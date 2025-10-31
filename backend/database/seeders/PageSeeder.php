<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Homepage
        $homepage = Page::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Homepage',
            'slug' => 'home',
            'type' => 'home',
            'template' => 'default',
            'status' => 'published',
            'meta_title' => 'Multi-Vendor E-commerce Platform - Shop from Multiple Vendors',
            'meta_description' => 'Discover amazing products from verified vendors. Shop electronics, fashion, home essentials and more.',
            'meta_keywords' => 'multi-vendor, e-commerce, online shopping, marketplace',
            'published_at' => now(),
            'settings' => [
                'show_breadcrumbs' => false,
                'full_width' => true,
            ],
        ]);

        // Homepage Section 1: Hero Banner
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'hero_banner',
            'component_name' => 'Main Hero Slider',
            'position' => 0,
            'container_width' => 'full',
            'settings' => [
                'banner_ids' => [], // Will be populated after BannerSeeder runs
                'slider_enabled' => true,
                'autoplay' => true,
                'autoplay_speed' => 5000,
                'show_arrows' => true,
                'show_dots' => true,
                'height' => 'large', // small, medium, large
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Homepage Section 2: Category Grid
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'category_grid',
            'component_name' => 'Shop by Category',
            'position' => 1,
            'container_width' => 'boxed',
            'padding_top' => 60,
            'padding_bottom' => 40,
            'settings' => [
                'title' => 'Shop by Category',
                'subtitle' => 'Browse our wide range of categories',
                'category_ids' => [], // Will show all categories
                'layout' => 'grid',
                'columns' => 4,
                'show_product_count' => true,
                'show_image' => true,
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Homepage Section 3: Flash Sale
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'flash_sale',
            'component_name' => 'Flash Sale',
            'position' => 2,
            'container_width' => 'boxed',
            'background_color' => '#FFF5F5',
            'padding_top' => 50,
            'padding_bottom' => 50,
            'settings' => [
                'title' => '⚡ Flash Sale',
                'subtitle' => 'Limited time offers - Grab them before they\'re gone!',
                'end_date' => now()->addDays(7)->toDateTimeString(),
                'show_timer' => true,
                'product_ids' => [], // Will show featured products
                'max_products' => 8,
                'layout' => 'carousel',
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Homepage Section 4: Product Carousel - Featured Products
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'product_carousel',
            'component_name' => 'Featured Products',
            'position' => 3,
            'container_width' => 'boxed',
            'padding_top' => 50,
            'padding_bottom' => 50,
            'settings' => [
                'title' => 'Featured Products',
                'subtitle' => 'Handpicked products just for you',
                'source' => 'featured', // featured, new_arrivals, best_sellers, category
                'category_id' => null,
                'max_products' => 12,
                'show_arrows' => true,
                'show_dots' => false,
                'autoplay' => false,
                'items_per_slide' => 4,
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Homepage Section 5: Feature Grid
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'feature_grid',
            'component_name' => 'Why Shop With Us',
            'position' => 4,
            'container_width' => 'boxed',
            'background_color' => '#F9FAFB',
            'padding_top' => 60,
            'padding_bottom' => 60,
            'settings' => [
                'title' => 'Why Shop With Us',
                'features' => [
                    [
                        'icon' => 'truck',
                        'title' => 'Free Shipping',
                        'description' => 'On orders over ₹500',
                    ],
                    [
                        'icon' => 'shield-check',
                        'title' => 'Secure Payment',
                        'description' => '100% secure transactions',
                    ],
                    [
                        'icon' => 'refresh',
                        'title' => 'Easy Returns',
                        'description' => '7-day return policy',
                    ],
                    [
                        'icon' => 'headphones',
                        'title' => '24/7 Support',
                        'description' => 'Dedicated customer support',
                    ],
                ],
                'columns' => 4,
                'icon_style' => 'outline',
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Homepage Section 6: Product Carousel - New Arrivals
        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $homepage->id,
            'component_type' => 'product_carousel',
            'component_name' => 'New Arrivals',
            'position' => 5,
            'container_width' => 'boxed',
            'padding_top' => 50,
            'padding_bottom' => 50,
            'settings' => [
                'title' => 'New Arrivals',
                'subtitle' => 'Check out the latest products',
                'source' => 'new_arrivals',
                'category_id' => null,
                'max_products' => 12,
                'show_arrows' => true,
                'show_dots' => false,
                'autoplay' => false,
                'items_per_slide' => 4,
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        // Create About Us Page
        $aboutPage = Page::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'About Us',
            'slug' => 'about-us',
            'type' => 'custom',
            'template' => 'default',
            'status' => 'published',
            'meta_title' => 'About Us - Multi-Vendor E-commerce Platform',
            'meta_description' => 'Learn more about our multi-vendor marketplace.',
            'published_at' => now(),
        ]);

        PageSection::create([
            'uuid' => (string) Str::uuid(),
            'page_id' => $aboutPage->id,
            'component_type' => 'text_block',
            'component_name' => 'About Us Content',
            'position' => 0,
            'container_width' => 'boxed',
            'padding_top' => 60,
            'padding_bottom' => 60,
            'settings' => [
                'title' => 'About Our Platform',
                'content' => '<p>Welcome to our multi-vendor e-commerce platform!</p>',
                'text_align' => 'left',
            ],
            'status' => 'active',
            'is_visible_mobile' => true,
            'is_visible_tablet' => true,
            'is_visible_desktop' => true,
        ]);

        $this->command->info('✅ Pages seeded successfully!');
    }
}
