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
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('page_id')->constrained()->onDelete('cascade');

            // Component Info
            $table->string('component_type', 100);
            $table->string('component_name')->nullable();

            // Position & Layout
            $table->integer('position')->default(0);
            $table->enum('container_width', ['full', 'boxed'])->default('boxed');
            $table->string('background_color', 50)->nullable();
            $table->string('background_image', 500)->nullable();
            $table->integer('padding_top')->default(0);
            $table->integer('padding_bottom')->default(0);

            // Component Settings (JSON)
            $table->json('settings');

            // Visibility
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_visible_mobile')->default(true);
            $table->boolean('is_visible_tablet')->default(true);
            $table->boolean('is_visible_desktop')->default(true);

            // Scheduling
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();

            // Personalization (Future)
            $table->json('target_audience')->nullable();

            $table->timestamps();

            $table->index(['page_id', 'position']);
            $table->index('component_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
