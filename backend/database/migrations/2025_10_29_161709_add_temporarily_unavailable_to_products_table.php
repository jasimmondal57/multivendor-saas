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
        Schema::table('products', function (Blueprint $table) {
            // Add field to store original stock status when vendor is suspended/on leave
            $table->enum('original_stock_status', ['in_stock', 'out_of_stock', 'low_stock'])->nullable()->after('stock_status');
            $table->string('unavailability_reason')->nullable()->after('original_stock_status'); // Why product is unavailable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['original_stock_status', 'unavailability_reason']);
        });
    }
};
