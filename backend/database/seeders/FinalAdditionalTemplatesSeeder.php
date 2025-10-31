<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;

class FinalAdditionalTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Additional Email Templates
        $emailTemplates = [
            // Loyalty & Rewards
            [
                'code' => 'customer_loyalty_points_earned',
                'name' => 'Loyalty Points Earned',
                'category' => 'customer',
                'subject' => 'You Earned {{points}} Loyalty Points!',
                'body' => '<h1>Loyalty Points Earned!</h1>
<p>Dear {{customer_name}},</p>
<p>Congratulations! You have earned <strong>{{points}}</strong> loyalty points on your recent purchase.</p>
<h3>Your Loyalty Summary:</h3>
<ul>
<li>Points Earned: {{points}}</li>
<li>Total Points: {{total_points}}</li>
<li>Points Value: ₹{{points_value}}</li>
</ul>
<p><a href="{{rewards_url}}" style="background-color: #9C27B0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redeem Points</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'points', 'total_points', 'points_value', 'rewards_url', 'site_name']),
                'description' => 'Sent when customer earns loyalty points',
                'is_active' => true,
            ],
            [
                'code' => 'customer_coupon_expiring',
                'name' => 'Coupon Expiring Soon',
                'category' => 'customer',
                'subject' => 'Your Coupon is Expiring Soon!',
                'body' => '<h1>Coupon Expiring Soon!</h1>
<p>Dear {{customer_name}},</p>
<p>Your coupon code <strong>{{coupon_code}}</strong> is expiring soon!</p>
<h3>Coupon Details:</h3>
<ul>
<li>Code: {{coupon_code}}</li>
<li>Discount: {{discount}}</li>
<li>Expires: {{expiry_date}}</li>
<li>Minimum Order: ₹{{min_order}}</li>
</ul>
<p>Don\'t miss out! Use it before it expires.</p>
<p><a href="{{shop_url}}" style="background-color: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Shop Now</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'coupon_code', 'discount', 'expiry_date', 'min_order', 'shop_url', 'site_name']),
                'description' => 'Sent when coupon is about to expire',
                'is_active' => true,
            ],

            // Subscription & Membership
            [
                'code' => 'customer_subscription_activated',
                'name' => 'Subscription Activated',
                'category' => 'customer',
                'subject' => 'Your Subscription is Active!',
                'body' => '<h1>Subscription Activated!</h1>
<p>Dear {{customer_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription has been activated successfully!</p>
<h3>Subscription Details:</h3>
<ul>
<li>Plan: {{plan_name}}</li>
<li>Price: ₹{{price}}/{{billing_cycle}}</li>
<li>Start Date: {{start_date}}</li>
<li>Next Billing: {{next_billing_date}}</li>
</ul>
<p>Enjoy your exclusive benefits!</p>
<p><a href="{{subscription_url}}" style="background-color: #673AB7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Subscription</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'plan_name', 'price', 'billing_cycle', 'start_date', 'next_billing_date', 'subscription_url', 'site_name']),
                'description' => 'Sent when subscription is activated',
                'is_active' => true,
            ],
            [
                'code' => 'customer_subscription_renewal',
                'name' => 'Subscription Renewal',
                'category' => 'customer',
                'subject' => 'Subscription Renewed Successfully',
                'body' => '<h1>Subscription Renewed!</h1>
<p>Dear {{customer_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription has been renewed successfully.</p>
<h3>Renewal Details:</h3>
<ul>
<li>Amount Charged: ₹{{amount}}</li>
<li>Renewal Date: {{renewal_date}}</li>
<li>Next Billing: {{next_billing_date}}</li>
<li>Payment Method: {{payment_method}}</li>
</ul>
<p>Thank you for continuing with us!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'plan_name', 'amount', 'renewal_date', 'next_billing_date', 'payment_method', 'site_name']),
                'description' => 'Sent when subscription is renewed',
                'is_active' => true,
            ],
            [
                'code' => 'customer_subscription_cancelled',
                'name' => 'Subscription Cancelled',
                'category' => 'customer',
                'subject' => 'Subscription Cancelled',
                'body' => '<h1>Subscription Cancelled</h1>
<p>Dear {{customer_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription has been cancelled as requested.</p>
<p>Your subscription will remain active until <strong>{{end_date}}</strong>.</p>
<p>We\'re sorry to see you go! If you change your mind, you can reactivate anytime.</p>
<p><a href="{{reactivate_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reactivate Subscription</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'plan_name', 'end_date', 'reactivate_url', 'site_name']),
                'description' => 'Sent when subscription is cancelled',
                'is_active' => true,
            ],

            // Warranty & Support
            [
                'code' => 'customer_warranty_activated',
                'name' => 'Warranty Activated',
                'category' => 'customer',
                'subject' => 'Warranty Activated - {{product_name}}',
                'body' => '<h1>Warranty Activated!</h1>
<p>Dear {{customer_name}},</p>
<p>The warranty for your product <strong>{{product_name}}</strong> has been activated.</p>
<h3>Warranty Details:</h3>
<ul>
<li>Product: {{product_name}}</li>
<li>Warranty Period: {{warranty_period}}</li>
<li>Valid Until: {{expiry_date}}</li>
<li>Warranty ID: {{warranty_id}}</li>
</ul>
<p><a href="{{warranty_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Warranty Details</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'warranty_period', 'expiry_date', 'warranty_id', 'warranty_url', 'site_name']),
                'description' => 'Sent when warranty is activated',
                'is_active' => true,
            ],
            [
                'code' => 'customer_warranty_expiring',
                'name' => 'Warranty Expiring Soon',
                'category' => 'customer',
                'subject' => 'Warranty Expiring Soon - {{product_name}}',
                'body' => '<h1>Warranty Expiring Soon</h1>
<p>Dear {{customer_name}},</p>
<p>The warranty for your product <strong>{{product_name}}</strong> is expiring on <strong>{{expiry_date}}</strong>.</p>
<p>Consider extending your warranty for continued protection.</p>
<p><a href="{{extend_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Extend Warranty</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'expiry_date', 'extend_url', 'site_name']),
                'description' => 'Sent when warranty is about to expire',
                'is_active' => true,
            ],

            // Vendor - Subscription & Compliance
            [
                'code' => 'vendor_subscription_renewal_reminder',
                'name' => 'Subscription Renewal Reminder',
                'category' => 'vendor',
                'subject' => 'Subscription Renewal Reminder',
                'body' => '<h1>Subscription Renewal Reminder</h1>
<p>Dear {{vendor_name}},</p>
<p>Your <strong>{{plan_name}}</strong> subscription will renew on <strong>{{renewal_date}}</strong>.</p>
<h3>Renewal Details:</h3>
<ul>
<li>Plan: {{plan_name}}</li>
<li>Amount: ₹{{amount}}</li>
<li>Renewal Date: {{renewal_date}}</li>
<li>Payment Method: {{payment_method}}</li>
</ul>
<p>Please ensure sufficient balance in your payment method.</p>
<p><a href="{{subscription_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Subscription</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'plan_name', 'amount', 'renewal_date', 'payment_method', 'subscription_url', 'site_name']),
                'description' => 'Reminder for subscription renewal',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_tax_document_required',
                'name' => 'Tax Document Required',
                'category' => 'vendor',
                'subject' => 'Tax Document Required - Action Needed',
                'body' => '<h1>Tax Document Required</h1>
<p>Dear {{vendor_name}},</p>
<p>We need your updated tax documents to continue processing payouts.</p>
<h3>Required Documents:</h3>
<p>{{required_documents}}</p>
<p>Please upload the documents by <strong>{{deadline}}</strong> to avoid payout delays.</p>
<p><a href="{{upload_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upload Documents</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'required_documents', 'deadline', 'upload_url', 'site_name']),
                'description' => 'Sent when tax documents are required',
                'is_active' => true,
            ],

            // Admin - Reports & Analytics
            [
                'code' => 'admin_weekly_report',
                'name' => 'Weekly Summary Report',
                'category' => 'admin',
                'subject' => 'Weekly Summary - {{week}}',
                'body' => '<h1>Weekly Summary Report</h1>
<p>Here\'s your weekly summary for <strong>{{week}}</strong>:</p>
<h3>Sales Performance:</h3>
<ul>
<li>Total Orders: {{total_orders}}</li>
<li>Total Revenue: ₹{{total_revenue}}</li>
<li>Average Order Value: ₹{{avg_order_value}}</li>
<li>Growth: {{growth_percentage}}%</li>
</ul>
<h3>User Activity:</h3>
<ul>
<li>New Customers: {{new_customers}}</li>
<li>New Vendors: {{new_vendors}}</li>
<li>Active Users: {{active_users}}</li>
</ul>
<p><a href="{{report_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['week', 'total_orders', 'total_revenue', 'avg_order_value', 'growth_percentage', 'new_customers', 'new_vendors', 'active_users', 'report_url', 'site_name']),
                'description' => 'Weekly summary report for admin',
                'is_active' => true,
            ],
        ];

        foreach ($emailTemplates as $template) {
            EmailTemplate::updateOrCreate(
                ['code' => $template['code']],
                $template
            );
        }

        // Additional WhatsApp Templates
        $whatsappTemplates = [
            [
                'code' => 'customer_loyalty_points',
                'name' => 'Loyalty Points Earned',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Points Earned! 🎁',
                'body' => 'Hi {{1}}, you earned {{2}} loyalty points! Total points: {{3}}. Redeem now for rewards worth ₹{{4}}!',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'Redeem Points', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'points_earned', 'total_points', 'points_value', 'rewards_url'],
                'status' => 'draft',
                'description' => 'Sent when loyalty points are earned',
                'is_active' => true,
            ],
            [
                'code' => 'customer_subscription_renewal',
                'name' => 'Subscription Renewal',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Subscription Renewed ✅',
                'body' => 'Hi {{1}}, your {{2}} subscription has been renewed. Amount: ₹{{3}}. Next billing: {{4}}.',
                'footer' => 'Thank you for staying with us',
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'plan_name', 'amount', 'next_billing', 'subscription_url'],
                'status' => 'draft',
                'description' => 'Sent when subscription is renewed',
                'is_active' => true,
            ],
            [
                'code' => 'customer_warranty_activated',
                'name' => 'Warranty Activated',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Warranty Activated! 🛡️',
                'body' => 'Hi {{1}}, warranty for "{{2}}" is now active. Valid until {{3}}. Warranty ID: {{4}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Details', 'url' => '{{5}}']
                ]),
                'variables' => ['customer_name', 'product_name', 'expiry_date', 'warranty_id', 'warranty_url'],
                'status' => 'draft',
                'description' => 'Sent when warranty is activated',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_monthly_report',
                'name' => 'Monthly Report',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'Monthly Report 📊',
                'body' => 'Hi {{1}}, your {{2}} report: Orders: {{3}}, Revenue: ₹{{4}}, Commission: ₹{{5}}.',
                'footer' => null,
                'button_type' => 'CALL_TO_ACTION',
                'buttons' => json_encode([
                    ['type' => 'URL', 'text' => 'View Report', 'url' => '{{6}}']
                ]),
                'variables' => ['vendor_name', 'month', 'total_orders', 'revenue', 'commission', 'report_url'],
                'status' => 'draft',
                'description' => 'Monthly performance report',
                'is_active' => true,
            ],
        ];

        foreach ($whatsappTemplates as $template) {
            WhatsAppTemplate::updateOrCreate(
                ['code' => $template['code']],
                $template
            );
        }
    }
}

