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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique(); // TXN-YYYYMMDD-XXXXXXXX
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            
            // Transaction Details
            $table->enum('type', ['credit', 'debit']); // credit = money in, debit = money out
            $table->enum('category', [
                'order_payment', // Payment from order
                'payout', // Withdrawal/payout
                'commission', // Commission deduction
                'tds', // TDS deduction
                'refund', // Refund to customer
                'adjustment', // Manual adjustment
                'penalty', // Penalty/fine
                'bonus', // Bonus/reward
            ]);
            
            // Amount
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            
            // Reference
            $table->string('reference_type')->nullable(); // Order, Payout, etc.
            $table->unsignedBigInteger('reference_id')->nullable(); // ID of referenced entity
            $table->text('description')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['vendor_id', 'type']);
            $table->index(['vendor_id', 'category']);
            $table->index('transaction_number');
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};

