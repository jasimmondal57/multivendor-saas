<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhatsAppTemplate;

class ReturnWhatsAppTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding return order WhatsApp templates...');

        $templates = [
            [
                'code' => 'customer_return_requested_wa',
                'name' => 'Return Request Submitted (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Return Request Submitted',
                'body' => 'Hi {{1}}, your return request {{2}} has been submitted successfully. Refund Amount: ₹{{3}}. The vendor will review your request shortly.',
                'footer' => 'Thank you for shopping with us!',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Track Return',
                        'url' => '{{4}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'refund_amount', 'return_url'],
                'meta_template_name' => 'return_requested',
                'status' => 'draft',
                'description' => 'Sent when customer submits a return request',
            ],
            [
                'code' => 'customer_return_approved_wa',
                'name' => 'Return Request Approved (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Return Approved ✅',
                'body' => 'Great news {{1}}! Your return request {{2}} has been approved. Refund Amount: ₹{{3}}. Pickup will be scheduled soon.',
                'footer' => 'Keep the product ready for pickup',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Track Return',
                        'url' => '{{4}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'refund_amount', 'return_url'],
                'meta_template_name' => 'return_approved',
                'status' => 'draft',
                'description' => 'Sent when vendor approves the return request',
            ],
            [
                'code' => 'customer_return_rejected_wa',
                'name' => 'Return Request Rejected (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Return Rejected ❌',
                'body' => 'Hi {{1}}, your return request {{2}} has been rejected. Reason: {{3}}. Contact support for assistance.',
                'footer' => 'We are here to help',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Contact Support',
                        'url' => '{{4}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'rejection_reason', 'support_url'],
                'meta_template_name' => 'return_rejected',
                'status' => 'draft',
                'description' => 'Sent when vendor rejects the return request',
            ],
            [
                'code' => 'customer_return_pickup_scheduled_wa',
                'name' => 'Return Pickup Scheduled (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Pickup Scheduled 📦',
                'body' => 'Hi {{1}}, pickup for return {{2}} is scheduled on {{3}}. AWB: {{4}}. Courier: {{5}}. Please keep the product ready.',
                'footer' => 'Pickup time: 10 AM - 6 PM',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Track Return',
                        'url' => '{{6}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'pickup_date', 'awb_number', 'courier_partner', 'return_url'],
                'meta_template_name' => 'return_pickup_scheduled',
                'status' => 'draft',
                'description' => 'Sent when return pickup is scheduled',
            ],
            [
                'code' => 'customer_return_picked_up_wa',
                'name' => 'Return Package Picked Up (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Package Picked Up 🚚',
                'body' => 'Hi {{1}}, your return package {{2}} has been picked up. AWB: {{3}}. Track your return for updates.',
                'footer' => 'Refund will be processed after inspection',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Track Return',
                        'url' => '{{4}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'awb_number', 'return_url'],
                'meta_template_name' => 'return_picked_up',
                'status' => 'draft',
                'description' => 'Sent when return package is picked up',
            ],
            [
                'code' => 'customer_return_received_wa',
                'name' => 'Return Package Received (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Package Received ✅',
                'body' => 'Hi {{1}}, your return {{2}} has been received at the warehouse. Inspection in progress. You will be notified once complete.',
                'footer' => 'Inspection takes 1-2 business days',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Track Return',
                        'url' => '{{3}}',
                    ],
                ],
                'variables' => ['customer_name', 'return_number', 'return_url'],
                'meta_template_name' => 'return_received',
                'status' => 'draft',
                'description' => 'Sent when return package is received at warehouse',
            ],
            [
                'code' => 'customer_return_refund_initiated_wa',
                'name' => 'Refund Initiated (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Refund Initiated 💰',
                'body' => 'Great news {{1}}! Refund of ₹{{2}} for return {{3}} has been initiated. Amount will be credited in 5-7 business days.',
                'footer' => 'Thank you for your patience',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'View Details',
                        'url' => '{{4}}',
                    ],
                ],
                'variables' => ['customer_name', 'refund_amount', 'return_number', 'return_url'],
                'meta_template_name' => 'return_refund_initiated',
                'status' => 'draft',
                'description' => 'Sent when refund is initiated',
            ],
            [
                'code' => 'customer_return_refund_completed_wa',
                'name' => 'Refund Completed (WhatsApp)',
                'category' => 'customer',
                'language' => 'en',
                'header' => 'Refund Completed ✅',
                'body' => 'Hi {{1}}, your refund of ₹{{2}} for return {{3}} has been completed. Transaction ID: {{4}}. Amount will reflect in 5-7 days.',
                'footer' => 'Thank you for shopping with us!',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Shop Again',
                        'url' => '{{5}}',
                    ],
                ],
                'variables' => ['customer_name', 'refund_amount', 'return_number', 'transaction_id', 'shop_url'],
                'meta_template_name' => 'return_refund_completed',
                'status' => 'draft',
                'description' => 'Sent when refund is completed',
            ],
            [
                'code' => 'vendor_return_requested_wa',
                'name' => 'New Return Request (WhatsApp)',
                'category' => 'vendor',
                'language' => 'en',
                'header' => 'New Return Request 📦',
                'body' => 'Hi {{1}}, you have a new return request {{2}} from {{3}}. Product: {{4}}. Refund: ₹{{5}}. Please review.',
                'footer' => 'Login to your dashboard',
                'button_type' => 'url',
                'buttons' => [
                    [
                        'type' => 'URL',
                        'text' => 'Review Request',
                        'url' => '{{6}}',
                    ],
                ],
                'variables' => ['vendor_name', 'return_number', 'customer_name', 'product_name', 'refund_amount', 'vendor_dashboard_url'],
                'meta_template_name' => 'vendor_return_requested',
                'status' => 'draft',
                'description' => 'Sent to vendor when customer submits a return request',
            ],
        ];

        foreach ($templates as $template) {
            WhatsAppTemplate::updateOrCreate(
                ['code' => $template['code']],
                array_merge($template, ['is_active' => true])
            );
            $this->command->info("Created/Updated: {$template['code']}");
        }

        $this->command->info('✅ Created 9 return order WhatsApp templates');
    }
}

