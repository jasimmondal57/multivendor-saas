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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('restrict');

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();

            // Pricing
            $table->decimal('mrp', 10, 2); // Maximum Retail Price
            $table->decimal('selling_price', 10, 2);
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->decimal('discount_percentage', 5, 2)->default(0);

            // Inventory
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->boolean('track_inventory')->default(true);
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'low_stock'])->default('in_stock');

            // Product Details
            $table->string('brand')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('country_of_origin', 100)->default('India');
            $table->json('specifications')->nullable(); // JSON field for product specs

            // Shipping
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->decimal('length', 8, 2)->nullable(); // in cm
            $table->decimal('width', 8, 2)->nullable(); // in cm
            $table->decimal('height', 8, 2)->nullable(); // in cm
            $table->boolean('is_returnable')->default(true);
            $table->integer('return_period_days')->default(7);

            // Tax & HSN
            $table->string('hsn_code', 20)->nullable();
            $table->decimal('gst_percentage', 5, 2)->default(18.00);

            // Status & Moderation
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected', 'inactive'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

            // SEO & Marketing
            $table->json('meta_data')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_best_seller')->default(false);

            // Stats
            $table->integer('view_count')->default(0);
            $table->integer('order_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('review_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['vendor_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['slug']);
            $table->index(['sku']);
            // Note: fullText index will be added when using PostgreSQL/MySQL
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
