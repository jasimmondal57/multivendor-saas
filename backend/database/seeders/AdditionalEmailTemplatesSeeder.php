<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class AdditionalEmailTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ==================== ADDITIONAL CUSTOMER NOTIFICATIONS ====================
            
            // Payment & Invoice
            [
                'code' => 'customer_payment_received',
                'name' => 'Payment Received',
                'category' => 'customer',
                'subject' => 'Payment Received - {{order_number}}',
                'body' => '<h1>Payment Confirmed</h1>
<p>Dear {{customer_name}},</p>
<p>We have successfully received your payment for order <strong>{{order_number}}</strong>.</p>
<h3>Payment Details:</h3>
<ul>
<li>Amount Paid: ₹{{amount}}</li>
<li>Payment Method: {{payment_method}}</li>
<li>Transaction ID: {{transaction_id}}</li>
<li>Payment Date: {{payment_date}}</li>
</ul>
<p>Your order is now being processed.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'amount', 'payment_method', 'transaction_id', 'payment_date', 'site_name']),
                'description' => 'Sent when payment is successfully received',
                'is_active' => true,
            ],
            [
                'code' => 'customer_payment_failed',
                'name' => 'Payment Failed',
                'category' => 'customer',
                'subject' => 'Payment Failed - {{order_number}}',
                'body' => '<h1>Payment Failed</h1>
<p>Dear {{customer_name}},</p>
<p>Unfortunately, your payment for order <strong>{{order_number}}</strong> could not be processed.</p>
<h3>Reason:</h3>
<p>{{failure_reason}}</p>
<p>Please try again or use a different payment method.</p>
<p><a href="{{retry_payment_url}}" style="background-color: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Retry Payment</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'failure_reason', 'retry_payment_url', 'site_name']),
                'description' => 'Sent when payment fails',
                'is_active' => true,
            ],
            [
                'code' => 'customer_invoice',
                'name' => 'Invoice',
                'category' => 'customer',
                'subject' => 'Invoice for Order {{order_number}}',
                'body' => '<h1>Invoice</h1>
<p>Dear {{customer_name}},</p>
<p>Please find your invoice for order <strong>{{order_number}}</strong> below.</p>
<h3>Invoice Details:</h3>
<ul>
<li>Invoice Number: {{invoice_number}}</li>
<li>Invoice Date: {{invoice_date}}</li>
<li>Total Amount: ₹{{total_amount}}</li>
<li>Tax: ₹{{tax_amount}}</li>
<li>Grand Total: ₹{{grand_total}}</li>
</ul>
<p><a href="{{invoice_pdf_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Invoice</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'invoice_number', 'invoice_date', 'total_amount', 'tax_amount', 'grand_total', 'invoice_pdf_url', 'site_name']),
                'description' => 'Sent with order invoice',
                'is_active' => true,
            ],

            // Order Status Updates
            [
                'code' => 'customer_order_processing',
                'name' => 'Order Processing',
                'category' => 'customer',
                'subject' => 'Your Order is Being Processed - {{order_number}}',
                'body' => '<h1>Order Processing</h1>
<p>Dear {{customer_name}},</p>
<p>Great news! Your order <strong>{{order_number}}</strong> is now being processed.</p>
<p>We are preparing your items for shipment. You will receive a shipping notification once your order is dispatched.</p>
<p><a href="{{order_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'order_url', 'site_name']),
                'description' => 'Sent when order starts processing',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_ready_for_pickup',
                'name' => 'Order Ready for Pickup',
                'category' => 'customer',
                'subject' => 'Your Order is Ready for Pickup - {{order_number}}',
                'body' => '<h1>Order Ready for Pickup!</h1>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> is ready for pickup!</p>
<h3>Pickup Details:</h3>
<ul>
<li>Pickup Location: {{pickup_location}}</li>
<li>Pickup Code: {{pickup_code}}</li>
<li>Available Until: {{pickup_deadline}}</li>
</ul>
<p>Please bring a valid ID and your pickup code.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'pickup_location', 'pickup_code', 'pickup_deadline', 'site_name']),
                'description' => 'Sent when order is ready for pickup',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_delayed',
                'name' => 'Order Delayed',
                'category' => 'customer',
                'subject' => 'Order Delay Notification - {{order_number}}',
                'body' => '<h1>Order Delay Notice</h1>
<p>Dear {{customer_name}},</p>
<p>We regret to inform you that your order <strong>{{order_number}}</strong> has been delayed.</p>
<h3>Details:</h3>
<ul>
<li>Original Delivery Date: {{original_date}}</li>
<li>New Expected Date: {{new_date}}</li>
<li>Reason: {{delay_reason}}</li>
</ul>
<p>We apologize for the inconvenience and are working to deliver your order as soon as possible.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'original_date', 'new_date', 'delay_reason', 'site_name']),
                'description' => 'Sent when order is delayed',
                'is_active' => true,
            ],

            // Reviews & Feedback
            [
                'code' => 'customer_review_request',
                'name' => 'Review Request',
                'category' => 'customer',
                'subject' => 'How was your experience? - {{order_number}}',
                'body' => '<h1>We Value Your Feedback!</h1>
<p>Dear {{customer_name}},</p>
<p>Thank you for your recent purchase! We hope you love your order <strong>{{order_number}}</strong>.</p>
<p>Would you mind taking a moment to share your experience?</p>
<p><a href="{{review_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Write a Review</a></p>
<p>Your feedback helps us improve and helps other customers make informed decisions.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'review_url', 'site_name']),
                'description' => 'Sent to request product review',
                'is_active' => true,
            ],
            [
                'code' => 'customer_review_thank_you',
                'name' => 'Review Thank You',
                'category' => 'customer',
                'subject' => 'Thank You for Your Review!',
                'body' => '<h1>Thank You!</h1>
<p>Dear {{customer_name}},</p>
<p>Thank you for taking the time to review <strong>{{product_name}}</strong>!</p>
<p>Your feedback is invaluable to us and helps other customers make better purchasing decisions.</p>
<p>As a token of our appreciation, here\'s a special discount code for your next purchase:</p>
<p style="font-size: 24px; font-weight: bold; color: #4CAF50;">{{discount_code}}</p>
<p>Valid until: {{expiry_date}}</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'discount_code', 'expiry_date', 'site_name']),
                'description' => 'Sent after customer submits a review',
                'is_active' => true,
            ],

            // Wishlist & Alerts
            [
                'code' => 'customer_wishlist_reminder',
                'name' => 'Wishlist Reminder',
                'category' => 'customer',
                'subject' => 'Items in Your Wishlist Are Waiting!',
                'body' => '<h1>Don\'t Forget Your Wishlist!</h1>
<p>Dear {{customer_name}},</p>
<p>You have {{item_count}} item(s) in your wishlist that are still available!</p>
<p>{{wishlist_items}}</p>
<p><a href="{{wishlist_url}}" style="background-color: #E91E63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Wishlist</a></p>
<p>Don\'t miss out on your favorite items!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'item_count', 'wishlist_items', 'wishlist_url', 'site_name']),
                'description' => 'Reminder for wishlist items',
                'is_active' => true,
            ],
            [
                'code' => 'customer_flash_sale_alert',
                'name' => 'Flash Sale Alert',
                'category' => 'customer',
                'subject' => '⚡ Flash Sale Alert! {{discount}}% OFF',
                'body' => '<h1>⚡ Flash Sale Alert!</h1>
<p>Dear {{customer_name}},</p>
<p>Hurry! Get <strong>{{discount}}% OFF</strong> on selected items for the next {{duration}} hours!</p>
<p>Use code: <strong>{{coupon_code}}</strong></p>
<p><a href="{{sale_url}}" style="background-color: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Shop Now</a></p>
<p>Sale ends: {{end_time}}</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'discount', 'duration', 'coupon_code', 'sale_url', 'end_time', 'site_name']),
                'description' => 'Flash sale notification',
                'is_active' => true,
            ],
            [
                'code' => 'customer_low_stock_alert',
                'name' => 'Low Stock Alert',
                'category' => 'customer',
                'subject' => 'Hurry! {{product_name}} is Almost Sold Out',
                'body' => '<h1>Low Stock Alert!</h1>
<p>Dear {{customer_name}},</p>
<p>The product <strong>{{product_name}}</strong> from your wishlist is running low on stock!</p>
<p>Only {{stock_count}} units left. Order now before it\'s gone!</p>
<p><a href="{{product_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Buy Now</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'stock_count', 'product_url', 'site_name']),
                'description' => 'Low stock alert for wishlist items',
                'is_active' => true,
            ],

            // Account & Security
            [
                'code' => 'customer_email_verification',
                'name' => 'Email Verification',
                'category' => 'customer',
                'subject' => 'Verify Your Email Address',
                'body' => '<h1>Verify Your Email</h1>
<p>Dear {{customer_name}},</p>
<p>Thank you for registering with {{site_name}}!</p>
<p>Please verify your email address by clicking the button below:</p>
<p><a href="{{verification_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
<p>This link will expire in {{expiry_hours}} hours.</p>
<p>If you didn\'t create this account, please ignore this email.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'site_name', 'verification_url', 'expiry_hours']),
                'description' => 'Email verification for new accounts',
                'is_active' => true,
            ],
            [
                'code' => 'customer_login_alert',
                'name' => 'New Login Alert',
                'category' => 'customer',
                'subject' => 'New Login to Your Account',
                'body' => '<h1>New Login Detected</h1>
<p>Dear {{customer_name}},</p>
<p>We detected a new login to your account.</p>
<h3>Login Details:</h3>
<ul>
<li>Time: {{login_time}}</li>
<li>Device: {{device}}</li>
<li>Location: {{location}}</li>
<li>IP Address: {{ip_address}}</li>
</ul>
<p>If this was you, you can safely ignore this email.</p>
<p>If you don\'t recognize this activity, please secure your account immediately:</p>
<p><a href="{{security_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Secure My Account</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'login_time', 'device', 'location', 'ip_address', 'security_url', 'site_name']),
                'description' => 'Alert for new login from unknown device',
                'is_active' => true,
            ],
            [
                'code' => 'customer_password_changed',
                'name' => 'Password Changed',
                'category' => 'customer',
                'subject' => 'Your Password Has Been Changed',
                'body' => '<h1>Password Changed Successfully</h1>
<p>Dear {{customer_name}},</p>
<p>Your password was successfully changed on {{change_date}}.</p>
<p>If you made this change, you can safely ignore this email.</p>
<p>If you did NOT change your password, please contact us immediately:</p>
<p><a href="{{support_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact Support</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'change_date', 'support_url', 'site_name']),
                'description' => 'Confirmation of password change',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['code' => $template['code']],
                $template
            );
        }
    }
}

