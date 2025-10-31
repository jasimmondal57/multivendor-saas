<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorPayout;
use App\Services\PayoutService;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    private PayoutService $payoutService;

    public function __construct(PayoutService $payoutService)
    {
        $this->payoutService = $payoutService;
    }

    /**
     * Get all payouts
     */
    public function index(Request $request)
    {
        $query = VendorPayout::with(['vendor', 'processedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('period_start', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('period_end', '<=', $request->to_date);
        }

        // Search by payout number
        if ($request->has('search')) {
            $query->where('payout_number', 'like', '%' . $request->search . '%');
        }

        $payouts = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }

    /**
     * Get payout details
     */
    public function show(VendorPayout $payout)
    {
        $payout->load(['vendor.bankAccount', 'processedBy']);

        return response()->json([
            'success' => true,
            'data' => $payout,
        ]);
    }

    /**
     * Calculate payout for a vendor
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
        ]);

        $vendor = Vendor::findOrFail($validated['vendor_id']);

        $result = $this->payoutService->calculatePayout(
            $vendor,
            $validated['period_start'],
            $validated['period_end']
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'success' => true,
            'data' => $result['data'],
        ]);
    }

    /**
     * Create payout
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'adjustment_amount' => 'nullable|numeric',
            'adjustment_reason' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        $vendor = Vendor::findOrFail($validated['vendor_id']);

        // Calculate payout
        $calculation = $this->payoutService->calculatePayout(
            $vendor,
            $validated['period_start'],
            $validated['period_end']
        );

        if (!$calculation['success']) {
            return response()->json($calculation, 400);
        }

        // Create payout
        $payout = $this->payoutService->createPayout($vendor, array_merge(
            $calculation['data'],
            [
                'period_start' => $validated['period_start'],
                'period_end' => $validated['period_end'],
                'adjustment_amount' => $validated['adjustment_amount'] ?? 0,
                'adjustment_reason' => $validated['adjustment_reason'] ?? null,
            ]
        ));

        if (isset($validated['admin_notes'])) {
            $payout->update(['admin_notes' => $validated['admin_notes']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payout created successfully',
            'data' => $payout->load('vendor'),
        ], 201);
    }

    /**
     * Process payout
     */
    public function process(VendorPayout $payout, Request $request)
    {
        $result = $this->payoutService->processPayout($payout, $request->user()->id);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Complete payout
     */
    public function complete(VendorPayout $payout, Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'payment_reference' => 'required|string',
            'payment_gateway' => 'nullable|string',
        ]);

        $result = $this->payoutService->completePayout($payout, $validated);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Fail payout
     */
    public function fail(VendorPayout $payout, Request $request)
    {
        $validated = $request->validate([
            'failure_reason' => 'required|string',
        ]);

        $result = $this->payoutService->failPayout($payout, $validated['failure_reason']);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Get payout statistics
     */
    public function statistics()
    {
        $stats = [
            'total_payouts' => VendorPayout::count(),
            'pending_payouts' => VendorPayout::where('status', 'pending')->count(),
            'processing_payouts' => VendorPayout::where('status', 'processing')->count(),
            'completed_payouts' => VendorPayout::where('status', 'completed')->count(),
            'failed_payouts' => VendorPayout::where('status', 'failed')->count(),
            'total_amount_paid' => VendorPayout::where('status', 'completed')->sum('net_amount'),
            'pending_amount' => VendorPayout::where('status', 'pending')->sum('net_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

