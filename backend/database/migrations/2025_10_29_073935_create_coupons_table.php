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
        if (!Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('type', ['percentage', 'fixed', 'free_shipping'])->default('percentage');
                $table->decimal('value', 10, 2); // Percentage or fixed amount
                $table->decimal('min_order_amount', 10, 2)->default(0);
                $table->decimal('max_discount_amount', 10, 2)->nullable();
                $table->integer('usage_limit')->nullable(); // Total usage limit
                $table->integer('usage_limit_per_user')->default(1);
                $table->integer('used_count')->default(0);
                $table->timestamp('valid_from')->nullable();
                $table->timestamp('valid_until')->nullable();
                $table->boolean('is_active')->default(true);
                $table->json('applicable_categories')->nullable(); // Array of category IDs
                $table->json('applicable_products')->nullable(); // Array of product IDs
                $table->timestamps();

                $table->index('code');
                $table->index('is_active');
            });
        }

        // Coupon usage tracking
        if (!Schema::hasTable('coupon_usage')) {
            Schema::create('coupon_usage', function (Blueprint $table) {
                $table->id();
                $table->foreignId('coupon_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->decimal('discount_amount', 10, 2);
                $table->timestamps();

                $table->index(['coupon_id', 'user_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
