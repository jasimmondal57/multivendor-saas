<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'mrp',
        'selling_price',
        'cost_price',
        'discount_percentage',
        'stock_quantity',
        'low_stock_threshold',
        'stock_status',
        'original_stock_status',
        'unavailability_reason',
        'weight',
        'length',
        'width',
        'height',
        'is_returnable',
        'return_period_days',
        'hsn_code',
        'gst_percentage',
        'status',
        'ban_reason',
        'banned_at',
        'banned_by',
        'is_featured',
        'is_trending',
        'meta_data',
        'view_count',
        'order_count',
        'rating',
        'review_count',
    ];

    protected $casts = [
        'mrp' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'gst_percentage' => 'decimal:2',
        'is_returnable' => 'boolean',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'meta_data' => 'array',
        'rating' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function bannedBy()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_status', 'in_stock');
    }

    /**
     * Check if product is temporarily unavailable
     */
    public function isTemporarilyUnavailable()
    {
        return $this->stock_status === 'temporarily_unavailable' || 
               !empty($this->unavailability_reason);
    }

    /**
     * Mark product as temporarily unavailable
     */
    public function markAsTemporarilyUnavailable($reason)
    {
        $this->update([
            'original_stock_status' => $this->stock_status,
            'stock_status' => 'out_of_stock',
            'unavailability_reason' => $reason,
        ]);
    }

    /**
     * Restore product availability
     */
    public function restoreAvailability()
    {
        $this->update([
            'stock_status' => $this->original_stock_status ?? 'in_stock',
            'original_stock_status' => null,
            'unavailability_reason' => null,
        ]);
    }
}
