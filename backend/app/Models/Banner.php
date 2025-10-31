<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Banner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'title',
        'subtitle',
        'description',
        'image_desktop',
        'image_mobile',
        'image_tablet',
        'video_url',
        'cta_text',
        'cta_link',
        'cta_style',
        'text_color',
        'background_color',
        'overlay_opacity',
        'text_alignment',
        'banner_group',
        'position',
        'status',
        'start_date',
        'end_date',
        'view_count',
        'click_count',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($banner) {
            if (empty($banner->uuid)) {
                $banner->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Check if banner is active
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->start_date && $this->start_date->isFuture()) {
            return false;
        }

        if ($this->end_date && $this->end_date->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Track banner view
     */
    public function trackView(): void
    {
        $this->increment('view_count');
    }

    /**
     * Track banner click
     */
    public function trackClick(): void
    {
        $this->increment('click_count');
    }

    /**
     * Get click-through rate
     */
    public function getClickThroughRate(): float
    {
        if ($this->view_count === 0) {
            return 0;
        }

        return round(($this->click_count / $this->view_count) * 100, 2);
    }

    /**
     * Scope: Active banners
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Scope: By group
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('banner_group', $group);
    }
}
