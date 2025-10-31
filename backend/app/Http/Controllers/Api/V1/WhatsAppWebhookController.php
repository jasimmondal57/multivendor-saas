<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Verify webhook (GET request from Meta)
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        // Get verify token from settings
        $verifyToken = SystemSetting::get('whatsapp_verify_token');

        // Check if mode and token are correct
        if ($mode === 'subscribe' && $token === $verifyToken) {
            // Respond with challenge token from the request
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        // Forbidden if verify tokens don't match
        return response()->json(['error' => 'Forbidden'], 403);
    }

    /**
     * Handle webhook events (POST request from Meta)
     */
    public function handle(Request $request)
    {
        try {
            $data = $request->all();

            // Log the webhook payload for debugging
            Log::info('WhatsApp Webhook Received', ['payload' => $data]);

            // Process webhook entries
            if (isset($data['entry']) && is_array($data['entry'])) {
                foreach ($data['entry'] as $entry) {
                    if (isset($entry['changes']) && is_array($entry['changes'])) {
                        foreach ($entry['changes'] as $change) {
                            $this->processChange($change);
                        }
                    }
                }
            }

            // Always return 200 OK to Meta
            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Webhook Error: ' . $e->getMessage(), [
                'payload' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Still return 200 to prevent Meta from retrying
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * Process webhook change
     */
    private function processChange(array $change)
    {
        $field = $change['field'] ?? null;
        $value = $change['value'] ?? null;

        if (!$value) {
            return;
        }

        // Handle message status updates
        if (isset($value['statuses']) && is_array($value['statuses'])) {
            foreach ($value['statuses'] as $status) {
                $this->updateMessageStatus($status);
            }
        }

        // Handle incoming messages
        if (isset($value['messages']) && is_array($value['messages'])) {
            foreach ($value['messages'] as $message) {
                $this->handleIncomingMessage($message, $value);
            }
        }

        // Handle errors
        if (isset($value['errors']) && is_array($value['errors'])) {
            foreach ($value['errors'] as $error) {
                $this->handleError($error);
            }
        }
    }

    /**
     * Update message delivery status
     */
    private function updateMessageStatus(array $status)
    {
        $messageId = $status['id'] ?? null;
        $statusType = $status['status'] ?? null;
        $timestamp = $status['timestamp'] ?? null;

        if (!$messageId || !$statusType) {
            return;
        }

        // Find the message log
        $log = WhatsAppLog::where('message_id', $messageId)->first();

        if (!$log) {
            Log::warning('WhatsApp message not found in logs', ['message_id' => $messageId]);
            return;
        }

        // Update status
        $updateData = ['status' => $statusType];

        switch ($statusType) {
            case 'sent':
                $updateData['sent_at'] = $timestamp ? date('Y-m-d H:i:s', $timestamp) : now();
                break;
            case 'delivered':
                $updateData['delivered_at'] = $timestamp ? date('Y-m-d H:i:s', $timestamp) : now();
                break;
            case 'read':
                $updateData['read_at'] = $timestamp ? date('Y-m-d H:i:s', $timestamp) : now();
                break;
            case 'failed':
                $updateData['error_message'] = $status['errors'][0]['message'] ?? 'Message failed';
                break;
        }

        $log->update($updateData);

        Log::info('WhatsApp message status updated', [
            'message_id' => $messageId,
            'status' => $statusType,
        ]);
    }

    /**
     * Handle incoming message (for future use - customer replies)
     */
    private function handleIncomingMessage(array $message, array $value)
    {
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;
        $timestamp = $message['timestamp'] ?? null;
        $type = $message['type'] ?? null;

        // Get message content based on type
        $content = null;
        switch ($type) {
            case 'text':
                $content = $message['text']['body'] ?? null;
                break;
            case 'image':
                $content = $message['image']['caption'] ?? 'Image received';
                break;
            case 'document':
                $content = $message['document']['caption'] ?? 'Document received';
                break;
            case 'audio':
                $content = 'Audio received';
                break;
            case 'video':
                $content = $message['video']['caption'] ?? 'Video received';
                break;
            case 'button':
                $content = $message['button']['text'] ?? 'Button clicked';
                break;
            case 'interactive':
                $content = $message['interactive']['button_reply']['title'] ?? 'Interactive response';
                break;
        }

        Log::info('WhatsApp incoming message', [
            'from' => $from,
            'message_id' => $messageId,
            'type' => $type,
            'content' => $content,
        ]);

        // TODO: Store incoming messages in database if needed
        // TODO: Implement auto-reply logic if needed
        // TODO: Notify admin of new messages
    }

    /**
     * Handle webhook errors
     */
    private function handleError(array $error)
    {
        $code = $error['code'] ?? null;
        $title = $error['title'] ?? null;
        $message = $error['message'] ?? null;
        $errorData = $error['error_data'] ?? null;

        Log::error('WhatsApp API Error', [
            'code' => $code,
            'title' => $title,
            'message' => $message,
            'error_data' => $errorData,
        ]);

        // TODO: Notify admin of critical errors
        // TODO: Update message status if error is related to a specific message
    }

    /**
     * Get webhook configuration info
     */
    public function getWebhookInfo(Request $request)
    {
        $verifyToken = SystemSetting::get('whatsapp_verify_token');
        $appUrl = rtrim(config('app.url'), '/');

        return response()->json([
            'success' => true,
            'data' => [
                'webhook_url' => $appUrl . '/api/v1/whatsapp/webhook',
                'verify_token' => $verifyToken,
                'callback_url' => $appUrl . '/api/v1/whatsapp/webhook',
                'verify_url' => $appUrl . '/api/v1/whatsapp/webhook/verify',
                'instructions' => [
                    '1. Go to Meta App Dashboard → WhatsApp → Configuration',
                    '2. Click "Edit" in Webhook section',
                    '3. Enter the Callback URL above',
                    '4. Enter the Verify Token above',
                    '5. Click "Verify and Save"',
                    '6. Subscribe to webhook fields: messages, message_status',
                ],
            ],
        ]);
    }

    /**
     * Generate a new verify token
     */
    public function generateVerifyToken(Request $request)
    {
        // Generate a random secure token
        $token = bin2hex(random_bytes(32));

        // Save to settings
        SystemSetting::updateOrCreate(
            ['key' => 'whatsapp_verify_token'],
            [
                'key' => 'whatsapp_verify_token',
                'value' => $token,
                'type' => 'string',
                'group' => 'whatsapp',
                'description' => 'Webhook Verify Token',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Verify token generated successfully',
            'data' => [
                'verify_token' => $token,
            ],
        ]);
    }
}

