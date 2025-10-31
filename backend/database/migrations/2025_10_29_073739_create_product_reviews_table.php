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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('rating')->unsigned(); // 1-5
            $table->string('title')->nullable();
            $table->text('comment');
            $table->json('images')->nullable(); // Array of image URLs
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->text('vendor_response')->nullable();
            $table->timestamp('vendor_responded_at')->nullable();
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'is_approved']);
            $table->index(['user_id']);
            $table->index(['rating']);
        });

        // Review helpfulness tracking
        Schema::create('review_helpfulness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('product_reviews')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_helpful'); // true = helpful, false = not helpful
            $table->timestamps();

            $table->unique(['review_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_helpfulness');
        Schema::dropIfExists('product_reviews');
    }
};
