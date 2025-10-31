<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            ['key' => 'site_name', 'value' => 'Multi-Vendor E-commerce', 'type' => 'string', 'group' => 'general', 'description' => 'Website name'],
            ['key' => 'site_tagline', 'value' => 'Your One-Stop Shopping Destination', 'type' => 'string', 'group' => 'general', 'description' => 'Website tagline'],
            ['key' => 'contact_email', 'value' => 'support@multivendor.com', 'type' => 'string', 'group' => 'general', 'description' => 'Contact email'],
            ['key' => 'contact_phone', 'value' => '+91 1234567890', 'type' => 'string', 'group' => 'general', 'description' => 'Contact phone'],
            ['key' => 'address', 'value' => '123 Business Street, Mumbai, Maharashtra 400001', 'type' => 'string', 'group' => 'general', 'description' => 'Business address'],
            ['key' => 'timezone', 'value' => 'Asia/Kolkata', 'type' => 'string', 'group' => 'general', 'description' => 'Default timezone'],
            ['key' => 'currency', 'value' => 'INR', 'type' => 'string', 'group' => 'general', 'description' => 'Default currency'],
            ['key' => 'currency_symbol', 'value' => '₹', 'type' => 'string', 'group' => 'general', 'description' => 'Currency symbol'],
            ['key' => 'date_format', 'value' => 'DD/MM/YYYY', 'type' => 'string', 'group' => 'general', 'description' => 'Date format'],
            ['key' => 'time_format', 'value' => '12h', 'type' => 'string', 'group' => 'general', 'description' => 'Time format'],

            // Payment Settings
            ['key' => 'razorpay_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'payment', 'description' => 'Enable Razorpay'],
            ['key' => 'razorpay_key_id', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Razorpay Key ID'],
            ['key' => 'razorpay_key_secret', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Razorpay Key Secret'],
            ['key' => 'stripe_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'payment', 'description' => 'Enable Stripe'],
            ['key' => 'stripe_publishable_key', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Stripe Publishable Key'],
            ['key' => 'stripe_secret_key', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Stripe Secret Key'],
            ['key' => 'paytm_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'payment', 'description' => 'Enable Paytm'],
            ['key' => 'paytm_merchant_id', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Paytm Merchant ID'],
            ['key' => 'paytm_merchant_key', 'value' => '', 'type' => 'string', 'group' => 'payment', 'description' => 'Paytm Merchant Key'],
            ['key' => 'cod_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'payment', 'description' => 'Enable Cash on Delivery'],
            ['key' => 'cod_max_amount', 'value' => '50000', 'type' => 'integer', 'group' => 'payment', 'description' => 'COD maximum amount'],
            ['key' => 'platform_commission', 'value' => '10', 'type' => 'float', 'group' => 'payment', 'description' => 'Platform commission percentage (excluding GST)'],
            ['key' => 'commission_gst_percentage', 'value' => '18', 'type' => 'float', 'group' => 'payment', 'description' => 'GST percentage on platform commission'],

            // Email Settings
            ['key' => 'smtp_host', 'value' => 'smtp.gmail.com', 'type' => 'string', 'group' => 'email', 'description' => 'SMTP host'],
            ['key' => 'smtp_port', 'value' => '587', 'type' => 'integer', 'group' => 'email', 'description' => 'SMTP port'],
            ['key' => 'smtp_username', 'value' => '', 'type' => 'string', 'group' => 'email', 'description' => 'SMTP username'],
            ['key' => 'smtp_password', 'value' => '', 'type' => 'string', 'group' => 'email', 'description' => 'SMTP password'],
            ['key' => 'smtp_encryption', 'value' => 'tls', 'type' => 'string', 'group' => 'email', 'description' => 'SMTP encryption'],
            ['key' => 'from_email', 'value' => 'noreply@multivendor.com', 'type' => 'string', 'group' => 'email', 'description' => 'From email address'],
            ['key' => 'from_name', 'value' => 'Multi-Vendor E-commerce', 'type' => 'string', 'group' => 'email', 'description' => 'From name'],
            ['key' => 'order_confirmation_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'email', 'description' => 'Send order confirmation emails'],
            ['key' => 'order_shipped_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'email', 'description' => 'Send order shipped emails'],
            ['key' => 'order_delivered_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'email', 'description' => 'Send order delivered emails'],
            ['key' => 'vendor_approval_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'email', 'description' => 'Send vendor approval emails'],

            // Security Settings
            ['key' => 'two_factor_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'security', 'description' => 'Enable two-factor authentication'],
            ['key' => 'session_timeout', 'value' => '30', 'type' => 'integer', 'group' => 'security', 'description' => 'Session timeout in minutes'],
            ['key' => 'password_min_length', 'value' => '8', 'type' => 'integer', 'group' => 'security', 'description' => 'Minimum password length'],
            ['key' => 'password_require_uppercase', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'description' => 'Require uppercase in password'],
            ['key' => 'password_require_lowercase', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'description' => 'Require lowercase in password'],
            ['key' => 'password_require_numbers', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'description' => 'Require numbers in password'],
            ['key' => 'password_require_special_chars', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'description' => 'Require special characters in password'],
            ['key' => 'max_login_attempts', 'value' => '5', 'type' => 'integer', 'group' => 'security', 'description' => 'Maximum login attempts'],
            ['key' => 'lockout_duration', 'value' => '15', 'type' => 'integer', 'group' => 'security', 'description' => 'Lockout duration in minutes'],
            ['key' => 'ip_whitelist', 'value' => '', 'type' => 'string', 'group' => 'security', 'description' => 'IP whitelist (comma-separated)'],

            // Shipping Settings
            ['key' => 'free_shipping_threshold', 'value' => '500', 'type' => 'integer', 'group' => 'shipping', 'description' => 'Free shipping threshold amount'],
            ['key' => 'default_shipping_charge', 'value' => '50', 'type' => 'integer', 'group' => 'shipping', 'description' => 'Default shipping charge'],
            ['key' => 'express_shipping_charge', 'value' => '100', 'type' => 'integer', 'group' => 'shipping', 'description' => 'Express shipping charge'],
            ['key' => 'international_shipping_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'shipping', 'description' => 'Enable international shipping'],
            ['key' => 'estimated_delivery_days', 'value' => '7', 'type' => 'integer', 'group' => 'shipping', 'description' => 'Estimated delivery days'],
            ['key' => 'tracking_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'shipping', 'description' => 'Enable order tracking'],

            // Delhivery Courier API Settings
            ['key' => 'delhivery_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'shipping', 'description' => 'Enable Delhivery courier integration'],
            ['key' => 'delhivery_api_key', 'value' => '', 'type' => 'string', 'group' => 'shipping', 'description' => 'Delhivery API Token'],
            ['key' => 'delhivery_client_name', 'value' => '', 'type' => 'string', 'group' => 'shipping', 'description' => 'Delhivery Client Name'],
            ['key' => 'delhivery_warehouse_name', 'value' => '', 'type' => 'string', 'group' => 'shipping', 'description' => 'Delhivery Warehouse Name'],
            ['key' => 'delhivery_mode', 'value' => 'test', 'type' => 'string', 'group' => 'shipping', 'description' => 'Delhivery Mode (test/production)'],
            ['key' => 'delhivery_auto_create_shipment', 'value' => '0', 'type' => 'boolean', 'group' => 'shipping', 'description' => 'Auto create shipment on order confirmation'],
            ['key' => 'delhivery_auto_schedule_pickup', 'value' => '0', 'type' => 'boolean', 'group' => 'shipping', 'description' => 'Auto schedule pickup'],
            ['key' => 'delhivery_webhook_url', 'value' => '', 'type' => 'string', 'group' => 'shipping', 'description' => 'Delhivery Webhook URL for tracking updates'],

            // Payout Settings
            ['key' => 'platform_commission_rate', 'value' => '10', 'type' => 'decimal', 'group' => 'payout', 'description' => 'Default platform commission rate (%)'],
            ['key' => 'tds_rate', 'value' => '1', 'type' => 'decimal', 'group' => 'payout', 'description' => 'TDS rate for vendor payouts (%)'],
            ['key' => 'minimum_payout_amount', 'value' => '1000', 'type' => 'integer', 'group' => 'payout', 'description' => 'Minimum payout amount (₹)'],
            ['key' => 'payout_schedule_days', 'value' => '7', 'type' => 'integer', 'group' => 'payout', 'description' => 'Payout schedule (days after delivery)'],
            ['key' => 'auto_payout_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'payout', 'description' => 'Enable automatic payout processing'],
            ['key' => 'payout_gateway', 'value' => 'manual', 'type' => 'string', 'group' => 'payout', 'description' => 'Payout gateway (manual/razorpay/cashfree)'],

            // WhatsApp Settings (Meta WhatsApp Cloud API)
            ['key' => 'whatsapp_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'whatsapp', 'description' => 'Enable WhatsApp notifications'],
            ['key' => 'whatsapp_phone_number_id', 'value' => '', 'type' => 'string', 'group' => 'whatsapp', 'description' => 'WhatsApp Phone Number ID from Meta'],
            ['key' => 'whatsapp_waba_id', 'value' => '', 'type' => 'string', 'group' => 'whatsapp', 'description' => 'WhatsApp Business Account ID (WABA ID)'],
            ['key' => 'whatsapp_access_token', 'value' => '', 'type' => 'string', 'group' => 'whatsapp', 'description' => 'Meta Access Token (Permanent)'],
            ['key' => 'whatsapp_verify_token', 'value' => '', 'type' => 'string', 'group' => 'whatsapp', 'description' => 'Webhook Verify Token'],
            ['key' => 'whatsapp_otp_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'whatsapp', 'description' => 'Enable OTP via WhatsApp'],
            ['key' => 'whatsapp_order_notifications', 'value' => '1', 'type' => 'boolean', 'group' => 'whatsapp', 'description' => 'Send order notifications via WhatsApp'],
            ['key' => 'whatsapp_vendor_notifications', 'value' => '1', 'type' => 'boolean', 'group' => 'whatsapp', 'description' => 'Send vendor notifications via WhatsApp'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
