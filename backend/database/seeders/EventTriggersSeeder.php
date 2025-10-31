<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventTrigger;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;

class EventTriggersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            // ========== CUSTOMER EVENTS ==========
            [
                'event_code' => 'customer.registered',
                'event_name' => 'Customer Registration',
                'event_category' => 'customer',
                'description' => 'Triggered when a new customer registers',
                'email_template_code' => 'customer_welcome',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'email', 'site_name', 'login_url'],
            ],
            [
                'event_code' => 'customer.email_verification',
                'event_name' => 'Email Verification',
                'event_category' => 'customer',
                'description' => 'Triggered when customer needs to verify email',
                'email_template_code' => 'customer_email_verification',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'verification_url', 'verification_code'],
            ],
            [
                'event_code' => 'customer.password_reset',
                'event_name' => 'Password Reset Request',
                'event_category' => 'customer',
                'description' => 'Triggered when customer requests password reset',
                'email_template_code' => 'customer_password_reset',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'reset_url', 'reset_token'],
            ],
            [
                'event_code' => 'customer.password_changed',
                'event_name' => 'Password Changed',
                'event_category' => 'customer',
                'description' => 'Triggered when customer changes password',
                'email_template_code' => 'customer_password_changed',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'changed_at', 'ip_address'],
            ],
            [
                'event_code' => 'customer.login_alert',
                'event_name' => 'New Login Alert',
                'event_category' => 'customer',
                'description' => 'Triggered when customer logs in from new device',
                'email_template_code' => 'customer_login_alert',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'device', 'location', 'ip_address', 'login_time'],
            ],

            // ========== ORDER EVENTS ==========
            [
                'event_code' => 'order.placed',
                'event_name' => 'Order Placed',
                'event_category' => 'customer',
                'description' => 'Triggered when customer places an order',
                'email_template_code' => 'customer_order_confirmation',
                'whatsapp_template_code' => 'customer_order_confirmation',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'order_date', 'order_total', 'order_url', 'items'],
            ],
            [
                'event_code' => 'order.processing',
                'event_name' => 'Order Processing',
                'event_category' => 'customer',
                'description' => 'Triggered when order is being processed',
                'email_template_code' => 'customer_order_processing',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'estimated_ship_date'],
            ],
            [
                'event_code' => 'order.shipped',
                'event_name' => 'Order Shipped',
                'event_category' => 'customer',
                'description' => 'Triggered when order is shipped',
                'email_template_code' => 'customer_order_shipped',
                'whatsapp_template_code' => 'customer_order_shipped',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'tracking_number', 'tracking_url', 'carrier'],
            ],
            [
                'event_code' => 'order.out_for_delivery',
                'event_name' => 'Out for Delivery',
                'event_category' => 'customer',
                'description' => 'Triggered when order is out for delivery',
                'email_template_code' => 'customer_order_out_for_delivery',
                'whatsapp_template_code' => 'customer_order_out_for_delivery',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'estimated_delivery_time'],
            ],
            [
                'event_code' => 'order.delivered',
                'event_name' => 'Order Delivered',
                'event_category' => 'customer',
                'description' => 'Triggered when order is delivered',
                'email_template_code' => 'customer_order_delivered',
                'whatsapp_template_code' => 'customer_order_delivered',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'delivered_at', 'review_url'],
            ],
            [
                'event_code' => 'order.cancelled',
                'event_name' => 'Order Cancelled',
                'event_category' => 'customer',
                'description' => 'Triggered when order is cancelled',
                'email_template_code' => 'customer_order_cancelled',
                'whatsapp_template_code' => 'customer_order_cancelled',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'cancellation_reason', 'refund_amount'],
            ],
            [
                'event_code' => 'order.delayed',
                'event_name' => 'Order Delayed',
                'event_category' => 'customer',
                'description' => 'Triggered when order delivery is delayed',
                'email_template_code' => 'customer_order_delayed',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'new_estimated_date', 'delay_reason'],
            ],
            [
                'event_code' => 'order.ready_for_pickup',
                'event_name' => 'Order Ready for Pickup',
                'event_category' => 'customer',
                'description' => 'Triggered when order is ready for pickup',
                'email_template_code' => 'customer_order_ready_for_pickup',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'pickup_location', 'pickup_hours'],
            ],

            // ========== PAYMENT EVENTS ==========
            [
                'event_code' => 'payment.received',
                'event_name' => 'Payment Received',
                'event_category' => 'customer',
                'description' => 'Triggered when payment is successfully received',
                'email_template_code' => 'customer_payment_received',
                'whatsapp_template_code' => 'customer_payment_received',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'amount', 'payment_method', 'transaction_id'],
            ],
            [
                'event_code' => 'payment.failed',
                'event_name' => 'Payment Failed',
                'event_category' => 'customer',
                'description' => 'Triggered when payment fails',
                'email_template_code' => 'customer_payment_failed',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'amount', 'failure_reason', 'retry_url'],
            ],
            [
                'event_code' => 'refund.processed',
                'event_name' => 'Refund Processed',
                'event_category' => 'customer',
                'description' => 'Triggered when refund is processed',
                'email_template_code' => 'customer_refund_processed',
                'whatsapp_template_code' => 'customer_refund_processed',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'order_number', 'refund_amount', 'refund_method', 'processing_days'],
            ],
            [
                'event_code' => 'invoice.generated',
                'event_name' => 'Invoice Generated',
                'event_category' => 'customer',
                'description' => 'Triggered when invoice is generated',
                'email_template_code' => 'customer_invoice',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'invoice_number', 'invoice_date', 'invoice_url', 'total_amount'],
            ],

            // ========== RETURN EVENTS ==========
            [
                'event_code' => 'return.requested',
                'event_name' => 'Return Requested',
                'event_category' => 'customer',
                'description' => 'Triggered when customer requests a return',
                'email_template_code' => 'customer_return_request_received',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'return_number', 'return_reason'],
            ],
            [
                'event_code' => 'return.approved',
                'event_name' => 'Return Approved',
                'event_category' => 'customer',
                'description' => 'Triggered when return is approved',
                'email_template_code' => 'customer_return_approved',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'order_number', 'return_number', 'return_label_url'],
            ],

            // ========== REVIEW EVENTS ==========
            [
                'event_code' => 'review.request',
                'event_name' => 'Review Request',
                'event_category' => 'customer',
                'description' => 'Triggered to request product review after delivery',
                'email_template_code' => 'customer_review_request',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'product_name', 'order_number', 'review_url'],
            ],
            [
                'event_code' => 'review.thank_you',
                'event_name' => 'Review Thank You',
                'event_category' => 'customer',
                'description' => 'Triggered when customer submits a review',
                'email_template_code' => 'customer_review_thank_you',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'product_name', 'rating'],
            ],

            // ========== WISHLIST & ALERTS ==========
            [
                'event_code' => 'wishlist.price_drop',
                'event_name' => 'Wishlist Price Drop',
                'event_category' => 'customer',
                'description' => 'Triggered when wishlist item price drops',
                'email_template_code' => 'customer_wishlist_price_drop',
                'whatsapp_template_code' => 'customer_price_drop',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'product_name', 'old_price', 'new_price', 'product_url'],
            ],
            [
                'event_code' => 'product.back_in_stock',
                'event_name' => 'Product Back in Stock',
                'event_category' => 'customer',
                'description' => 'Triggered when out-of-stock product is back',
                'email_template_code' => 'customer_product_back_in_stock',
                'whatsapp_template_code' => 'customer_back_in_stock',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'product_name', 'product_url', 'price'],
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
