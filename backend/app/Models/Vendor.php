<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Vendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'business_name',
        'business_type',
        'business_category',
        'business_description',
        'gstin',
        'pan',
        'pan_number',
        'pan_holder_name',
        'gst_registered',
        'aadhaar',
        'business_address',
        'business_city',
        'business_state',
        'business_pincode',
        'business_phone',
        'business_email',
        'contact_person_name',
        'contact_person_phone',
        'contact_person_email',
        'website',
        'description',
        'logo',
        'banner',
        'status',
        'suspension_reason',
        'suspended_at',
        'suspended_by',
        'kyc_status',
        'kyc_verified_at',
        'commission_percentage',
        'total_sales',
        'total_orders',
        'average_rating',
        'total_reviews',
    ];

    protected $casts = [
        'kyc_verified_at' => 'datetime',
        'suspended_at' => 'datetime',
        'commission_percentage' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'average_rating' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function onboardingStep()
    {
        return $this->hasOne(VendorOnboardingStep::class);
    }

    public function kycDocuments()
    {
        return $this->hasMany(VendorKycDocument::class);
    }

    public function bankAccount()
    {
        return $this->hasOne(VendorBankAccount::class);
    }

    public function store()
    {
        return $this->hasOne(VendorStore::class);
    }

    public function leaves()
    {
        return $this->hasMany(VendorLeave::class);
    }

    public function activeLeave()
    {
        return $this->hasOne(VendorLeave::class)
            ->where('status', 'active')
            ->where('from_date', '<=', now())
            ->where('to_date', '>=', now());
    }

    public function bankChangeRequests()
    {
        return $this->hasMany(VendorBankChangeRequest::class);
    }

    public function pendingBankChangeRequest()
    {
        return $this->hasOne(VendorBankChangeRequest::class)
            ->where('status', 'pending')
            ->latest();
    }

    public function suspendedBy()
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function orders()
    {
        return $this->hasManyThrough(Order::class, Product::class);
    }

    public function wallet()
    {
        return $this->hasOne(VendorWallet::class);
    }

    public function payouts()
    {
        return $this->hasMany(VendorPayout::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function isOnboardingComplete(): bool
    {
        $onboarding = $this->onboardingStep;
        return $onboarding && $onboarding->is_completed;
    }

    public function isVerified(): bool
    {
        $onboarding = $this->onboardingStep;
        return $onboarding && $onboarding->verification_status === 'approved';
    }
}
