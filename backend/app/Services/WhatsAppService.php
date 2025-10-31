<?php

namespace App\Services;

use App\Models\WhatsAppTemplate;
use App\Models\WhatsAppLog;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $phoneNumberId;
    private $accessToken;
    private $wabaId;
    private $apiVersion = 'v21.0';
    private $baseUrl;

    public function __construct()
    {
        $this->phoneNumberId = SystemSetting::get('whatsapp_phone_number_id');
        $this->accessToken = SystemSetting::get('whatsapp_access_token');
        $this->wabaId = SystemSetting::get('whatsapp_waba_id');
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
    }

    /**
     * Send WhatsApp message using template
     */
    public function sendTemplate(string $phone, string $templateCode, array $variables = [], ?int $userId = null): array
    {
        try {
            // Get template
            $template = WhatsAppTemplate::getByCode($templateCode);

            if (!$template) {
                throw new \Exception("Template not found: {$templateCode}");
            }

            // Format phone number (add country code if not present)
            $phone = $this->formatPhoneNumber($phone);

            // Render message for logging
            $message = $template->render($variables);

            // Check if template is approved by Meta
            if (!$template->meta_template_name || $template->status === 'draft') {
                // Development mode: Log the message instead of sending
                Log::info('WhatsApp OTP (Development Mode)', [
                    'phone' => $phone,
                    'template' => $templateCode,
                    'message' => $message,
                    'variables' => $variables,
                ]);

                // Log the message
                $log = WhatsAppLog::create([
                    'user_id' => $userId,
                    'whatsapp_template_id' => $template->id,
                    'phone' => $phone,
                    'template_code' => $templateCode,
                    'message' => $message,
                    'variables' => $variables,
                    'status' => 'sent', // Mark as sent in dev mode
                    'message_id' => 'dev_' . uniqid(),
                    'error_message' => null,
                    'response' => ['dev_mode' => true, 'message' => $message],
                    'sent_at' => now(),
                ]);

                return [
                    'success' => true,
                    'message_id' => 'dev_' . uniqid(),
                    'log_id' => $log->id,
                    'dev_mode' => true,
                    'message' => $message,
                ];
            }

            // Send via Meta WhatsApp Cloud API
            $response = $this->sendViaMetaAPI($phone, $template, $variables);

            // Log the message
            $log = WhatsAppLog::create([
                'user_id' => $userId,
                'whatsapp_template_id' => $template->id,
                'phone' => $phone,
                'template_code' => $templateCode,
                'message' => $message,
                'variables' => $variables,
                'status' => $response['status'],
                'message_id' => $response['message_id'] ?? null,
                'error_message' => $response['error'] ?? null,
                'response' => $response,
                'sent_at' => $response['status'] === 'sent' ? now() : null,
            ]);

            return [
                'success' => $response['status'] === 'sent',
                'message_id' => $response['message_id'] ?? null,
                'log_id' => $log->id,
                'error' => $response['error'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('WhatsApp send error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send message via Meta WhatsApp Cloud API
     */
    private function sendViaMetaAPI(string $phone, WhatsAppTemplate $template, array $variables): array
    {
        try {
            // Build template components with variables
            $components = [];

            if (!empty($variables)) {
                $parameters = [];
                foreach ($variables as $variable) {
                    $parameters[] = [
                        'type' => 'text',
                        'text' => $variable,
                    ];
                }

                $components[] = [
                    'type' => 'body',
                    'parameters' => $parameters,
                ];
            }

            // Build request payload
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $phone,
                'type' => 'template',
                'template' => [
                    'name' => $template->meta_template_name,
                    'language' => [
                        'code' => $template->language,
                    ],
                ],
            ];

            if (!empty($components)) {
                $payload['template']['components'] = $components;
            }

            // Send request to Meta API
            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => 'sent',
                    'message_id' => $data['messages'][0]['id'] ?? null,
                    'response' => $data,
                ];
            } else {
                $error = $response->json();
                return [
                    'status' => 'failed',
                    'error' => $error['error']['message'] ?? 'Unknown error',
                    'response' => $error,
                ];
            }

        } catch (\Exception $e) {
            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Submit template to Meta for approval
     */
    public function submitTemplateToMeta(WhatsAppTemplate $template): array
    {
        try {
            if (!$this->wabaId) {
                throw new \Exception('WhatsApp Business Account ID not configured');
            }

            $payload = [
                'name' => $template->meta_template_name ?: $template->code,
                'language' => $template->language,
                'category' => $this->getCategoryForMeta($template->category),
                'components' => $this->buildTemplateComponents($template),
            ];

            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/{$this->wabaId}/message_templates", $payload);

            if ($response->successful()) {
                $data = $response->json();

                // Update template with Meta template ID
                $template->update([
                    'meta_template_id' => $data['id'],
                    'status' => 'pending_approval',
                    'submitted_at' => now(),
                ]);

                return [
                    'success' => true,
                    'template_id' => $data['id'],
                    'status' => $data['status'],
                    'message' => 'Template submitted successfully',
                ];
            } else {
                $error = $response->json();
                return [
                    'success' => false,
                    'error' => $error['error']['message'] ?? 'Failed to submit template',
                ];
            }

        } catch (\Exception $e) {
            Log::error('Meta template submission error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check template status from Meta
     */
    public function checkTemplateStatus(WhatsAppTemplate $template): array
    {
        try {
            if (!$template->meta_template_id) {
                throw new \Exception('Template not submitted to Meta');
            }

            $response = Http::withToken($this->accessToken)
                ->get("{$this->baseUrl}/{$this->wabaId}/message_templates", [
                    'name' => $template->meta_template_name ?: $template->code,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if (!empty($data['data'])) {
                    $metaTemplate = $data['data'][0];
                    $status = strtolower($metaTemplate['status']);

                    // Update template status
                    $updateData = ['status' => $status];

                    if ($status === 'approved') {
                        $updateData['approved_at'] = now();
                    } elseif ($status === 'rejected') {
                        $updateData['rejection_reason'] = $metaTemplate['rejected_reason'] ?? 'Unknown reason';
                    }

                    $template->update($updateData);

                    return [
                        'success' => true,
                        'status' => $status,
                        'data' => $metaTemplate,
                    ];
                }

                return [
                    'success' => false,
                    'error' => 'Template not found in Meta',
                ];
            } else {
                $error = $response->json();
                return [
                    'success' => false,
                    'error' => $error['error']['message'] ?? 'Failed to check status',
                ];
            }

        } catch (\Exception $e) {
            Log::error('Meta template status check error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build template components for Meta API
     */
    private function buildTemplateComponents(WhatsAppTemplate $template): array
    {
        $components = [];

        // Header component
        if ($template->header) {
            $components[] = [
                'type' => 'HEADER',
                'format' => 'TEXT',
                'text' => $template->header,
            ];
        }

        // Body component (required)
        $components[] = [
            'type' => 'BODY',
            'text' => $template->body,
        ];

        // Footer component
        if ($template->footer) {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $template->footer,
            ];
        }

        // Buttons component
        if ($template->buttons && count($template->buttons) > 0) {
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => $template->buttons,
            ];
        }

        return $components;
    }

    /**
     * Map template category to Meta category
     */
    private function getCategoryForMeta(string $category): string
    {
        return match ($category) {
            'otp' => 'AUTHENTICATION',
            default => 'UTILITY',
        };
    }

    /**
     * Format phone number to international format
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If phone doesn't start with country code, add India code (91)
        if (!str_starts_with($phone, '91') && strlen($phone) === 10) {
            $phone = '91' . $phone;
        }

        return $phone;
    }
}
