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
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Page Info
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['home', 'category', 'landing', 'custom'])->default('custom');
            $table->string('template', 100)->default('default');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->string('og_image', 500)->nullable();

            // Scheduling
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_publish_at')->nullable();
            $table->timestamp('scheduled_unpublish_at')->nullable();

            // Settings
            $table->json('settings')->nullable();

            // Stats
            $table->integer('view_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
