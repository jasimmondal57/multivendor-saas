<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorOnboardingStep;
use App\Models\VendorKycDocument;
use App\Models\VendorBankAccount;
use App\Models\VendorStore;
use Illuminate\Http\Request;

class VendorOnboardingController extends Controller
{
    // Get onboarding status
    public function status(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $onboarding = VendorOnboardingStep::firstOrCreate(
            ['vendor_id' => $vendor->id],
            ['current_step' => 1, 'is_completed' => false]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'is_completed' => $onboarding->is_completed ?? false,
                'current_step' => $onboarding->current_step ?? 1,
                'progress_percentage' => $onboarding->progress_percentage,
                'step_1_completed' => $onboarding->step_1_completed ?? false,
                'step_2_completed' => $onboarding->step_2_completed ?? false,
                'step_3_completed' => $onboarding->step_3_completed ?? false,
                'step_4_completed' => $onboarding->step_4_completed ?? false,
                'step_5_completed' => $onboarding->step_5_completed ?? false,
                'verification_status' => $onboarding->verification_status,
                'onboarding' => $onboarding,
                'vendor' => $vendor,
            ],
        ]);
    }

    // Step 1: Business Information
    public function updateBusinessInfo(Request $request)
    {
        $vendor = $request->user()->vendor;

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|in:individual,proprietorship,partnership,private_limited,llp,public_limited',
            'business_category' => 'required|string',
            'business_description' => 'nullable|string',
            'business_address' => 'required|string',
            'business_city' => 'required|string',
            'business_state' => 'required|string',
            'business_pincode' => 'required|string|max:6',
            'contact_person_name' => 'required|string',
            'contact_person_phone' => 'required|string',
            'contact_person_email' => 'required|email',
        ]);

        // Clean phone number - remove country code, spaces, dashes, etc.
        if (isset($validated['contact_person_phone'])) {
            $phone = $validated['contact_person_phone'];
            // Remove +91, spaces, dashes, parentheses
            $phone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
            // Remove country code if present
            $phone = preg_replace('/^91/', '', $phone);
            // Take only last 10 digits
            $validated['contact_person_phone'] = substr($phone, -10);
        }

        $vendor->update($validated);

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendor->id)->first();
        $onboarding->update([
            'step_1_completed' => true,
            'current_step' => 2,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Business information updated successfully',
            'data' => ['onboarding' => $onboarding],
        ]);
    }

    // Step 2: PAN & GST Details
    public function updateKycDetails(Request $request)
    {
        $vendor = $request->user()->vendor;

        $validated = $request->validate([
            'pan_number' => 'required|string|size:10',
            'pan_holder_name' => 'required|string',
            'gstin' => 'nullable|string|size:15',
            'gst_registered' => 'required|boolean',
        ]);

        $vendor->update($validated);

        // Create or update KYC document
        VendorKycDocument::updateOrCreate(
            ['vendor_id' => $vendor->id, 'document_type' => 'pan_card'],
            [
                'document_number' => $validated['pan_number'],
                'document_url' => $request->pan_document_url ?? null,
                'verification_status' => 'pending',
            ]
        );

        if ($validated['gst_registered'] && !empty($validated['gstin'])) {
            VendorKycDocument::updateOrCreate(
                ['vendor_id' => $vendor->id, 'document_type' => 'gst_certificate'],
                [
                    'document_number' => $validated['gstin'],
                    'document_url' => $request->gst_document_url ?? null,
                    'verification_status' => 'pending',
                ]
            );
        }

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendor->id)->first();
        $onboarding->update([
            'step_2_completed' => true,
            'current_step' => 3,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'KYC details updated successfully',
            'data' => ['onboarding' => $onboarding],
        ]);
    }

    // Step 3: Bank Account Details
    public function updateBankDetails(Request $request)
    {
        $vendor = $request->user()->vendor;

        $validated = $request->validate([
            'account_holder_name' => 'required|string',
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string|size:11',
            'bank_name' => 'required|string',
            'branch_name' => 'required|string',
            'account_type' => 'required|in:savings,current',
        ]);

        VendorBankAccount::updateOrCreate(
            ['vendor_id' => $vendor->id],
            array_merge($validated, ['is_verified' => false])
        );

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendor->id)->first();
        $onboarding->update([
            'step_3_completed' => true,
            'current_step' => 4,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bank details updated successfully',
            'data' => ['onboarding' => $onboarding],
        ]);
    }

    // Step 4: Store Setup
    public function updateStoreDetails(Request $request)
    {
        $vendor = $request->user()->vendor;

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_description' => 'nullable|string',
            'store_logo' => 'nullable|url',
            'store_banner' => 'nullable|url',
            'customer_support_email' => 'required|email',
            'customer_support_phone' => 'required|string',
        ]);

        // Note: Shipping and return policies are managed centrally by admin
        // They are not vendor-specific in a multi-vendor marketplace

        VendorStore::updateOrCreate(
            ['vendor_id' => $vendor->id],
            $validated
        );

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendor->id)->first();
        $onboarding->update([
            'step_4_completed' => true,
            'current_step' => 5,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store details updated successfully',
            'data' => ['onboarding' => $onboarding],
        ]);
    }

    // Step 5: Upload Documents
    public function uploadDocuments(Request $request)
    {
        $vendor = $request->user()->vendor;

        $validated = $request->validate([
            'documents' => 'required|array',
            'documents.*.type' => 'required|in:pan_card,gst_certificate,cancelled_cheque,address_proof,identity_proof',
            'documents.*.url' => 'required|url',
            'documents.*.number' => 'nullable|string',
        ]);

        foreach ($validated['documents'] as $doc) {
            VendorKycDocument::updateOrCreate(
                [
                    'vendor_id' => $vendor->id,
                    'document_type' => $doc['type'],
                ],
                [
                    'document_url' => $doc['url'],
                    'document_number' => $doc['number'] ?? null,
                    'verification_status' => 'pending',
                ]
            );
        }

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendor->id)->first();
        $onboarding->update([
            'step_5_completed' => true,
            'is_completed' => true,
            'verification_status' => 'in_review',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully. Your application is under review.',
            'data' => ['onboarding' => $onboarding],
        ]);
    }

    // Admin: Approve vendor
    public function approve(Request $request, $vendorId)
    {
        $onboarding = VendorOnboardingStep::where('vendor_id', $vendorId)->firstOrFail();

        $onboarding->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        $vendor = Vendor::findOrFail($vendorId);
        $vendor->update([
            'verification_status' => 'approved',
            'status' => 'active',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vendor approved successfully',
        ]);
    }

    // Admin: Reject vendor
    public function reject(Request $request, $vendorId)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $onboarding = VendorOnboardingStep::where('vendor_id', $vendorId)->firstOrFail();

        $onboarding->update([
            'verification_status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vendor rejected',
        ]);
    }

    // Admin: Get pending vendors
    public function pendingVendors()
    {
        $vendors = VendorOnboardingStep::where('verification_status', 'in_review')
            ->with(['vendor.user', 'vendor.kycDocuments', 'vendor.bankAccount', 'vendor.store'])
            ->orderBy('submitted_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $vendors,
        ]);
    }
}
