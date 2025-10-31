<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventTrigger;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;

class VendorAdminEventTriggersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            // ========== VENDOR EVENTS ==========
            [
                'event_code' => 'vendor.new_order',
                'event_name' => 'New Order Received',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor receives a new order',
                'email_template_code' => 'vendor_new_order',
                'whatsapp_template_code' => 'vendor_new_order',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'order_number', 'customer_name', 'order_total', 'items'],
            ],
            [
                'event_code' => 'vendor.order_cancelled',
                'event_name' => 'Order Cancelled',
                'event_category' => 'vendor',
                'description' => 'Triggered when order is cancelled',
                'email_template_code' => 'vendor_order_cancelled',
                'whatsapp_template_code' => 'vendor_order_cancelled',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'order_number', 'cancellation_reason'],
            ],
            [
                'event_code' => 'vendor.product_approved',
                'event_name' => 'Product Approved',
                'event_category' => 'vendor',
                'description' => 'Triggered when product is approved by admin',
                'email_template_code' => 'vendor_product_approved',
                'whatsapp_template_code' => 'vendor_product_approved',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'product_name', 'product_url'],
            ],
            [
                'event_code' => 'vendor.product_rejected',
                'event_name' => 'Product Rejected',
                'event_category' => 'vendor',
                'description' => 'Triggered when product is rejected by admin',
                'email_template_code' => 'vendor_product_rejected',
                'whatsapp_template_code' => 'vendor_product_rejected',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'product_name', 'rejection_reason'],
            ],
            [
                'event_code' => 'vendor.low_stock',
                'event_name' => 'Low Stock Alert',
                'event_category' => 'vendor',
                'description' => 'Triggered when product stock is low',
                'email_template_code' => 'vendor_low_stock_alert',
                'whatsapp_template_code' => 'vendor_low_stock_alert',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'product_name', 'current_stock', 'threshold'],
            ],
            [
                'event_code' => 'vendor.out_of_stock',
                'event_name' => 'Out of Stock',
                'event_category' => 'vendor',
                'description' => 'Triggered when product is out of stock',
                'email_template_code' => 'vendor_product_out_of_stock',
                'whatsapp_template_code' => 'vendor_out_of_stock',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'product_name', 'product_id'],
            ],
            [
                'event_code' => 'vendor.payout_initiated',
                'event_name' => 'Payout Initiated',
                'event_category' => 'vendor',
                'description' => 'Triggered when payout is initiated',
                'email_template_code' => 'vendor_payout_initiated',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'payout_amount', 'payout_id', 'processing_days'],
            ],
            [
                'event_code' => 'vendor.payout_completed',
                'event_name' => 'Payout Completed',
                'event_category' => 'vendor',
                'description' => 'Triggered when payout is completed',
                'email_template_code' => 'vendor_payout_completed',
                'whatsapp_template_code' => 'vendor_payout_processed',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'payout_amount', 'payout_id', 'transaction_id'],
            ],
            [
                'event_code' => 'vendor.payout_failed',
                'event_name' => 'Payout Failed',
                'event_category' => 'vendor',
                'description' => 'Triggered when payout fails',
                'email_template_code' => 'vendor_payout_failed',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'payout_amount', 'failure_reason'],
            ],
            [
                'event_code' => 'vendor.commission_earned',
                'event_name' => 'Commission Earned',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor earns commission',
                'email_template_code' => 'vendor_commission_earned',
                'whatsapp_template_code' => 'vendor_commission_earned',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'order_number', 'commission_amount', 'order_total'],
            ],
            [
                'event_code' => 'vendor.new_review',
                'event_name' => 'New Review Received',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor receives a new review',
                'email_template_code' => 'vendor_new_review',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'product_name', 'rating', 'review_text', 'customer_name'],
            ],
            [
                'event_code' => 'vendor.rating_received',
                'event_name' => 'Rating Received',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor receives a rating',
                'email_template_code' => 'vendor_rating_received',
                'whatsapp_template_code' => 'vendor_rating_received',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'product_name', 'rating'],
            ],
            [
                'event_code' => 'vendor.return_request',
                'event_name' => 'Return Request',
                'event_category' => 'vendor',
                'description' => 'Triggered when customer requests return',
                'email_template_code' => 'vendor_return_request',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'order_number', 'return_reason', 'customer_name'],
            ],
            [
                'event_code' => 'vendor.account_approved',
                'event_name' => 'Account Approved',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor account is approved',
                'email_template_code' => 'vendor_account_approved',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'store_name', 'dashboard_url'],
            ],
            [
                'event_code' => 'vendor.account_rejected',
                'event_name' => 'Account Rejected',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor account is rejected',
                'email_template_code' => 'vendor_account_rejected',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'rejection_reason'],
            ],
            [
                'event_code' => 'vendor.account_suspended',
                'event_name' => 'Account Suspended',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor account is suspended',
                'email_template_code' => 'vendor_account_suspended',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'suspension_reason', 'suspension_until'],
            ],
            [
                'event_code' => 'vendor.subscription_expiring',
                'event_name' => 'Subscription Expiring',
                'event_category' => 'vendor',
                'description' => 'Triggered when vendor subscription is about to expire',
                'email_template_code' => 'vendor_subscription_expiring',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['vendor_name', 'expiry_date', 'days_remaining', 'renewal_url'],
            ],

            // ========== ADMIN EVENTS ==========
            [
                'event_code' => 'admin.new_vendor_registration',
                'event_name' => 'New Vendor Registration',
                'event_category' => 'admin',
                'description' => 'Triggered when new vendor registers',
                'email_template_code' => 'admin_new_vendor_registration',
                'whatsapp_template_code' => 'admin_new_vendor_registration',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'store_name', 'email', 'phone', 'approval_url'],
            ],
            [
                'event_code' => 'admin.new_customer_registration',
                'event_name' => 'New Customer Registration',
                'event_category' => 'admin',
                'description' => 'Triggered when new customer registers',
                'email_template_code' => 'admin_new_customer_registration',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'email', 'phone', 'registration_date'],
            ],
            [
                'event_code' => 'admin.product_pending_approval',
                'event_name' => 'Product Pending Approval',
                'event_category' => 'admin',
                'description' => 'Triggered when product needs approval',
                'email_template_code' => 'admin_new_product_pending',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['product_name', 'vendor_name', 'category', 'price', 'approval_url'],
            ],
            [
                'event_code' => 'admin.high_value_order',
                'event_name' => 'High Value Order',
                'event_category' => 'admin',
                'description' => 'Triggered when high-value order is placed',
                'email_template_code' => 'admin_high_value_order',
                'whatsapp_template_code' => 'admin_high_value_order',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['order_number', 'customer_name', 'order_total', 'order_url'],
            ],
            [
                'event_code' => 'admin.refund_requested',
                'event_name' => 'Refund Requested',
                'event_category' => 'admin',
                'description' => 'Triggered when refund is requested',
                'email_template_code' => 'admin_order_refund_requested',
                'whatsapp_template_code' => 'admin_refund_requested',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['order_number', 'customer_name', 'refund_amount', 'reason'],
            ],
            [
                'event_code' => 'admin.chargeback_alert',
                'event_name' => 'Chargeback Alert',
                'event_category' => 'admin',
                'description' => 'Triggered when chargeback is initiated',
                'email_template_code' => 'admin_chargeback_alert',
                'whatsapp_template_code' => 'admin_chargeback_alert',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['order_number', 'customer_name', 'amount', 'reason'],
            ],
            [
                'event_code' => 'admin.low_inventory',
                'event_name' => 'Low Inventory Alert',
                'event_category' => 'admin',
                'description' => 'Triggered when inventory is low across platform',
                'email_template_code' => 'admin_low_inventory_alert',
                'whatsapp_template_code' => 'admin_low_inventory',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['product_count', 'products_list'],
            ],
            [
                'event_code' => 'admin.suspicious_activity',
                'event_name' => 'Suspicious Activity',
                'event_category' => 'admin',
                'description' => 'Triggered when suspicious activity is detected',
                'email_template_code' => 'admin_suspicious_activity',
                'whatsapp_template_code' => 'admin_suspicious_activity',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['activity_type', 'user_name', 'ip_address', 'details'],
            ],
            [
                'event_code' => 'admin.payment_gateway_failure',
                'event_name' => 'Payment Gateway Failure',
                'event_category' => 'admin',
                'description' => 'Triggered when payment gateway fails',
                'email_template_code' => 'admin_payment_gateway_failure',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['gateway_name', 'error_message', 'affected_orders'],
            ],
            [
                'event_code' => 'admin.system_error',
                'event_name' => 'System Error',
                'event_category' => 'admin',
                'description' => 'Triggered when critical system error occurs',
                'email_template_code' => 'admin_system_error',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['error_type', 'error_message', 'stack_trace', 'timestamp'],
            ],
        ];

        foreach ($events as $event) {
            $emailTemplateCode = $event['email_template_code'] ?? null;
            $whatsappTemplateCode = $event['whatsapp_template_code'] ?? null;
            
            unset($event['email_template_code'], $event['whatsapp_template_code']);

            // Get template IDs
            $emailTemplateId = $emailTemplateCode 
                ? EmailTemplate::where('code', $emailTemplateCode)->value('id')
                : null;
            
            $whatsappTemplateId = $whatsappTemplateCode
                ? WhatsAppTemplate::where('code', $whatsappTemplateCode)->value('id')
                : null;

            EventTrigger::updateOrCreate(
                ['event_code' => $event['event_code']],
                array_merge($event, [
                    'email_template_id' => $emailTemplateId,
                    'whatsapp_template_id' => $whatsappTemplateId,
                ])
            );
        }
    }
}

