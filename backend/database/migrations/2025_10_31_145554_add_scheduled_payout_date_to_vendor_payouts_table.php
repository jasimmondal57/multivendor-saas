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
        Schema::table('vendor_payouts', function (Blueprint $table) {
            // Scheduled payout date (delivery_date + 30 days return period + 1 day, skipping bank holidays)
            $table->date('scheduled_payout_date')->nullable()->after('period_end')
                ->comment('Date when payout is scheduled (after return period ends + bank holidays)');

            // Earliest delivery date in the payout period (for reference)
            $table->date('earliest_delivery_date')->nullable()->after('scheduled_payout_date')
                ->comment('Earliest delivery date in this payout period');

            // Latest delivery date in the payout period (for reference)
            $table->date('latest_delivery_date')->nullable()->after('earliest_delivery_date')
                ->comment('Latest delivery date in this payout period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_payouts', function (Blueprint $table) {
            $table->dropColumn(['scheduled_payout_date', 'earliest_delivery_date', 'latest_delivery_date']);
        });
    }
};
