<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Wishlist;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get customer dashboard statistics
     */
    public function dashboardStats(Request $request)
    {
        $userId = $request->user()->id;

        $stats = [
            'total_orders' => Order::where('customer_id', $userId)->count(),
            'wishlist_items' => Wishlist::where('user_id', $userId)->count(),
            'reviews_written' => ProductReview::where('user_id', $userId)->count(),
            'unread_notifications' => DB::table('notifications')
                ->where('notifiable_type', 'App\\Models\\User')
                ->where('notifiable_id', $userId)
                ->whereNull('read_at')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get customer orders
     */
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with(['items.product', 'items.vendor'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
        $order = Order::where('customer_id', $request->user()->id)
            ->with([
                'items.product',
                'items.vendor' => function ($query) {
                    $query->with('store');
                },
                'payments'
            ])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Create new order
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address_id' => 'nullable|exists:user_addresses,id',
            'shipping_name' => 'required|string|max:255',
            'shipping_phone' => 'required|string|max:15',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_pincode' => 'required|string|max:10',
            'payment_method' => 'required|in:cod,online,wallet,upi',
            'save_address' => 'nullable|boolean',
            'address_type' => 'nullable|in:home,work,other',
        ]);

        try {
            DB::beginTransaction();

            // Save address if requested
            if ($request->save_address && !$request->address_id) {
                $addressData = [
                    'user_id' => $request->user()->id,
                    'type' => $request->address_type ?? 'home',
                    'name' => $request->shipping_name,
                    'phone' => $request->shipping_phone,
                    'address_line_1' => $request->shipping_address,
                    'address_line_2' => null,
                    'city' => $request->shipping_city,
                    'state' => $request->shipping_state,
                    'pincode' => $request->shipping_pincode,
                    'country' => 'India',
                    'landmark' => null,
                ];

                // Check if this is the first address
                $existingAddressCount = \App\Models\UserAddress::where('user_id', $request->user()->id)->count();
                $addressData['is_default'] = $existingAddressCount === 0;

                // If setting as default, unset other defaults
                if ($addressData['is_default']) {
                    \App\Models\UserAddress::where('user_id', $request->user()->id)
                        ->update(['is_default' => false]);
                }

                \App\Models\UserAddress::create($addressData);
            }

            // Calculate order totals
            $subtotal = 0;
            $taxAmount = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                $quantity = $item['quantity'];
                $priceInclGst = (float) $product->selling_price; // Price inclusive of GST
                $itemTotalInclGst = $priceInclGst * $quantity;

                // Calculate GST (reverse calculation from inclusive price)
                // Formula: GST Amount = (Price Incl GST) - (Price Incl GST / 1.18)
                // Or: GST Amount = (Price Incl GST) * (18/118)
                $gstRate = (float) $product->gst_percentage / 100; // Get GST rate from product (default 18%)
                $itemBasePrice = $itemTotalInclGst / (1 + $gstRate);
                $itemTax = $itemTotalInclGst - $itemBasePrice;

                $subtotal += $itemBasePrice; // Subtotal is base price (before GST)
                $taxAmount += $itemTax;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'price' => $priceInclGst, // Store the inclusive price
                    'tax_amount' => $itemTax,
                    'discount_amount' => 0,
                    'total_amount' => $itemTotalInclGst, // Total is inclusive of GST
                    'status' => 'pending',
                ];
            }

            $shippingCharge = 50; // Flat shipping
            $totalAmount = $subtotal + $taxAmount + $shippingCharge; // This equals sum of item totals + shipping

            // Create order
            $order = Order::create([
                'customer_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_charge' => $shippingCharge,
                'discount_amount' => 0,
                'total_amount' => $totalAmount,
                'shipping_name' => $request->shipping_name,
                'shipping_phone' => $request->shipping_phone,
                'shipping_email' => $request->shipping_email,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_pincode' => $request->shipping_pincode,
                'shipping_country' => 'India',
                'billing_name' => $request->billing_name ?? $request->shipping_name,
                'billing_phone' => $request->billing_phone ?? $request->shipping_phone,
                'billing_email' => $request->billing_email ?? $request->shipping_email,
                'billing_address' => $request->billing_address ?? $request->shipping_address,
                'billing_city' => $request->billing_city ?? $request->shipping_city,
                'billing_state' => $request->billing_state ?? $request->shipping_state,
                'billing_pincode' => $request->billing_pincode ?? $request->shipping_pincode,
                'billing_country' => 'India',
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'status' => 'pending',
                'customer_notes' => $request->customer_notes,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('customer_id', $request->user()->id)->findOrFail($id);

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled at this stage',
            ], 400);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $order,
        ]);
    }

    /**
     * Track order
     */
    public function track($id)
    {
        $order = Order::with(['items.product'])->findOrFail($id);

        $timeline = [
            [
                'status' => 'Order Placed',
                'date' => $order->created_at->format('d M Y, h:i A'),
                'completed' => true,
            ],
            [
                'status' => 'Order Confirmed',
                'date' => $order->status !== 'pending' ? $order->updated_at->format('d M Y, h:i A') : null,
                'completed' => !in_array($order->status, ['pending']),
            ],
            [
                'status' => 'Shipped',
                'date' => $order->shipped_at?->format('d M Y, h:i A'),
                'completed' => in_array($order->status, ['shipped', 'out_for_delivery', 'delivered']),
            ],
            [
                'status' => 'Out for Delivery',
                'date' => $order->status === 'out_for_delivery' ? $order->updated_at->format('d M Y, h:i A') : null,
                'completed' => in_array($order->status, ['out_for_delivery', 'delivered']),
            ],
            [
                'status' => 'Delivered',
                'date' => $order->delivered_at?->format('d M Y, h:i A'),
                'completed' => $order->status === 'delivered',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'timeline' => $timeline,
            ],
        ]);
    }
}
