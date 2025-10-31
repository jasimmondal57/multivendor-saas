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
        Schema::create('vendor_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('payout_number')->unique(); // PAY-YYYYMMDD-XXXXXXXX
            $table->foreignId('vendor_id')->constrained()->onDelete('restrict');
            
            // Payout Period
            $table->date('period_start');
            $table->date('period_end');
            
            // Financial Details
            $table->decimal('total_sales', 15, 2); // Total sales in period
            $table->decimal('platform_commission', 15, 2); // Commission deducted (excluding GST)
            $table->decimal('commission_rate', 5, 2); // Commission % applied
            $table->decimal('commission_gst', 15, 2)->default(0); // GST on commission (18%)
            $table->decimal('commission_gst_rate', 5, 2)->default(18); // GST rate on commission
            $table->decimal('total_commission_with_gst', 15, 2)->default(0); // Commission + GST
            $table->decimal('tds_amount', 15, 2)->default(0); // TDS deducted (Section 194-O)
            $table->decimal('tds_rate', 5, 2)->default(0); // TDS % applied
            $table->decimal('adjustment_amount', 15, 2)->default(0); // Manual adjustments (+/-)
            $table->text('adjustment_reason')->nullable();
            $table->decimal('net_amount', 15, 2); // Final payout amount
            
            // Order Details
            $table->integer('total_orders'); // Number of orders in period
            $table->json('order_ids')->nullable(); // Array of order IDs included
            
            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            
            // Payment Details
            $table->string('payment_method')->nullable(); // bank_transfer, upi, etc.
            $table->string('payment_reference')->nullable(); // UTR/Transaction ID
            $table->string('payment_gateway')->nullable(); // razorpay, cashfree, etc.
            $table->json('payment_response')->nullable();
            
            // Bank Account Details (snapshot)
            $table->string('account_holder_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('bank_name')->nullable();
            
            // Timestamps
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            // Admin Actions
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['vendor_id', 'status']);
            $table->index(['period_start', 'period_end']);
            $table->index('status');
            $table->index('payout_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_payouts');
    }
};

