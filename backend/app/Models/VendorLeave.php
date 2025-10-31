<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorLeave extends Model
{
    protected $fillable = [
        'vendor_id',
        'from_date',
        'to_date',
        'reason',
        'type',
        'status',
        'admin_notes',
        'approved_by',
        'approved_at',
        'auto_reactivate',
        'reactivated_at',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date' => 'date',
        'approved_at' => 'datetime',
        'reactivated_at' => 'datetime',
        'auto_reactivate' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isActive()
    {
        return $this->status === 'active' &&
               now()->between($this->from_date, $this->to_date);
    }

    public function isExpired()
    {
        return now()->greaterThan($this->to_date);
    }
}
