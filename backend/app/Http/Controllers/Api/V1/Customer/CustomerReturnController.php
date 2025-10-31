<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomerReturnController extends Controller
{
    /**
     * Get customer's orders eligible for return
     */
    public function getEligibleOrders(Request $request)
    {
        $user = $request->user();

        // Get delivered orders from last 30 days
        $orders = Order::where('customer_id', $user->id)
            ->where('status', 'delivered')
            ->where('delivered_at', '>=', now()->subDays(30))
            ->with(['items.product', 'items.vendor'])
            ->orderBy('delivered_at', 'desc')
            ->get();

        // Filter items that haven't been returned yet
        $eligibleOrders = $orders->map(function ($order) {
            $order->items = $order->items->filter(function ($item) {
                return !ReturnOrder::where('order_item_id', $item->id)->exists();
            });
            return $order;
        })->filter(function ($order) {
            return $order->items->count() > 0;
        });

        return response()->json([
            'success' => true,
            'data' => $eligibleOrders->values(),
        ]);
    }

    /**
     * Get customer's return requests
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $returns = ReturnOrder::where('customer_id', $user->id)
            ->with(['order', 'orderItem.product', 'vendor', 'product', 'trackingHistory'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    /**
     * Get single return request details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->where('customer_id', $user->id)
            ->with(['order', 'orderItem.product', 'vendor', 'product', 'trackingHistory'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $return,
        ]);
    }

    /**
     * Create return request
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
            'return_type' => 'required|in:refund,replacement,exchange',
            'reason' => 'required|in:defective,wrong_item,not_as_described,damaged,size_issue,quality_issue,changed_mind,late_delivery,other',
            'reason_description' => 'nullable|string|max:1000',
            'quantity' => 'required|integer|min:1',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        // Get order item and validate
        $orderItem = OrderItem::with(['order', 'product', 'vendor'])
            ->findOrFail($request->order_item_id);

        // Verify order belongs to customer
        if ($orderItem->order->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to order',
            ], 403);
        }

        // Verify order is delivered
        if ($orderItem->order->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Only delivered orders can be returned',
            ], 400);
        }

        // Verify return window (30 days)
        if ($orderItem->order->delivered_at < now()->subDays(30)) {
            return response()->json([
                'success' => false,
                'message' => 'Return window has expired (30 days from delivery)',
            ], 400);
        }

        // Check if already returned
        $existingReturn = ReturnOrder::where('order_item_id', $orderItem->id)->first();
        if ($existingReturn) {
            return response()->json([
                'success' => false,
                'message' => 'Return request already exists for this item',
            ], 400);
        }

        // Validate quantity
        if ($request->quantity > $orderItem->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Return quantity cannot exceed ordered quantity',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Handle image uploads
            $images = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('returns', 'public');
                    $images[] = $path;
                }
            }

            // Calculate refund amount
            $refundAmount = ($orderItem->price * $request->quantity);

            // Create return order
            $return = ReturnOrder::create([
                'return_number' => ReturnOrder::generateReturnNumber(),
                'order_id' => $orderItem->order_id,
                'order_item_id' => $orderItem->id,
                'customer_id' => $user->id,
                'vendor_id' => $orderItem->vendor_id,
                'product_id' => $orderItem->product_id,
                'return_type' => $request->return_type,
                'reason' => $request->reason,
                'reason_description' => $request->reason_description,
                'quantity' => $request->quantity,
                'refund_amount' => $refundAmount,
                'status' => 'pending_approval',
                'images' => $images,
            ]);

            // Add tracking history
            $return->addTrackingHistory(
                'requested',
                'Return request submitted by customer',
                null,
                'customer',
                $user->id
            );

            DB::commit();

            // TODO: Send notification to vendor
            // TODO: Send confirmation email to customer

            return response()->json([
                'success' => true,
                'message' => 'Return request submitted successfully',
                'data' => $return->fresh(['order', 'orderItem.product', 'vendor', 'product']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create return request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel return request (only if pending approval)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->where('customer_id', $user->id)
            ->where('status', 'pending_approval')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'cancelled',
            ]);

            $return->addTrackingHistory(
                'cancelled',
                'Return request cancelled by customer',
                null,
                'customer',
                $user->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Return request cancelled successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel return request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get return timeline
     */
    public function getTimeline(Request $request, $id)
    {
        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->where('customer_id', $user->id)
            ->with('trackingHistory')
            ->firstOrFail();

        $timeline = $return->trackingHistory->map(function ($history) {
            return [
                'status' => $history->status,
                'description' => $history->description,
                'location' => $history->location,
                'timestamp' => $history->scanned_at ?? $history->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'return' => $return,
                'timeline' => $timeline,
            ],
        ]);
    }

    /**
     * Get return statistics for customer
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        $stats = [
            'pending' => ReturnOrder::where('customer_id', $user->id)
                ->where('status', 'pending_approval')->count(),
            'approved' => ReturnOrder::where('customer_id', $user->id)
                ->whereIn('status', ['approved', 'pickup_scheduled', 'in_transit', 'picked_up'])->count(),
            'processing' => ReturnOrder::where('customer_id', $user->id)
                ->whereIn('status', ['received', 'inspecting', 'inspection_passed', 'refund_initiated'])->count(),
            'completed' => ReturnOrder::where('customer_id', $user->id)
                ->whereIn('status', ['refund_completed', 'completed'])->count(),
            'rejected' => ReturnOrder::where('customer_id', $user->id)
                ->whereIn('status', ['rejected', 'inspection_failed', 'cancelled'])->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

