<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class OtpVerification extends Model
{
    protected $fillable = [
        'phone',
        'otp',
        'purpose',
        'channel',
        'attempts',
        'is_verified',
        'verified_at',
        'expires_at',
        'ip_address',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $hidden = [
        'otp',
    ];

    /**
     * Generate OTP
     */
    public static function generate(string $phone, string $purpose, string $channel = 'whatsapp', int $length = 6): self
    {
        // Delete old OTPs for this phone and purpose
        self::where('phone', $phone)
            ->where('purpose', $purpose)
            ->where('is_verified', false)
            ->delete();

        // Generate random OTP
        $otp = str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);

        // Create new OTP record
        return self::create([
            'phone' => $phone,
            'otp' => Hash::make($otp),
            'purpose' => $purpose,
            'channel' => $channel,
            'expires_at' => now()->addMinutes(10), // 10 minutes expiry
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Verify OTP
     */
    public function verify(string $otp): bool
    {
        // Check if expired
        if ($this->expires_at < now()) {
            return false;
        }

        // Check if already verified
        if ($this->is_verified) {
            return false;
        }

        // Increment attempts
        $this->increment('attempts');

        // Check max attempts (5)
        if ($this->attempts > 5) {
            return false;
        }

        // Verify OTP
        if (Hash::check($otp, $this->otp)) {
            $this->update([
                'is_verified' => true,
                'verified_at' => now(),
            ]);
            return true;
        }

        return false;
    }

    /**
     * Check if OTP is valid
     */
    public function isValid(): bool
    {
        return !$this->is_verified
            && $this->expires_at > now()
            && $this->attempts < 5;
    }
}
