<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformRevenue;
use App\Models\VendorPayout;
use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RevenueController extends Controller
{
    /**
     * Get revenue dashboard statistics
     */
    public function dashboard(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, quarter, year, all
        $startDate = $this->getStartDate($period);
        $endDate = now();

        // Total Revenue
        $totalRevenue = PlatformRevenue::confirmed()
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('net_revenue');

        // Commission Revenue
        $commissionRevenue = PlatformRevenue::confirmed()
            ->bySourceType('commission')
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('net_revenue');

        // Other Revenue Sources
        $subscriptionRevenue = PlatformRevenue::confirmed()
            ->bySourceType('subscription')
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('net_revenue');

        $listingFeeRevenue = PlatformRevenue::confirmed()
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('listing_fee');

        $advertisementRevenue = PlatformRevenue::confirmed()
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('advertisement_fee');

        $penaltyRevenue = PlatformRevenue::confirmed()
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->sum('penalty_amount');

        // Total Orders Value
        $totalOrdersValue = Order::where('payment_status', 'paid')
            ->when($startDate, fn($q) => $q->where('created_at', '>=', $startDate))
            ->sum('total_amount');

        // Total Payouts
        $totalPayouts = VendorPayout::whereIn('status', ['completed', 'processing'])
            ->when($startDate, fn($q) => $q->where('created_at', '>=', $startDate))
            ->sum('net_amount');

        // Average Commission Rate
        $avgCommissionRate = PlatformRevenue::confirmed()
            ->bySourceType('commission')
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->whereNotNull('commission_rate')
            ->avg('commission_rate');

        // Revenue Trend (last 12 periods)
        $revenueTrend = $this->getRevenueTrend($period);

        // Top Revenue Sources
        $topSources = PlatformRevenue::confirmed()
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->select('source_type', DB::raw('SUM(net_revenue) as total'))
            ->groupBy('source_type')
            ->orderByDesc('total')
            ->get();

        // Top Vendors by Commission
        $topVendors = PlatformRevenue::confirmed()
            ->bySourceType('commission')
            ->when($startDate, fn($q) => $q->where('revenue_date', '>=', $startDate))
            ->select('vendor_id', 'vendor_name', DB::raw('SUM(net_revenue) as total_commission'), DB::raw('COUNT(*) as transaction_count'))
            ->whereNotNull('vendor_id')
            ->groupBy('vendor_id', 'vendor_name')
            ->orderByDesc('total_commission')
            ->limit(10)
            ->get();

        // Recent Transactions
        $recentTransactions = PlatformRevenue::with(['vendor', 'order'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_revenue' => (float) $totalRevenue,
                    'commission_revenue' => (float) $commissionRevenue,
                    'subscription_revenue' => (float) $subscriptionRevenue,
                    'listing_fee_revenue' => (float) $listingFeeRevenue,
                    'advertisement_revenue' => (float) $advertisementRevenue,
                    'penalty_revenue' => (float) $penaltyRevenue,
                    'total_orders_value' => (float) $totalOrdersValue,
                    'total_payouts' => (float) $totalPayouts,
                    'avg_commission_rate' => round((float) $avgCommissionRate, 2),
                    'period' => $period,
                ],
                'revenue_trend' => $revenueTrend,
                'top_sources' => $topSources,
                'top_vendors' => $topVendors,
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }

    /**
     * Get all revenue records with filters
     */
    public function index(Request $request)
    {
        $query = PlatformRevenue::with(['vendor', 'order', 'payout']);

        // Filters
        if ($request->has('source_type') && $request->source_type !== 'all') {
            $query->where('source_type', $request->source_type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('start_date')) {
            $query->where('revenue_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('revenue_date', '<=', $request->end_date);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('revenue_number', 'like', "%{$search}%")
                  ->orWhere('order_number', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $revenues = $query->orderByDesc('revenue_date')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $revenues,
        ]);
    }

    /**
     * Get revenue analytics
     */
    public function analytics(Request $request)
    {
        $year = $request->get('year', now()->year);

        // Monthly breakdown
        $monthlyRevenue = PlatformRevenue::confirmed()
            ->forYear($year)
            ->select(
                'revenue_month',
                DB::raw('SUM(net_revenue) as total_revenue'),
                DB::raw('SUM(commission_amount) as commission'),
                DB::raw('SUM(gst_amount) as gst'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy('revenue_month')
            ->orderBy('revenue_month')
            ->get();

        // Quarterly breakdown
        $quarterlyRevenue = PlatformRevenue::confirmed()
            ->forYear($year)
            ->select(
                'revenue_quarter',
                DB::raw('SUM(net_revenue) as total_revenue'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy('revenue_quarter')
            ->orderBy('revenue_quarter')
            ->get();

        // Source type breakdown
        $sourceBreakdown = PlatformRevenue::confirmed()
            ->forYear($year)
            ->select(
                'source_type',
                DB::raw('SUM(net_revenue) as total_revenue'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('AVG(net_revenue) as avg_revenue')
            )
            ->groupBy('source_type')
            ->get();

        // Year-over-year comparison
        $previousYear = $year - 1;
        $currentYearTotal = PlatformRevenue::confirmed()->forYear($year)->sum('net_revenue');
        $previousYearTotal = PlatformRevenue::confirmed()->forYear($previousYear)->sum('net_revenue');
        $yoyGrowth = $previousYearTotal > 0
            ? (($currentYearTotal - $previousYearTotal) / $previousYearTotal) * 100
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'monthly_revenue' => $monthlyRevenue,
                'quarterly_revenue' => $quarterlyRevenue,
                'source_breakdown' => $sourceBreakdown,
                'year_comparison' => [
                    'current_year' => (float) $currentYearTotal,
                    'previous_year' => (float) $previousYearTotal,
                    'growth_percentage' => round($yoyGrowth, 2),
                ],
            ],
        ]);
    }

    /**
     * Export revenue data
     */
    public function export(Request $request)
    {
        // This would generate CSV/Excel export
        // Implementation depends on your export library preference
        return response()->json([
            'success' => true,
            'message' => 'Export functionality to be implemented',
        ]);
    }

    /**
     * Helper: Get start date based on period
     */
    private function getStartDate($period)
    {
        return match($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            'all' => null,
            default => now()->startOfMonth(),
        };
    }

    /**
     * Helper: Get revenue trend data
     */
    private function getRevenueTrend($period)
    {
        $groupBy = match($period) {
            'day' => 'DATE(revenue_date)',
            'week' => 'YEARWEEK(revenue_date)',
            'month' => 'revenue_month',
            'quarter' => 'revenue_quarter',
            'year' => 'revenue_year',
            default => 'revenue_month',
        };

        $limit = match($period) {
            'day' => 30,
            'week' => 12,
            'month' => 12,
            'quarter' => 8,
            'year' => 5,
            default => 12,
        };

        return PlatformRevenue::confirmed()
            ->select(
                DB::raw("{$groupBy} as period"),
                DB::raw('SUM(net_revenue) as revenue')
            )
            ->groupBy('period')
            ->orderByDesc('period')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }
}
