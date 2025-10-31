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
        Schema::create('vendor_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->unique()->constrained()->onDelete('cascade');
            
            // Balance
            $table->decimal('available_balance', 15, 2)->default(0); // Available for withdrawal
            $table->decimal('pending_balance', 15, 2)->default(0); // Pending clearance
            $table->decimal('total_earned', 15, 2)->default(0); // Lifetime earnings
            $table->decimal('total_withdrawn', 15, 2)->default(0); // Lifetime withdrawals
            
            // Last Payout
            $table->timestamp('last_payout_at')->nullable();
            $table->decimal('last_payout_amount', 15, 2)->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_wallets');
    }
};

