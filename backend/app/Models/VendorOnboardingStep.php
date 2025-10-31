<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorOnboardingStep extends Model
{
    protected $fillable = [
        'vendor_id',
        'current_step',
        'step_1_completed',
        'step_2_completed',
        'step_3_completed',
        'step_4_completed',
        'step_5_completed',
        'is_completed',
        'verification_status',
        'rejection_reason',
        'submitted_at',
        'verified_at',
    ];

    protected $casts = [
        'step_1_completed' => 'boolean',
        'step_2_completed' => 'boolean',
        'step_3_completed' => 'boolean',
        'step_4_completed' => 'boolean',
        'step_5_completed' => 'boolean',
        'is_completed' => 'boolean',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function getProgressPercentageAttribute(): int
    {
        $completed = 0;
        for ($i = 1; $i <= 5; $i++) {
            if ($this->{"step_{$i}_completed"}) {
                $completed++;
            }
        }
        return ($completed / 5) * 100;
    }
}
