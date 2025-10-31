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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Transaction Details
            $table->string('transaction_id')->unique();
            $table->string('payment_gateway')->nullable(); // razorpay, payu, stripe, etc.
            $table->string('payment_method'); // card, upi, netbanking, wallet, cod
            $table->string('payment_id')->nullable(); // Gateway payment ID

            // Amount
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('INR');

            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');

            // Gateway Response
            $table->json('gateway_response')->nullable();

            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['transaction_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
