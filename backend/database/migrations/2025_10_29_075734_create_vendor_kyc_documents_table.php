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
        if (!Schema::hasTable('vendor_kyc_documents')) {
            Schema::create('vendor_kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', ['pan_card', 'gst_certificate', 'cancelled_cheque', 'address_proof', 'identity_proof']);
            $table->string('document_number')->nullable();
            $table->string('document_url')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_id', 'document_type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_kyc_documents');
    }
};
