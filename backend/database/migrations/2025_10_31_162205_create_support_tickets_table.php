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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // TKT-XXXXXXXXXX
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer or Vendor
            $table->enum('user_type', ['customer', 'vendor']); // Who created the ticket
            $table->foreignId('vendor_id')->nullable()->constrained()->onDelete('cascade'); // If vendor created
            $table->foreignId('support_category_id')->constrained()->onDelete('restrict');
            $table->string('subject');
            $table->text('description');
            $table->json('attachments')->nullable(); // Array of file paths

            // Related entities
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('return_order_id')->nullable()->constrained('return_orders')->onDelete('set null');

            // Priority and Status
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', [
                'open',           // New ticket
                'assigned',       // Assigned to admin
                'in_progress',    // Admin working on it
                'waiting_customer', // Waiting for customer response
                'waiting_vendor',   // Waiting for vendor response
                'resolved',       // Issue resolved
                'closed'          // Ticket closed
            ])->default('open');

            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // Admin user
            $table->timestamp('assigned_at')->nullable();

            // Resolution
            $table->text('resolution_notes')->nullable(); // Admin's resolution notes
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            // Ratings
            $table->integer('rating')->nullable(); // 1-5 stars for support quality
            $table->text('feedback')->nullable(); // Customer/Vendor feedback

            // Timestamps
            $table->timestamp('first_response_at')->nullable(); // SLA tracking
            $table->timestamp('last_response_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'user_type']);
            $table->index('status');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
