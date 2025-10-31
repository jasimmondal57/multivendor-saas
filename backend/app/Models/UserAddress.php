<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'name',
        'phone',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'pincode',
        'country',
        'landmark',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Set this address as default and unset others
     */
    public function setAsDefault(): void
    {
        // Unset all other default addresses for this user
        self::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        // Set this address as default
        $this->update(['is_default' => true]);
    }
}
