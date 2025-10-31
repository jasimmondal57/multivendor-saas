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
        if (!Schema::hasTable('vendor_bank_accounts')) {
            Schema::create('vendor_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->string('account_holder_name');
            $table->string('account_number');
            $table->string('ifsc_code', 11);
            $table->string('bank_name');
            $table->string('branch_name');
            $table->enum('account_type', ['savings', 'current'])->default('current');
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_primary')->default(true);
            $table->timestamp('verified_at')->nullable();
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
        Schema::dropIfExists('vendor_bank_accounts');
    }
};
