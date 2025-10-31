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
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('category_attribute_id')->constrained('category_attributes')->onDelete('cascade');
            $table->text('value'); // Stores the actual value (can be JSON for multi_select)
            $table->timestamps();

            // Indexes
            $table->index('product_id');
            $table->index('category_attribute_id');
            $table->unique(['product_id', 'category_attribute_id']); // One value per attribute per product
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute_values');
    }
};
