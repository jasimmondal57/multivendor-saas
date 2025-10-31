<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MenuItem extends Model
{
    protected $fillable = [
        'uuid',
        'menu_id',
        'parent_id',
        'label',
        'url',
        'type',
        'target',
        'icon',
        'icon_position',
        'css_class',
        'position',
        'status',
        'is_visible_mobile',
        'is_visible_desktop',
        'is_mega_menu',
        'mega_menu_content',
    ];

    protected $casts = [
        'is_visible_mobile' => 'boolean',
        'is_visible_desktop' => 'boolean',
        'is_mega_menu' => 'boolean',
        'mega_menu_content' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->uuid)) {
                $item->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the menu that owns the item
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the parent menu item
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('position');
    }

    /**
     * Get active children
     */
    public function activeChildren(): HasMany
    {
        return $this->children()->where('status', 'active');
    }

    /**
     * Check if item is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if visible on device
     */
    public function isVisibleOnDevice(string $device): bool
    {
        return match($device) {
            'mobile' => $this->is_visible_mobile,
            'desktop' => $this->is_visible_desktop,
            default => true,
        };
    }

    /**
     * Check if has children
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }
}
