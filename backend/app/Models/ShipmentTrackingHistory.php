<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentTrackingHistory extends Model
{
    protected $table = 'shipment_tracking_history';

    protected $fillable = [
        'shipment_id',
        'status',
        'status_code',
        'status_description',
        'location',
        'city',
        'state',
        'country',
        'scan_type',
        'scanned_at',
        'scanned_by',
        'instructions',
        'remarks',
        'raw_data',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'raw_data' => 'array',
    ];

    /**
     * Get the shipment that owns the tracking history.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}

