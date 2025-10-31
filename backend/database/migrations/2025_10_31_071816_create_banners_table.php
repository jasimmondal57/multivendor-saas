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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Banner Info
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->text('description')->nullable();

            // Media
            $table->string('image_desktop', 500)->nullable();
            $table->string('image_mobile', 500)->nullable();
            $table->string('image_tablet', 500)->nullable();
            $table->string('video_url', 500)->nullable();

            // Call to Action
            $table->string('cta_text', 100)->nullable();
            $table->string('cta_link', 500)->nullable();
            $table->enum('cta_style', ['primary', 'secondary', 'outline'])->default('primary');

            // Styling
            $table->string('text_color', 50)->default('#FFFFFF');
            $table->string('background_color', 50)->nullable();
            $table->integer('overlay_opacity')->default(0); // 0-100
            $table->enum('text_alignment', ['left', 'center', 'right'])->default('center');

            // Position & Display
            $table->string('banner_group', 100)->nullable(); // "homepage_hero", "category_top"
            $table->integer('position')->default(0);

            // Status & Scheduling
            $table->enum('status', ['active', 'inactive', 'scheduled'])->default('active');
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();

            // Stats
            $table->integer('view_count')->default(0);
            $table->integer('click_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['banner_group', 'status']);
            $table->index('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
