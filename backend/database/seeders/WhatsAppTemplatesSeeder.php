<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\WhatsAppTemplate;

class WhatsAppTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // OTP Templates
            [
                'code' => 'otp_verification',
                'name' => 'OTP Verification',
                'category' => 'otp',
                'language' => 'en',
                'header' => null,
                'body' => 'Your OTP for verification is {{1}}. Valid for {{2}} minutes. Do not share this OTP with anyone.',
                'footer' => null,
                'button_type' => 'NONE',
                'buttons' => null,
                'variables' => ['otp', 'expiry_minutes'],
                'status' => 'draft',
                'description' => 'OTP for login, registration, and verification',
                'is_active' => true,
            ],
            [
                'code' => 'otp_login',
                'name' => 'Login OTP',
                'category' => 'otp',
                'language' => 'en',
                'header' => null,
                'body' => '{{1}} is your login OTP for {{2}}. Valid for {{3}} minutes.',
                'footer' => 'Do not share this OTP',
                'button_type' => 'NONE',
                'buttons' => null,
                'variables' => ['otp', 'site_name', 'expiry_minutes'],
                'status' => 'draft',
                'description' => 'OTP for user login',
                'is_active' => true,
            ],

            // Customer Order Templates
            [
                'code' => 'customer_order_confirmation',
                'name' => 'Order Confirmation',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Order Confirmed! 🎉',
                'body' => 'Hi {{1}}, your order {{2}} has been confirmed. Total: ₹{{3}}. Expected delivery: {{4}}.',
                'footer' => 'Thank you for shopping with us!',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Track Order', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'order_number', 'total_amount', 'delivery_date', 'tracking_url'],
                'status' => 'draft',
                'description' => 'Sent when order is confirmed',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_shipped',
                'name' => 'Order Shipped',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Order Shipped! 📦',
                'body' => 'Hi {{1}}, your order {{2}} has been shipped. Tracking ID: {{3}}. Expected delivery: {{4}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Track Shipment', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'order_number', 'tracking_id', 'delivery_date', 'tracking_url'],
                'status' => 'draft',
                'description' => 'Sent when order is shipped',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_delivered',
                'name' => 'Order Delivered',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Order Delivered! ✅',
                'body' => 'Hi {{1}}, your order {{2}} has been delivered. We hope you love your purchase!',
                'footer' => 'Please rate your experience',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Rate Order', 'url' => '{{3}}']
                ]),
                'variables' => ['customer_name', 'order_number', 'review_url'],
                'status' => 'draft',
                'description' => 'Sent when order is delivered',
                'is_active' => true,
            ],

            // Vendor Templates
            [
                'code' => 'vendor_new_order',
                'name' => 'New Order Alert',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'New Order Received! 🛍️',
                'body' => 'Hi {{1}}, you have a new order {{2}}. Items: {{3}}. Amount: ₹{{4}}. Please process it soon.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Order', 'url' => '{{5}}']
                ]),
                'variables' => ['vendor_name', 'order_number', 'item_count', 'order_amount', 'order_url'],
                'status' => 'draft',
                'description' => 'Sent when vendor receives new order',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_approved',
                'name' => 'Product Approved',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Product Approved! ✅',
                'body' => 'Hi {{1}}, your product "{{2}}" has been approved and is now live on the marketplace.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Product', 'url' => '{{3}}']
                ]),
                'variables' => ['vendor_name', 'product_name', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when product is approved',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_low_stock_alert',
                'name' => 'Low Stock Alert',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Low Stock Alert! ⚠️',
                'body' => 'Hi {{1}}, your product "{{2}}" is running low on stock. Current stock: {{3}} units.',
                'footer' => 'Please restock soon',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Update Stock', 'url' => '{{4}}']
                ]),
                'variables' => ['vendor_name', 'product_name', 'current_stock', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when product stock is low',
                'is_active' => true,
            ],

            // Admin Templates
            [
                'code' => 'admin_new_vendor_registration',
                'name' => 'New Vendor Registration',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'New Vendor Registration',
                'body' => 'New vendor "{{1}}" has registered. Business: {{2}}. Please review the application.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Review Application', 'url' => '{{3}}']
                ]),
                'variables' => ['vendor_name', 'business_name', 'review_url'],
                'status' => 'draft',
                'description' => 'Sent when new vendor registers',
                'is_active' => true,
            ],
            [
                'code' => 'admin_high_value_order',
                'name' => 'High Value Order Alert',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'High Value Order! 💰',
                'body' => 'High value order {{1}} placed. Amount: ₹{{2}}. Customer: {{3}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Order', 'url' => '{{4}}']
                ]),
                'variables' => ['order_number', 'order_amount', 'customer_name', 'order_url'],
                'status' => 'draft',
                'description' => 'Sent when high-value order is placed',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            WhatsAppTemplate::updateOrCreate(
                ['code' => $template['code']],
                $template
            );
        }
    }
}

