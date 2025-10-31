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
        Schema::create('otp_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('phone'); // Phone number
            $table->string('otp'); // OTP code (hashed)
            $table->string('purpose'); // login, registration, password_reset, phone_verification
            $table->string('channel')->default('whatsapp'); // whatsapp, sms
            $table->integer('attempts')->default(0); // Verification attempts
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at'); // OTP expiry time
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            $table->index('phone');
            $table->index(['phone', 'purpose']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_verifications');
    }
};
