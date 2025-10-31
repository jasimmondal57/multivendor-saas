<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnOrder;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminReturnController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all return orders (admin view)
     */
    public function index(Request $request)
    {
        $query = ReturnOrder::with(['order', 'orderItem.product', 'customer', 'vendor', 'product']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($oq) use ($search) {
                        $oq->where('order_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = $request->get('per_page', 15);
        $returns = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    /**
     * Get return statistics (admin)
     */
    public function statistics(Request $request)
    {
        $stats = [
            'total_returns' => ReturnOrder::count(),
            'pending_approval' => ReturnOrder::where('status', 'pending_approval')->count(),
            'approved' => ReturnOrder::where('status', 'approved')->count(),
            'rejected' => ReturnOrder::where('status', 'rejected')->count(),
            'in_transit' => ReturnOrder::whereIn('status', ['pickup_scheduled', 'in_transit', 'out_for_pickup', 'picked_up'])->count(),
            'received' => ReturnOrder::whereIn('status', ['received', 'inspecting'])->count(),
            'refund_pending' => ReturnOrder::whereIn('status', ['inspection_passed', 'refund_initiated'])->count(),
            'completed' => ReturnOrder::whereIn('status', ['refund_completed', 'completed'])->count(),
            'total_refund_amount' => ReturnOrder::whereIn('status', ['refund_completed', 'completed'])->sum('refund_amount'),
            'pending_refund_amount' => ReturnOrder::whereIn('status', ['inspection_passed', 'refund_initiated'])->sum('refund_amount'),
        ];

        // Return reasons breakdown
        $reasonsBreakdown = ReturnOrder::select('reason', DB::raw('count(*) as count'))
            ->groupBy('reason')
            ->get()
            ->pluck('count', 'reason');

        $stats['reasons_breakdown'] = $reasonsBreakdown;

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Approve single return request
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->where('status', 'pending_approval')
            ->with('customer', 'vendor')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'approved',
                'approved_at' => now(),
            ]);

            $return->addTrackingHistory(
                'approved',
                'Return request approved by admin',
                null,
                'admin',
                $user->id
            );

            DB::commit();

            // Send notification to customer
            $this->notificationService->sendReturnApprovedNotification($return, $return->customer);

            return response()->json([
                'success' => true,
                'message' => 'Return request approved successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve return: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject single return request
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->where('status', 'pending_approval')
            ->with('customer', 'vendor')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            $return->addTrackingHistory(
                'rejected',
                'Return request rejected by admin: ' . $request->reason,
                null,
                'admin',
                $user->id
            );

            DB::commit();

            // Send notification to customer
            $this->notificationService->sendReturnRejectedNotification($return, $return->customer);

            return response()->json([
                'success' => true,
                'message' => 'Return request rejected successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject return: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk approve return requests
     */
    public function bulkApprove(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'return_ids' => 'required|array|min:1',
            'return_ids.*' => 'required|exists:return_orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $returnIds = $request->return_ids;

        // Get returns that are pending approval
        $returns = ReturnOrder::whereIn('id', $returnIds)
            ->where('status', 'pending_approval')
            ->with('customer')
            ->get();

        if ($returns->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No pending returns found to approve',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $approvedCount = 0;

            foreach ($returns as $return) {
                $return->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);

                $return->addTrackingHistory(
                    'approved',
                    'Return request approved by admin',
                    null,
                    'admin',
                    $user->id
                );

                // Send notification to customer
                $this->notificationService->sendReturnApprovedNotification($return, $return->customer);

                $approvedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$approvedCount} return(s) approved successfully",
                'approved_count' => $approvedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve returns: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk reject return requests
     */
    public function bulkReject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'return_ids' => 'required|array|min:1',
            'return_ids.*' => 'required|exists:return_orders,id',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $returnIds = $request->return_ids;
        $reason = $request->reason;

        // Get returns that are pending approval
        $returns = ReturnOrder::whereIn('id', $returnIds)
            ->where('status', 'pending_approval')
            ->with('customer')
            ->get();

        if ($returns->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No pending returns found to reject',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $rejectedCount = 0;

            foreach ($returns as $return) {
                $return->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                    'rejection_reason' => $reason,
                ]);

                $return->addTrackingHistory(
                    'rejected',
                    'Return request rejected by admin: ' . $reason,
                    null,
                    'admin',
                    $user->id
                );

                // Send notification to customer
                $this->notificationService->sendReturnRejectedNotification($return, $return->customer);

                $rejectedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$rejectedCount} return(s) rejected successfully",
                'rejected_count' => $rejectedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject returns: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single return details
     */
    public function show($id)
    {
        $return = ReturnOrder::with([
            'order',
            'orderItem.product',
            'customer',
            'vendor',
            'product',
            'trackingHistory'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $return,
        ]);
    }

    /**
     * Force complete refund (admin override)
     */
    public function forceCompleteRefund(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string|max:255',
            'refund_method' => 'required|in:original_payment,wallet,bank_transfer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $return = ReturnOrder::where('id', $id)
            ->whereIn('status', ['inspection_passed', 'refund_initiated'])
            ->with('customer')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'refund_completed',
                'refund_completed_at' => now(),
                'refund_transaction_id' => $request->transaction_id,
                'refund_method' => $request->refund_method,
            ]);

            $return->addTrackingHistory(
                'refund_completed',
                'Refund completed by admin. Transaction ID: ' . $request->transaction_id,
                null,
                'admin',
                $user->id
            );

            DB::commit();

            // Send notification to customer
            $this->notificationService->sendRefundCompletedNotification($return, $return->customer);

            return response()->json([
                'success' => true,
                'message' => 'Refund marked as completed successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete refund: ' . $e->getMessage(),
            ], 500);
        }
    }
}

