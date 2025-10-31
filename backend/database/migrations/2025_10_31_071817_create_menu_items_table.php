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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');

            // Item Info
            $table->string('label');
            $table->string('url', 500)->nullable();
            $table->enum('type', ['link', 'category', 'page', 'custom'])->default('link');
            $table->enum('target', ['_self', '_blank'])->default('_self');

            // Icon & Styling
            $table->string('icon')->nullable();
            $table->enum('icon_position', ['left', 'right', 'none'])->default('none');
            $table->string('css_class')->nullable();

            // Position
            $table->integer('position')->default(0);

            // Visibility
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_visible_mobile')->default(true);
            $table->boolean('is_visible_desktop')->default(true);

            // Mega Menu (Future)
            $table->boolean('is_mega_menu')->default(false);
            $table->json('mega_menu_content')->nullable();

            $table->timestamps();

            $table->index(['menu_id', 'position']);
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
