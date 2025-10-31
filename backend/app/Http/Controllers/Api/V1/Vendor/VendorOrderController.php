<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Services\DelhiveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorOrderController extends Controller
{
    /**
     * Get vendor orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $vendor = $user->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found. Please contact support.',
            ], 404);
        }

        // Get orders that have items from this vendor
        $orders = Order::whereHas('items', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
        ->with(['items' => function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id)->with('product');
        }, 'customer'])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        $order = Order::whereHas('items', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })
        ->with(['items' => function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id)->with('product');
        }, 'customer'])
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order item status
     */
    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;

        $request->validate([
            'status' => 'required|in:confirmed,processing,ready_for_pickup,shipped,delivered',
        ]);

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $orderItem->update([
            'status' => $request->status,
        ]);

        // Update main order status if all items are at same status
        $order = $orderItem->order;
        $allItemsStatus = $order->items()->pluck('status')->unique();

        if ($allItemsStatus->count() === 1) {
            $order->update(['status' => $allItemsStatus->first()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order item status updated successfully',
            'data' => $orderItem,
        ]);
    }

    /**
     * Mark order as ready for pickup
     */
    public function readyForPickup(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        $order = Order::whereHas('items', function ($query) use ($vendor) {
            $query->where('vendor_id', $vendor->id);
        })->findOrFail($id);

        $order->items()->where('vendor_id', $vendor->id)->update([
            'status' => 'ready_for_pickup',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order marked as ready for pickup',
        ]);
    }

    /**
     * Get vendor order statistics
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $vendor = $user->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found. Please contact support.',
            ], 404);
        }

        $stats = [
            'total_orders' => OrderItem::where('vendor_id', $vendor->id)->distinct('order_id')->count('order_id'),
            'pending_orders' => OrderItem::where('vendor_id', $vendor->id)->where('status', 'pending')->distinct('order_id')->count('order_id'),
            'processing_orders' => OrderItem::where('vendor_id', $vendor->id)->where('status', 'processing')->distinct('order_id')->count('order_id'),
            'completed_orders' => OrderItem::where('vendor_id', $vendor->id)->where('status', 'delivered')->distinct('order_id')->count('order_id'),
            'total_revenue' => OrderItem::where('vendor_id', $vendor->id)->where('status', 'delivered')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Accept order (vendor accepts the order)
     */
    public function acceptOrder(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->where('vendor_status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $orderItem->update([
                'vendor_status' => 'accepted',
                'accepted_at' => now(),
            ]);

            // TODO: Send notification to customer

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order accepted successfully',
                'data' => $orderItem->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject order (vendor rejects the order)
     */
    public function rejectOrder(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->where('vendor_status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $orderItem->update([
                'vendor_status' => 'rejected',
                'rejected_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            // TODO: Send notification to customer and admin

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order rejected successfully',
                'data' => $orderItem->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark order as ready to ship
     */
    public function markReadyToShip(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;

        $request->validate([
            'weight' => 'required|numeric|min:0.1|max:50',
            'length' => 'required|numeric|min:1|max:200',
            'width' => 'required|numeric|min:1|max:200',
            'height' => 'required|numeric|min:1|max:200',
            'package_count' => 'nullable|integer|min:1|max:10',
        ]);

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->where('vendor_status', 'accepted')
            ->with('order')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            // Update order item status
            $orderItem->update([
                'vendor_status' => 'ready_to_ship',
                'ready_to_ship_at' => now(),
            ]);

            // Create shipment record
            $shipment = Shipment::create([
                'order_id' => $orderItem->order_id,
                'vendor_id' => $vendor->id,
                'status' => 'ready_to_ship',
                'weight' => $request->weight,
                'length' => $request->length,
                'width' => $request->width,
                'height' => $request->height,
                'package_count' => $request->package_count ?? 1,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order marked as ready to ship',
                'data' => [
                    'order_item' => $orderItem->fresh(),
                    'shipment' => $shipment,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as ready to ship: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate shipping label (create shipment with Delhivery)
     */
    public function generateShippingLabel(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;
        $vendor->load('user'); // Load user relationship for vendor name

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->where('vendor_status', 'ready_to_ship')
            ->with(['order', 'product'])
            ->firstOrFail();

        // Check if shipment already exists
        $shipment = Shipment::where('order_id', $orderItem->order_id)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$shipment) {
            return response()->json([
                'success' => false,
                'message' => 'Please mark order as ready to ship first',
            ], 400);
        }

        if ($shipment->awb_number) {
            return response()->json([
                'success' => false,
                'message' => 'Shipping label already generated',
                'data' => $shipment,
            ], 400);
        }

        DB::beginTransaction();
        try {
            $delhiveryService = new DelhiveryService();

            $order = $orderItem->order;

            // Prepare order data array for Delhivery
            $orderData = [
                'customer_name' => $order->shipping_name,
                'address' => $order->shipping_address,
                'pincode' => $order->shipping_pincode,
                'city' => $order->shipping_city,
                'state' => $order->shipping_state,
                'country' => 'India',
                'phone' => $order->shipping_phone,
                'order_number' => $order->order_number,
                'payment_method' => $order->payment_method,
                'total_amount' => $orderItem->total_amount,
                'product_description' => $orderItem->product_name ?? $orderItem->product->name,
                'quantity' => $orderItem->quantity,
                'weight' => $shipment->weight * 1000, // Convert kg to grams
                'width' => $shipment->width,
                'height' => $shipment->height,
                'order_date' => $order->created_at->format('Y-m-d H:i:s'),
                'seller_name' => $vendor->business_name ?? $vendor->user->name,
                'seller_address' => $vendor->address ?? '',
                'seller_gst' => $vendor->gst_number ?? '',
                'invoice_number' => $order->order_number,
                'return_pincode' => $vendor->pincode ?? '',
                'return_city' => $vendor->city ?? '',
                'return_phone' => $vendor->phone ?? '',
                'return_address' => $vendor->address ?? '',
                'return_state' => $vendor->state ?? '',
            ];

            // Create shipment with Delhivery
            $result = $delhiveryService->createShipment($orderData);

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Failed to generate shipping label',
                    'error' => $result['error'] ?? null,
                ], 400);
            }

            // Update shipment with Delhivery response
            $shipment->update([
                'awb_number' => $result['waybill'] ?? null,
                'tracking_id' => $result['waybill'] ?? null,
                'status' => 'manifested',
                'delhivery_response' => $result['data'] ?? null,
            ]);

            // Update order item status
            $orderItem->update([
                'vendor_status' => 'shipped',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Shipping label generated successfully',
                'data' => [
                    'shipment' => $shipment->fresh(),
                    'order_item' => $orderItem->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate shipping label: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order timeline (tracking history)
     */
    public function getOrderTimeline(Request $request, $orderId, $itemId)
    {
        $vendor = $request->user()->vendor;

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->where('vendor_id', $vendor->id)
            ->with('order')
            ->firstOrFail();

        $shipment = Shipment::where('order_id', $orderItem->order_id)
            ->where('vendor_id', $vendor->id)
            ->with('trackingHistory')
            ->first();

        $timeline = [];

        // Add order placed event
        $timeline[] = [
            'status' => 'Order Placed',
            'description' => 'Order placed by customer',
            'timestamp' => $orderItem->created_at,
            'icon' => 'shopping-cart',
        ];

        // Add accepted/rejected event
        if ($orderItem->accepted_at) {
            $timeline[] = [
                'status' => 'Order Accepted',
                'description' => 'Order accepted by vendor',
                'timestamp' => $orderItem->accepted_at,
                'icon' => 'check-circle',
            ];
        } elseif ($orderItem->rejected_at) {
            $timeline[] = [
                'status' => 'Order Rejected',
                'description' => 'Order rejected: ' . $orderItem->rejection_reason,
                'timestamp' => $orderItem->rejected_at,
                'icon' => 'x-circle',
            ];
        }

        // Add ready to ship event
        if ($orderItem->ready_to_ship_at) {
            $timeline[] = [
                'status' => 'Ready to Ship',
                'description' => 'Order marked as ready for pickup',
                'timestamp' => $orderItem->ready_to_ship_at,
                'icon' => 'package',
            ];
        }

        // Add shipment tracking events
        if ($shipment && $shipment->trackingHistory) {
            foreach ($shipment->trackingHistory as $tracking) {
                $timeline[] = [
                    'status' => ucfirst(str_replace('_', ' ', $tracking->status)),
                    'description' => $tracking->status_description ?? $tracking->remarks,
                    'location' => $tracking->location,
                    'timestamp' => $tracking->scanned_at ?? $tracking->created_at,
                    'icon' => 'truck',
                ];
            }
        }

        // Sort timeline by timestamp
        usort($timeline, function ($a, $b) {
            return $a['timestamp'] <=> $b['timestamp'];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'timeline' => $timeline,
                'shipment' => $shipment,
                'order_item' => $orderItem,
            ],
        ]);
    }
}
