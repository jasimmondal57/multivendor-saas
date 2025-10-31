<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_limit_per_user',
        'used_count',
        'valid_from',
        'valid_until',
        'is_active',
        'applicable_categories',
        'applicable_products',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        $now = Carbon::now();

        if ($this->valid_from && $now->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && $now->gt($this->valid_until)) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $orderAmount): float
    {
        if ($orderAmount < $this->min_order_amount) {
            return 0;
        }

        $discount = 0;

        if ($this->type === 'percentage') {
            $discount = ($orderAmount * $this->value) / 100;
        } elseif ($this->type === 'fixed') {
            $discount = $this->value;
        }

        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = $this->max_discount_amount;
        }

        return round($discount, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                  ->orWhere('valid_from', '<=', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', Carbon::now());
            });
    }
}
