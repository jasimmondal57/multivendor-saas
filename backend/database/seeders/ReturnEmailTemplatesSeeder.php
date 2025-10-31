<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;
use App\Models\EventTrigger;

class ReturnEmailTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding return order email templates...');

        $emailTemplates = [
            // Customer Templates
            [
                'code' => 'customer_return_requested',
                'name' => 'Return Request Submitted',
                'category' => 'customer',
                'subject' => 'Return Request Submitted - {{return_number}}',
                'body' => '<h2>Return Request Submitted</h2>
<p>Dear {{customer_name}},</p>
<p>Your return request has been successfully submitted.</p>
<p><strong>Return Details:</strong></p>
<ul>
    <li>Return Number: <strong>{{return_number}}</strong></li>
    <li>Order Number: {{order_number}}</li>
    <li>Product: {{product_name}}</li>
    <li>Quantity: {{quantity}}</li>
    <li>Refund Amount: ₹{{refund_amount}}</li>
    <li>Return Type: {{return_type}}</li>
    <li>Reason: {{reason}}</li>
</ul>
<p>Your return request is currently under review by the vendor. You will be notified once the vendor approves or rejects your request.</p>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Return</a></p>
<p>Thank you for shopping with {{site_name}}!</p>',
                'variables' => ['customer_name', 'return_number', 'order_number', 'product_name', 'quantity', 'refund_amount', 'return_type', 'reason', 'return_url', 'site_name'],
                'description' => 'Sent when customer submits a return request',
            ],
            [
                'code' => 'customer_return_approved',
                'name' => 'Return Request Approved',
                'category' => 'customer',
                'subject' => 'Return Request Approved - {{return_number}}',
                'body' => '<h2>Return Request Approved</h2>
<p>Dear {{customer_name}},</p>
<p>Great news! Your return request has been approved by the vendor.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p><strong>Next Steps:</strong></p>
<ol>
    <li>The vendor will schedule a pickup for your return</li>
    <li>You will receive a notification with pickup details</li>
    <li>Please keep the product ready in its original packaging</li>
    <li>Hand over the product to the courier partner</li>
</ol>
<p>Expected refund amount: <strong>₹{{refund_amount}}</strong></p>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Return</a></p>
<p>Thank you for your patience!</p>',
                'variables' => ['customer_name', 'return_number', 'refund_amount', 'return_url', 'site_name'],
                'description' => 'Sent when vendor approves the return request',
            ],
            [
                'code' => 'customer_return_rejected',
                'name' => 'Return Request Rejected',
                'category' => 'customer',
                'subject' => 'Return Request Rejected - {{return_number}}',
                'body' => '<h2>Return Request Rejected</h2>
<p>Dear {{customer_name}},</p>
<p>We regret to inform you that your return request has been rejected by the vendor.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p><strong>Rejection Reason:</strong></p>
<p>{{rejection_reason}}</p>
<p>If you have any questions or concerns, please contact our customer support team.</p>
<p><a href="{{support_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Contact Support</a></p>
<p>Thank you for your understanding.</p>',
                'variables' => ['customer_name', 'return_number', 'rejection_reason', 'support_url', 'site_name'],
                'description' => 'Sent when vendor rejects the return request',
            ],
            [
                'code' => 'customer_return_pickup_scheduled',
                'name' => 'Return Pickup Scheduled',
                'category' => 'customer',
                'subject' => 'Return Pickup Scheduled - {{return_number}}',
                'body' => '<h2>Return Pickup Scheduled</h2>
<p>Dear {{customer_name}},</p>
<p>Your return pickup has been scheduled!</p>
<p><strong>Pickup Details:</strong></p>
<ul>
    <li>Return Number: {{return_number}}</li>
    <li>Pickup Date: {{pickup_date}}</li>
    <li>AWB Number: {{awb_number}}</li>
    <li>Courier Partner: {{courier_partner}}</li>
</ul>
<p><strong>Important Instructions:</strong></p>
<ul>
    <li>Keep the product ready in its original packaging</li>
    <li>Include all accessories and documents</li>
    <li>The courier will arrive between 10 AM - 6 PM</li>
    <li>Please be available at the pickup address</li>
</ul>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Return</a></p>
<p>Thank you!</p>',
                'variables' => ['customer_name', 'return_number', 'pickup_date', 'awb_number', 'courier_partner', 'return_url', 'site_name'],
                'description' => 'Sent when return pickup is scheduled',
            ],
            [
                'code' => 'customer_return_picked_up',
                'name' => 'Return Package Picked Up',
                'category' => 'customer',
                'subject' => 'Return Package Picked Up - {{return_number}}',
                'body' => '<h2>Return Package Picked Up</h2>
<p>Dear {{customer_name}},</p>
<p>Your return package has been successfully picked up by our courier partner.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p><strong>AWB Number:</strong> {{awb_number}}</p>
<p>The package is now in transit to the vendor warehouse. You can track the shipment status using the AWB number.</p>
<p>Once the vendor receives and inspects the product, your refund will be processed.</p>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Return</a></p>
<p>Thank you!</p>',
                'variables' => ['customer_name', 'return_number', 'awb_number', 'return_url', 'site_name'],
                'description' => 'Sent when return package is picked up',
            ],
            [
                'code' => 'customer_return_received',
                'name' => 'Return Package Received',
                'category' => 'customer',
                'subject' => 'Return Package Received - {{return_number}}',
                'body' => '<h2>Return Package Received</h2>
<p>Dear {{customer_name}},</p>
<p>Your return package has been received at the vendor warehouse.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p>The vendor is now inspecting the product. This process typically takes 1-2 business days.</p>
<p>You will be notified once the inspection is complete and your refund is processed.</p>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Return</a></p>
<p>Thank you for your patience!</p>',
                'variables' => ['customer_name', 'return_number', 'return_url', 'site_name'],
                'description' => 'Sent when return package is received at warehouse',
            ],
            [
                'code' => 'customer_return_inspection_passed',
                'name' => 'Return Inspection Passed',
                'category' => 'customer',
                'subject' => 'Return Inspection Passed - Refund Initiated',
                'body' => '<h2>Return Inspection Passed</h2>
<p>Dear {{customer_name}},</p>
<p>Great news! Your returned product has passed inspection.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p><strong>Refund Details:</strong></p>
<ul>
    <li>Refund Amount: ₹{{refund_amount}}</li>
    <li>Refund Method: {{refund_method}}</li>
    <li>Expected Credit: 5-7 business days</li>
</ul>
<p>Your refund has been initiated and will be credited to your {{refund_method}} within 5-7 business days.</p>
<p><a href="{{return_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Return Details</a></p>
<p>Thank you for shopping with {{site_name}}!</p>',
                'variables' => ['customer_name', 'return_number', 'refund_amount', 'refund_method', 'return_url', 'site_name'],
                'description' => 'Sent when return inspection passes and refund is initiated',
            ],
            [
                'code' => 'customer_return_inspection_failed',
                'name' => 'Return Inspection Failed',
                'category' => 'customer',
                'subject' => 'Return Inspection Failed - {{return_number}}',
                'body' => '<h2>Return Inspection Failed</h2>
<p>Dear {{customer_name}},</p>
<p>We regret to inform you that your returned product did not pass inspection.</p>
<p><strong>Return Number:</strong> {{return_number}}</p>
<p><strong>Inspection Notes:</strong></p>
<p>{{inspection_notes}}</p>
<p>Unfortunately, we cannot process your refund at this time. The product will be shipped back to you.</p>
<p>If you have any questions, please contact our customer support team.</p>
<p><a href="{{support_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Contact Support</a></p>
<p>Thank you for your understanding.</p>',
                'variables' => ['customer_name', 'return_number', 'inspection_notes', 'support_url', 'site_name'],
                'description' => 'Sent when return inspection fails',
            ],
            [
                'code' => 'customer_return_refund_completed',
                'name' => 'Refund Completed',
                'category' => 'customer',
                'subject' => 'Refund Completed - {{return_number}}',
                'body' => '<h2>Refund Completed Successfully</h2>
<p>Dear {{customer_name}},</p>
<p>Your refund has been successfully processed!</p>
<p><strong>Refund Details:</strong></p>
<ul>
    <li>Return Number: {{return_number}}</li>
    <li>Refund Amount: ₹{{refund_amount}}</li>
    <li>Refund Method: {{refund_method}}</li>
    <li>Transaction ID: {{transaction_id}}</li>
</ul>
<p>The refund amount should reflect in your account within 5-7 business days depending on your bank.</p>
<p>Thank you for shopping with {{site_name}}. We hope to serve you again!</p>
<p><a href="{{shop_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Continue Shopping</a></p>',
                'variables' => ['customer_name', 'return_number', 'refund_amount', 'refund_method', 'transaction_id', 'shop_url', 'site_name'],
                'description' => 'Sent when refund is completed',
            ],

            // Vendor Templates
            [
                'code' => 'vendor_return_requested',
                'name' => 'New Return Request',
                'category' => 'vendor',
                'subject' => 'New Return Request - {{return_number}}',
                'body' => '<h2>New Return Request Received</h2>
<p>Dear {{vendor_name}},</p>
<p>You have received a new return request from a customer.</p>
<p><strong>Return Details:</strong></p>
<ul>
    <li>Return Number: <strong>{{return_number}}</strong></li>
    <li>Order Number: {{order_number}}</li>
    <li>Customer: {{customer_name}}</li>
    <li>Product: {{product_name}}</li>
    <li>Quantity: {{quantity}}</li>
    <li>Refund Amount: ₹{{refund_amount}}</li>
    <li>Return Type: {{return_type}}</li>
    <li>Reason: {{reason}}</li>
</ul>
<p><strong>Customer Comments:</strong></p>
<p>{{reason_description}}</p>
<p>Please review and approve/reject this return request from your vendor dashboard.</p>
<p><a href="{{vendor_dashboard_url}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Review Return Request</a></p>
<p>Thank you!</p>',
                'variables' => ['vendor_name', 'return_number', 'order_number', 'customer_name', 'product_name', 'quantity', 'refund_amount', 'return_type', 'reason', 'reason_description', 'vendor_dashboard_url', 'site_name'],
                'description' => 'Sent to vendor when customer submits a return request',
            ],
        ];

        foreach ($emailTemplates as $template) {
            EmailTemplate::updateOrCreate(
                ['code' => $template['code']],
                array_merge($template, ['is_active' => true])
            );
            $this->command->info("Created/Updated: {$template['code']}");
        }

        $this->command->info('✅ Created 10 return order email templates');
    }
}

