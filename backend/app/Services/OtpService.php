<?php

namespace App\Services;

use App\Models\OtpVerification;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class OtpService
{
    private $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Send OTP via WhatsApp
     */
    public function sendOtp(string $phone, string $purpose = 'login', string $channel = 'whatsapp'): array
    {
        try {
            // Generate plain OTP first
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Create OTP record with hashed OTP
            $otpRecord = OtpVerification::create([
                'phone' => $phone,
                'otp' => \Illuminate\Support\Facades\Hash::make($otp),
                'purpose' => $purpose,
                'channel' => $channel,
                'expires_at' => now()->addMinutes(10),
                'ip_address' => request()->ip(),
            ]);

            if ($channel === 'whatsapp') {
                // Send via WhatsApp
                $result = $this->whatsappService->sendTemplate(
                    $phone,
                    'otp_verification',
                    [$otp, '10'] // OTP and expiry time in minutes
                );

                if (!$result['success']) {
                    throw new \Exception($result['error'] ?? 'Failed to send WhatsApp OTP');
                }

                return [
                    'success' => true,
                    'message' => 'OTP sent successfully via WhatsApp',
                    'otp_id' => $otpRecord->id,
                    'expires_at' => $otpRecord->expires_at,
                ];
            } elseif ($channel === 'sms') {
                // TODO: Implement SMS sending via MSG91 or Twilio
                return [
                    'success' => false,
                    'error' => 'SMS channel not yet implemented',
                ];
            }

            return [
                'success' => false,
                'error' => 'Invalid channel',
            ];

        } catch (\Exception $e) {
            Log::error('OTP send error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(string $phone, string $otp, string $purpose = 'login'): array
    {
        try {
            // Get latest OTP for this phone and purpose
            $otpRecord = OtpVerification::where('phone', $phone)
                ->where('purpose', $purpose)
                ->where('is_verified', false)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$otpRecord) {
                return [
                    'success' => false,
                    'error' => 'No OTP found for this phone number',
                ];
            }

            // Check if OTP is valid
            if (!$otpRecord->isValid()) {
                return [
                    'success' => false,
                    'error' => 'OTP has expired or maximum attempts exceeded',
                ];
            }

            // Verify OTP
            if ($otpRecord->verify($otp)) {
                return [
                    'success' => true,
                    'message' => 'OTP verified successfully',
                    'otp_id' => $otpRecord->id,
                ];
            }

            return [
                'success' => false,
                'error' => 'Invalid OTP',
                'attempts_left' => 5 - $otpRecord->attempts,
            ];

        } catch (\Exception $e) {
            Log::error('OTP verify error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(string $phone, string $purpose = 'login', string $channel = 'whatsapp'): array
    {
        // Check rate limiting (max 3 OTPs per 10 minutes)
        $recentOtps = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->where('created_at', '>', now()->subMinutes(10))
            ->count();

        if ($recentOtps >= 3) {
            return [
                'success' => false,
                'error' => 'Too many OTP requests. Please try again later.',
            ];
        }

        return $this->sendOtp($phone, $purpose, $channel);
    }
}

