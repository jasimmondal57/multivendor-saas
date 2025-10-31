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
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            // Email Notification Settings
            $table->boolean('email_order_updates')->default(true);
            $table->boolean('email_promotional')->default(true);
            $table->boolean('email_newsletter')->default(false);

            // Privacy Settings
            $table->boolean('profile_public')->default(false);
            $table->boolean('show_purchase_history')->default(false);

            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
