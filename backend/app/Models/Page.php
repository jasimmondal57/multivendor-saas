<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Page extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'type',
        'template',
        'status',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        'published_at',
        'scheduled_publish_at',
        'scheduled_unpublish_at',
        'settings',
        'view_count',
    ];

    protected $casts = [
        'settings' => 'array',
        'published_at' => 'datetime',
        'scheduled_publish_at' => 'datetime',
        'scheduled_unpublish_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->uuid)) {
                $page->uuid = (string) Str::uuid();
            }
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->name);
            }
        });
    }

    /**
     * Get the sections for the page
     */
    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('position');
    }

    /**
     * Get only active sections
     */
    public function activeSections(): HasMany
    {
        return $this->sections()->where('status', 'active');
    }

    /**
     * Check if page is published
     */
    public function isPublished(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->published_at && $this->published_at->isFuture()) {
            return false;
        }

        if ($this->scheduled_unpublish_at && $this->scheduled_unpublish_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Publish the page
     */
    public function publish(): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * Unpublish the page
     */
    public function unpublish(): void
    {
        $this->update([
            'status' => 'draft',
        ]);
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
    }

    /**
     * Duplicate the page
     */
    public function duplicate(): self
    {
        $newPage = $this->replicate();
        $newPage->name = $this->name . ' (Copy)';
        $newPage->slug = $this->slug . '-copy-' . time();
        $newPage->status = 'draft';
        $newPage->published_at = null;
        $newPage->uuid = (string) Str::uuid();
        $newPage->save();

        // Duplicate sections
        foreach ($this->sections as $section) {
            $newSection = $section->replicate();
            $newSection->page_id = $newPage->id;
            $newSection->uuid = (string) Str::uuid();
            $newSection->save();
        }

        return $newPage;
    }
}
