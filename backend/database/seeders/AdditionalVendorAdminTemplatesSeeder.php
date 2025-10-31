<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class AdditionalVendorAdminTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ==================== ADDITIONAL VENDOR NOTIFICATIONS ====================
            
            // Commission & Payouts
            [
                'code' => 'vendor_commission_earned',
                'name' => 'Commission Earned',
                'category' => 'vendor',
                'subject' => 'Commission Earned - {{order_number}}',
                'body' => '<h1>Commission Earned!</h1>
<p>Dear {{vendor_name}},</p>
<p>You have earned a commission on order <strong>{{order_number}}</strong>.</p>
<h3>Commission Details:</h3>
<ul>
<li>Order Amount: ₹{{order_amount}}</li>
<li>Commission Rate: {{commission_rate}}%</li>
<li>Commission Earned: ₹{{commission_amount}}</li>
<li>Order Date: {{order_date}}</li>
</ul>
<p><a href="{{earnings_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Earnings</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'order_number', 'order_amount', 'commission_rate', 'commission_amount', 'order_date', 'earnings_url', 'site_name']),
                'description' => 'Sent when vendor earns commission',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_payout_pending',
                'name' => 'Payout Pending',
                'category' => 'vendor',
                'subject' => 'Payout Pending - ₹{{amount}}',
                'body' => '<h1>Payout Pending</h1>
<p>Dear {{vendor_name}},</p>
<p>Your payout of <strong>₹{{amount}}</strong> is pending and will be processed soon.</p>
<h3>Payout Details:</h3>
<ul>
<li>Amount: ₹{{amount}}</li>
<li>Period: {{period}}</li>
<li>Expected Date: {{expected_date}}</li>
<li>Payment Method: {{payment_method}}</li>
</ul>
<p>You will receive a confirmation once the payout is completed.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'amount', 'period', 'expected_date', 'payment_method', 'site_name']),
                'description' => 'Sent when payout is pending',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_payout_failed',
                'name' => 'Payout Failed',
                'category' => 'vendor',
                'subject' => 'Payout Failed - Action Required',
                'body' => '<h1>Payout Failed</h1>
<p>Dear {{vendor_name}},</p>
<p>Unfortunately, your payout of <strong>₹{{amount}}</strong> could not be processed.</p>
<h3>Reason:</h3>
<p>{{failure_reason}}</p>
<p>Please update your payment information and try again.</p>
<p><a href="{{payment_settings_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Info</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'amount', 'failure_reason', 'payment_settings_url', 'site_name']),
                'description' => 'Sent when payout fails',
                'is_active' => true,
            ],

            // Product Management
            [
                'code' => 'vendor_product_out_of_stock',
                'name' => 'Product Out of Stock',
                'category' => 'vendor',
                'subject' => 'Product Out of Stock - {{product_name}}',
                'body' => '<h1>Product Out of Stock</h1>
<p>Dear {{vendor_name}},</p>
<p>Your product <strong>{{product_name}}</strong> is now out of stock.</p>
<p>Please restock this item to continue receiving orders.</p>
<p><a href="{{product_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Stock</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'product_url', 'site_name']),
                'description' => 'Sent when product goes out of stock',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_pending_approval',
                'name' => 'Product Pending Approval',
                'category' => 'vendor',
                'subject' => 'Product Submitted for Approval - {{product_name}}',
                'body' => '<h1>Product Submitted</h1>
<p>Dear {{vendor_name}},</p>
<p>Your product <strong>{{product_name}}</strong> has been submitted for approval.</p>
<p>Our team will review it within {{review_time}} business days.</p>
<p>You will be notified once the review is complete.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'review_time', 'site_name']),
                'description' => 'Sent when product is submitted for approval',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_updated',
                'name' => 'Product Updated Successfully',
                'category' => 'vendor',
                'subject' => 'Product Updated - {{product_name}}',
                'body' => '<h1>Product Updated</h1>
<p>Dear {{vendor_name}},</p>
<p>Your product <strong>{{product_name}}</strong> has been updated successfully.</p>
<p><a href="{{product_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'product_url', 'site_name']),
                'description' => 'Sent when product is updated',
                'is_active' => true,
            ],

            // Order & Shipping
            [
                'code' => 'vendor_order_cancelled',
                'name' => 'Order Cancelled',
                'category' => 'vendor',
                'subject' => 'Order Cancelled - {{order_number}}',
                'body' => '<h1>Order Cancelled</h1>
<p>Dear {{vendor_name}},</p>
<p>Order <strong>{{order_number}}</strong> has been cancelled.</p>
<h3>Cancellation Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Cancelled By: {{cancelled_by}}</li>
<li>Reason: {{cancellation_reason}}</li>
<li>Refund Amount: ₹{{refund_amount}}</li>
</ul>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'order_number', 'cancelled_by', 'cancellation_reason', 'refund_amount', 'site_name']),
                'description' => 'Sent when order is cancelled',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_shipping_label_ready',
                'name' => 'Shipping Label Ready',
                'category' => 'vendor',
                'subject' => 'Shipping Label Ready - {{order_number}}',
                'body' => '<h1>Shipping Label Ready</h1>
<p>Dear {{vendor_name}},</p>
<p>The shipping label for order <strong>{{order_number}}</strong> is ready.</p>
<p><a href="{{label_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Label</a></p>
<p>Please print and attach the label to the package before shipping.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'order_number', 'label_url', 'site_name']),
                'description' => 'Sent when shipping label is generated',
                'is_active' => true,
            ],

            // Performance & Analytics
            [
                'code' => 'vendor_monthly_report',
                'name' => 'Monthly Performance Report',
                'category' => 'vendor',
                'subject' => 'Your Monthly Report - {{month}}',
                'body' => '<h1>Monthly Performance Report</h1>
<p>Dear {{vendor_name}},</p>
<p>Here\'s your performance summary for <strong>{{month}}</strong>:</p>
<h3>Sales Summary:</h3>
<ul>
<li>Total Orders: {{total_orders}}</li>
<li>Total Revenue: ₹{{total_revenue}}</li>
<li>Total Commission: ₹{{total_commission}}</li>
<li>Average Order Value: ₹{{avg_order_value}}</li>
</ul>
<p><a href="{{report_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'month', 'total_orders', 'total_revenue', 'total_commission', 'avg_order_value', 'report_url', 'site_name']),
                'description' => 'Monthly performance report',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_rating_received',
                'name' => 'New Rating Received',
                'category' => 'vendor',
                'subject' => 'New Rating Received - {{rating}} Stars',
                'body' => '<h1>New Rating Received</h1>
<p>Dear {{vendor_name}},</p>
<p>You have received a new <strong>{{rating}}-star</strong> rating from a customer.</p>
<p><strong>Review:</strong> {{review_text}}</p>
<p><a href="{{review_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Review</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'rating', 'review_text', 'review_url', 'site_name']),
                'description' => 'Sent when vendor receives a rating',
                'is_active' => true,
            ],

            // Account & Compliance
            [
                'code' => 'vendor_account_suspended',
                'name' => 'Account Suspended',
                'category' => 'vendor',
                'subject' => 'Account Suspended - Action Required',
                'body' => '<h1>Account Suspended</h1>
<p>Dear {{vendor_name}},</p>
<p>Your vendor account has been suspended.</p>
<h3>Reason:</h3>
<p>{{suspension_reason}}</p>
<p>To reactivate your account, please contact our support team:</p>
<p><a href="{{support_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact Support</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'suspension_reason', 'support_url', 'site_name']),
                'description' => 'Sent when vendor account is suspended',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_document_expiring',
                'name' => 'Document Expiring Soon',
                'category' => 'vendor',
                'subject' => 'Document Expiring Soon - {{document_type}}',
                'body' => '<h1>Document Expiring Soon</h1>
<p>Dear {{vendor_name}},</p>
<p>Your <strong>{{document_type}}</strong> is expiring on <strong>{{expiry_date}}</strong>.</p>
<p>Please upload a new document to avoid account suspension.</p>
<p><a href="{{upload_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upload Document</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'document_type', 'expiry_date', 'upload_url', 'site_name']),
                'description' => 'Sent when vendor document is expiring',
                'is_active' => true,
            ],

            // ==================== ADDITIONAL ADMIN NOTIFICATIONS ====================
            
            // Orders & Payments
            [
                'code' => 'admin_order_refund_requested',
                'name' => 'Refund Request',
                'category' => 'admin',
                'subject' => 'Refund Requested - {{order_number}}',
                'body' => '<h1>Refund Request</h1>
<p>A refund has been requested for order <strong>{{order_number}}</strong>.</p>
<h3>Details:</h3>
<ul>
<li>Customer: {{customer_name}}</li>
<li>Order Amount: ₹{{order_amount}}</li>
<li>Refund Amount: ₹{{refund_amount}}</li>
<li>Reason: {{refund_reason}}</li>
</ul>
<p><a href="{{order_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['order_number', 'customer_name', 'order_amount', 'refund_amount', 'refund_reason', 'order_url', 'site_name']),
                'description' => 'Sent when refund is requested',
                'is_active' => true,
            ],
            [
                'code' => 'admin_chargeback_alert',
                'name' => 'Chargeback Alert',
                'category' => 'admin',
                'subject' => 'Chargeback Alert - {{order_number}}',
                'body' => '<h1>Chargeback Alert</h1>
<p>A chargeback has been initiated for order <strong>{{order_number}}</strong>.</p>
<h3>Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Amount: ₹{{amount}}</li>
<li>Customer: {{customer_name}}</li>
<li>Reason: {{chargeback_reason}}</li>
<li>Date: {{chargeback_date}}</li>
</ul>
<p>Immediate action required!</p>
<p><a href="{{dispute_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Handle Dispute</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['order_number', 'amount', 'customer_name', 'chargeback_reason', 'chargeback_date', 'dispute_url', 'site_name']),
                'description' => 'Sent when chargeback is initiated',
                'is_active' => true,
            ],

            // Inventory & Products
            [
                'code' => 'admin_low_inventory_alert',
                'name' => 'Low Inventory Alert',
                'category' => 'admin',
                'subject' => 'Low Inventory Alert - {{product_count}} Products',
                'body' => '<h1>Low Inventory Alert</h1>
<p><strong>{{product_count}}</strong> products are running low on inventory.</p>
<p>{{product_list}}</p>
<p><a href="{{inventory_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Inventory</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['product_count', 'product_list', 'inventory_url', 'site_name']),
                'description' => 'Sent when multiple products are low on stock',
                'is_active' => true,
            ],
            [
                'code' => 'admin_product_report_abuse',
                'name' => 'Product Reported',
                'category' => 'admin',
                'subject' => 'Product Reported - {{product_name}}',
                'body' => '<h1>Product Reported</h1>
<p>A product has been reported by a user.</p>
<h3>Details:</h3>
<ul>
<li>Product: {{product_name}}</li>
<li>Vendor: {{vendor_name}}</li>
<li>Reported By: {{reporter_name}}</li>
<li>Reason: {{report_reason}}</li>
<li>Date: {{report_date}}</li>
</ul>
<p><a href="{{product_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Product</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['product_name', 'vendor_name', 'reporter_name', 'report_reason', 'report_date', 'product_url', 'site_name']),
                'description' => 'Sent when product is reported',
                'is_active' => true,
            ],

            // Security & System
            [
                'code' => 'admin_suspicious_activity',
                'name' => 'Suspicious Activity Alert',
                'category' => 'admin',
                'subject' => 'Suspicious Activity Detected',
                'body' => '<h1>Suspicious Activity Alert</h1>
<p>Suspicious activity has been detected on the platform.</p>
<h3>Details:</h3>
<ul>
<li>Activity Type: {{activity_type}}</li>
<li>User: {{user_name}}</li>
<li>IP Address: {{ip_address}}</li>
<li>Time: {{activity_time}}</li>
<li>Description: {{activity_description}}</li>
</ul>
<p>Please investigate immediately.</p>
<p><a href="{{security_url}}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Investigate</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['activity_type', 'user_name', 'ip_address', 'activity_time', 'activity_description', 'security_url', 'site_name']),
                'description' => 'Sent when suspicious activity is detected',
                'is_active' => true,
            ],
            [
                'code' => 'admin_daily_summary',
                'name' => 'Daily Summary Report',
                'category' => 'admin',
                'subject' => 'Daily Summary - {{date}}',
                'body' => '<h1>Daily Summary Report</h1>
<p>Here\'s your daily summary for <strong>{{date}}</strong>:</p>
<h3>Sales:</h3>
<ul>
<li>Total Orders: {{total_orders}}</li>
<li>Total Revenue: ₹{{total_revenue}}</li>
<li>New Customers: {{new_customers}}</li>
<li>New Vendors: {{new_vendors}}</li>
</ul>
<h3>Issues:</h3>
<ul>
<li>Pending Refunds: {{pending_refunds}}</li>
<li>Pending Products: {{pending_products}}</li>
<li>Support Tickets: {{support_tickets}}</li>
</ul>
<p><a href="{{dashboard_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['date', 'total_orders', 'total_revenue', 'new_customers', 'new_vendors', 'pending_refunds', 'pending_products', 'support_tickets', 'dashboard_url', 'site_name']),
                'description' => 'Daily summary report for admin',
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

