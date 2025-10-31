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
        Schema::create('vendor_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');

            // Leave details
            $table->date('from_date');
            $table->date('to_date');
            $table->text('reason')->nullable();
            $table->enum('type', ['holiday', 'emergency', 'medical', 'other'])->default('holiday');

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'active', 'completed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();

            // Auto-reactivation
            $table->boolean('auto_reactivate')->default(true);
            $table->timestamp('reactivated_at')->nullable();

            $table->timestamps();

            $table->index(['vendor_id', 'status']);
            $table->index(['from_date', 'to_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_leaves');
    }
};
