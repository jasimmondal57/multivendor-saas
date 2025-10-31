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
        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('product_id')->after('id')->constrained()->onDelete('cascade');
            $table->string('sku')->unique()->after('product_id');
            $table->string('variant_name')->after('sku'); // e.g., "Red - Large"

            // Variant attributes stored as JSON
            // Example: {"color": "Red", "size": "Large", "material": "Cotton"}
            $table->json('attributes')->after('variant_name');

            // Pricing
            $table->decimal('price', 10, 2)->after('attributes');
            $table->decimal('compare_at_price', 10, 2)->nullable()->after('price');

            // Inventory
            $table->integer('stock_quantity')->default(0)->after('compare_at_price');
            $table->integer('low_stock_threshold')->default(5)->after('stock_quantity');

            // Physical attributes
            $table->decimal('weight', 8, 2)->nullable()->after('low_stock_threshold');

            // Images
            $table->string('image')->nullable()->after('weight');

            // Status
            $table->boolean('is_active')->default(true)->after('image');
            $table->integer('sort_order')->default(0)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn([
                'product_id',
                'sku',
                'variant_name',
                'attributes',
                'price',
                'compare_at_price',
                'stock_quantity',
                'low_stock_threshold',
                'weight',
                'image',
                'is_active',
                'sort_order',
            ]);
        });
    }
};
