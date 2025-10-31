<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a vendor user first
        $vendorUser = User::firstOrCreate(
            ['email' => 'vendor@test.com'],
            [
                'uuid' => Str::uuid(),
                'name' => 'Test Vendor',
                'password' => bcrypt('password123'),
                'user_type' => 'vendor',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Assign vendor role
        if (!$vendorUser->hasRole('vendor')) {
            $vendorUser->assignRole('vendor');
        }

        // Create vendor profile
        $vendor = Vendor::firstOrCreate(
            ['user_id' => $vendorUser->id],
            [
                'uuid' => Str::uuid(),
                'business_name' => 'Test Electronics Store',
                'business_type' => 'proprietorship',
                'gstin' => '27AABCU9603R1ZM',
                'pan_number' => 'AABCU9603R',
                'verification_status' => 'approved',
                'status' => 'active',
                'kyc_status' => 'verified',
            ]
        );

        // Create categories
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Electronic devices and gadgets'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Clothing and accessories'],
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen', 'description' => 'Home and kitchen appliances'],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Books and stationery'],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports and fitness equipment'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                [
                    'uuid' => Str::uuid(),
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description'],
                    'is_active' => true,
                ]
            );
        }

        // Sample products
        $products = [
            [
                'category' => 'electronics',
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Latest flagship smartphone with 200MP camera, Snapdragon 8 Gen 3, and 5000mAh battery',
                'mrp' => 129999.00,
                'selling_price' => 119999.00,
                'stock' => 50,
                'sku' => 'SAM-S24U-BLK',
            ],
            [
                'category' => 'electronics',
                'name' => 'Apple iPhone 15 Pro',
                'description' => 'iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system',
                'mrp' => 134900.00,
                'selling_price' => 129900.00,
                'stock' => 30,
                'sku' => 'APL-IP15P-BLU',
            ],
            [
                'category' => 'electronics',
                'name' => 'Sony WH-1000XM5 Headphones',
                'description' => 'Industry-leading noise canceling wireless headphones with premium sound quality',
                'mrp' => 34990.00,
                'selling_price' => 29990.00,
                'stock' => 100,
                'sku' => 'SNY-WH1000XM5',
            ],
            [
                'category' => 'fashion',
                'name' => 'Levi\'s Men\'s Jeans',
                'description' => 'Classic 501 original fit jeans in dark blue wash',
                'mrp' => 3999.00,
                'selling_price' => 2499.00,
                'stock' => 200,
                'sku' => 'LEV-501-BLU-32',
            ],
            [
                'category' => 'fashion',
                'name' => 'Nike Air Max Shoes',
                'description' => 'Comfortable running shoes with Air Max cushioning technology',
                'mrp' => 8995.00,
                'selling_price' => 6995.00,
                'stock' => 75,
                'sku' => 'NIK-AIRMAX-BLK-9',
            ],
            [
                'category' => 'home-kitchen',
                'name' => 'Philips Air Fryer',
                'description' => 'Healthy cooking with Rapid Air technology, 4.1L capacity',
                'mrp' => 12995.00,
                'selling_price' => 9995.00,
                'stock' => 40,
                'sku' => 'PHI-AF-4.1L',
            ],
            [
                'category' => 'home-kitchen',
                'name' => 'Prestige Induction Cooktop',
                'description' => '2000W induction cooktop with automatic voltage regulator',
                'mrp' => 3495.00,
                'selling_price' => 2295.00,
                'stock' => 60,
                'sku' => 'PRE-IND-2000W',
            ],
            [
                'category' => 'books',
                'name' => 'Atomic Habits by James Clear',
                'description' => 'An easy and proven way to build good habits and break bad ones',
                'mrp' => 599.00,
                'selling_price' => 399.00,
                'stock' => 150,
                'sku' => 'BK-ATOMIC-HABITS',
            ],
            [
                'category' => 'sports',
                'name' => 'Yoga Mat with Carry Bag',
                'description' => 'Premium quality 6mm thick yoga mat with non-slip surface',
                'mrp' => 1499.00,
                'selling_price' => 799.00,
                'stock' => 120,
                'sku' => 'YOG-MAT-6MM-BLU',
            ],
            [
                'category' => 'sports',
                'name' => 'Dumbbells Set 10kg',
                'description' => 'Adjustable dumbbells set with rubber coating for home gym',
                'mrp' => 2999.00,
                'selling_price' => 1999.00,
                'stock' => 80,
                'sku' => 'DUM-10KG-SET',
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('slug', $productData['category'])->first();

            if ($category) {
                Product::firstOrCreate(
                    ['sku' => $productData['sku']],
                    [
                        'uuid' => Str::uuid(),
                        'vendor_id' => $vendor->id,
                        'category_id' => $category->id,
                        'name' => $productData['name'],
                        'slug' => Str::slug($productData['name']),
                        'description' => $productData['description'],
                        'mrp' => $productData['mrp'],
                        'selling_price' => $productData['selling_price'],
                        'cost_price' => $productData['selling_price'] * 0.7, // 30% margin
                        'discount_percentage' => round((($productData['mrp'] - $productData['selling_price']) / $productData['mrp']) * 100, 2),
                        'stock_quantity' => $productData['stock'],
                        'low_stock_threshold' => 10,
                        'stock_status' => 'in_stock',
                        'weight' => 500, // grams
                        'is_returnable' => true,
                        'return_period_days' => 7,
                        'hsn_code' => '8517',
                        'gst_percentage' => 18.00,
                        'status' => 'approved',
                        'is_featured' => rand(0, 1) == 1,
                    ]
                );
            }
        }

        $this->command->info('Products seeded successfully!');
    }
}
