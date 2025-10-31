<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorLeave;
use Illuminate\Http\Request;

class VendorLeaveManagementController extends Controller
{
    /**
     * Get vendor's own leave applications
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

        $query = VendorLeave::where('vendor_id', $vendor->id)
            ->with(['approvedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $leaves = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $leaves,
        ]);
    }

    /**
     * Get vendor's leave statistics
     */
    public function stats(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $stats = [
            'pending' => VendorLeave::where('vendor_id', $vendor->id)->where('status', 'pending')->count(),
            'approved' => VendorLeave::where('vendor_id', $vendor->id)->where('status', 'approved')->count(),
            'active' => VendorLeave::where('vendor_id', $vendor->id)->where('status', 'active')->count(),
            'completed' => VendorLeave::where('vendor_id', $vendor->id)->where('status', 'completed')->count(),
            'rejected' => VendorLeave::where('vendor_id', $vendor->id)->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Create a new leave application
     */
    public function store(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'from_date' => 'required|date|after_or_equal:today',
            'to_date' => 'required|date|after:from_date',
            'type' => 'required|in:holiday,emergency,medical,other',
            'reason' => 'nullable|string|max:500',
            'auto_reactivate' => 'boolean',
        ]);

        // Check for overlapping leaves
        $overlapping = VendorLeave::where('vendor_id', $vendor->id)
            ->whereIn('status', ['pending', 'approved', 'active'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('from_date', [$request->from_date, $request->to_date])
                    ->orWhereBetween('to_date', [$request->from_date, $request->to_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('from_date', '<=', $request->from_date)
                          ->where('to_date', '>=', $request->to_date);
                    });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a leave application for overlapping dates',
            ], 400);
        }

        $leave = VendorLeave::create([
            'vendor_id' => $vendor->id,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
            'type' => $request->type,
            'reason' => $request->reason,
            'status' => 'pending',
            'auto_reactivate' => $request->get('auto_reactivate', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave application submitted successfully. Waiting for admin approval.',
            'data' => $leave,
        ], 201);
    }

    /**
     * Get a specific leave application
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

        $leave = VendorLeave::where('vendor_id', $vendor->id)
            ->with(['approvedBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $leave,
        ]);
    }

    /**
     * Cancel a pending leave application
     */
    public function cancel(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $leave = VendorLeave::where('vendor_id', $vendor->id)->findOrFail($id);

        if ($leave->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending leave applications can be cancelled',
            ], 400);
        }

        $leave->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave application cancelled successfully',
        ]);
    }

    /**
     * Update a pending leave application
     */
    public function update(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $leave = VendorLeave::where('vendor_id', $vendor->id)->findOrFail($id);

        if ($leave->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending leave applications can be updated',
            ], 400);
        }

        $request->validate([
            'from_date' => 'sometimes|required|date|after_or_equal:today',
            'to_date' => 'sometimes|required|date|after:from_date',
            'type' => 'sometimes|required|in:holiday,emergency,medical,other',
            'reason' => 'nullable|string|max:500',
            'auto_reactivate' => 'boolean',
        ]);

        // Check for overlapping leaves (excluding current leave)
        if ($request->has('from_date') || $request->has('to_date')) {
            $fromDate = $request->get('from_date', $leave->from_date);
            $toDate = $request->get('to_date', $leave->to_date);

            $overlapping = VendorLeave::where('vendor_id', $vendor->id)
                ->where('id', '!=', $id)
                ->whereIn('status', ['pending', 'approved', 'active'])
                ->where(function ($query) use ($fromDate, $toDate) {
                    $query->whereBetween('from_date', [$fromDate, $toDate])
                        ->orWhereBetween('to_date', [$fromDate, $toDate])
                        ->orWhere(function ($q) use ($fromDate, $toDate) {
                            $q->where('from_date', '<=', $fromDate)
                              ->where('to_date', '>=', $toDate);
                        });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a leave application for overlapping dates',
                ], 400);
            }
        }

        $leave->update($request->only(['from_date', 'to_date', 'type', 'reason', 'auto_reactivate']));

        return response()->json([
            'success' => true,
            'message' => 'Leave application updated successfully',
            'data' => $leave->fresh(['approvedBy']),
        ]);
    }
}

