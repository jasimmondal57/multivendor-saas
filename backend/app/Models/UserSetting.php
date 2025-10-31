<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'email_order_updates',
        'email_promotional',
        'email_newsletter',
        'profile_public',
        'show_purchase_history',
    ];

    protected $casts = [
        'email_order_updates' => 'boolean',
        'email_promotional' => 'boolean',
        'email_newsletter' => 'boolean',
        'profile_public' => 'boolean',
        'show_purchase_history' => 'boolean',
    ];

    /**
     * Get the user that owns the settings
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
