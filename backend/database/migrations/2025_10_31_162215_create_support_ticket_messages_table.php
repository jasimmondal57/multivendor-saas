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
        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who sent the message
            $table->enum('sender_type', ['customer', 'vendor', 'admin']); // Who sent it
            $table->text('message');
            $table->json('attachments')->nullable(); // Array of file paths
            $table->boolean('is_internal_note')->default(false); // Admin-only notes
            $table->boolean('is_read')->default(false); // Has the recipient read it?
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('support_ticket_id');
            $table->index(['user_id', 'sender_type']);
            $table->index('is_internal_note');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_ticket_messages');
    }
};
