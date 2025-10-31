<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorStore;
use App\Models\VendorBankAccount;
use App\Models\OtpVerification;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class VendorSettingsController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }
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

        $validated = $request->validate([
            'new_email' => 'required|email|unique:users,email',
        ]);

        try {
            // Generate OTP for old email
            $oldOtp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store OTP and new email in cache
            cache()->put('email_change_old_otp_' . $request->user()->id, $oldOtp, now()->addMinutes(10));
            cache()->put('email_change_new_email_' . $request->user()->id, $validated['new_email'], now()->addMinutes(10));

            // Send OTP to old email
            $oldEmail = $request->user()->email;
            Mail::send([], [], function ($message) use ($oldEmail, $oldOtp, $vendor) {
                $message->to($oldEmail)
                    ->subject('Email Change Verification - OTP')
                    ->html("
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #2563eb;'>Email Change Verification</h2>
                            <p>Hello {$vendor->business_name},</p>
                            <p>You have requested to change your email address. Please use the OTP below to verify your current email:</p>
                            <div style='background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;'>
                                <h1 style='color: #1f2937; margin: 0; font-size: 32px; letter-spacing: 8px;'>{$oldOtp}</h1>
                            </div>
                            <p style='color: #6b7280;'>This OTP will expire in 10 minutes.</p>
                            <p style='color: #6b7280;'>If you did not request this change, please ignore this email.</p>
                            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
                            <p style='color: #9ca3af; font-size: 12px;'>This is an automated email. Please do not reply.</p>
                        </div>
                    ");
            });

            Log::info('Email change OTP sent to old email', [
                'user_id' => $request->user()->id,
                'old_email' => $oldEmail,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OTP sent to your current email address',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send email change OTP', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ], 500);
        }
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

        $validated = $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get('email_change_old_otp_' . $request->user()->id);

        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        try {
            // Generate OTP for new email
            $newOtp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $newEmail = cache()->get('email_change_new_email_' . $request->user()->id);

            if (!$newEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired. Please start again.',
                ], 422);
            }

            cache()->put('email_change_new_otp_' . $request->user()->id, $newOtp, now()->addMinutes(10));

            // Send OTP to new email
            Mail::send([], [], function ($message) use ($newEmail, $newOtp, $vendor) {
                $message->to($newEmail)
                    ->subject('Email Change Verification - OTP')
                    ->html("
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #2563eb;'>Email Change Verification</h2>
                            <p>Hello {$vendor->business_name},</p>
                            <p>Please use the OTP below to verify your new email address:</p>
                            <div style='background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;'>
                                <h1 style='color: #1f2937; margin: 0; font-size: 32px; letter-spacing: 8px;'>{$newOtp}</h1>
                            </div>
                            <p style='color: #6b7280;'>This OTP will expire in 10 minutes.</p>
                            <p style='color: #6b7280;'>After verification, this will become your new email address.</p>
                            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
                            <p style='color: #9ca3af; font-size: 12px;'>This is an automated email. Please do not reply.</p>
                        </div>
                    ");
            });

            Log::info('Email change OTP sent to new email', [
                'user_id' => $request->user()->id,
                'new_email' => $newEmail,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Old email verified. OTP sent to new email address',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send OTP to new email', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ], 500);
        }
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

        $validated = $request->validate([
            'new_phone' => 'required|string|max:15|unique:users,phone',
        ]);

        try {
            $oldPhone = $request->user()->phone;

            // Store new phone in cache
            cache()->put('phone_change_new_phone_' . $request->user()->id, $validated['new_phone'], now()->addMinutes(10));

            // Send OTP via WhatsApp to old phone using OtpService
            $result = $this->otpService->sendOtp($oldPhone, 'phone_change_old', 'whatsapp');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Failed to send WhatsApp OTP',
                ], 500);
            }

            Log::info('Phone change OTP sent to old phone', [
                'user_id' => $request->user()->id,
                'old_phone' => $oldPhone,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp OTP sent to your current phone number',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send phone change OTP', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send WhatsApp OTP. Please try again.',
            ], 500);
        }
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

        $validated = $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        try {
            $oldPhone = $request->user()->phone;

            // Verify OTP using OtpService
            $result = $this->otpService->verifyOtp($oldPhone, $validated['otp'], 'phone_change_old');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Invalid or expired OTP',
                ], 422);
            }

            // Get new phone from cache
            $newPhone = cache()->get('phone_change_new_phone_' . $request->user()->id);

            if (!$newPhone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired. Please start again.',
                ], 422);
            }

            // Send OTP to new phone via WhatsApp
            $newOtpResult = $this->otpService->sendOtp($newPhone, 'phone_change_new', 'whatsapp');

            if (!$newOtpResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $newOtpResult['error'] ?? 'Failed to send WhatsApp OTP to new phone',
                ], 500);
            }

            Log::info('Phone change OTP sent to new phone', [
                'user_id' => $request->user()->id,
                'new_phone' => $newPhone,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Old phone verified. WhatsApp OTP sent to new phone number',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to verify old phone OTP', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify OTP. Please try again.',
            ], 500);
        }
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

        $validated = $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        try {
            // Get new phone from cache
            $newPhone = cache()->get('phone_change_new_phone_' . $request->user()->id);

            if (!$newPhone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired. Please start again.',
                ], 422);
            }

            // Verify OTP using OtpService
            $result = $this->otpService->verifyOtp($newPhone, $validated['otp'], 'phone_change_new');

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Invalid or expired OTP',
                ], 422);
            }

            // Update phone
            $request->user()->update(['phone' => $newPhone]);

            // Clear cache
            cache()->forget('phone_change_new_phone_' . $request->user()->id);

            Log::info('Phone number updated successfully', [
                'user_id' => $request->user()->id,
                'new_phone' => $newPhone,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Phone number updated successfully',
                'data' => $vendor->fresh(['user']),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to verify new phone OTP', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify OTP. Please try again.',
            ], 500);
        }
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

