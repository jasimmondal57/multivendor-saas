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
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('business_category')->nullable()->after('business_type');
            $table->string('contact_person_name')->nullable()->after('business_pincode');
            $table->string('contact_person_phone', 10)->nullable()->after('contact_person_name');
            $table->string('contact_person_email')->nullable()->after('contact_person_phone');
            $table->string('pan_holder_name')->nullable()->after('pan_number');
            $table->boolean('gst_registered')->default(false)->after('gstin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'business_category',
                'contact_person_name',
                'contact_person_phone',
                'contact_person_email',
                'pan_holder_name',
                'gst_registered',
            ]);
        });
    }
};

