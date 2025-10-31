<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Page Builder Seeders
        $this->call([
            PageSeeder::class,
            BannerSeeder::class,
            MenuSeeder::class,
        ]);
    }
}
