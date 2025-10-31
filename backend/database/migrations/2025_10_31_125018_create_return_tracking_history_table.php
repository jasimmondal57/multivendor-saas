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
        Schema::create('return_tracking_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_order_id')->constrained('return_orders')->onDelete('cascade');
            $table->string('status');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('updated_by_type')->nullable(); // 'customer', 'vendor', 'admin', 'system', 'courier'
            $table->unsignedBigInteger('updated_by_id')->nullable();
            $table->json('metadata')->nullable(); // Additional data like courier response
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('return_order_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_tracking_history');
    }
};
