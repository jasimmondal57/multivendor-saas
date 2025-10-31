<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'vendor_id',
        'product_name',
        'product_sku',
        'quantity',
        'price',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the order that owns the item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the vendor
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}

