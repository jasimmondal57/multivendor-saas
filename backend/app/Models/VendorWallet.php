<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorWallet extends Model
{
    protected $fillable = [
        'vendor_id',
        'available_balance',
        'pending_balance',
        'total_earned',
        'total_withdrawn',
        'last_payout_at',
        'last_payout_amount',
    ];

    protected $casts = [
        'available_balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'total_withdrawn' => 'decimal:2',
        'last_payout_amount' => 'decimal:2',
        'last_payout_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'vendor_id', 'vendor_id');
    }

    public function getTotalBalanceAttribute(): float
    {
        return (float) ($this->available_balance + $this->pending_balance);
    }
}

