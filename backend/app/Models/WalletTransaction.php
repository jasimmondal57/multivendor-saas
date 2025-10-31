<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WalletTransaction extends Model
{
    protected $fillable = [
        'transaction_number',
        'vendor_id',
        'type',
        'category',
        'amount',
        'balance_before',
        'balance_after',
        'reference_type',
        'reference_id',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_number)) {
                $transaction->transaction_number = 'TXN-' . date('Ymd') . '-' . strtoupper(Str::random(8));
            }
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function getTypeColorAttribute(): string
    {
        return $this->type === 'credit' ? 'green' : 'red';
    }

    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            'order_payment' => 'Order Payment',
            'payout' => 'Payout',
            'commission' => 'Commission',
            'tds' => 'TDS Deduction',
            'refund' => 'Refund',
            'adjustment' => 'Adjustment',
            'penalty' => 'Penalty',
            'bonus' => 'Bonus',
            default => ucfirst($this->category),
        };
    }
}

