<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PlatformRevenue extends Model
{
    use SoftDeletes;

    protected $table = 'platform_revenue';

    protected $fillable = [
        'revenue_number',
        'source_type',
        'source_reference',
        'source_id',
        'vendor_id',
        'vendor_name',
        'order_id',
        'order_number',
        'vendor_payout_id',
        'payout_number',
        'gross_amount',
        'commission_rate',
        'commission_amount',
        'gst_rate',
        'gst_amount',
        'net_revenue',
        'listing_fee',
        'advertisement_fee',
        'penalty_amount',
        'other_fees',
        'revenue_date',
        'revenue_month',
        'revenue_quarter',
        'revenue_year',
        'status',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
        'description',
        'metadata',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'net_revenue' => 'decimal:2',
        'listing_fee' => 'decimal:2',
        'advertisement_fee' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'other_fees' => 'decimal:2',
        'revenue_date' => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($revenue) {
            if (empty($revenue->revenue_number)) {
                $revenue->revenue_number = 'REV-' . date('Ymd') . '-' . strtoupper(Str::random(8));
            }

            // Auto-set period fields
            if ($revenue->revenue_date) {
                $date = \Carbon\Carbon::parse($revenue->revenue_date);
                $revenue->revenue_month = $date->format('Y-m');
                $revenue->revenue_quarter = $date->format('Y') . '-Q' . $date->quarter;
                $revenue->revenue_year = $date->format('Y');
            }

            // Auto-confirm if not set
            if ($revenue->status === 'confirmed' && !$revenue->confirmed_at) {
                $revenue->confirmed_at = now();
            }
        });
    }

    /**
     * Get the vendor
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the payout
     */
    public function payout(): BelongsTo
    {
        return $this->belongsTo(VendorPayout::class, 'vendor_payout_id');
    }

    /**
     * Scope for confirmed revenue
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for specific period
     */
    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('revenue_date', [$startDate, $endDate]);
    }

    /**
     * Scope for specific month
     */
    public function scopeForMonth($query, $month)
    {
        return $query->where('revenue_month', $month);
    }

    /**
     * Scope for specific year
     */
    public function scopeForYear($query, $year)
    {
        return $query->where('revenue_year', $year);
    }

    /**
     * Scope for specific source type
     */
    public function scopeBySourceType($query, $type)
    {
        return $query->where('source_type', $type);
    }
}
