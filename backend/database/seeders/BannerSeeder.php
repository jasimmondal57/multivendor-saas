<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;
use Illuminate\Support\Str;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Homepage Hero Banners
        Banner::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'Summer Sale 2024',
            'subtitle' => 'Up to 50% OFF',
            'description' => 'Shop the hottest deals of the season',
            'image_desktop' => '/images/banners/summer-sale-desktop.jpg',
            'image_mobile' => '/images/banners/summer-sale-mobile.jpg',
            'image_tablet' => '/images/banners/summer-sale-tablet.jpg',
            'cta_text' => 'Shop Now',
            'cta_link' => '/products?sale=true',
            'cta_style' => 'primary',
            'text_color' => '#FFFFFF',
            'background_color' => '#FF6B6B',
            'overlay_opacity' => 30,
            'text_alignment' => 'left',
            'banner_group' => 'homepage_hero',
            'position' => 0,
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays(30),
        ]);

        Banner::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'New Electronics Collection',
            'subtitle' => 'Latest Tech Gadgets',
            'description' => 'Discover cutting-edge technology',
            'image_desktop' => '/images/banners/electronics-desktop.jpg',
            'image_mobile' => '/images/banners/electronics-mobile.jpg',
            'image_tablet' => '/images/banners/electronics-tablet.jpg',
            'cta_text' => 'Explore',
            'cta_link' => '/products?category=electronics',
            'cta_style' => 'primary',
            'text_color' => '#FFFFFF',
            'background_color' => '#4A90E2',
            'overlay_opacity' => 40,
            'text_alignment' => 'center',
            'banner_group' => 'homepage_hero',
            'position' => 1,
            'status' => 'active',
            'start_date' => now(),
        ]);

        Banner::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'Fashion Week Special',
            'subtitle' => 'Trendy Styles for Everyone',
            'description' => 'Upgrade your wardrobe with the latest fashion',
            'image_desktop' => '/images/banners/fashion-desktop.jpg',
            'image_mobile' => '/images/banners/fashion-mobile.jpg',
            'image_tablet' => '/images/banners/fashion-tablet.jpg',
            'cta_text' => 'Shop Fashion',
            'cta_link' => '/products?category=fashion',
            'cta_style' => 'secondary',
            'text_color' => '#FFFFFF',
            'background_color' => '#E91E63',
            'overlay_opacity' => 35,
            'text_alignment' => 'right',
            'banner_group' => 'homepage_hero',
            'position' => 2,
            'status' => 'active',
            'start_date' => now(),
        ]);

        // Category Page Banners
        Banner::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'Electronics Mega Sale',
            'subtitle' => 'Save Big on Tech',
            'description' => 'Limited time offer on all electronics',
            'image_desktop' => '/images/banners/electronics-sale-desktop.jpg',
            'image_mobile' => '/images/banners/electronics-sale-mobile.jpg',
            'cta_text' => 'View Deals',
            'cta_link' => '/products?category=electronics&sale=true',
            'cta_style' => 'primary',
            'text_color' => '#FFFFFF',
            'background_color' => '#2196F3',
            'overlay_opacity' => 25,
            'text_alignment' => 'center',
            'banner_group' => 'category_electronics',
            'position' => 0,
            'status' => 'active',
            'start_date' => now(),
        ]);

        // Promotional Banners
        Banner::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'Free Shipping',
            'subtitle' => 'On Orders Over ₹500',
            'description' => 'Shop now and save on delivery',
            'cta_text' => 'Learn More',
            'cta_link' => '/shipping-policy',
            'cta_style' => 'outline',
            'text_color' => '#333333',
            'background_color' => '#FFF9C4',
            'text_alignment' => 'center',
            'banner_group' => 'promotional',
            'position' => 0,
            'status' => 'active',
            'start_date' => now(),
        ]);

        $this->command->info('✅ Banners seeded successfully!');
    }
}
