<?php

namespace App\Services;

use App\Models\EventTrigger;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Send notification based on event trigger
     *
     * @param string $eventCode Event code (e.g., 'return.requested')
     * @param array $data Data to populate template variables
     * @param string|null $recipientEmail Recipient email address
     * @param string|null $recipientPhone Recipient phone number (for WhatsApp)
     * @param int|null $userId User ID (for WhatsApp logging)
     * @return array Result of notification sending
     */
    public function sendNotification(
        string $eventCode,
        array $data,
        ?string $recipientEmail = null,
        ?string $recipientPhone = null,
        ?int $userId = null
    ): array {
        $results = [
            'email' => ['sent' => false, 'message' => 'Not configured'],
            'whatsapp' => ['sent' => false, 'message' => 'Not configured'],
        ];

        try {
            // Get event trigger
            $trigger = EventTrigger::where('event_code', $eventCode)
                ->where('is_active', true)
                ->with(['emailTemplate', 'whatsappTemplate'])
                ->first();

            if (!$trigger) {
                Log::warning("Event trigger not found or inactive: {$eventCode}");
                return $results;
            }

            // Send Email
            if ($trigger->email_enabled && $trigger->emailTemplate && $recipientEmail) {
                $results['email'] = $this->sendEmail(
                    $trigger->emailTemplate,
                    $data,
                    $recipientEmail
                );
            }

            // Send WhatsApp
            if ($trigger->whatsapp_enabled && $trigger->whatsappTemplate && $recipientPhone) {
                $results['whatsapp'] = $this->sendWhatsApp(
                    $trigger->whatsappTemplate,
                    $data,
                    $recipientPhone,
                    $userId
                );
            }

            return $results;
        } catch (\Exception $e) {
            Log::error("Notification sending failed for event {$eventCode}: " . $e->getMessage());
            return [
                'email' => ['sent' => false, 'message' => $e->getMessage()],
                'whatsapp' => ['sent' => false, 'message' => $e->getMessage()],
            ];
        }
    }

    /**
     * Send email notification
     */
    protected function sendEmail(EmailTemplate $template, array $data, string $recipientEmail): array
    {
        try {
            // Check if email is enabled in system settings
            $emailEnabled = SystemSetting::get('email_enabled', false);
            if (!$emailEnabled) {
                return ['sent' => false, 'message' => 'Email notifications disabled in system settings'];
            }

            // Render template
            $rendered = $template->render($data);

            // Send email
            Mail::send([], [], function ($message) use ($rendered, $recipientEmail) {
                $message->to($recipientEmail)
                    ->subject($rendered['subject'])
                    ->html($rendered['body']);
            });

            Log::info("Email sent successfully to {$recipientEmail} using template {$template->code}");

            return [
                'sent' => true,
                'message' => 'Email sent successfully',
                'recipient' => $recipientEmail,
            ];
        } catch (\Exception $e) {
            Log::error("Email sending failed: " . $e->getMessage());
            return [
                'sent' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send WhatsApp notification
     */
    protected function sendWhatsApp(
        WhatsAppTemplate $template,
        array $data,
        string $recipientPhone,
        ?int $userId = null
    ): array {
        try {
            // Check if WhatsApp is enabled in system settings
            $whatsappEnabled = SystemSetting::get('whatsapp_enabled', false);
            if (!$whatsappEnabled) {
                return ['sent' => false, 'message' => 'WhatsApp notifications disabled in system settings'];
            }

            // Prepare variables array (WhatsApp uses indexed variables)
            $variables = array_values($data);

            // Send via WhatsApp service
            $result = $this->whatsappService->sendTemplate(
                $recipientPhone,
                $template->code,
                $variables,
                $userId
            );

            if ($result['success']) {
                Log::info("WhatsApp sent successfully to {$recipientPhone} using template {$template->code}");
                return [
                    'sent' => true,
                    'message' => 'WhatsApp sent successfully',
                    'recipient' => $recipientPhone,
                    'message_id' => $result['message_id'] ?? null,
                ];
            } else {
                return [
                    'sent' => false,
                    'message' => $result['error'] ?? 'Failed to send WhatsApp',
                ];
            }
        } catch (\Exception $e) {
            Log::error("WhatsApp sending failed: " . $e->getMessage());
            return [
                'sent' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send return request notification to customer
     */
    public function sendReturnRequestedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'order_number' => $return->order->order_number,
            'product_name' => $return->product->name,
            'quantity' => $return->quantity,
            'refund_amount' => number_format($return->refund_amount, 2),
            'return_type' => ucfirst($return->return_type),
            'reason' => ucfirst(str_replace('_', ' ', $return->reason)),
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.requested',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send return request notification to vendor
     */
    public function sendVendorReturnRequestedNotification($return, $vendor, $customer): array
    {
        $data = [
            'vendor_name' => $vendor->business_name,
            'return_number' => $return->return_number,
            'order_number' => $return->order->order_number,
            'customer_name' => $customer->name,
            'product_name' => $return->product->name,
            'quantity' => $return->quantity,
            'refund_amount' => number_format($return->refund_amount, 2),
            'return_type' => ucfirst($return->return_type),
            'reason' => ucfirst(str_replace('_', ' ', $return->reason)),
            'reason_description' => $return->reason_description ?? 'N/A',
            'vendor_dashboard_url' => config('app.frontend_url') . '/vendor/dashboard?menu=returns',
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'vendor.return_requested',
            $data,
            $vendor->email,
            $vendor->phone,
            null
        );
    }

    /**
     * Send return approved notification
     */
    public function sendReturnApprovedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'refund_amount' => number_format($return->refund_amount, 2),
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.approved',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send return rejected notification
     */
    public function sendReturnRejectedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'rejection_reason' => $return->rejection_reason ?? 'Not specified',
            'support_url' => config('app.frontend_url') . '/support',
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.rejected',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send pickup scheduled notification
     */
    public function sendPickupScheduledNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'pickup_date' => $return->pickup_scheduled_at ? $return->pickup_scheduled_at->format('d M Y') : 'TBD',
            'awb_number' => $return->pickup_awb_number ?? 'N/A',
            'courier_partner' => $return->courier_partner ?? 'N/A',
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.pickup_scheduled',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send package picked up notification
     */
    public function sendPackagePickedUpNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'awb_number' => $return->pickup_awb_number ?? 'N/A',
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.picked_up',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send package received notification
     */
    public function sendPackageReceivedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.received',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send inspection passed notification
     */
    public function sendInspectionPassedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'refund_amount' => number_format($return->refund_amount, 2),
            'refund_method' => ucfirst(str_replace('_', ' ', $return->refund_method ?? 'original payment')),
            'return_url' => config('app.frontend_url') . '/customer/returns/' . $return->id,
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.inspection_passed',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send inspection failed notification
     */
    public function sendInspectionFailedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'inspection_notes' => $return->inspection_notes ?? 'Product did not pass quality inspection',
            'support_url' => config('app.frontend_url') . '/support',
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.inspection_failed',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }

    /**
     * Send refund completed notification
     */
    public function sendRefundCompletedNotification($return, $customer): array
    {
        $data = [
            'customer_name' => $customer->name,
            'return_number' => $return->return_number,
            'refund_amount' => number_format($return->refund_amount, 2),
            'refund_method' => ucfirst(str_replace('_', ' ', $return->refund_method ?? 'original payment')),
            'transaction_id' => $return->refund_transaction_id ?? 'N/A',
            'shop_url' => config('app.frontend_url'),
            'site_name' => config('app.name'),
        ];

        return $this->sendNotification(
            'return.refund_completed',
            $data,
            $customer->email,
            $customer->phone,
            $customer->id
        );
    }
}

