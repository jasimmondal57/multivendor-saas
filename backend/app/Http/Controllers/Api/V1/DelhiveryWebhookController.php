<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DelhiveryWebhookController extends Controller
{
    /**
     * Handle Delhivery webhook
     */
    public function handle(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('Delhivery Webhook Received', ['payload' => $data]);

            // Validate webhook data
            if (!isset($data['waybill'])) {
                return response()->json(['status' => 'error', 'message' => 'Invalid webhook data'], 400);
            }

            $waybill = $data['waybill'];
            $status = $data['Status'] ?? null;
            $statusCode = $data['StatusCode'] ?? null;

            // Find order by waybill/tracking number
            $order = Order::where('tracking_number', $waybill)->first();

            if (!$order) {
                Log::warning('Order not found for waybill: ' . $waybill);
                return response()->json(['status' => 'success', 'message' => 'Order not found'], 200);
            }

            // Update order status based on Delhivery status
            $this->updateOrderStatus($order, $status, $statusCode, $data);

            return response()->json(['status' => 'success'], 200);
        } catch (\Exception $e) {
            Log::error('Delhivery Webhook Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * Update order status based on Delhivery status
     */
    private function updateOrderStatus(Order $order, ?string $status, ?string $statusCode, array $data): void
    {
        // Map Delhivery status to order status
        $statusMapping = [
            'Dispatched' => 'shipped',
            'In Transit' => 'shipped',
            'Out for Delivery' => 'out_for_delivery',
            'Delivered' => 'delivered',
            'RTO' => 'returned',
            'RTO Delivered' => 'returned',
            'Cancelled' => 'cancelled',
            'Lost' => 'cancelled',
            'Damaged' => 'cancelled',
        ];

        $newStatus = $statusMapping[$status] ?? null;

        if ($newStatus && $order->status !== $newStatus) {
            $order->update([
                'status' => $newStatus,
                'tracking_data' => json_encode($data),
            ]);

            Log::info('Order status updated', [
                'order_id' => $order->id,
                'old_status' => $order->status,
                'new_status' => $newStatus,
                'delhivery_status' => $status,
            ]);

            // TODO: Send notification to customer about status update
            // TODO: Send notification to vendor about status update
        }
    }

    /**
     * Test webhook endpoint
     */
    public function test(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Delhivery webhook endpoint is working',
            'timestamp' => now()->toDateTimeString(),
        ]);
    }
}

