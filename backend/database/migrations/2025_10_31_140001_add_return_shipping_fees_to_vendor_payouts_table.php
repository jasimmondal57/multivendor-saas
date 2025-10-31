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
            // Return shipping fees deducted from vendor payout
            $table->decimal('return_shipping_fees', 15, 2)->default(0)->after('tds_rate')
                ->comment('Total return shipping fees (₹150 per customer-initiated return) deducted from payout');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_payouts', function (Blueprint $table) {
            $table->dropColumn('return_shipping_fees');
        });
    }
};

