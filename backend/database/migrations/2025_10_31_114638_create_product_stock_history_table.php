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
        Schema::create('product_stock_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['increase', 'decrease']); // Type of stock change
            $table->integer('quantity'); // Quantity changed (positive number)
            $table->integer('previous_stock'); // Stock before change
            $table->integer('new_stock'); // Stock after change
            $table->enum('reason', [
                'restock', // New stock received
                'sale', // Sold to customer
                'damage', // Damaged/defective items
                'return', // Customer return
                'correction', // Manual correction
                'initial', // Initial stock setup
                'other' // Other reasons
            ])->default('other');
            $table->text('notes')->nullable(); // Additional notes
            $table->timestamps();

            // Indexes for better query performance
            $table->index('product_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_stock_history');
    }
};
