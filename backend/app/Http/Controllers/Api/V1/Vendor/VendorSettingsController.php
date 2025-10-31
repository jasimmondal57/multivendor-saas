<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorStore;
use App\Models\VendorBankAccount;
use Illuminate\Http\Request;

class VendorSettingsController extends Controller
{
    /**
     * Get vendor profile
     */
    public function getProfile(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $vendor->load(['user', 'store', 'bankAccount']);

        return response()->json([
            'success' => true,
            'data' => $vendor,
        ]);
    }

    /**
     * Update vendor profile (name and other non-sensitive fields are not editable after registration)
     */
    public function updateProfile(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Name and other profile details are not editable after registration
        // Only email and phone can be changed through OTP verification

        return response()->json([
            'success' => false,
            'message' => 'Profile details cannot be changed. To update email or phone, use the respective change endpoints with OTP verification.',
        ], 422);
    }

    /**
     * Request email change - Send OTP to old email
     */
    public function requestEmailChange(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'new_email' => 'required|email|unique:users,email',
        ]);

        // Generate OTP for old email
        $oldOtp = rand(100000, 999999);

        // Store OTP in session or cache
        cache()->put('email_change_old_otp_' . $request->user()->id, $oldOtp, now()->addMinutes(10));
        cache()->put('email_change_new_email_' . $request->user()->id, $request->new_email, now()->addMinutes(10));

        // TODO: Send OTP to old email via email service
        // For now, return OTP in response (remove in production)

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to your current email address',
            'debug_otp' => $oldOtp, // Remove in production
        ]);
    }

    /**
     * Verify old email OTP and send OTP to new email
     */
    public function verifyOldEmailOtp(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get('email_change_old_otp_' . $request->user()->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Generate OTP for new email
        $newOtp = rand(100000, 999999);
        $newEmail = cache()->get('email_change_new_email_' . $request->user()->id);

        cache()->put('email_change_new_otp_' . $request->user()->id, $newOtp, now()->addMinutes(10));

        // TODO: Send OTP to new email via email service

        return response()->json([
            'success' => true,
            'message' => 'Old email verified. OTP sent to new email address',
            'debug_otp' => $newOtp, // Remove in production
        ]);
    }

    /**
     * Verify new email OTP and complete email change
     */
    public function verifyNewEmailOtp(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get('email_change_new_otp_' . $request->user()->id);
        $newEmail = cache()->get('email_change_new_email_' . $request->user()->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Update email
        $request->user()->update(['email' => $newEmail]);

        // Clear cache
        cache()->forget('email_change_old_otp_' . $request->user()->id);
        cache()->forget('email_change_new_otp_' . $request->user()->id);
        cache()->forget('email_change_new_email_' . $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Email updated successfully',
            'data' => $vendor->fresh(['user']),
        ]);
    }

    /**
     * Request phone change - Send WhatsApp OTP to old phone
     */
    public function requestPhoneChange(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'new_phone' => 'required|string|max:15|unique:users,phone',
        ]);

        // Generate OTP for old phone
        $oldOtp = rand(100000, 999999);

        // Store OTP in cache
        cache()->put('phone_change_old_otp_' . $request->user()->id, $oldOtp, now()->addMinutes(10));
        cache()->put('phone_change_new_phone_' . $request->user()->id, $request->new_phone, now()->addMinutes(10));

        // TODO: Send WhatsApp OTP to old phone

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp OTP sent to your current phone number',
            'debug_otp' => $oldOtp, // Remove in production
        ]);
    }

    /**
     * Verify old phone OTP and send WhatsApp OTP to new phone
     */
    public function verifyOldPhoneOtp(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get('phone_change_old_otp_' . $request->user()->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Generate OTP for new phone
        $newOtp = rand(100000, 999999);
        $newPhone = cache()->get('phone_change_new_phone_' . $request->user()->id);

        cache()->put('phone_change_new_otp_' . $request->user()->id, $newOtp, now()->addMinutes(10));

        // TODO: Send WhatsApp OTP to new phone

        return response()->json([
            'success' => true,
            'message' => 'Old phone verified. WhatsApp OTP sent to new phone number',
            'debug_otp' => $newOtp, // Remove in production
        ]);
    }

    /**
     * Verify new phone OTP and complete phone change
     */
    public function verifyNewPhoneOtp(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get('phone_change_new_otp_' . $request->user()->id);
        $newPhone = cache()->get('phone_change_new_phone_' . $request->user()->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Update phone
        $request->user()->update(['phone' => $newPhone]);

        // Clear cache
        cache()->forget('phone_change_old_otp_' . $request->user()->id);
        cache()->forget('phone_change_new_otp_' . $request->user()->id);
        cache()->forget('phone_change_new_phone_' . $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Phone number updated successfully',
            'data' => $vendor->fresh(['user']),
        ]);
    }

    /**
     * Update store details
     */
    public function updateStore(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'business_address' => 'nullable|string',
            'business_city' => 'nullable|string|max:100',
            'business_state' => 'nullable|string|max:100',
            'business_pincode' => 'nullable|string|max:10',
            'business_phone' => 'nullable|string|max:20',
            'business_email' => 'nullable|email|max:255',
        ]);

        $vendor->update($request->only([
            'business_name',
            'description',
            'business_address',
            'business_city',
            'business_state',
            'business_pincode',
            'business_phone',
            'business_email',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Store details updated successfully',
            'data' => $vendor->fresh(),
        ]);
    }

    /**
     * Get bank details
     */
    public function getBankDetails(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $bankAccount = $vendor->bankAccount;
        $pendingRequest = $vendor->pendingBankChangeRequest;

        return response()->json([
            'success' => true,
            'data' => [
                'current_bank' => $bankAccount,
                'pending_request' => $pendingRequest,
            ],
        ]);
    }
}

