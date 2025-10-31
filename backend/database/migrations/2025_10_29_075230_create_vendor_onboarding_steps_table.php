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
        Schema::create('vendor_onboarding_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->integer('current_step')->default(1); // 1-5
            $table->boolean('step_1_completed')->default(false); // Business Info
            $table->boolean('step_2_completed')->default(false); // PAN & GST
            $table->boolean('step_3_completed')->default(false); // Bank Details
            $table->boolean('step_4_completed')->default(false); // Store Setup
            $table->boolean('step_5_completed')->default(false); // Documents Upload
            $table->boolean('is_completed')->default(false);
            $table->enum('verification_status', ['pending', 'in_review', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('vendor_id');
            $table->index('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_onboarding_steps');
    }
};
