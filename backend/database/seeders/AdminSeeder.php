<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@multivendor.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'user_type' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $this->command->info('✅ Admin user created successfully!');
        $this->command->info('📧 Email: admin@multivendor.com');
        $this->command->info('🔑 Password: admin123');
        $this->command->info('🔐 User Type: admin');
    }
}

