<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhatsAppTemplate;

class AdditionalWhatsAppTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ==================== ADDITIONAL CUSTOMER WHATSAPP TEMPLATES ====================
            
            [
                'code' => 'customer_order_cancelled',
                'name' => 'Order Cancelled',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Order Cancelled',
                'body' => 'Hi {{1}}, your order {{2}} has been cancelled. Refund of ₹{{3}} will be processed within {{4}} business days.',
                'footer' => 'Thank you for your understanding',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'order_number', 'refund_amount', 'refund_days', 'order_url'],
                'status' => 'draft',
                'description' => 'Sent when order is cancelled',
                'is_active' => true,
            ],
            [
                'code' => 'customer_payment_received',
                'name' => 'Payment Received',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Payment Confirmed ✅',
                'body' => 'Hi {{1}}, we have received your payment of ₹{{2}} for order {{3}}. Transaction ID: {{4}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Receipt', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'amount', 'order_number', 'transaction_id', 'receipt_url'],
                'status' => 'draft',
                'description' => 'Sent when payment is received',
                'is_active' => true,
            ],
            [
                'code' => 'customer_refund_processed',
                'name' => 'Refund Processed',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Refund Processed 💰',
                'body' => 'Hi {{1}}, your refund of ₹{{2}} for order {{3}} has been processed. It will reflect in your account within {{4}} business days.',
                'footer' => null,
                'button_type' => 'NONE',
                'buttons' => null,
                'variables' => ['customer_name', 'refund_amount', 'order_number', 'days'],
                'status' => 'draft',
                'description' => 'Sent when refund is processed',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_out_for_delivery',
                'name' => 'Out for Delivery',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Out for Delivery! 🚚',
                'body' => 'Hi {{1}}, your order {{2}} is out for delivery! Expected delivery: {{3}}. Delivery partner: {{4}}.',
                'footer' => 'Please keep your phone handy',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Track Live', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'order_number', 'delivery_time', 'delivery_partner', 'tracking_url'],
                'status' => 'draft',
                'description' => 'Sent when order is out for delivery',
                'is_active' => true,
            ],
            [
                'code' => 'customer_back_in_stock',
                'name' => 'Back in Stock',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Back in Stock! 🎉',
                'body' => 'Hi {{1}}, great news! "{{2}}" is back in stock. Price: ₹{{3}}. Hurry, limited stock available!',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Buy Now', 'url' => '{{4}}']
                ]),
                'variables' => ['customer_name', 'product_name', 'price', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when wishlist item is back in stock',
                'is_active' => true,
            ],
            [
                'code' => 'customer_price_drop',
                'name' => 'Price Drop Alert',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Price Drop Alert! 💸',
                'body' => 'Hi {{1}}, "{{2}}" from your wishlist is now ₹{{3}} (was ₹{{4}}). Save {{5}}%!',
                'footer' => 'Limited time offer',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Buy Now', 'url' => '{{6}}']
                ]),
                'variables' => ['customer_name', 'product_name', 'new_price', 'old_price', 'discount', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when wishlist item price drops',
                'is_active' => true,
            ],
            [
                'code' => 'customer_abandoned_cart',
                'name' => 'Abandoned Cart Reminder',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'You Left Something Behind! 🛒',
                'body' => 'Hi {{1}}, you have {{2}} item(s) in your cart worth ₹{{3}}. Complete your purchase now!',
                'footer' => 'Items selling fast',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Complete Order', 'url' => '{{4}}']
                ]),
                'variables' => ['customer_name', 'item_count', 'cart_total', 'cart_url'],
                'status' => 'draft',
                'description' => 'Sent for abandoned cart',
                'is_active' => true,
            ],
            [
                'code' => 'customer_flash_sale',
                'name' => 'Flash Sale Alert',
                'category' => 'customer',
                'language' => 'en',
                'header' => '⚡ Flash Sale Alert!',
                'body' => 'Hi {{1}}, {{2}}% OFF on selected items! Use code: {{3}}. Valid for next {{4}} hours only!',
                'footer' => 'Hurry, limited time!',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Shop Now', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'discount', 'coupon_code', 'duration', 'sale_url'],
                'status' => 'draft',
                'description' => 'Flash sale notification',
                'is_active' => true,
            ],

            // ==================== ADDITIONAL VENDOR WHATSAPP TEMPLATES ====================
            
            [
                'code' => 'vendor_order_cancelled',
                'name' => 'Order Cancelled',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Order Cancelled',
                'body' => 'Hi {{1}}, order {{2}} has been cancelled. Reason: {{3}}. Refund: ₹{{4}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{5}}']
                ]),
                'variables' => ['vendor_name', 'order_number', 'reason', 'refund_amount', 'order_url'],
                'status' => 'draft',
                'description' => 'Sent when order is cancelled',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_payout_processed',
                'name' => 'Payout Processed',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Payout Processed! 💰',
                'body' => 'Hi {{1}}, your payout of ₹{{2}} has been processed. Reference: {{3}}. Check your account in {{4}} hours.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{5}}']
                ]),
                'variables' => ['vendor_name', 'amount', 'reference', 'hours', 'payout_url'],
                'status' => 'draft',
                'description' => 'Sent when payout is processed',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_rejected',
                'name' => 'Product Rejected',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Product Rejected',
                'body' => 'Hi {{1}}, your product "{{2}}" was rejected. Reason: {{3}}. Please update and resubmit.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Edit Product', 'url' => '{{4}}']
                ]),
                'variables' => ['vendor_name', 'product_name', 'rejection_reason', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when product is rejected',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_out_of_stock',
                'name' => 'Product Out of Stock',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Out of Stock! ⚠️',
                'body' => 'Hi {{1}}, your product "{{2}}" is out of stock. Please restock to continue receiving orders.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Update Stock', 'url' => '{{3}}']
                ]),
                'variables' => ['vendor_name', 'product_name', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when product goes out of stock',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_return_approved',
                'name' => 'Return Approved',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Return Approved',
                'body' => 'Hi {{1}}, return request for order {{2}} has been approved. Pickup scheduled: {{3}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{4}}']
                ]),
                'variables' => ['vendor_name', 'order_number', 'pickup_date', 'return_url'],
                'status' => 'draft',
                'description' => 'Sent when return is approved',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_commission_earned',
                'name' => 'Commission Earned',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Commission Earned! 💵',
                'body' => 'Hi {{1}}, you earned ₹{{2}} commission on order {{3}}. Total earnings this month: ₹{{4}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Earnings', 'url' => '{{5}}']
                ]),
                'variables' => ['vendor_name', 'commission', 'order_number', 'monthly_total', 'earnings_url'],
                'status' => 'draft',
                'description' => 'Sent when commission is earned',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_rating_received',
                'name' => 'New Rating',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'New Rating Received! ⭐',
                'body' => 'Hi {{1}}, you received a {{2}}-star rating from {{3}}. Review: "{{4}}"',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Review', 'url' => '{{5}}']
                ]),
                'variables' => ['vendor_name', 'rating', 'customer_name', 'review_text', 'review_url'],
                'status' => 'draft',
                'description' => 'Sent when vendor receives rating',
                'is_active' => true,
            ],

            // ==================== ADDITIONAL ADMIN WHATSAPP TEMPLATES ====================
            
            [
                'code' => 'admin_refund_requested',
                'name' => 'Refund Request',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'Refund Request',
                'body' => 'Refund requested for order {{1}}. Customer: {{2}}. Amount: ₹{{3}}. Reason: {{4}}.',
                'footer' => 'Action required',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Review Request', 'url' => '{{5}}']
                ]),
                'variables' => ['order_number', 'customer_name', 'amount', 'reason', 'order_url'],
                'status' => 'draft',
                'description' => 'Sent when refund is requested',
                'is_active' => true,
            ],
            [
                'code' => 'admin_product_reported',
                'name' => 'Product Reported',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'Product Reported! ⚠️',
                'body' => 'Product "{{1}}" by vendor {{2}} has been reported. Reason: {{3}}. Reported by: {{4}}.',
                'footer' => 'Immediate action required',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Review Product', 'url' => '{{5}}']
                ]),
                'variables' => ['product_name', 'vendor_name', 'report_reason', 'reporter_name', 'product_url'],
                'status' => 'draft',
                'description' => 'Sent when product is reported',
                'is_active' => true,
            ],
            [
                'code' => 'admin_chargeback_alert',
                'name' => 'Chargeback Alert',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'Chargeback Alert! 🚨',
                'body' => 'Chargeback initiated for order {{1}}. Amount: ₹{{2}}. Customer: {{3}}. Immediate action required!',
                'footer' => 'Critical',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Handle Dispute', 'url' => '{{4}}']
                ]),
                'variables' => ['order_number', 'amount', 'customer_name', 'dispute_url'],
                'status' => 'draft',
                'description' => 'Sent when chargeback is initiated',
                'is_active' => true,
            ],
            [
                'code' => 'admin_low_inventory',
                'name' => 'Low Inventory Alert',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'Low Inventory Alert',
                'body' => '{{1}} products are running low on inventory. Immediate restocking required.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Inventory', 'url' => '{{2}}']
                ]),
                'variables' => ['product_count', 'inventory_url'],
                'status' => 'draft',
                'description' => 'Sent when inventory is low',
                'is_active' => true,
            ],
            [
                'code' => 'admin_suspicious_activity',
                'name' => 'Suspicious Activity',
                'category' => 'admin',
                'language' => 'en',
                'header' => 'Security Alert! 🔒',
                'body' => 'Suspicious activity detected. Type: {{1}}. User: {{2}}. IP: {{3}}. Time: {{4}}.',
                'footer' => 'Investigate immediately',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Investigate', 'url' => '{{5}}']
                ]),
                'variables' => ['activity_type', 'user_name', 'ip_address', 'time', 'security_url'],
                'status' => 'draft',
                'description' => 'Sent when suspicious activity is detected',
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

