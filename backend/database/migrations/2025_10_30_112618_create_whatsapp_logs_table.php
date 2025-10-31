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
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('whatsapp_template_id')->nullable()->constrained()->onDelete('set null');
            $table->string('phone'); // Recipient phone number
            $table->string('template_code'); // Template used
            $table->text('message'); // Final message sent
            $table->text('variables')->nullable(); // JSON of variables used
            $table->string('status'); // sent, delivered, read, failed
            $table->string('message_id')->nullable(); // WhatsApp message ID
            $table->text('error_message')->nullable(); // Error if failed
            $table->text('response')->nullable(); // Full API response
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('phone');
            $table->index('status');
            $table->index('template_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_logs');
    }
};
