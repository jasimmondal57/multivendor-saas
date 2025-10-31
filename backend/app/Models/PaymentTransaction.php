<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'transaction_id',
        'payment_gateway',
        'payment_method',
        'amount',
        'currency',
        'status',
        'gateway_response',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

