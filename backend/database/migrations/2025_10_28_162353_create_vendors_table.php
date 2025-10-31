<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Business Information
            $table->string('business_name');
            $table->string('business_type', 50)->nullable(); // proprietorship, partnership, pvt_ltd, etc
            $table->text('business_description')->nullable();
            $table->string('business_address')->nullable();
            $table->string('business_city', 100)->nullable();
            $table->string('business_state', 100)->nullable();
            $table->string('business_pincode', 10)->nullable();

            // KYC Information
            $table->string('pan_number', 10)->unique();
            $table->string('gstin', 15)->nullable()->unique();
            $table->string('aadhaar_number', 12)->nullable();
            $table->enum('kyc_status', ['pending', 'under_review', 'verified', 'rejected'])->default('pending');
            $table->text('kyc_rejection_reason')->nullable();
            $table->timestamp('kyc_verified_at')->nullable();

            // Verification Status
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

            // Performance & Tier
            $table->enum('performance_tier', ['bronze', 'silver', 'gold', 'platinum'])->default('bronze');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0.00);

            // Commission
            $table->decimal('commission_rate', 5, 2)->nullable(); // Override platform commission

            // Subscription
            $table->enum('subscription_plan', ['free', 'basic', 'pro', 'enterprise'])->default('free');
            $table->enum('subscription_status', ['trial', 'active', 'expired', 'cancelled'])->default('trial');
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamp('subscription_expires_at')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['verification_status', 'status']);
            $table->index(['performance_tier', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
