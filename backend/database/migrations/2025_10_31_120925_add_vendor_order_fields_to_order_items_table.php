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
        Schema::table('order_items', function (Blueprint $table) {
            // Vendor Action Fields
            $table->enum('vendor_status', [
                'pending', // Waiting for vendor action
                'accepted', // Vendor accepted the order
                'rejected', // Vendor rejected the order
                'ready_to_ship', // Vendor marked ready for pickup
                'shipped', // Shipped by vendor
                'delivered', // Delivered to customer
                'cancelled', // Cancelled
                'returned', // Returned by customer
                'refunded' // Refunded
            ])->default('pending')->after('status');

            $table->timestamp('accepted_at')->nullable()->after('vendor_status');
            $table->timestamp('rejected_at')->nullable()->after('accepted_at');
            $table->text('rejection_reason')->nullable()->after('rejected_at');
            $table->timestamp('ready_to_ship_at')->nullable()->after('rejection_reason');

            // Add index for vendor queries
            $table->index(['vendor_id', 'vendor_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['vendor_id', 'vendor_status']);
            $table->dropColumn([
                'vendor_status',
                'accepted_at',
                'rejected_at',
                'rejection_reason',
                'ready_to_ship_at'
            ]);
        });
    }
};
