<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Menu extends Model
{
    protected $fillable = [
        'uuid',
        'name',
        'location',
        'status',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($menu) {
            if (empty($menu->uuid)) {
                $menu->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get all menu items (including nested)
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->whereNull('parent_id')->orderBy('position');
    }

    /**
     * Get all menu items (flat)
     */
    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('position');
    }

    /**
     * Get active menu items
     */
    public function activeItems(): HasMany
    {
        return $this->items()->where('status', 'active');
    }

    /**
     * Check if menu is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
