<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VendorNotificationController extends Controller
{
    /**
     * Get real-time notifications for vendor
     */
    public function getNotifications(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Get timestamp from request (for polling)
        $since = $request->query('since');
        $sinceDate = $since ? Carbon::parse($since) : Carbon::now()->subMinutes(5);

        // Get new orders
        $newOrders = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->where('created_at', '>', $sinceDate)
            ->with(['order', 'product'])
            ->get();

        // Get status updates
        $statusUpdates = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->where('updated_at', '>', $sinceDate)
            ->where('created_at', '<=', $sinceDate) // Only updates, not new orders
            ->with(['order', 'product'])
            ->get();

        $notifications = [];

        // New order notifications
        foreach ($newOrders as $orderItem) {
            $notifications[] = [
                'id' => 'new_order_' . $orderItem->id,
                'type' => 'new_order',
                'title' => 'New Order Received',
                'message' => "New order #{$orderItem->order->order_number} for {$orderItem->product->name}",
                'data' => [
                    'order_id' => $orderItem->order->id,
                    'order_number' => $orderItem->order->order_number,
                    'product_name' => $orderItem->product->name,
                    'quantity' => $orderItem->quantity,
                    'amount' => $orderItem->total_amount,
                ],
                'timestamp' => $orderItem->created_at->toIso8601String(),
                'read' => false,
            ];
        }

        // Status update notifications
        foreach ($statusUpdates as $orderItem) {
            $notifications[] = [
                'id' => 'status_update_' . $orderItem->id,
                'type' => 'status_update',
                'title' => 'Order Status Updated',
                'message' => "Order #{$orderItem->order->order_number} status changed to {$orderItem->status}",
                'data' => [
                    'order_id' => $orderItem->order->id,
                    'order_number' => $orderItem->order->order_number,
                    'product_name' => $orderItem->product->name,
                    'status' => $orderItem->status,
                ],
                'timestamp' => $orderItem->updated_at->toIso8601String(),
                'read' => false,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'count' => count($notifications),
                'timestamp' => Carbon::now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get notification statistics
     */
    public function getStats(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Get counts for different notification types
        $pendingOrders = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->where('status', 'pending')
            ->count();

        $processingOrders = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->where('status', 'processing')
            ->count();

        $readyToShip = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->where('status', 'ready_to_ship')
            ->count();

        // Get today's new orders
        $todayOrders = OrderItem::whereHas('product', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'pending_orders' => $pendingOrders,
                'processing_orders' => $processingOrders,
                'ready_to_ship' => $readyToShip,
                'today_orders' => $todayOrders,
                'total_active' => $pendingOrders + $processingOrders + $readyToShip,
            ],
        ]);
    }
}

