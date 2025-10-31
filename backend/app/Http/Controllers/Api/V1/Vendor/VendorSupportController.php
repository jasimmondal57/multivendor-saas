<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\SupportCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VendorSupportController extends Controller
{
    /**
     * Get all support categories for vendors
     */
    public function getCategories()
    {
        $categories = SupportCategory::active()
            ->forVendor()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get vendor's tickets
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $query = SupportTicket::where('user_id', $user->id)
            ->where('user_type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->with(['category', 'assignedTo', 'order', 'product', 'returnOrder']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'open') {
                $query->open();
            } elseif ($request->status === 'closed') {
                $query->closed();
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('support_category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest()->paginate(20);

        // Add unread count for each ticket
        $tickets->getCollection()->transform(function ($ticket) use ($user) {
            $ticket->unread_count = $ticket->getUnreadCountForUser($user->id);
            return $ticket;
        });

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    /**
     * Create new support ticket
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $validated = $request->validate([
            'support_category_id' => 'required|exists:support_categories,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'order_id' => 'nullable|exists:orders,id',
            'product_id' => 'nullable|exists:products,id',
            'return_order_id' => 'nullable|exists:return_orders,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ]);

        DB::beginTransaction();
        try {
            // Handle file uploads
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('support/tickets', 'public');
                    $attachmentPaths[] = $path;
                }
            }

            // Create ticket
            $ticket = SupportTicket::create([
                'ticket_number' => SupportTicket::generateTicketNumber(),
                'user_id' => $user->id,
                'user_type' => 'vendor',
                'vendor_id' => $vendor->id,
                'support_category_id' => $validated['support_category_id'],
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'priority' => $validated['priority'] ?? 'medium',
                'order_id' => $validated['order_id'] ?? null,
                'product_id' => $validated['product_id'] ?? null,
                'return_order_id' => $validated['return_order_id'] ?? null,
                'attachments' => $attachmentPaths,
                'status' => 'open',
            ]);

            DB::commit();

            // Load relationships
            $ticket->load(['category', 'order', 'product', 'returnOrder']);

            // TODO: Send notification to admin

            return response()->json([
                'success' => true,
                'message' => 'Support ticket created successfully',
                'data' => $ticket,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single ticket details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $vendor = $user->vendor;

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->where('user_type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->with([
                'category',
                'assignedTo',
                'order',
                'product',
                'returnOrder',
                'publicMessages.user'
            ])
            ->firstOrFail();

        // Mark messages as read
        $ticket->markAsReadForUser($user->id);

        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }

    /**
     * Send message to ticket
     */
    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();
        $vendor = $user->vendor;

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->where('user_type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        if ($ticket->isClosed()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot send message to closed ticket',
            ], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ]);

        DB::beginTransaction();
        try {
            // Handle file uploads
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('support/messages', 'public');
                    $attachmentPaths[] = $path;
                }
            }

            // Create message
            $message = SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'sender_type' => 'vendor',
                'message' => $validated['message'],
                'attachments' => $attachmentPaths,
                'is_internal_note' => false,
            ]);

            // Update ticket status if waiting for vendor
            if ($ticket->status === 'waiting_vendor') {
                $ticket->update(['status' => 'in_progress']);
            }

            // Update last response time
            $ticket->update(['last_response_at' => now()]);

            DB::commit();

            // Load user relationship
            $message->load('user');

            // TODO: Send notification to assigned admin

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $message,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rate and close ticket
     */
    public function rateTicket(Request $request, $id)
    {
        $user = $request->user();
        $vendor = $user->vendor;

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->where('user_type', 'vendor')
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string',
        ]);

        $ticket->update([
            'rating' => $validated['rating'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback',
            'data' => $ticket,
        ]);
    }
}

