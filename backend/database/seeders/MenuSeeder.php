<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Header Menu
        $headerMenu = Menu::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Main Navigation',
            'location' => 'header',
            'status' => 'active',
            'settings' => [
                'style' => 'horizontal',
                'sticky' => true,
            ],
        ]);

        // Header Menu Items
        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $headerMenu->id,
            'label' => 'Home',
            'url' => '/',
            'type' => 'link',
            'target' => '_self',
            'icon' => 'home',
            'icon_position' => 'left',
            'position' => 0,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $headerMenu->id,
            'label' => 'Products',
            'url' => '/products',
            'type' => 'link',
            'target' => '_self',
            'icon' => 'shopping-bag',
            'icon_position' => 'left',
            'position' => 1,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $headerMenu->id,
            'label' => 'Categories',
            'url' => '/categories',
            'type' => 'link',
            'target' => '_self',
            'icon' => 'grid',
            'icon_position' => 'left',
            'position' => 2,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $headerMenu->id,
            'label' => 'About Us',
            'url' => '/about-us',
            'type' => 'page',
            'target' => '_self',
            'position' => 3,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $headerMenu->id,
            'label' => 'Contact',
            'url' => '/contact-us',
            'type' => 'page',
            'target' => '_self',
            'position' => 4,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        // Create Footer Menu
        $footerMenu = Menu::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Footer Navigation',
            'location' => 'footer',
            'status' => 'active',
            'settings' => [
                'columns' => 3,
            ],
        ]);

        // Footer Menu - Company Section
        $companyParent = MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'label' => 'Company',
            'url' => '#',
            'type' => 'custom',
            'target' => '_self',
            'position' => 0,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'parent_id' => $companyParent->id,
            'label' => 'About Us',
            'url' => '/about-us',
            'type' => 'page',
            'target' => '_self',
            'position' => 0,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'parent_id' => $companyParent->id,
            'label' => 'Contact Us',
            'url' => '/contact-us',
            'type' => 'page',
            'target' => '_self',
            'position' => 1,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        // Footer Menu - Help Section
        $helpParent = MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'label' => 'Help',
            'url' => '#',
            'type' => 'custom',
            'target' => '_self',
            'position' => 1,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'parent_id' => $helpParent->id,
            'label' => 'Shipping Policy',
            'url' => '/shipping-policy',
            'type' => 'page',
            'target' => '_self',
            'position' => 0,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'parent_id' => $helpParent->id,
            'label' => 'Return Policy',
            'url' => '/return-policy',
            'type' => 'page',
            'target' => '_self',
            'position' => 1,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        MenuItem::create([
            'uuid' => (string) Str::uuid(),
            'menu_id' => $footerMenu->id,
            'parent_id' => $helpParent->id,
            'label' => 'FAQ',
            'url' => '/faq',
            'type' => 'page',
            'target' => '_self',
            'position' => 2,
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_desktop' => true,
        ]);

        $this->command->info('✅ Menus seeded successfully!');
    }
}
