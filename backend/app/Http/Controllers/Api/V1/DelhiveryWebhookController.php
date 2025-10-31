<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReturnOrder;
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

            // Try to find order by waybill/tracking number
            $order = Order::where('tracking_number', $waybill)->first();

            if ($order) {
                // Update forward shipment (order delivery)
                $this->updateOrderStatus($order, $status, $statusCode, $data);
                return response()->json(['status' => 'success'], 200);
            }

            // Try to find return order by pickup AWB number
            $returnOrder = ReturnOrder::where('pickup_awb_number', $waybill)
                ->orWhere('pickup_tracking_id', $waybill)
                ->first();

            if ($returnOrder) {
                // Update return shipment (return pickup/delivery)
                $this->updateReturnStatus($returnOrder, $status, $statusCode, $data);
                return response()->json(['status' => 'success'], 200);
            }

            Log::warning('Order/Return not found for waybill: ' . $waybill);
            return response()->json(['status' => 'success', 'message' => 'Shipment not found'], 200);

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
     * Update return order status based on Delhivery status
     */
    private function updateReturnStatus(ReturnOrder $return, ?string $status, ?string $statusCode, array $data): void
    {
        // Map Delhivery status to return order status
        $statusMapping = [
            'Pickup Scheduled' => 'pickup_scheduled',
            'Out for Pickup' => 'out_for_pickup',
            'Picked Up' => 'picked_up',
            'In Transit' => 'in_transit',
            'Out for Delivery' => 'out_for_delivery', // Delivery to vendor warehouse
            'Delivered' => 'received', // Delivered back to vendor
            'RTO' => 'cancelled', // Return to origin (customer kept the product)
            'Cancelled' => 'cancelled',
        ];

        $newStatus = $statusMapping[$status] ?? null;
        $location = $data['Location'] ?? null;
        $instructions = $data['Instructions'] ?? null;

        if ($newStatus && $return->status !== $newStatus) {
            $return->update([
                'status' => $newStatus,
                'courier_response' => $data,
            ]);

            // Add tracking history
            $description = $status;
            if ($instructions) {
                $description .= ' - ' . $instructions;
            }

            $return->addTrackingHistory(
                $newStatus,
                $description,
                $location,
                'system',
                null
            );

            // Update specific timestamps
            if ($newStatus === 'picked_up') {
                $return->update(['picked_up_at' => now()]);
            } elseif ($newStatus === 'received') {
                $return->update(['received_at' => now()]);
            }

            Log::info('Return order status updated', [
                'return_id' => $return->id,
                'return_number' => $return->return_number,
                'old_status' => $return->status,
                'new_status' => $newStatus,
                'delhivery_status' => $status,
            ]);

            // TODO: Send notification to customer about return status update
            // TODO: Send notification to vendor about return status update
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

