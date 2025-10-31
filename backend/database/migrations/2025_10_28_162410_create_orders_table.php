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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('users')->onDelete('restrict');

            // Order Amounts
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('shipping_charge', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // Shipping Address
            $table->string('shipping_name');
            $table->string('shipping_phone', 15);
            $table->string('shipping_email')->nullable();
            $table->text('shipping_address');
            $table->string('shipping_city', 100);
            $table->string('shipping_state', 100);
            $table->string('shipping_pincode', 10);
            $table->string('shipping_country', 100)->default('India');

            // Billing Address
            $table->string('billing_name');
            $table->string('billing_phone', 15);
            $table->string('billing_email')->nullable();
            $table->text('billing_address');
            $table->string('billing_city', 100);
            $table->string('billing_state', 100);
            $table->string('billing_pincode', 10);
            $table->string('billing_country', 100)->default('India');

            // Payment
            $table->enum('payment_method', ['cod', 'online', 'wallet', 'upi'])->default('online');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();

            // Order Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned',
                'refunded'
            ])->default('pending');

            // Tracking
            $table->string('awb_number')->nullable(); // Air Waybill Number
            $table->string('courier_name')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Notes
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['order_number']);
            $table->index(['payment_status']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
