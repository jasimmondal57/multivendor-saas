<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'email',
        'phone',
        'password',
        'user_type',
        'status',
        'avatar',
        'email_verified_at',
        'phone_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Boot function to generate UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the vendor profile for the user.
     */
    public function vendor()
    {
        return $this->hasOne(Vendor::class);
    }

    /**
     * Check if user is a vendor
     */
    public function isVendor(): bool
    {
        return $this->user_type === 'vendor';
    }

    /**
     * Check if user is a customer
     */
    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    /**
     * Get the user's addresses
     */
    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * Get the user's settings
     */
    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }
}
