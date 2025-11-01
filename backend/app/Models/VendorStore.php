<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorStore extends Model
{
    protected $fillable = [
        'vendor_id',
        'store_name',
        'store_description',
        'store_logo',
        'store_banner',
        'customer_support_email',
        'customer_support_phone',
        // Note: return_policy and shipping_policy removed
        // These are managed centrally by admin in multi-vendor marketplace
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function hasLogo(): bool
    {
        return !empty($this->store_logo);
    }

    public function hasBanner(): bool
    {
        return !empty($this->store_banner);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->store_logo ? url('storage/' . $this->store_logo) : null;
    }

    public function getBannerUrlAttribute(): ?string
    {
        return $this->store_banner ? url('storage/' . $this->store_banner) : null;
    }
}
