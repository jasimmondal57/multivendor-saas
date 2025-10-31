<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    private $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Send OTP
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|regex:/^[0-9]{10}$/',
            'purpose' => 'required|in:login,registration,password_reset,phone_verification',
            'channel' => 'sometimes|in:whatsapp,sms',
        ]);

        $result = $this->otpService->sendOtp(
            $validated['phone'],
            $validated['purpose'],
            $validated['channel'] ?? 'whatsapp'
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'otp_id' => $result['otp_id'],
                    'expires_at' => $result['expires_at'],
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP',
            'error' => $result['error'],
        ], 400);
    }

    /**
     * Verify OTP
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|regex:/^[0-9]{10}$/',
            'otp' => 'required|string|size:6',
            'purpose' => 'required|in:login,registration,password_reset,phone_verification',
        ]);

        $result = $this->otpService->verifyOtp(
            $validated['phone'],
            $validated['otp'],
            $validated['purpose']
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'otp_id' => $result['otp_id'],
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'OTP verification failed',
            'error' => $result['error'],
            'attempts_left' => $result['attempts_left'] ?? null,
        ], 400);
    }

    /**
     * Resend OTP
     */
    public function resend(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|regex:/^[0-9]{10}$/',
            'purpose' => 'required|in:login,registration,password_reset,phone_verification',
            'channel' => 'sometimes|in:whatsapp,sms',
        ]);

        $result = $this->otpService->resendOtp(
            $validated['phone'],
            $validated['purpose'],
            $validated['channel'] ?? 'whatsapp'
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'otp_id' => $result['otp_id'],
                    'expires_at' => $result['expires_at'],
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to resend OTP',
            'error' => $result['error'],
        ], 400);
    }
}
