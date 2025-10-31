<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReturnOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'return_number',
        'order_id',
        'order_item_id',
        'customer_id',
        'vendor_id',
        'product_id',
        'return_type',
        'reason',
        'reason_description',
        'quantity',
        'refund_amount',
        'return_shipping_fee',
        'is_customer_return',
        'status',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'received_at',
        'inspected_at',
        'inspection_notes',
        'inspection_passed',
        'pickup_awb_number',
        'pickup_tracking_id',
        'pickup_scheduled_at',
        'picked_up_at',
        'refund_initiated_at',
        'refund_completed_at',
        'refund_transaction_id',
        'refund_method',
        'images',
        'courier_partner',
        'courier_response',
    ];

    protected $casts = [
        'images' => 'array',
        'courier_response' => 'array',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'received_at' => 'datetime',
        'inspected_at' => 'datetime',
        'pickup_scheduled_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'refund_initiated_at' => 'datetime',
        'refund_completed_at' => 'datetime',
        'inspection_passed' => 'boolean',
        'is_customer_return' => 'boolean',
        'quantity' => 'integer',
        'refund_amount' => 'decimal:2',
        'return_shipping_fee' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function trackingHistory(): HasMany
    {
        return $this->hasMany(ReturnTrackingHistory::class)->orderBy('scanned_at', 'desc');
    }

    /**
     * Helper Methods
     */
    public static function generateReturnNumber(): string
    {
        $prefix = 'RET';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        return "{$prefix}-{$date}-{$random}";
    }

    public function addTrackingHistory(string $status, string $description, ?string $location = null, ?string $updatedByType = null, ?int $updatedById = null): void
    {
        $this->trackingHistory()->create([
            'status' => $status,
            'description' => $description,
            'location' => $location,
            'updated_by_type' => $updatedByType,
            'updated_by_id' => $updatedById,
            'scanned_at' => now(),
        ]);
    }
}
