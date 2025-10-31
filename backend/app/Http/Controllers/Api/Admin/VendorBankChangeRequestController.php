<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorBankChangeRequest;
use App\Models\VendorBankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorBankChangeRequestController extends Controller
{
    /**
     * Get all bank change requests
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = VendorBankChangeRequest::with(['vendor.user', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $requests = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Get single bank change request
     */
    public function show($id)
    {
        $request = VendorBankChangeRequest::with(['vendor.user', 'vendor.bankAccount', 'reviewer'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $request,
        ]);
    }

    /**
     * Approve bank change request
     */
    public function approve(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $changeRequest = VendorBankChangeRequest::with('vendor')
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();

        try {
            // Update or create bank account with new details
            VendorBankAccount::updateOrCreate(
                ['vendor_id' => $changeRequest->vendor_id],
                [
                    'account_holder_name' => $changeRequest->new_account_holder_name,
                    'account_number' => $changeRequest->new_account_number,
                    'ifsc_code' => $changeRequest->new_ifsc_code,
                    'bank_name' => $changeRequest->new_bank_name,
                    'branch_name' => $changeRequest->new_branch_name,
                    'account_type' => $changeRequest->new_account_type,
                    'is_verified' => false, // Admin can verify separately
                    'is_primary' => true,
                ]
            );

            // Update request status
            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]);

            DB::commit();

            // TODO: Send notification to vendor about approval

            return response()->json([
                'success' => true,
                'message' => 'Bank change request approved successfully',
                'data' => $changeRequest->fresh(['vendor.user', 'reviewer']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve bank change request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject bank change request
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $changeRequest = VendorBankChangeRequest::where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $changeRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        // TODO: Send notification to vendor about rejection

        return response()->json([
            'success' => true,
            'message' => 'Bank change request rejected',
            'data' => $changeRequest->fresh(['vendor.user', 'reviewer']),
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $stats = [
            'pending' => VendorBankChangeRequest::where('status', 'pending')->count(),
            'approved' => VendorBankChangeRequest::where('status', 'approved')->count(),
            'rejected' => VendorBankChangeRequest::where('status', 'rejected')->count(),
            'total' => VendorBankChangeRequest::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

