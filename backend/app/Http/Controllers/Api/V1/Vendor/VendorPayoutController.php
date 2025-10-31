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
}

