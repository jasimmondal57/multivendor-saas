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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->foreignId('vendor_id')->constrained()->onDelete('restrict');

            // Product Details (snapshot at time of order)
            $table->string('product_name');
            $table->string('product_sku');

            // Pricing
            $table->integer('quantity');
            $table->decimal('price', 10, 2); // Unit price
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2); // (price * quantity) + tax - discount

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'returned',
                'refunded'
            ])->default('pending');

            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['product_id']);
            $table->index(['vendor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
