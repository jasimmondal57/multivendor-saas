<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PageSection extends Model
{
    protected $fillable = [
        'uuid',
        'page_id',
        'component_type',
        'component_name',
        'position',
        'container_width',
        'background_color',
        'background_image',
        'padding_top',
        'padding_bottom',
        'settings',
        'status',
        'is_visible_mobile',
        'is_visible_tablet',
        'is_visible_desktop',
        'start_date',
        'end_date',
        'target_audience',
    ];

    protected $casts = [
        'settings' => 'array',
        'target_audience' => 'array',
        'is_visible_mobile' => 'boolean',
        'is_visible_tablet' => 'boolean',
        'is_visible_desktop' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($section) {
            if (empty($section->uuid)) {
                $section->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the page that owns the section
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Check if section is visible
     */
    public function isVisible(): bool
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
     * Check if visible on device
     */
    public function isVisibleOnDevice(string $device): bool
    {
        return match($device) {
            'mobile' => $this->is_visible_mobile,
            'tablet' => $this->is_visible_tablet,
            'desktop' => $this->is_visible_desktop,
            default => true,
        };
    }

    /**
     * Move section up
     */
    public function moveUp(): void
    {
        $previousSection = static::where('page_id', $this->page_id)
            ->where('position', '<', $this->position)
            ->orderBy('position', 'desc')
            ->first();

        if ($previousSection) {
            $tempPosition = $this->position;
            $this->update(['position' => $previousSection->position]);
            $previousSection->update(['position' => $tempPosition]);
        }
    }

    /**
     * Move section down
     */
    public function moveDown(): void
    {
        $nextSection = static::where('page_id', $this->page_id)
            ->where('position', '>', $this->position)
            ->orderBy('position', 'asc')
            ->first();

        if ($nextSection) {
            $tempPosition = $this->position;
            $this->update(['position' => $nextSection->position]);
            $nextSection->update(['position' => $tempPosition]);
        }
    }
}
