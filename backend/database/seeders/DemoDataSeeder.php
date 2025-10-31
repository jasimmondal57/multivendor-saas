<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserAddress;
use App\Models\VendorPayout;
use App\Models\VendorBankAccount;
use App\Models\VendorStore;
use App\Models\PlatformRevenue;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Demo Data Seeding...');

        // Check if demo data already exists
        if (User::where('email', 'admin@multivendor.com')->exists()) {
            $this->command->warn('⚠️  Demo data already exists!');
            $this->command->info('💡 To reseed, first run: php artisan migrate:fresh');
            return;
        }

        // 0. Create Roles and Permissions first
        $this->command->info('🔐 Creating Roles and Permissions...');
        $this->call(RoleSeeder::class);

        // 1. Create Admin User
        $this->command->info('👤 Creating Admin User...');
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@multivendor.com',
            'phone' => '9876543210',
            'password' => Hash::make('password'),
            'user_type' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Assign admin role
        $admin->assignRole('admin');
        $this->command->info('  ✓ Admin role assigned');

        // 2. Create Categories
        $this->command->info('📂 Creating Categories...');
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Electronic gadgets and devices'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Clothing and accessories'],
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen', 'description' => 'Home appliances and kitchenware'],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Books and stationery'],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports equipment and accessories'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = Category::create([
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'description' => $cat['description'],
                'is_active' => true,
                'is_featured' => true,
            ]);
        }

        // 3. Create Vendors with Products
        $this->command->info('🏪 Creating Vendors...');
        $vendors = [
            [
                'name' => 'TechHub Store',
                'email' => 'vendor1@multivendor.com',
                'business_name' => 'TechHub Electronics Pvt Ltd',
                'business_type' => 'private_limited',
                'gstin' => '29ABCDE1234F1Z5',
                'pan' => 'ABCDE1234F',
                'category_index' => 0, // Electronics
                'commission' => 10,
            ],
            [
                'name' => 'Fashion World',
                'email' => 'vendor2@multivendor.com',
                'business_name' => 'Fashion World Retail LLP',
                'business_type' => 'llp',
                'gstin' => '27FGHIJ5678K1Z9',
                'pan' => 'FGHIJ5678K',
                'category_index' => 1, // Fashion
                'commission' => 15,
            ],
            [
                'name' => 'HomeEssentials',
                'email' => 'vendor3@multivendor.com',
                'business_name' => 'HomeEssentials India',
                'business_type' => 'proprietorship',
                'gstin' => '19LMNOP9012Q1Z3',
                'pan' => 'LMNOP9012Q',
                'category_index' => 2, // Home & Kitchen
                'commission' => 12,
            ],
        ];

        $vendorModels = [];
        foreach ($vendors as $index => $vendorData) {
            // Create vendor user
            $user = User::create([
                'name' => $vendorData['name'],
                'email' => $vendorData['email'],
                'phone' => '9876543' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'user_type' => 'vendor',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]);

            // Assign vendor role
            $user->assignRole('vendor');

            // Create vendor profile
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'business_name' => $vendorData['business_name'],
                'business_type' => $vendorData['business_type'],
                'gstin' => $vendorData['gstin'],
                'pan_number' => $vendorData['pan'],
                'business_address' => rand(100, 999) . ' MG Road',
                'business_city' => 'Bangalore',
                'business_state' => 'Karnataka',
                'business_pincode' => '560001',
                'status' => 'active',
                'verification_status' => 'approved',
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'approved_at' => now(),
                'commission_rate' => $vendorData['commission'],
            ]);

            // Create vendor bank account
            VendorBankAccount::create([
                'vendor_id' => $vendor->id,
                'account_holder_name' => $vendorData['business_name'],
                'account_number' => '1234567890' . rand(10, 99),
                'ifsc_code' => 'HDFC0001234',
                'bank_name' => 'HDFC Bank',
                'branch_name' => 'MG Road Branch',
                'account_type' => 'current',
                'is_verified' => true,
                'verified_at' => now(),
            ]);

            // Create vendor store
            VendorStore::create([
                'vendor_id' => $vendor->id,
                'store_name' => $vendorData['name'],
                'store_description' => 'Welcome to ' . $vendorData['name'],
                'store_logo' => null,
                'store_banner' => null,
                'customer_support_email' => $vendorData['email'],
                'customer_support_phone' => '080' . rand(10000000, 99999999),
            ]);

            $vendorModels[] = [
                'vendor' => $vendor,
                'category_index' => $vendorData['category_index'],
            ];
        }

        // 4. Create Products
        $this->command->info('📦 Creating Products...');
        $products = [];
        
        // Vendor 1 - Electronics
        $electronicsProducts = [
            ['name' => 'Wireless Bluetooth Headphones', 'mrp' => 2999, 'price' => 1999, 'stock' => 50],
            ['name' => 'Smart Watch Series 5', 'mrp' => 8999, 'price' => 6999, 'stock' => 30],
            ['name' => 'USB-C Fast Charger 65W', 'mrp' => 1499, 'price' => 999, 'stock' => 100],
            ['name' => 'Portable Power Bank 20000mAh', 'mrp' => 2499, 'price' => 1799, 'stock' => 75],
        ];

        foreach ($electronicsProducts as $prod) {
            $products[] = Product::create([
                'vendor_id' => $vendorModels[0]['vendor']->id,
                'category_id' => $categoryModels[0]->id,
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']),
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'description' => 'High quality ' . $prod['name'] . ' with excellent features.',
                'short_description' => 'Premium quality product',
                'mrp' => $prod['mrp'],
                'selling_price' => $prod['price'],
                'cost_price' => $prod['price'] * 0.7,
                'discount_percentage' => round((($prod['mrp'] - $prod['price']) / $prod['mrp']) * 100, 2),
                'stock_quantity' => $prod['stock'],
                'stock_status' => 'in_stock',
                'gst_percentage' => 18,
                'status' => 'approved',
                'is_active' => true,
                'is_featured' => true,
                'approved_at' => now(),
            ]);
        }

        // Vendor 2 - Fashion
        $fashionProducts = [
            ['name' => 'Cotton T-Shirt Pack of 3', 'mrp' => 1499, 'price' => 999, 'stock' => 200],
            ['name' => 'Denim Jeans Slim Fit', 'mrp' => 2999, 'price' => 1999, 'stock' => 150],
            ['name' => 'Casual Sneakers', 'mrp' => 3999, 'price' => 2499, 'stock' => 80],
        ];

        foreach ($fashionProducts as $prod) {
            $products[] = Product::create([
                'vendor_id' => $vendorModels[1]['vendor']->id,
                'category_id' => $categoryModels[1]->id,
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']),
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'description' => 'Stylish ' . $prod['name'] . ' for everyday wear.',
                'short_description' => 'Trendy fashion item',
                'mrp' => $prod['mrp'],
                'selling_price' => $prod['price'],
                'cost_price' => $prod['price'] * 0.6,
                'discount_percentage' => round((($prod['mrp'] - $prod['price']) / $prod['mrp']) * 100, 2),
                'stock_quantity' => $prod['stock'],
                'stock_status' => 'in_stock',
                'gst_percentage' => 12,
                'status' => 'approved',
                'is_active' => true,
                'is_featured' => true,
                'approved_at' => now(),
            ]);
        }

        // Vendor 3 - Home & Kitchen
        $homeProducts = [
            ['name' => 'Non-Stick Cookware Set', 'mrp' => 4999, 'price' => 3499, 'stock' => 40],
            ['name' => 'Electric Kettle 1.5L', 'mrp' => 1999, 'price' => 1299, 'stock' => 60],
            ['name' => 'Microwave Safe Container Set', 'mrp' => 899, 'price' => 599, 'stock' => 120],
        ];

        foreach ($homeProducts as $prod) {
            $products[] = Product::create([
                'vendor_id' => $vendorModels[2]['vendor']->id,
                'category_id' => $categoryModels[2]->id,
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']),
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'description' => 'Essential ' . $prod['name'] . ' for your home.',
                'short_description' => 'Home essential product',
                'mrp' => $prod['mrp'],
                'selling_price' => $prod['price'],
                'cost_price' => $prod['price'] * 0.65,
                'discount_percentage' => round((($prod['mrp'] - $prod['price']) / $prod['mrp']) * 100, 2),
                'stock_quantity' => $prod['stock'],
                'stock_status' => 'in_stock',
                'gst_percentage' => 18,
                'status' => 'approved',
                'is_active' => true,
                'is_featured' => false,
                'approved_at' => now(),
            ]);
        }

        // 5. Create Customers
        $this->command->info('👥 Creating Customers...');
        $customers = [];
        for ($i = 1; $i <= 5; $i++) {
            $customer = User::create([
                'name' => 'Customer ' . $i,
                'email' => 'customer' . $i . '@example.com',
                'phone' => '91234567' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'user_type' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]);

            // Assign customer role
            $customer->assignRole('customer');

            // Create address for customer
            UserAddress::create([
                'user_id' => $customer->id,
                'type' => 'home',
                'name' => 'Customer ' . $i,
                'phone' => '91234567' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'address_line_1' => rand(1, 999) . ' Main Street',
                'address_line_2' => 'Apartment ' . rand(1, 50),
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pincode' => '400001',
                'country' => 'India',
                'is_default' => true,
            ]);

            $customers[] = $customer;
        }

        $this->command->info('📝 Creating Orders...');

        // 6. Create Orders (mix of statuses)
        $orderStatuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending'];
        $orders = [];

        foreach ($customers as $index => $customer) {
            // Each customer places 2-3 orders
            $numOrders = rand(2, 3);

            for ($j = 0; $j < $numOrders; $j++) {
                $address = $customer->addresses()->first();
                $status = $orderStatuses[array_rand($orderStatuses)];

                // Random date in last 3 months
                $orderDate = Carbon::now()->subDays(rand(1, 90));

                $order = Order::create([
                    'customer_id' => $customer->id,
                    'subtotal' => 0, // Will calculate
                    'tax_amount' => 0,
                    'shipping_charge' => 50,
                    'discount_amount' => 0,
                    'total_amount' => 0,
                    'shipping_name' => $address->name,
                    'shipping_phone' => $address->phone,
                    'shipping_address' => $address->address_line_1 . ', ' . $address->address_line_2,
                    'shipping_city' => $address->city,
                    'shipping_state' => $address->state,
                    'shipping_pincode' => $address->pincode,
                    'shipping_country' => $address->country,
                    'billing_name' => $address->name,
                    'billing_phone' => $address->phone,
                    'billing_address' => $address->address_line_1 . ', ' . $address->address_line_2,
                    'billing_city' => $address->city,
                    'billing_state' => $address->state,
                    'billing_pincode' => $address->pincode,
                    'billing_country' => $address->country,
                    'payment_method' => 'online',
                    'payment_status' => in_array($status, ['delivered', 'shipped', 'processing']) ? 'paid' : 'pending',
                    'paid_at' => in_array($status, ['delivered', 'shipped', 'processing']) ? $orderDate : null,
                    'status' => $status,
                    'shipped_at' => in_array($status, ['delivered', 'shipped']) ? $orderDate->copy()->addDays(2) : null,
                    'delivered_at' => $status === 'delivered' ? $orderDate->copy()->addDays(5) : null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Add 1-3 random products to order
                $numItems = rand(1, 3);
                $randomProducts = collect($products)->random(min($numItems, count($products)));

                $subtotal = 0;
                $taxAmount = 0;

                foreach ($randomProducts as $product) {
                    $quantity = rand(1, 2);
                    $price = $product->selling_price;
                    $itemTax = ($price * $quantity * $product->gst_percentage) / 100;
                    $itemTotal = ($price * $quantity) + $itemTax;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'vendor_id' => $product->vendor_id,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                        'quantity' => $quantity,
                        'price' => $price,
                        'tax_amount' => $itemTax,
                        'discount_amount' => 0,
                        'total_amount' => $itemTotal,
                        'status' => $status,
                    ]);

                    $subtotal += $price * $quantity;
                    $taxAmount += $itemTax;
                }

                // Update order totals
                $order->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $subtotal + $taxAmount + 50, // +50 shipping
                ]);

                $orders[] = $order;
            }
        }

        $this->command->info('💰 Creating Vendor Payouts with TDS...');

        // 7. Create Payouts for delivered orders
        foreach ($vendorModels as $vendorData) {
            $vendor = $vendorData['vendor'];

            // ===== LAST MONTH PAYOUT (COMPLETED) =====
            $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            $lastMonthOrders = Order::where('status', 'delivered')
                ->where('delivered_at', '>=', $lastMonthStart)
                ->where('delivered_at', '<=', $lastMonthEnd)
                ->whereHas('items', function($query) use ($vendor) {
                    $query->where('vendor_id', $vendor->id);
                })
                ->get();

            if ($lastMonthOrders->count() > 0) {
                $totalSales = 0;
                $orderIds = [];

                foreach ($lastMonthOrders as $order) {
                    $vendorItems = $order->items()->where('vendor_id', $vendor->id)->get();
                    $totalSales += $vendorItems->sum('total_amount');
                    $orderIds[] = $order->id;
                }

                // Calculate commission
                $commissionRate = $vendor->commission_rate ?? 10;
                $platformCommission = ($totalSales * $commissionRate) / 100;

                // Calculate GST on commission (18%)
                $commissionGst = ($platformCommission * 18) / 100;
                $totalCommissionWithGst = $platformCommission + $commissionGst;

                // Calculate TDS (1% for vendors with PAN, 5% without)
                $tdsRate = $vendor->pan_number ? 1 : 5;
                $tdsAmount = ($totalSales * $tdsRate) / 100;

                // Net amount = Total Sales - Commission - Commission GST - TDS
                $netAmount = $totalSales - $totalCommissionWithGst - $tdsAmount;

                $bankAccount = $vendor->bankAccount;

                $payout = VendorPayout::create([
                    'vendor_id' => $vendor->id,
                    'period_start' => $lastMonthStart,
                    'period_end' => $lastMonthEnd,
                    'total_sales' => $totalSales,
                    'platform_commission' => $platformCommission,
                    'commission_rate' => $commissionRate,
                    'commission_gst' => $commissionGst,
                    'commission_gst_rate' => 18,
                    'total_commission_with_gst' => $totalCommissionWithGst,
                    'tds_amount' => $tdsAmount,
                    'tds_rate' => $tdsRate,
                    'adjustment_amount' => 0,
                    'net_amount' => $netAmount,
                    'total_orders' => $lastMonthOrders->count(),
                    'order_ids' => $orderIds,
                    'status' => 'completed',
                    'payment_method' => 'bank_transfer',
                    'payment_reference' => 'UTR' . rand(100000000000, 999999999999),
                    'account_holder_name' => $bankAccount->account_holder_name,
                    'account_number' => $bankAccount->account_number,
                    'ifsc_code' => $bankAccount->ifsc_code,
                    'bank_name' => $bankAccount->bank_name,
                    'processed_at' => $lastMonthEnd->copy()->addDays(5),
                    'completed_at' => $lastMonthEnd->copy()->addDays(7),
                    'processed_by' => $admin->id,
                    'admin_notes' => 'Payout processed successfully for ' . $lastMonthStart->format('F Y'),
                ]);

                // Create platform revenue record for commission
                $revenueDate = $payout->completed_at;
                PlatformRevenue::create([
                    'revenue_number' => 'REV-' . date('Ymd') . '-' . strtoupper(Str::random(8)),
                    'source_type' => 'commission',
                    'source_reference' => $payout->payout_number,
                    'source_id' => $payout->id,
                    'vendor_id' => $vendor->id,
                    'vendor_name' => $vendor->business_name,
                    'order_id' => $lastMonthOrders->first()->id,
                    'order_number' => $lastMonthOrders->first()->order_number,
                    'vendor_payout_id' => $payout->id,
                    'payout_number' => $payout->payout_number,
                    'gross_amount' => $totalSales,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $platformCommission,
                    'gst_rate' => 18,
                    'gst_amount' => $commissionGst,
                    'net_revenue' => $totalCommissionWithGst,
                    'revenue_date' => $revenueDate->toDateString(),
                    'revenue_month' => $revenueDate->format('Y-m'),
                    'revenue_quarter' => $revenueDate->format('Y') . '-Q' . ceil($revenueDate->month / 3),
                    'revenue_year' => $revenueDate->format('Y'),
                    'status' => 'confirmed',
                    'confirmed_at' => $payout->completed_at,
                    'description' => 'Commission from ' . $vendor->business_name . ' for ' . $lastMonthStart->format('F Y'),
                ]);

                $this->command->info("  ✓ Created completed payout for {$vendor->business_name}: ₹{$netAmount} (TDS: ₹{$tdsAmount})");
            }

            // ===== THIS MONTH PAYOUT (PENDING) =====
            $thisMonthStart = Carbon::now()->startOfMonth();
            $thisMonthEnd = Carbon::now()->endOfMonth();

            $thisMonthOrders = Order::where('status', 'delivered')
                ->where('delivered_at', '>=', $thisMonthStart)
                ->where('delivered_at', '<=', Carbon::now())
                ->whereHas('items', function($query) use ($vendor) {
                    $query->where('vendor_id', $vendor->id);
                })
                ->get();

            if ($thisMonthOrders->count() > 0) {
                $totalSales = 0;
                $orderIds = [];

                foreach ($thisMonthOrders as $order) {
                    $vendorItems = $order->items()->where('vendor_id', $vendor->id)->get();
                    $totalSales += $vendorItems->sum('total_amount');
                    $orderIds[] = $order->id;
                }

                // Calculate commission
                $commissionRate = $vendor->commission_rate ?? 10;
                $platformCommission = ($totalSales * $commissionRate) / 100;

                // Calculate GST on commission (18%)
                $commissionGst = ($platformCommission * 18) / 100;
                $totalCommissionWithGst = $platformCommission + $commissionGst;

                // Calculate TDS (1% for vendors with PAN, 5% without)
                $tdsRate = $vendor->pan_number ? 1 : 5;
                $tdsAmount = ($totalSales * $tdsRate) / 100;

                // Net amount = Total Sales - Commission - Commission GST - TDS
                $netAmount = $totalSales - $totalCommissionWithGst - $tdsAmount;

                $bankAccount = $vendor->bankAccount;

                // Get latest delivery date for scheduled payout calculation
                $latestDeliveryDate = $thisMonthOrders->max('delivered_at');
                $earliestDeliveryDate = $thisMonthOrders->min('delivered_at');

                // Calculate scheduled payout date (delivery + 30 days return period + 1 day)
                $scheduledPayoutDate = Carbon::parse($latestDeliveryDate)->addDays(31);

                VendorPayout::create([
                    'vendor_id' => $vendor->id,
                    'period_start' => $thisMonthStart,
                    'period_end' => $thisMonthEnd,
                    'scheduled_payout_date' => $scheduledPayoutDate,
                    'earliest_delivery_date' => $earliestDeliveryDate,
                    'latest_delivery_date' => $latestDeliveryDate,
                    'total_sales' => $totalSales,
                    'platform_commission' => $platformCommission,
                    'commission_rate' => $commissionRate,
                    'commission_gst' => $commissionGst,
                    'commission_gst_rate' => 18,
                    'total_commission_with_gst' => $totalCommissionWithGst,
                    'tds_amount' => $tdsAmount,
                    'tds_rate' => $tdsRate,
                    'adjustment_amount' => 0,
                    'net_amount' => $netAmount,
                    'total_orders' => $thisMonthOrders->count(),
                    'order_ids' => $orderIds,
                    'status' => 'pending',
                    'account_holder_name' => $bankAccount->account_holder_name,
                    'account_number' => $bankAccount->account_number,
                    'ifsc_code' => $bankAccount->ifsc_code,
                    'bank_name' => $bankAccount->bank_name,
                    'admin_notes' => 'Pending payout for ' . $thisMonthStart->format('F Y'),
                ]);

                $this->command->info("  ✓ Created pending payout for {$vendor->business_name}: ₹{$netAmount} (Scheduled: {$scheduledPayoutDate->format('Y-m-d')})");
            }
        }

        $this->command->info('');
        $this->command->info('✅ Demo Data Seeding Complete!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info('  • Admin: admin@multivendor.com (password: password)');
        $this->command->info('  • Vendors: ' . count($vendorModels));
        $this->command->info('  • Products: ' . count($products));
        $this->command->info('  • Customers: ' . count($customers));
        $this->command->info('  • Orders: ' . count($orders));
        $this->command->info('  • Payouts with TDS: ' . VendorPayout::count());
        $this->command->info('');
        $this->command->info('🔑 Login Credentials:');
        $this->command->info('  Admin: admin@multivendor.com / password');
        $this->command->info('  Vendor 1: vendor1@multivendor.com / password');
        $this->command->info('  Vendor 2: vendor2@multivendor.com / password');
        $this->command->info('  Vendor 3: vendor3@multivendor.com / password');
        $this->command->info('  Customer: customer1@example.com / password');
        $this->command->info('');
    }
}

