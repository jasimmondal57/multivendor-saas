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
        Schema::create('vendor_bank_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');

            // Old bank details (for reference)
            $table->string('old_account_holder_name')->nullable();
            $table->string('old_account_number')->nullable();
            $table->string('old_ifsc_code')->nullable();
            $table->string('old_bank_name')->nullable();
            $table->string('old_branch_name')->nullable();

            // New bank details (requested)
            $table->string('new_account_holder_name');
            $table->string('new_account_number');
            $table->string('new_ifsc_code');
            $table->string('new_bank_name');
            $table->string('new_branch_name')->nullable();
            $table->enum('new_account_type', ['savings', 'current'])->default('current');

            // Cancelled cheque document
            $table->string('cancelled_cheque_url')->nullable();

            // Request status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('vendor_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();

            // Admin actions
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['vendor_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_bank_change_requests');
    }
};
