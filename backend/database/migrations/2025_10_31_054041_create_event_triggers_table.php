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
        Schema::create('event_triggers', function (Blueprint $table) {
            $table->id();
            $table->string('event_code')->unique(); // e.g., 'order.placed', 'order.shipped'
            $table->string('event_name'); // Human-readable name
            $table->string('event_category'); // customer, vendor, admin
            $table->text('description')->nullable();
            $table->foreignId('email_template_id')->nullable()->constrained('email_templates')->onDelete('set null');
            $table->foreignId('whatsapp_template_id')->nullable()->constrained('whatsapp_templates')->onDelete('set null');
            $table->boolean('email_enabled')->default(true);
            $table->boolean('whatsapp_enabled')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('available_variables')->nullable(); // Variables available for this event
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_triggers');
    }
};
