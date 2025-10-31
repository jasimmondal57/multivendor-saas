<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorPayout;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class TDSController extends Controller
{
    /**
     * Get TDS dashboard statistics
     */
    public function dashboard(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, quarter, year, all
        $financialYear = $request->get('financial_year', $this->getCurrentFinancialYear());

        // Get date range based on period
        $dateRange = $this->getDateRange($period, $financialYear);

        // Summary statistics
        $summary = VendorPayout::query()
            ->when($dateRange, function ($query) use ($dateRange) {
                return $query->whereBetween('period_start', [$dateRange['start'], $dateRange['end']]);
            })
            ->selectRaw('
                SUM(tds_amount) as total_tds_deducted,
                AVG(tds_rate) as avg_tds_rate,
                COUNT(DISTINCT vendor_id) as total_vendors,
                COUNT(*) as total_payouts,
                SUM(total_sales) as total_sales_value,
                SUM(net_amount) as total_net_payouts
            ')
            ->first();

        // TDS by month (for trend chart)
        // Use database-agnostic date formatting
        $driver = config('database.default');
        $dateFormat = $driver === 'sqlite'
            ? "strftime('%Y-%m', period_start)"
            : "DATE_FORMAT(period_start, '%Y-%m')";

        $monthlyTrend = VendorPayout::query()
            ->when($dateRange, function ($query) use ($dateRange) {
                return $query->whereBetween('period_start', [$dateRange['start'], $dateRange['end']]);
            })
            ->selectRaw("
                {$dateFormat} as month,
                SUM(tds_amount) as tds_amount,
                COUNT(*) as payout_count,
                COUNT(DISTINCT vendor_id) as vendor_count
            ")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        // Top vendors by TDS deducted
        $topVendors = VendorPayout::query()
            ->with('vendor:id,business_name,email,pan_number')
            ->when($dateRange, function ($query) use ($dateRange) {
                return $query->whereBetween('period_start', [$dateRange['start'], $dateRange['end']]);
            })
            ->select('vendor_id')
            ->selectRaw('
                SUM(tds_amount) as total_tds,
                SUM(total_sales) as total_sales,
                SUM(net_amount) as total_payouts,
                COUNT(*) as payout_count
            ')
            ->groupBy('vendor_id')
            ->orderByDesc('total_tds')
            ->limit(10)
            ->get();

        // TDS by rate breakdown
        $tdsByRate = VendorPayout::query()
            ->when($dateRange, function ($query) use ($dateRange) {
                return $query->whereBetween('period_start', [$dateRange['start'], $dateRange['end']]);
            })
            ->selectRaw('
                tds_rate,
                SUM(tds_amount) as total_tds,
                COUNT(*) as payout_count,
                COUNT(DISTINCT vendor_id) as vendor_count
            ')
            ->groupBy('tds_rate')
            ->orderByDesc('total_tds')
            ->get();

        // Recent TDS deductions
        $recentDeductions = VendorPayout::query()
            ->with('vendor:id,business_name,email,pan_number')
            ->when($dateRange, function ($query) use ($dateRange) {
                return $query->whereBetween('period_start', [$dateRange['start'], $dateRange['end']]);
            })
            ->where('tds_amount', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_tds_deducted' => (float) ($summary->total_tds_deducted ?? 0),
                'avg_tds_rate' => (float) ($summary->avg_tds_rate ?? 0),
                'total_vendors' => (int) ($summary->total_vendors ?? 0),
                'total_payouts' => (int) ($summary->total_payouts ?? 0),
                'total_sales_value' => (float) ($summary->total_sales_value ?? 0),
                'total_net_payouts' => (float) ($summary->total_net_payouts ?? 0),
            ],
            'monthly_trend' => $monthlyTrend,
            'top_vendors' => $topVendors,
            'tds_by_rate' => $tdsByRate,
            'recent_deductions' => $recentDeductions,
            'financial_year' => $financialYear,
        ]);
    }

    /**
     * Get TDS records with filters
     */
    public function index(Request $request)
    {
        $query = VendorPayout::query()
            ->with('vendor:id,business_name,email,pan_number,gstin')
            ->where('tds_amount', '>', 0);

        // Filter by vendor
        if ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by financial year
        if ($request->filled('financial_year')) {
            $fy = $request->financial_year;
            $fyStart = Carbon::createFromFormat('Y', explode('-', $fy)[0])->month(4)->day(1)->startOfDay();
            $fyEnd = Carbon::createFromFormat('Y', explode('-', $fy)[1])->month(3)->day(31)->endOfDay();
            $query->whereBetween('period_start', [$fyStart, $fyEnd]);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('period_start', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('period_end', '<=', $request->end_date);
        }

        // Filter by TDS rate
        if ($request->filled('tds_rate')) {
            $query->where('tds_rate', $request->tds_rate);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payout_number', 'like', "%{$search}%")
                    ->orWhereHas('vendor', function ($vq) use ($search) {
                        $vq->where('business_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('pan_number', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $records = $query->paginate($perPage);

        return response()->json($records);
    }

    /**
     * Get TDS certificate data for a specific payout
     */
    public function certificate($payoutId)
    {
        $payout = VendorPayout::with('vendor')->findOrFail($payoutId);

        if ($payout->tds_amount <= 0) {
            return response()->json([
                'message' => 'No TDS deducted for this payout'
            ], 400);
        }

        // Calculate financial year
        $periodStart = Carbon::parse($payout->period_start);
        $financialYear = $this->getFinancialYearForDate($periodStart);

        // Certificate data
        $certificateData = [
            'certificate_number' => 'TDS-' . $payout->payout_number,
            'financial_year' => $financialYear,
            'payout' => $payout,
            'vendor' => $payout->vendor,
            'deductor' => [
                'name' => config('app.name'),
                'tan' => config('app.tan_number', 'XXXX00000X'), // Configure in .env
                'pan' => config('app.pan_number', 'AAAA0000A'), // Configure in .env
                'address' => config('app.address', ''),
            ],
            'deductee' => [
                'name' => $payout->vendor->business_name,
                'pan' => $payout->vendor->pan_number,
                'address' => $payout->vendor->address,
            ],
            'tds_details' => [
                'section' => '194-O',
                'gross_amount' => $payout->total_sales,
                'tds_rate' => $payout->tds_rate,
                'tds_amount' => $payout->tds_amount,
                'net_amount' => $payout->net_amount,
                'period_start' => $payout->period_start,
                'period_end' => $payout->period_end,
                'deduction_date' => $payout->processed_at ?? $payout->created_at,
            ],
            'generated_at' => now(),
        ];

        return response()->json($certificateData);
    }

    /**
     * Download TDS certificate as PDF
     */
    public function downloadCertificate($payoutId)
    {
        $payout = VendorPayout::with('vendor')->findOrFail($payoutId);

        if ($payout->tds_amount <= 0) {
            return response()->json([
                'message' => 'No TDS deducted for this payout'
            ], 400);
        }

        // Calculate financial year
        $periodStart = Carbon::parse($payout->period_start);
        $financialYear = $this->getFinancialYearForDate($periodStart);

        // Certificate data
        $certificate = [
            'certificate_number' => 'TDS-' . $payout->payout_number,
            'financial_year' => $financialYear,
            'payout' => $payout,
            'vendor' => $payout->vendor,
            'deductor' => [
                'name' => config('app.name'),
                'tan' => config('app.tan_number', 'XXXX00000X'),
                'pan' => config('app.pan_number', 'AAAA0000A'),
                'address' => config('app.address', ''),
            ],
            'deductee' => [
                'name' => $payout->vendor->business_name,
                'pan' => $payout->vendor->pan_number,
                'address' => $payout->vendor->address,
            ],
            'tds_details' => [
                'section' => '194-O',
                'gross_amount' => $payout->total_sales,
                'tds_rate' => $payout->tds_rate,
                'tds_amount' => $payout->tds_amount,
                'net_amount' => $payout->net_amount,
                'period_start' => $payout->period_start,
                'period_end' => $payout->period_end,
                'deduction_date' => $payout->processed_at ?? $payout->created_at,
            ],
            'generated_at' => now(),
        ];

        // Generate PDF
        $pdf = Pdf::loadView('pdf.tds-certificate', ['certificate' => $certificate]);

        // Set paper size and orientation
        $pdf->setPaper('a4', 'portrait');

        // Download with filename
        $filename = 'TDS_Certificate_' . $payout->payout_number . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Get TDS summary by vendor
     */
    public function vendorSummary(Request $request, $vendorId)
    {
        $financialYear = $request->get('financial_year', $this->getCurrentFinancialYear());
        $dateRange = $this->getFinancialYearRange($financialYear);

        $vendor = Vendor::findOrFail($vendorId);

        // Get all payouts for the vendor in the financial year
        $payouts = VendorPayout::where('vendor_id', $vendorId)
            ->whereBetween('period_start', [$dateRange['start'], $dateRange['end']])
            ->where('tds_amount', '>', 0)
            ->orderBy('period_start', 'desc')
            ->get();

        // Summary
        $summary = [
            'total_tds_deducted' => $payouts->sum('tds_amount'),
            'total_sales' => $payouts->sum('total_sales'),
            'total_payouts' => $payouts->sum('net_amount'),
            'payout_count' => $payouts->count(),
            'avg_tds_rate' => $payouts->avg('tds_rate'),
        ];

        // Quarterly breakdown
        $quarterlyBreakdown = $payouts->groupBy(function ($payout) {
            $date = Carbon::parse($payout->period_start);
            return $date->format('Y') . '-Q' . $date->quarter;
        })->map(function ($quarterPayouts) {
            return [
                'tds_amount' => $quarterPayouts->sum('tds_amount'),
                'sales' => $quarterPayouts->sum('total_sales'),
                'payout_count' => $quarterPayouts->count(),
            ];
        });

        return response()->json([
            'vendor' => $vendor,
            'financial_year' => $financialYear,
            'summary' => $summary,
            'quarterly_breakdown' => $quarterlyBreakdown,
            'payouts' => $payouts,
        ]);
    }

    /**
     * Get financial year range
     */
    private function getFinancialYearRange($financialYear)
    {
        $years = explode('-', $financialYear);
        $startYear = $years[0];
        $endYear = $years[1];

        return [
            'start' => Carbon::createFromFormat('Y-m-d', "{$startYear}-04-01")->startOfDay(),
            'end' => Carbon::createFromFormat('Y-m-d', "{$endYear}-03-31")->endOfDay(),
        ];
    }

    /**
     * Get current financial year
     */
    private function getCurrentFinancialYear()
    {
        $now = Carbon::now();
        $currentYear = $now->year;
        $currentMonth = $now->month;

        if ($currentMonth >= 4) {
            return $currentYear . '-' . ($currentYear + 1);
        } else {
            return ($currentYear - 1) . '-' . $currentYear;
        }
    }

    /**
     * Get financial year for a specific date
     */
    private function getFinancialYearForDate($date)
    {
        $date = Carbon::parse($date);
        $year = $date->year;
        $month = $date->month;

        if ($month >= 4) {
            return $year . '-' . ($year + 1);
        } else {
            return ($year - 1) . '-' . $year;
        }
    }

    /**
     * Get date range based on period
     */
    private function getDateRange($period, $financialYear = null)
    {
        $now = Carbon::now();

        switch ($period) {
            case 'day':
                return ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case 'week':
                return ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()];
            case 'month':
                return ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
            case 'quarter':
                return ['start' => $now->copy()->startOfQuarter(), 'end' => $now->copy()->endOfQuarter()];
            case 'year':
                if ($financialYear) {
                    return $this->getFinancialYearRange($financialYear);
                }
                return ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()];
            case 'all':
                return null;
            default:
                return ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
        }
    }
}
