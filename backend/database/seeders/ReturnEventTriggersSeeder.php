<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventTrigger;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;

class ReturnEventTriggersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding return order event triggers...');

        $events = [
            [
                'event_code' => 'return.requested',
                'event_name' => 'Return Request Submitted',
                'event_category' => 'return',
                'description' => 'Triggered when customer submits a return request',
                'email_template_code' => 'customer_return_requested',
                'whatsapp_template_code' => 'customer_return_requested_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'order_number', 'product_name', 'quantity', 'refund_amount', 'return_type', 'reason', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.approved',
                'event_name' => 'Return Request Approved',
                'event_category' => 'return',
                'description' => 'Triggered when vendor approves a return request',
                'email_template_code' => 'customer_return_approved',
                'whatsapp_template_code' => 'customer_return_approved_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'refund_amount', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.rejected',
                'event_name' => 'Return Request Rejected',
                'event_category' => 'return',
                'description' => 'Triggered when vendor rejects a return request',
                'email_template_code' => 'customer_return_rejected',
                'whatsapp_template_code' => 'customer_return_rejected_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'rejection_reason', 'support_url', 'site_name'],
            ],
            [
                'event_code' => 'return.pickup_scheduled',
                'event_name' => 'Return Pickup Scheduled',
                'event_category' => 'return',
                'description' => 'Triggered when return pickup is scheduled',
                'email_template_code' => 'customer_return_pickup_scheduled',
                'whatsapp_template_code' => 'customer_return_pickup_scheduled_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'pickup_date', 'awb_number', 'courier_partner', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.picked_up',
                'event_name' => 'Return Package Picked Up',
                'event_category' => 'return',
                'description' => 'Triggered when return package is picked up',
                'email_template_code' => 'customer_return_picked_up',
                'whatsapp_template_code' => 'customer_return_picked_up_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'awb_number', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.received',
                'event_name' => 'Return Package Received',
                'event_category' => 'return',
                'description' => 'Triggered when return package is received at warehouse',
                'email_template_code' => 'customer_return_received',
                'whatsapp_template_code' => 'customer_return_received_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.inspection_passed',
                'event_name' => 'Return Inspection Passed',
                'event_category' => 'return',
                'description' => 'Triggered when return inspection passes and refund is initiated',
                'email_template_code' => 'customer_return_inspection_passed',
                'whatsapp_template_code' => 'customer_return_refund_initiated_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'refund_amount', 'refund_method', 'return_url', 'site_name'],
            ],
            [
                'event_code' => 'return.inspection_failed',
                'event_name' => 'Return Inspection Failed',
                'event_category' => 'return',
                'description' => 'Triggered when return inspection fails',
                'email_template_code' => 'customer_return_inspection_failed',
                'whatsapp_template_code' => null,
                'email_enabled' => true,
                'whatsapp_enabled' => false,
                'available_variables' => ['customer_name', 'return_number', 'inspection_notes', 'support_url', 'site_name'],
            ],
            [
                'event_code' => 'return.refund_completed',
                'event_name' => 'Refund Completed',
                'event_category' => 'return',
                'description' => 'Triggered when refund is completed',
                'email_template_code' => 'customer_return_refund_completed',
                'whatsapp_template_code' => 'customer_return_refund_completed_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['customer_name', 'return_number', 'refund_amount', 'refund_method', 'transaction_id', 'shop_url', 'site_name'],
            ],
            [
                'event_code' => 'vendor.return_requested',
                'event_name' => 'Vendor - New Return Request',
                'event_category' => 'vendor',
                'description' => 'Triggered when customer submits a return request (notification to vendor)',
                'email_template_code' => 'vendor_return_requested',
                'whatsapp_template_code' => 'vendor_return_requested_wa',
                'email_enabled' => true,
                'whatsapp_enabled' => true,
                'available_variables' => ['vendor_name', 'return_number', 'order_number', 'customer_name', 'product_name', 'quantity', 'refund_amount', 'return_type', 'reason', 'reason_description', 'vendor_dashboard_url', 'site_name'],
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
                    'is_active' => true,
                ])
            );

            $this->command->info("Created/Updated: {$event['event_code']}");
        }

        $this->command->info('✅ Created 10 return order event triggers');
    }
}

