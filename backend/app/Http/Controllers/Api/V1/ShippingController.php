<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\DelhiveryService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    private DelhiveryService $delhiveryService;

    public function __construct(DelhiveryService $delhiveryService)
    {
        $this->delhiveryService = $delhiveryService;
    }

    /**
     * Check pincode serviceability
     */
    public function checkPincode(string $pincode)
    {
        // Validate pincode format
        if (!preg_match('/^[0-9]{6}$/', $pincode)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid pincode format. Please enter a valid 6-digit pincode.',
            ], 400);
        }

        // Check if Delhivery is enabled
        if (!$this->delhiveryService->isEnabled()) {
            // Fallback to basic check if Delhivery is not enabled
            return $this->basicPincodeCheck($pincode);
        }

        // Use Delhivery API to check serviceability
        $result = $this->delhiveryService->checkServiceability($pincode);

        if ($result['success']) {
            $serviceable = $result['serviceable'];
            $deliveryData = $result['data'];

            if ($serviceable) {
                // Calculate estimated delivery days
                $estimatedDays = SystemSetting::get('estimated_delivery_days', 7);
                
                return response()->json([
                    'success' => true,
                    'serviceable' => true,
                    'message' => "Delivery available! Expected delivery in {$estimatedDays} business days",
                    'data' => [
                        'pincode' => $pincode,
                        'city' => $deliveryData['postal_code']['city'] ?? null,
                        'state' => $deliveryData['postal_code']['state_code'] ?? null,
                        'district' => $deliveryData['postal_code']['district'] ?? null,
                        'estimated_days' => $estimatedDays,
                        'cod_available' => SystemSetting::get('cod_enabled', true),
                        'prepaid_available' => true,
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'serviceable' => false,
                    'message' => 'Sorry, delivery is not available to this pincode at the moment.',
                    'data' => [
                        'pincode' => $pincode,
                    ],
                ]);
            }
        }

        // If Delhivery API fails, fallback to basic check
        return $this->basicPincodeCheck($pincode);
    }

    /**
     * Basic pincode check (fallback when Delhivery is not available)
     */
    private function basicPincodeCheck(string $pincode)
    {
        // Basic validation - accept most Indian pincodes
        // You can customize this logic based on your serviceable areas
        $serviceablePrefixes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $firstDigit = substr($pincode, 0, 1);
        
        $serviceable = in_array($firstDigit, $serviceablePrefixes);
        $estimatedDays = SystemSetting::get('estimated_delivery_days', 7);

        if ($serviceable) {
            return response()->json([
                'success' => true,
                'serviceable' => true,
                'message' => "Delivery available! Expected delivery in {$estimatedDays} business days",
                'data' => [
                    'pincode' => $pincode,
                    'estimated_days' => $estimatedDays,
                    'cod_available' => SystemSetting::get('cod_enabled', true),
                    'prepaid_available' => true,
                    'note' => 'Serviceability check performed without courier integration',
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'serviceable' => false,
            'message' => 'Sorry, delivery is not available to this pincode at the moment.',
            'data' => [
                'pincode' => $pincode,
            ],
        ]);
    }
}

