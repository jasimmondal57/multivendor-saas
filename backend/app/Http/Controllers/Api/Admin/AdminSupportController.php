<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\SupportCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSupportController extends Controller
{
    /**
     * Get all tickets with filters (tab-based)
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'vendor', 'category', 'assignedTo', 'order', 'product', 'returnOrder']);

        // Tab filter: all, customer, vendor, open, assigned, resolved, closed
        $tab = $request->get('tab', 'all');

        switch ($tab) {
            case 'customer':
                $query->customer();
                break;
            case 'vendor':
                $query->vendor();
                break;
            case 'open':
                $query->where('status', 'open')->unassigned();
                break;
            case 'assigned':
                $query->assigned()->whereIn('status', ['assigned', 'in_progress', 'waiting_customer', 'waiting_vendor']);
                break;
            case 'resolved':
                $query->where('status', 'resolved');
                break;
            case 'closed':
                $query->where('status', 'closed');
                break;
            case 'my_tickets':
                $query->where('assigned_to', $request->user()->id)->open();
                break;
        }

        // Additional filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category_id')) {
            $query->where('support_category_id', $request->category_id);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $tickets = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    /**
     * Get ticket statistics for dashboard
     */
    public function getStatistics()
    {
        $stats = [
            'total' => SupportTicket::count(),
            'open' => SupportTicket::where('status', 'open')->count(),
            'assigned' => SupportTicket::assigned()->open()->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
            'customer_tickets' => SupportTicket::customer()->count(),
            'vendor_tickets' => SupportTicket::vendor()->count(),
            'high_priority' => SupportTicket::highPriority()->open()->count(),
            'unassigned' => SupportTicket::unassigned()->open()->count(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
            'avg_first_response_time' => $this->getAverageFirstResponseTime(),
            'avg_rating' => SupportTicket::whereNotNull('rating')->avg('rating'),
        ];

        // Tickets by category
        $stats['by_category'] = SupportTicket::select('support_category_id', DB::raw('count(*) as count'))
            ->with('category:id,name')
            ->groupBy('support_category_id')
            ->get();

        // Tickets by priority
        $stats['by_priority'] = SupportTicket::select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get();

        // Recent activity (last 7 days)
        $stats['recent_activity'] = SupportTicket::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get single ticket details
     */
    public function show($id)
    {
        $ticket = SupportTicket::with([
            'user',
            'vendor',
            'category',
            'assignedTo',
            'order',
            'product',
            'returnOrder',
            'messages.user',
            'internalNotes.user'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }

    /**
     * Assign ticket to admin
     */
    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'assigned_to' => $validated['assigned_to'],
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        // TODO: Send notification to assigned admin

        return response()->json([
            'success' => true,
            'message' => 'Ticket assigned successfully',
            'data' => $ticket->fresh(['assignedTo']),
        ]);
    }

    /**
     * Update ticket status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,assigned,in_progress,waiting_customer,waiting_vendor,resolved,closed',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
            $updateData['resolved_at'] = now();
        }

        if ($validated['status'] === 'closed' && !$ticket->closed_at) {
            $updateData['closed_at'] = now();
        }

        $ticket->update($updateData);

        // TODO: Send notification to ticket creator

        return response()->json([
            'success' => true,
            'message' => 'Ticket status updated successfully',
            'data' => $ticket,
        ]);
    }

    /**
     * Update ticket priority
     */
    public function updatePriority(Request $request, $id)
    {
        $validated = $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['priority' => $validated['priority']]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket priority updated successfully',
            'data' => $ticket,
        ]);
    }

    /**
     * Send message to ticket
     */
    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string',
            'is_internal_note' => 'nullable|boolean',
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
                'sender_type' => 'admin',
                'message' => $validated['message'],
                'attachments' => $attachmentPaths,
                'is_internal_note' => $validated['is_internal_note'] ?? false,
            ]);

            // Update ticket timestamps
            if (!$validated['is_internal_note']) {
                if (!$ticket->first_response_at) {
                    $ticket->update(['first_response_at' => now()]);
                }
                $ticket->update(['last_response_at' => now()]);

                // Update status based on user type
                if ($ticket->user_type === 'customer') {
                    $ticket->update(['status' => 'waiting_customer']);
                } elseif ($ticket->user_type === 'vendor') {
                    $ticket->update(['status' => 'waiting_vendor']);
                }
            }

            DB::commit();

            // Load user relationship
            $message->load('user');

            // TODO: Send notification to ticket creator (if not internal note)

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
     * Resolve ticket with notes
     */
    public function resolve(Request $request, $id)
    {
        $validated = $request->validate([
            'resolution_notes' => 'required|string',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'resolved',
            'resolution_notes' => $validated['resolution_notes'],
            'resolved_at' => now(),
        ]);

        // TODO: Send notification to ticket creator

        return response()->json([
            'success' => true,
            'message' => 'Ticket resolved successfully',
            'data' => $ticket,
        ]);
    }

    /**
     * Get list of admins for assignment
     */
    public function getAdmins()
    {
        $admins = User::where('user_type', 'admin')
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $admins,
        ]);
    }

    /**
     * Calculate average resolution time in hours
     */
    private function getAverageResolutionTime()
    {
        $tickets = SupportTicket::whereNotNull('resolved_at')
            ->whereNotNull('created_at')
            ->get();

        if ($tickets->isEmpty()) {
            return 0;
        }

        $totalHours = $tickets->sum(function ($ticket) {
            return $ticket->created_at->diffInHours($ticket->resolved_at);
        });

        return round($totalHours / $tickets->count(), 2);
    }

    /**
     * Calculate average first response time in hours
     */
    private function getAverageFirstResponseTime()
    {
        $tickets = SupportTicket::whereNotNull('first_response_at')
            ->whereNotNull('created_at')
            ->get();

        if ($tickets->isEmpty()) {
            return 0;
        }

        $totalHours = $tickets->sum(function ($ticket) {
            return $ticket->created_at->diffInHours($ticket->first_response_at);
        });

        return round($totalHours / $tickets->count(), 2);
    }
}

