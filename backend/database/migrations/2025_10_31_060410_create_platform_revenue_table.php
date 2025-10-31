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
        Schema::create('platform_revenue', function (Blueprint $table) {
            $table->id();
            $table->string('revenue_number')->unique(); // REV-YYYYMMDD-XXXXXXXX

            // Source Information
            $table->enum('source_type', ['commission', 'subscription', 'listing_fee', 'advertisement', 'penalty', 'other']);
            $table->string('source_reference')->nullable(); // Order ID, Payout ID, etc.
            $table->unsignedBigInteger('source_id')->nullable(); // ID of source entity

            // Vendor Information (if applicable)
            $table->foreignId('vendor_id')->nullable()->constrained()->onDelete('set null');
            $table->string('vendor_name')->nullable(); // Cached for reporting

            // Order Information (if commission from order)
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_number')->nullable();

            // Payout Information (if commission from payout)
            $table->foreignId('vendor_payout_id')->nullable()->constrained('vendor_payouts')->onDelete('set null');
            $table->string('payout_number')->nullable();

            // Financial Details
            $table->decimal('gross_amount', 15, 2); // Total transaction amount (e.g., order total)
            $table->decimal('commission_rate', 5, 2)->nullable(); // Commission % applied
            $table->decimal('commission_amount', 15, 2); // Commission earned (before GST)
            $table->decimal('gst_rate', 5, 2)->default(18); // GST rate on commission
            $table->decimal('gst_amount', 15, 2)->default(0); // GST on commission
            $table->decimal('net_revenue', 15, 2); // Commission + GST = Total revenue

            // Additional Fees
            $table->decimal('listing_fee', 15, 2)->default(0);
            $table->decimal('advertisement_fee', 15, 2)->default(0);
            $table->decimal('penalty_amount', 15, 2)->default(0);
            $table->decimal('other_fees', 15, 2)->default(0);

            // Period
            $table->date('revenue_date'); // Date when revenue was earned
            $table->string('revenue_month'); // YYYY-MM for monthly grouping
            $table->string('revenue_quarter'); // YYYY-Q1, YYYY-Q2, etc.
            $table->string('revenue_year'); // YYYY

            // Status
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'refunded'])->default('confirmed');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Metadata
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for reporting
            $table->index(['revenue_date']);
            $table->index(['revenue_month']);
            $table->index(['revenue_quarter']);
            $table->index(['revenue_year']);
            $table->index(['source_type']);
            $table->index(['vendor_id']);
            $table->index(['status']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_revenue');
    }
};
