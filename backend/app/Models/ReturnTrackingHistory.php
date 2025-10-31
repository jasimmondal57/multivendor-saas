<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnTrackingHistory extends Model
{
    protected $table = 'return_tracking_history';

    protected $fillable = [
        'return_order_id',
        'status',
        'description',
        'location',
        'updated_by_type',
        'updated_by_id',
        'metadata',
        'scanned_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'scanned_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function returnOrder(): BelongsTo
    {
        return $this->belongsTo(ReturnOrder::class);
    }
}
