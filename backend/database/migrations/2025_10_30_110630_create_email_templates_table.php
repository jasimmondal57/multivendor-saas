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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., 'order_confirmation', 'order_shipped'
            $table->string('name'); // Display name
            $table->string('category'); // customer, vendor, admin
            $table->string('subject'); // Email subject with variables
            $table->text('body'); // HTML email body with variables
            $table->text('variables')->nullable(); // JSON array of available variables
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable(); // When this email is sent
            $table->timestamps();

            $table->index('code');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
