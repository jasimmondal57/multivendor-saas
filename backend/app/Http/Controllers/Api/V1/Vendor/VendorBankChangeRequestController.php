<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorBankChangeRequest;
use App\Models\VendorBankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VendorBankChangeRequestController extends Controller
{
    /**
     * Get all bank change requests for vendor
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

        $requests = VendorBankChangeRequest::where('vendor_id', $vendor->id)
            ->with('reviewer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Get pending bank change request
     */
    public function getPending(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $pendingRequest = VendorBankChangeRequest::where('vendor_id', $vendor->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => $pendingRequest,
        ]);
    }

    /**
     * Create new bank change request
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

        // Check if there's already a pending request
        $existingPending = VendorBankChangeRequest::where('vendor_id', $vendor->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending bank change request. Please wait for admin approval.',
            ], 422);
        }

        $validated = $request->validate([
            'new_account_holder_name' => 'required|string|max:255',
            'new_account_number' => 'required|string|max:50',
            'new_ifsc_code' => 'required|string|size:11',
            'new_bank_name' => 'required|string|max:255',
            'new_branch_name' => 'nullable|string|max:255',
            'new_account_type' => 'required|in:savings,current',
            'cancelled_cheque' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'vendor_notes' => 'nullable|string|max:500',
        ]);

        // Upload cancelled cheque
        $chequeUrl = null;
        if ($request->hasFile('cancelled_cheque')) {
            $file = $request->file('cancelled_cheque');
            $filename = 'cheque_' . $vendor->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('vendor_documents/bank_cheques', $filename, 'public');
            $chequeUrl = $path;
        }

        // Get current bank details
        $currentBank = $vendor->bankAccount;

        $changeRequest = VendorBankChangeRequest::create([
            'vendor_id' => $vendor->id,
            'old_account_holder_name' => $currentBank->account_holder_name ?? null,
            'old_account_number' => $currentBank->account_number ?? null,
            'old_ifsc_code' => $currentBank->ifsc_code ?? null,
            'old_bank_name' => $currentBank->bank_name ?? null,
            'old_branch_name' => $currentBank->branch_name ?? null,
            'new_account_holder_name' => $validated['new_account_holder_name'],
            'new_account_number' => $validated['new_account_number'],
            'new_ifsc_code' => $validated['new_ifsc_code'],
            'new_bank_name' => $validated['new_bank_name'],
            'new_branch_name' => $validated['new_branch_name'] ?? null,
            'new_account_type' => $validated['new_account_type'],
            'cancelled_cheque_url' => $chequeUrl,
            'vendor_notes' => $validated['vendor_notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bank change request submitted successfully. Admin will review it soon.',
            'data' => $changeRequest,
        ], 201);
    }

    /**
     * Cancel pending bank change request
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

        $changeRequest = VendorBankChangeRequest::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->where('status', 'pending')
            ->first();

        if (!$changeRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Pending request not found',
            ], 404);
        }

        // Delete the cancelled cheque file
        if ($changeRequest->cancelled_cheque_url) {
            Storage::disk('public')->delete($changeRequest->cancelled_cheque_url);
        }

        $changeRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank change request cancelled successfully',
        ]);
    }
}

