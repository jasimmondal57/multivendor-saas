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
        Schema::create('whatsapp_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., 'otp_verification', 'order_confirmation'
            $table->string('name'); // Display name
            $table->string('category'); // otp, customer, vendor, admin
            $table->string('language')->default('en'); // en, hi, etc.
            $table->text('header')->nullable(); // Template header
            $table->text('body'); // Template body with {{1}}, {{2}} placeholders
            $table->text('footer')->nullable(); // Template footer
            $table->string('button_type')->nullable(); // QUICK_REPLY, CALL_TO_ACTION, NONE
            $table->text('buttons')->nullable(); // JSON array of buttons
            $table->text('variables')->nullable(); // JSON array of variable names
            $table->string('meta_template_id')->nullable(); // Meta/WhatsApp template ID after approval
            $table->string('meta_template_name')->nullable(); // Template name in Meta
            $table->string('status')->default('draft'); // draft, pending_approval, approved, rejected
            $table->text('rejection_reason')->nullable(); // Reason if rejected by Meta
            $table->timestamp('submitted_at')->nullable(); // When submitted to Meta
            $table->timestamp('approved_at')->nullable(); // When approved by Meta
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable(); // When this template is used
            $table->timestamps();

            $table->index('code');
            $table->index('category');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_templates');
    }
};
