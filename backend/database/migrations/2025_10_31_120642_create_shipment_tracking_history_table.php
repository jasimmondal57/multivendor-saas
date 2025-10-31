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
        Schema::create('shipment_tracking_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');

            // Status Information
            $table->string('status'); // Current status from Delhivery
            $table->string('status_code')->nullable(); // Delhivery status code
            $table->text('status_description')->nullable(); // Detailed description

            // Location Information
            $table->string('location')->nullable(); // Current location
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');

            // Scan Details
            $table->string('scan_type')->nullable(); // Pickup, In-transit, Out for delivery, etc.
            $table->dateTime('scanned_at')->nullable(); // When the scan happened
            $table->string('scanned_by')->nullable(); // Who scanned (courier person name)

            // Additional Details
            $table->text('instructions')->nullable(); // Any special instructions
            $table->text('remarks')->nullable(); // Remarks from courier
            $table->json('raw_data')->nullable(); // Store complete webhook/API response

            $table->timestamps();

            // Indexes
            $table->index('shipment_id');
            $table->index('status');
            $table->index('scanned_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_tracking_history');
    }
};
