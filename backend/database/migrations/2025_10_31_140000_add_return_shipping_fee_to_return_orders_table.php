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
        Schema::table('return_orders', function (Blueprint $table) {
            // Return shipping fee (₹150 for customer-initiated returns)
            $table->decimal('return_shipping_fee', 10, 2)->default(0)->after('refund_amount');
            
            // Flag to identify customer-initiated returns vs undelivered returns
            $table->boolean('is_customer_return')->default(true)->after('return_shipping_fee')
                ->comment('true = customer initiated return (charged ₹150), false = undelivered/RTO (no charge)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('return_orders', function (Blueprint $table) {
            $table->dropColumn(['return_shipping_fee', 'is_customer_return']);
        });
    }
};

