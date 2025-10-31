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
        if (!Schema::hasTable('vendor_stores')) {
            Schema::create('vendor_stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->string('store_name');
            $table->text('store_description')->nullable();
            $table->string('store_logo')->nullable();
            $table->string('store_banner')->nullable();
            $table->text('return_policy')->nullable();
            $table->text('shipping_policy')->nullable();
            $table->string('customer_support_email');
            $table->string('customer_support_phone');
            $table->timestamps();

            $table->unique('vendor_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_stores');
    }
};
