<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBankAccount extends Model
{
    protected $fillable = [
        'vendor_id',
        'account_holder_name',
        'account_number',
        'ifsc_code',
        'bank_name',
        'branch_name',
        'account_type',
        'is_verified',
        'is_primary',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_primary' => 'boolean',
    ];

    protected $hidden = [
        'account_number', // Hide sensitive data
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function getMaskedAccountNumberAttribute(): string
    {
        if (!$this->account_number) {
            return '';
        }

        $length = strlen($this->account_number);
        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . substr($this->account_number, -4);
    }
}
