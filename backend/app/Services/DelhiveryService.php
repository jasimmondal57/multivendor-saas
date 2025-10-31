<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DelhiveryService
{
    private string $apiKey;
    private string $clientName;
    private string $warehouseName;
    private string $mode;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = SystemSetting::get('delhivery_api_key', '');
        $this->clientName = SystemSetting::get('delhivery_client_name', '');
        $this->warehouseName = SystemSetting::get('delhivery_warehouse_name', '');
        $this->mode = SystemSetting::get('delhivery_mode', 'test');
        
        // Set base URL based on mode
        $this->baseUrl = $this->mode === 'production' 
            ? 'https://track.delhivery.com/api' 
            : 'https://staging-express.delhivery.com/api';
    }

    /**
     * Check if Delhivery is enabled
     */
    public function isEnabled(): bool
    {
        return (bool) SystemSetting::get('delhivery_enabled', false);
    }

    /**
     * Create a shipment
     */
    public function createShipment(array $orderData): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'message' => 'Delhivery integration is not enabled'];
        }

        try {
            $shipmentData = $this->prepareShipmentData($orderData);
            
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/cmu/create.json', [
                'shipments' => [$shipmentData],
                'pickup_location' => [
                    'name' => $this->warehouseName,
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Delhivery shipment created', ['response' => $data]);
                
                return [
                    'success' => true,
                    'waybill' => $data['packages'][0]['waybill'] ?? null,
                    'data' => $data,
                ];
            }

            Log::error('Delhivery shipment creation failed', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create shipment',
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Delhivery shipment creation error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Schedule pickup
     */
    public function schedulePickup(string $waybill, array $pickupData): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'message' => 'Delhivery integration is not enabled'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/fm/request/new/', [
                'pickup_location' => $this->warehouseName,
                'pickup_time' => $pickupData['pickup_time'] ?? now()->addHours(2)->format('Y-m-d H:i:s'),
                'pickup_date' => $pickupData['pickup_date'] ?? now()->format('Y-m-d'),
                'expected_package_count' => $pickupData['package_count'] ?? 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Delhivery pickup scheduled', ['response' => $data]);
                
                return [
                    'success' => true,
                    'pickup_id' => $data['pickup_id'] ?? null,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to schedule pickup',
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Delhivery pickup scheduling error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Track shipment
     */
    public function trackShipment(string $waybill): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'message' => 'Delhivery integration is not enabled'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
            ])->get($this->baseUrl . '/v1/packages/json/', [
                'waybill' => $waybill,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'tracking_data' => $data['ShipmentData'][0] ?? null,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to track shipment',
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Delhivery tracking error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel shipment
     */
    public function cancelShipment(string $waybill): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'message' => 'Delhivery integration is not enabled'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/p/edit', [
                'waybill' => $waybill,
                'cancellation' => true,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Shipment cancelled successfully',
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to cancel shipment',
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Delhivery cancellation error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get serviceability (check if delivery is available for pincode)
     */
    public function checkServiceability(string $pincode): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'message' => 'Delhivery integration is not enabled'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
            ])->get($this->baseUrl . '/c/api/pin-codes/json/', [
                'filter_codes' => $pincode,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $deliveryData = $data['delivery_codes'][0] ?? null;
                
                return [
                    'success' => true,
                    'serviceable' => !empty($deliveryData),
                    'data' => $deliveryData,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to check serviceability',
            ];
        } catch (\Exception $e) {
            Log::error('Delhivery serviceability check error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Prepare shipment data from order
     */
    private function prepareShipmentData(array $orderData): array
    {
        // Determine package type based on payment method
        $packageType = ($orderData['payment_method'] ?? 'prepaid') === 'cod' ? 'COD' : 'Prepaid';

        return [
            'name' => $orderData['customer_name'],
            'add' => $orderData['address'],
            'pin' => $orderData['pincode'],
            'city' => $orderData['city'],
            'state' => $orderData['state'],
            'country' => $orderData['country'] ?? 'India',
            'phone' => $orderData['phone'],
            'order' => $orderData['order_number'],
            'payment_mode' => $packageType,
            'return_pin' => $orderData['return_pincode'] ?? '',
            'return_city' => $orderData['return_city'] ?? '',
            'return_phone' => $orderData['return_phone'] ?? '',
            'return_add' => $orderData['return_address'] ?? '',
            'return_state' => $orderData['return_state'] ?? '',
            'return_country' => $orderData['return_country'] ?? 'India',
            'products_desc' => $orderData['product_description'] ?? 'Product',
            'hsn_code' => $orderData['hsn_code'] ?? '',
            'cod_amount' => $packageType === 'COD' ? $orderData['total_amount'] : 0,
            'order_date' => $orderData['order_date'] ?? now()->format('Y-m-d H:i:s'),
            'total_amount' => $orderData['total_amount'],
            'seller_add' => $orderData['seller_address'] ?? '',
            'seller_name' => $orderData['seller_name'] ?? $this->clientName,
            'seller_inv' => $orderData['invoice_number'] ?? '',
            'quantity' => $orderData['quantity'] ?? 1,
            'waybill' => $orderData['waybill'] ?? '',
            'shipment_width' => $orderData['width'] ?? 10,
            'shipment_height' => $orderData['height'] ?? 10,
            'weight' => $orderData['weight'] ?? 500, // in grams
            'seller_gst_tin' => $orderData['seller_gst'] ?? '',
            'shipping_mode' => $orderData['shipping_mode'] ?? 'Surface',
            'address_type' => $orderData['address_type'] ?? 'home',
        ];
    }
}

