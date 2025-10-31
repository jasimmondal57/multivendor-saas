<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorPayout;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VendorPayoutController extends Controller
{
    /**
     * Get vendor's payout history
     */
    public function index(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $query = VendorPayout::where('vendor_id', $vendor->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payouts = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }

    /**
     * Get payout statistics for vendor
     */
    public function statistics(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Get all payouts
        $totalEarnings = VendorPayout::where('vendor_id', $vendor->id)
            ->where('status', 'completed')
            ->sum('net_amount');

        $pendingPayout = VendorPayout::where('vendor_id', $vendor->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('net_amount');

        // This month earnings
        $thisMonthEarnings = VendorPayout::where('vendor_id', $vendor->id)
            ->where('status', 'completed')
            ->whereMonth('completed_at', Carbon::now()->month)
            ->whereYear('completed_at', Carbon::now()->year)
            ->sum('net_amount');

        // Last payout
        $lastPayout = VendorPayout::where('vendor_id', $vendor->id)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->first();

        // Current period sales (not yet in payout)
        $lastPayoutDate = $lastPayout ? $lastPayout->period_end : Carbon::now()->subMonth();
        
        $currentPeriodSales = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) use ($lastPayoutDate) {
                $query->where('status', 'delivered')
                    ->where('delivered_at', '>', $lastPayoutDate);
            })
            ->sum('price');

        $stats = [
            'total_earnings' => round($totalEarnings, 2),
            'pending_payout' => round($pendingPayout, 2),
            'this_month_earnings' => round($thisMonthEarnings, 2),
            'last_payout_amount' => $lastPayout ? round($lastPayout->net_amount, 2) : 0,
            'last_payout_date' => $lastPayout ? $lastPayout->completed_at : null,
            'current_period_sales' => round($currentPeriodSales, 2),
            'total_payouts_count' => VendorPayout::where('vendor_id', $vendor->id)->count(),
            'pending_payouts_count' => VendorPayout::where('vendor_id', $vendor->id)
                ->whereIn('status', ['pending', 'processing'])
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get single payout details
     */
    public function show(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $payout = VendorPayout::where('vendor_id', $vendor->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payout,
        ]);
    }

    /**
     * Get order-wise breakdown for a payout
     */
    public function orderBreakdown(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $payout = VendorPayout::where('vendor_id', $vendor->id)
            ->findOrFail($id);

        // Get all order items for this payout
        $orderItems = OrderItem::where('vendor_id', $vendor->id)
            ->whereIn('order_id', $payout->order_ids ?? [])
            ->with(['order.customer', 'product'])
            ->get();

        // Group by order and calculate details
        $orderBreakdown = $orderItems->groupBy('order_id')->map(function ($items, $orderId) use ($payout) {
            $order = $items->first()->order;
            $orderTotal = $items->sum('total_amount');

            // Calculate commission for this order
            $commission = ($orderTotal * $payout->commission_rate) / 100;
            $commissionGst = ($commission * $payout->commission_gst_rate) / 100;
            $tds = ($orderTotal * $payout->tds_rate) / 100;

            // Get return shipping fees for this order (if any)
            $returnShippingFee = \App\Models\ReturnOrder::where('order_id', $orderId)
                ->where('vendor_id', $items->first()->vendor_id)
                ->where('is_customer_return', true)
                ->whereIn('status', ['refund_completed', 'completed'])
                ->sum('return_shipping_fee');

            $netAmount = $orderTotal - $commission - $commissionGst - $tds - $returnShippingFee;

            return [
                'order_id' => $orderId,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer->name ?? 'N/A',
                'customer_email' => $order->customer->email ?? 'N/A',
                'order_date' => $order->created_at->format('Y-m-d H:i:s'),
                'delivered_at' => $order->delivered_at?->format('Y-m-d H:i:s'),
                'payment_method' => $order->payment_method,
                'items_count' => $items->count(),
                'items' => $items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name ?? 'N/A',
                        'product_sku' => $item->product->sku ?? 'N/A',
                        'quantity' => $item->quantity,
                        'price' => round($item->price, 2),
                        'total' => round($item->total_amount, 2),
                    ];
                }),
                'order_total' => round($orderTotal, 2),
                'platform_commission' => round($commission, 2),
                'commission_gst' => round($commissionGst, 2),
                'tds_amount' => round($tds, 2),
                'return_shipping_fee' => round($returnShippingFee, 2),
                'net_amount' => round($netAmount, 2),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'payout' => $payout,
                'orders' => $orderBreakdown,
                'summary' => [
                    'total_orders' => $orderBreakdown->count(),
                    'total_items' => $orderItems->count(),
                    'total_sales' => round($orderBreakdown->sum('order_total'), 2),
                    'total_commission' => round($orderBreakdown->sum('platform_commission'), 2),
                    'total_commission_gst' => round($orderBreakdown->sum('commission_gst'), 2),
                    'total_tds' => round($orderBreakdown->sum('tds_amount'), 2),
                    'total_return_shipping_fees' => round($orderBreakdown->sum('return_shipping_fee'), 2),
                    'total_net_amount' => round($orderBreakdown->sum('net_amount'), 2),
                ],
            ],
        ]);
    }
}

