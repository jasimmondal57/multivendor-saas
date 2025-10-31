<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorKycDocument extends Model
{
    protected $fillable = [
        'vendor_id',
        'document_type',
        'document_number',
        'document_url',
        'verification_status',
        'rejection_reason',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'rejected';
    }
}
