<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\ReturnOrder;
use App\Services\DelhiveryService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorReturnController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    /**
     * Get vendor return orders (only approved returns)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $vendor = $user->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Only show approved returns (not pending_approval or rejected)
        $query = ReturnOrder::where('vendor_id', $vendor->id)
            ->whereNotIn('status', ['requested', 'pending_approval', 'rejected'])
            ->with(['order', 'orderItem.product', 'customer', 'product']);

        // Filter by status if provided
        if ($request->has('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Search by return number or order number
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($oq) use ($search) {
                        $oq->where('order_number', 'like', "%{$search}%");
                    });
            });
        }

        $returns = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    /**
     * Get single return order details
     */
    public function show(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->with(['order', 'orderItem.product', 'customer', 'product', 'trackingHistory'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $return,
        ]);
    }

    /**
     * Schedule pickup for return (Admin approved returns only)
     */
    public function schedulePickup(Request $request, $id)
    {
        $request->validate([
            'pickup_date' => 'required|date|after:today',
        ]);

        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->where('status', 'approved')
            ->with(['order', 'customer'])
            ->firstOrFail();

        DB::beginTransaction();
        try {
            // Schedule pickup with Delhivery (if enabled)
            $delhiveryService = new DelhiveryService();
            
            if ($delhiveryService->isEnabled()) {
                // Create reverse shipment
                $pickupData = [
                    'customer_name' => $return->order->shipping_name,
                    'address' => $return->order->shipping_address,
                    'pincode' => $return->order->shipping_pincode,
                    'city' => $return->order->shipping_city,
                    'state' => $return->order->shipping_state,
                    'phone' => $return->order->shipping_phone,
                    'order_number' => $return->return_number,
                    'payment_method' => 'prepaid', // Returns are always prepaid
                    'total_amount' => 0,
                    'product_description' => $return->product->name,
                    'quantity' => $return->quantity,
                    'weight' => 500, // Default weight in grams
                    'width' => 10,
                    'height' => 10,
                ];

                $result = $delhiveryService->createShipment($pickupData);

                if ($result['success']) {
                    $return->update([
                        'status' => 'pickup_scheduled',
                        'pickup_scheduled_at' => $request->pickup_date,
                        'pickup_awb_number' => $result['waybill'] ?? null,
                        'courier_partner' => 'Delhivery',
                        'courier_response' => $result['data'] ?? null,
                    ]);
                }
            } else {
                // Manual pickup scheduling
                $return->update([
                    'status' => 'pickup_scheduled',
                    'pickup_scheduled_at' => $request->pickup_date,
                ]);
            }

            $return->addTrackingHistory(
                'pickup_scheduled',
                'Pickup scheduled for ' . $request->pickup_date,
                null,
                'vendor',
                $vendor->id
            );

            DB::commit();

            // Send notification to customer
            $this->notificationService->sendPickupScheduledNotification($return, $return->customer);

            return response()->json([
                'success' => true,
                'message' => 'Pickup scheduled successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule pickup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark return as received
     */
    public function markReceived(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->whereIn('status', ['in_transit', 'picked_up'])
            ->with('customer')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'received',
                'received_at' => now(),
            ]);

            $return->addTrackingHistory(
                'received',
                'Return package received at warehouse',
                null,
                'vendor',
                $vendor->id
            );

            DB::commit();

            // Send notification to customer
            $this->notificationService->sendPackageReceivedNotification($return, $return->customer);

            return response()->json([
                'success' => true,
                'message' => 'Return marked as received',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as received: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete inspection
     */
    public function completeInspection(Request $request, $id)
    {
        $request->validate([
            'passed' => 'required|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->where('status', 'received')
            ->with('customer')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $passed = $request->passed;
            $newStatus = $passed ? 'inspection_passed' : 'inspection_failed';

            $return->update([
                'status' => $newStatus,
                'inspected_at' => now(),
                'inspection_passed' => $passed,
                'inspection_notes' => $request->notes,
                'refund_method' => $passed ? 'original_payment' : null,
            ]);

            $description = $passed
                ? 'Inspection passed. Product is in acceptable condition.'
                : 'Inspection failed. ' . ($request->notes ?? 'Product not in acceptable condition.');

            $return->addTrackingHistory(
                $newStatus,
                $description,
                null,
                'vendor',
                $vendor->id
            );

            DB::commit();

            // Send notification to customer
            if ($passed) {
                $this->notificationService->sendInspectionPassedNotification($return, $return->customer);
            } else {
                $this->notificationService->sendInspectionFailedNotification($return, $return->customer);
            }

            return response()->json([
                'success' => true,
                'message' => 'Inspection completed successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete inspection: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initiate refund
     */
    public function initiateRefund(Request $request, $id)
    {
        $request->validate([
            'refund_method' => 'required|in:original_payment,wallet,bank_transfer',
        ]);

        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->where('status', 'inspection_passed')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $return->update([
                'status' => 'refund_initiated',
                'refund_initiated_at' => now(),
                'refund_method' => $request->refund_method,
            ]);

            $return->addTrackingHistory(
                'refund_initiated',
                'Refund initiated via ' . $request->refund_method,
                null,
                'vendor',
                $vendor->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Refund initiated successfully',
                'data' => $return->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate refund: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get return timeline
     */
    public function getTimeline(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        $return = ReturnOrder::where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->with('trackingHistory')
            ->firstOrFail();

        $timeline = $return->trackingHistory->map(function ($history) {
            return [
                'status' => $history->status,
                'description' => $history->description,
                'location' => $history->location,
                'timestamp' => $history->scanned_at ?? $history->created_at,
                'icon' => $this->getStatusIcon($history->status),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'return' => $return,
                'timeline' => $timeline,
            ],
        ]);
    }

    /**
     * Get status icon for timeline
     */
    private function getStatusIcon(string $status): string
    {
        $icons = [
            'requested' => 'shopping-cart',
            'pending_approval' => 'clock',
            'approved' => 'check-circle',
            'rejected' => 'x-circle',
            'pickup_scheduled' => 'calendar',
            'in_transit' => 'truck',
            'picked_up' => 'package',
            'received' => 'inbox',
            'inspecting' => 'search',
            'inspection_passed' => 'check-circle',
            'inspection_failed' => 'x-circle',
            'refund_initiated' => 'credit-card',
            'refund_completed' => 'check-circle',
            'completed' => 'check-circle',
        ];

        return $icons[$status] ?? 'info';
    }

    /**
     * Get return statistics (only approved returns)
     */
    public function statistics(Request $request)
    {
        $vendor = $request->user()->vendor;

        $stats = [
            'in_transit' => ReturnOrder::where('vendor_id', $vendor->id)
                ->whereIn('status', ['approved', 'pickup_scheduled', 'in_transit', 'out_for_pickup', 'picked_up'])->count(),
            'received' => ReturnOrder::where('vendor_id', $vendor->id)
                ->whereIn('status', ['received', 'inspecting'])->count(),
            'delivered' => ReturnOrder::where('vendor_id', $vendor->id)
                ->whereIn('status', ['inspection_passed', 'refund_initiated', 'refund_completed', 'completed'])->count(),
            'total' => ReturnOrder::where('vendor_id', $vendor->id)
                ->whereNotIn('status', ['requested', 'pending_approval', 'rejected'])->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
