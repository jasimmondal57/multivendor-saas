<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorLeave;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorLeaveController extends Controller
{
    /**
     * Get all vendor leave applications
     */
    public function index(Request $request)
    {
        $query = VendorLeave::with(['vendor.user', 'approvedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search by vendor name
        if ($request->has('search')) {
            $query->whereHas('vendor', function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $leaves = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $leaves,
        ]);
    }

    /**
     * Approve vendor leave
     */
    public function approve(Request $request, $leaveId)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $leave = VendorLeave::findOrFail($leaveId);

        if ($leave->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending leave applications can be approved',
            ], 400);
        }

        $leave->update([
            'status' => 'approved',
            'admin_notes' => $request->admin_notes,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Check if leave should be activated immediately
        if (now()->between($leave->from_date, $leave->to_date)) {
            $this->activateLeave($leave);
        }

        return response()->json([
            'success' => true,
            'message' => 'Leave application approved successfully',
            'data' => $leave->load(['vendor.user', 'approvedBy']),
        ]);
    }

    /**
     * Reject vendor leave
     */
    public function reject(Request $request, $leaveId)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $leave = VendorLeave::findOrFail($leaveId);

        if ($leave->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending leave applications can be rejected',
            ], 400);
        }

        $leave->update([
            'status' => 'rejected',
            'admin_notes' => $request->admin_notes,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave application rejected successfully',
            'data' => $leave->load(['vendor.user', 'approvedBy']),
        ]);
    }

    /**
     * Activate leave (mark vendor as inactive and products as temporarily unavailable)
     */
    private function activateLeave(VendorLeave $leave)
    {
        $vendor = $leave->vendor()->with('products')->first();

        // Update vendor status to inactive
        $vendor->update(['status' => 'inactive']);

        // Mark all vendor products as temporarily unavailable
        foreach ($vendor->products as $product) {
            if ($product->stock_status !== 'out_of_stock' && empty($product->unavailability_reason)) {
                $product->markAsTemporarilyUnavailable(
                    "Vendor on leave from " . $leave->from_date->format('d M Y') . 
                    " to " . $leave->to_date->format('d M Y')
                );
            }
        }

        // Update leave status
        $leave->update(['status' => 'active']);
    }

    /**
     * Complete leave (reactivate vendor and restore product availability)
     */
    public function complete($leaveId)
    {
        $leave = VendorLeave::findOrFail($leaveId);

        if ($leave->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active leaves can be completed',
            ], 400);
        }

        $vendor = $leave->vendor()->with('products')->first();

        // Restore vendor status
        if ($leave->auto_reactivate) {
            $vendor->update(['status' => 'active']);

            // Restore product availability
            foreach ($vendor->products as $product) {
                if ($product->unavailability_reason && 
                    str_contains($product->unavailability_reason, 'Vendor on leave')) {
                    $product->restoreAvailability();
                }
            }
        }

        // Update leave status
        $leave->update([
            'status' => 'completed',
            'reactivated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave completed successfully',
            'data' => $leave->load(['vendor.user']),
        ]);
    }

    /**
     * Get leave statistics
     */
    public function stats()
    {
        $stats = [
            'pending' => VendorLeave::where('status', 'pending')->count(),
            'approved' => VendorLeave::where('status', 'approved')->count(),
            'active' => VendorLeave::where('status', 'active')->count(),
            'completed' => VendorLeave::where('status', 'completed')->count(),
            'rejected' => VendorLeave::where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
