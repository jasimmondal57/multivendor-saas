<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class VendorPayout extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payout_number',
        'vendor_id',
        'period_start',
        'period_end',
        'scheduled_payout_date',
        'earliest_delivery_date',
        'latest_delivery_date',
        'total_sales',
        'platform_commission',
        'commission_rate',
        'commission_gst',
        'commission_gst_rate',
        'total_commission_with_gst',
        'tds_amount',
        'tds_rate',
        'return_shipping_fees',
        'adjustment_amount',
        'adjustment_reason',
        'net_amount',
        'total_orders',
        'order_ids',
        'status',
        'payment_method',
        'payment_reference',
        'payment_gateway',
        'payment_response',
        'account_holder_name',
        'account_number',
        'ifsc_code',
        'bank_name',
        'processed_at',
        'completed_at',
        'failed_at',
        'failure_reason',
        'processed_by',
        'admin_notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'scheduled_payout_date' => 'date',
        'earliest_delivery_date' => 'date',
        'latest_delivery_date' => 'date',
        'total_sales' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_gst' => 'decimal:2',
        'commission_gst_rate' => 'decimal:2',
        'total_commission_with_gst' => 'decimal:2',
        'tds_amount' => 'decimal:2',
        'tds_rate' => 'decimal:2',
        'return_shipping_fees' => 'decimal:2',
        'adjustment_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'order_ids' => 'array',
        'payment_response' => 'array',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payout) {
            if (empty($payout->payout_number)) {
                $payout->payout_number = 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(8));
            }
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'processing' => 'blue',
            'completed' => 'green',
            'failed' => 'red',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getMaskedAccountNumberAttribute(): ?string
    {
        if (!$this->account_number) {
            return null;
        }

        $length = strlen($this->account_number);
        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        return str_repeat('*', $length - 4) . substr($this->account_number, -4);
    }
}

