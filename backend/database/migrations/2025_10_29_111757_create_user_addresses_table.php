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
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['home', 'work', 'other'])->default('home');
            $table->string('name'); // Recipient name
            $table->string('phone', 15);
            $table->text('address_line_1');
            $table->text('address_line_2')->nullable();
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('pincode', 10);
            $table->string('country', 100)->default('India');
            $table->string('landmark')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
