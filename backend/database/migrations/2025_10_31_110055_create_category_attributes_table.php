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
        Schema::create('category_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name'); // e.g., 'Size', 'Color', 'Fabric', 'Occasion'
            $table->string('slug'); // e.g., 'size', 'color', 'fabric'
            $table->enum('input_type', ['text', 'number', 'select', 'multi_select', 'color', 'textarea'])->default('text');
            $table->json('options')->nullable(); // For select/multi_select: ["S", "M", "L", "XL"]
            $table->boolean('is_required')->default(false);
            $table->boolean('is_filterable')->default(true); // Can be used for filtering products
            $table->boolean('is_variant')->default(false); // If true, this attribute creates variants (like size, color)
            $table->integer('sort_order')->default(0);
            $table->text('help_text')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['category_id', 'slug']);
            $table->index('is_filterable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_attributes');
    }
};
