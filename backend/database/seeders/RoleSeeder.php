<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $customerRole = Role::create(['name' => 'customer']);
        $vendorRole = Role::create(['name' => 'vendor']);
        $adminRole = Role::create(['name' => 'admin']);

        // Create permissions
        $permissions = [
            // Customer permissions
            'view products',
            'create orders',
            'view own orders',
            'cancel own orders',

            // Vendor permissions
            'manage own products',
            'update order status',
            'view own analytics',

            // Admin permissions
            'manage users',
            'manage vendors',
            'manage products',
            'manage orders',
            'manage categories',
            'view analytics',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $customerRole->givePermissionTo([
            'view products',
            'create orders',
            'view own orders',
            'cancel own orders',
        ]);

        $vendorRole->givePermissionTo([
            'view products',
            'manage own products',
            'view own orders',
            'update order status',
            'view own analytics',
        ]);

        $adminRole->givePermissionTo(Permission::all());

        $this->command->info('Roles and permissions created successfully!');
    }
}
