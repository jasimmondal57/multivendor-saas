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
        Schema::create('return_orders', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained('order_items')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            // Return Details
            $table->enum('return_type', ['refund', 'replacement', 'exchange'])->default('refund');
            $table->enum('reason', [
                'defective',
                'wrong_item',
                'not_as_described',
                'damaged',
                'size_issue',
                'quality_issue',
                'changed_mind',
                'late_delivery',
                'other'
            ]);
            $table->text('reason_description')->nullable();
            $table->integer('quantity');
            $table->decimal('refund_amount', 10, 2);

            // Status Management
            $table->enum('status', [
                'requested',           // Customer requested return
                'pending_approval',    // Waiting for vendor approval
                'approved',           // Vendor approved
                'rejected',           // Vendor rejected
                'pickup_scheduled',   // Pickup scheduled
                'in_transit',         // Return shipment in transit
                'out_for_pickup',     // Out for pickup
                'picked_up',          // Picked up from customer
                'received',           // Received at vendor warehouse
                'inspecting',         // Under inspection
                'inspection_passed',  // Inspection passed
                'inspection_failed',  // Inspection failed
                'refund_initiated',   // Refund initiated
                'refund_completed',   // Refund completed
                'replacement_shipped', // Replacement shipped
                'completed',          // Return completed
                'cancelled'           // Return cancelled
            ])->default('requested');

            // Vendor Actions
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->text('inspection_notes')->nullable();
            $table->boolean('inspection_passed')->nullable();

            // Pickup Details
            $table->string('pickup_awb_number')->nullable();
            $table->string('pickup_tracking_id')->nullable();
            $table->timestamp('pickup_scheduled_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();

            // Refund Details
            $table->timestamp('refund_initiated_at')->nullable();
            $table->timestamp('refund_completed_at')->nullable();
            $table->string('refund_transaction_id')->nullable();
            $table->enum('refund_method', ['original_payment', 'wallet', 'bank_transfer'])->nullable();

            // Images
            $table->json('images')->nullable(); // Customer uploaded images

            // Courier Integration
            $table->string('courier_partner')->nullable();
            $table->json('courier_response')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('return_number');
            $table->index('status');
            $table->index(['vendor_id', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_orders');
    }
};
