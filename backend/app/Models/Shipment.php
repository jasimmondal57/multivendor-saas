<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'vendor_id',
        'awb_number',
        'tracking_id',
        'shipment_id',
        'courier_partner',
        'status',
        'pickup_location',
        'pickup_scheduled_at',
        'picked_up_at',
        'expected_delivery_date',
        'delivered_at',
        'delivered_to',
        'delivery_proof_url',
        'weight',
        'length',
        'width',
        'height',
        'package_count',
        'shipping_charge',
        'cod_charge',
        'total_freight',
        'shipping_label_url',
        'manifest_url',
        'delhivery_response',
        'remarks',
        'failure_reason',
    ];

    protected $casts = [
        'pickup_scheduled_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'expected_delivery_date' => 'datetime',
        'delivered_at' => 'datetime',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'package_count' => 'integer',
        'shipping_charge' => 'decimal:2',
        'cod_charge' => 'decimal:2',
        'total_freight' => 'decimal:2',
        'delhivery_response' => 'array',
    ];

    /**
     * Get the order that owns the shipment.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the vendor that owns the shipment.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the tracking history for the shipment.
     */
    public function trackingHistory(): HasMany
    {
        return $this->hasMany(ShipmentTrackingHistory::class)->orderBy('scanned_at', 'desc');
    }

    /**
     * Get the latest tracking update.
     */
    public function latestTracking()
    {
        return $this->hasOne(ShipmentTrackingHistory::class)->latestOfMany('scanned_at');
    }

    /**
     * Check if shipment is delivered.
     */
    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    /**
     * Check if shipment is in transit.
     */
    public function isInTransit(): bool
    {
        return in_array($this->status, ['picked_up', 'in_transit', 'out_for_delivery']);
    }

    /**
     * Check if shipment can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'ready_to_ship', 'manifested']);
    }
}

