<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBankChangeRequest extends Model
{
    protected $fillable = [
        'vendor_id',
        'old_account_holder_name',
        'old_account_number',
        'old_ifsc_code',
        'old_bank_name',
        'old_branch_name',
        'new_account_holder_name',
        'new_account_number',
        'new_ifsc_code',
        'new_bank_name',
        'new_branch_name',
        'new_account_type',
        'cancelled_cheque_url',
        'status',
        'vendor_notes',
        'admin_notes',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getMaskedOldAccountNumberAttribute(): string
    {
        if (!$this->old_account_number) {
            return '';
        }

        $length = strlen($this->old_account_number);
        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . substr($this->old_account_number, -4);
    }

    public function getMaskedNewAccountNumberAttribute(): string
    {
        if (!$this->new_account_number) {
            return '';
        }

        $length = strlen($this->new_account_number);
        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . substr($this->new_account_number, -4);
    }
}
