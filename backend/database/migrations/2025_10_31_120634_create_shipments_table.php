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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');

            // Delhivery Details
            $table->string('awb_number')->unique()->nullable(); // Air Waybill Number from Delhivery
            $table->string('tracking_id')->nullable(); // Delhivery tracking ID
            $table->string('shipment_id')->nullable(); // Delhivery shipment ID
            $table->string('courier_partner')->default('Delhivery'); // Courier partner name

            // Shipment Status
            $table->enum('status', [
                'pending', // Order accepted, waiting for shipment creation
                'ready_to_ship', // Vendor marked ready, waiting for pickup
                'manifested', // Shipment manifested with Delhivery
                'picked_up', // Picked up by courier
                'in_transit', // In transit to destination
                'out_for_delivery', // Out for delivery
                'delivered', // Successfully delivered
                'failed', // Delivery failed
                'rto_initiated', // Return to origin initiated
                'rto_in_transit', // Return in transit
                'rto_delivered', // Returned to vendor
                'cancelled' // Shipment cancelled
            ])->default('pending');

            // Pickup Details
            $table->string('pickup_location')->nullable();
            $table->dateTime('pickup_scheduled_at')->nullable();
            $table->dateTime('picked_up_at')->nullable();

            // Delivery Details
            $table->dateTime('expected_delivery_date')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->string('delivered_to')->nullable(); // Name of person who received
            $table->text('delivery_proof_url')->nullable(); // Photo/signature URL

            // Package Details
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->decimal('length', 8, 2)->nullable(); // in cm
            $table->decimal('width', 8, 2)->nullable(); // in cm
            $table->decimal('height', 8, 2)->nullable(); // in cm
            $table->integer('package_count')->default(1);

            // Shipping Charges
            $table->decimal('shipping_charge', 10, 2)->default(0);
            $table->decimal('cod_charge', 10, 2)->default(0);
            $table->decimal('total_freight', 10, 2)->default(0);

            // Additional Info
            $table->text('shipping_label_url')->nullable(); // URL to shipping label PDF
            $table->text('manifest_url')->nullable(); // URL to manifest PDF
            $table->json('delhivery_response')->nullable(); // Store full API response
            $table->text('remarks')->nullable();
            $table->text('failure_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('order_id');
            $table->index('vendor_id');
            $table->index('awb_number');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
