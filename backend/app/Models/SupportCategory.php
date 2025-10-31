<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'user_type',
        'position',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'position' => 'integer',
    ];

    /**
     * Get tickets for this category
     */
    public function tickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for customer categories
     */
    public function scopeForCustomer($query)
    {
        return $query->whereIn('user_type', ['customer', 'both']);
    }

    /**
     * Scope for vendor categories
     */
    public function scopeForVendor($query)
    {
        return $query->whereIn('user_type', ['vendor', 'both']);
    }

    /**
     * Get ordered categories
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('position')->orderBy('name');
    }
}

