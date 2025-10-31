<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SupportCategory;
use Illuminate\Support\Str;

class SupportCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Customer Categories
            [
                'name' => 'Order Issues',
                'slug' => 'order-issues',
                'description' => 'Issues related to order placement, tracking, or delivery',
                'icon' => 'shopping-bag',
                'user_type' => 'customer',
                'position' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Payment & Refund',
                'slug' => 'payment-refund',
                'description' => 'Payment failures, refund status, or billing issues',
                'icon' => 'credit-card',
                'user_type' => 'customer',
                'position' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Product Issues',
                'slug' => 'product-issues',
                'description' => 'Damaged, defective, or wrong product received',
                'icon' => 'package',
                'user_type' => 'customer',
                'position' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Return & Exchange',
                'slug' => 'return-exchange',
                'description' => 'Return requests, exchange process, or pickup issues',
                'icon' => 'refresh-cw',
                'user_type' => 'customer',
                'position' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Account & Login',
                'slug' => 'account-login',
                'description' => 'Account access, password reset, or profile issues',
                'icon' => 'user',
                'user_type' => 'customer',
                'position' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Cancellation',
                'slug' => 'cancellation',
                'description' => 'Order cancellation requests or issues',
                'icon' => 'x-circle',
                'user_type' => 'customer',
                'position' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Other',
                'slug' => 'customer-other',
                'description' => 'Any other customer support queries',
                'icon' => 'help-circle',
                'user_type' => 'customer',
                'position' => 99,
                'is_active' => true,
            ],

            // Vendor Categories
            [
                'name' => 'Payout Issues',
                'slug' => 'payout-issues',
                'description' => 'Payout delays, incorrect amounts, or bank account issues',
                'icon' => 'dollar-sign',
                'user_type' => 'vendor',
                'position' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Product Listing',
                'slug' => 'product-listing',
                'description' => 'Product approval, listing issues, or catalog problems',
                'icon' => 'list',
                'user_type' => 'vendor',
                'position' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Order Management',
                'slug' => 'order-management',
                'description' => 'Order processing, shipping, or fulfillment issues',
                'icon' => 'truck',
                'user_type' => 'vendor',
                'position' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Return Disputes',
                'slug' => 'return-disputes',
                'description' => 'Disputes related to return requests or quality checks',
                'icon' => 'alert-triangle',
                'user_type' => 'vendor',
                'position' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Account & Settings',
                'slug' => 'vendor-account-settings',
                'description' => 'Vendor account, KYC, or store settings issues',
                'icon' => 'settings',
                'user_type' => 'vendor',
                'position' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Commission & Fees',
                'slug' => 'commission-fees',
                'description' => 'Questions about platform fees, commissions, or charges',
                'icon' => 'percent',
                'user_type' => 'vendor',
                'position' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Technical Issues',
                'slug' => 'technical-issues',
                'description' => 'Dashboard errors, bugs, or technical problems',
                'icon' => 'code',
                'user_type' => 'vendor',
                'position' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Other',
                'slug' => 'vendor-other',
                'description' => 'Any other vendor support queries',
                'icon' => 'help-circle',
                'user_type' => 'vendor',
                'position' => 99,
                'is_active' => true,
            ],

            // Common Categories (Both)
            [
                'name' => 'General Inquiry',
                'slug' => 'general-inquiry',
                'description' => 'General questions or information requests',
                'icon' => 'message-circle',
                'user_type' => 'both',
                'position' => 98,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            SupportCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}

