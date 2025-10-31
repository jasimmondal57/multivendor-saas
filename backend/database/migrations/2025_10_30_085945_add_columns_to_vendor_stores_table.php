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
        // All columns already exist in the create_vendor_stores_table migration
        // This migration is kept for backward compatibility but does nothing
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_stores', function (Blueprint $table) {
            $table->dropUnique(['vendor_id']);
            $table->dropForeign(['vendor_id']);
            $table->dropColumn([
                'vendor_id',
                'store_name',
                'store_description',
                'store_logo',
                'store_banner',
                'return_policy',
                'shipping_policy',
                'customer_support_email',
                'customer_support_phone',
            ]);
        });
    }
};
