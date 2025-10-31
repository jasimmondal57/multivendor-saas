<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ReturnOrder;
use App\Models\User;
use App\Models\Vendor;

class ReturnOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding return orders...');

        // Get delivered orders
        $deliveredOrders = Order::where('status', 'delivered')->with('items')->get();

        if ($deliveredOrders->isEmpty()) {
            $this->command->warn('No delivered orders found. Please run DemoDataSeeder first.');
            return;
        }

        $reasons = ['defective', 'wrong_item', 'not_as_described', 'damaged', 'size_issue', 'quality_issue', 'changed_mind'];
        $returnTypes = ['refund', 'replacement', 'exchange'];

        $statusGroups = [
            'pending_approval' => 3,
            'approved' => 2,
            'pickup_scheduled' => 2,
            'in_transit' => 2,
            'picked_up' => 1,
            'received' => 2,
            'inspecting' => 1,
            'inspection_passed' => 2,
            'inspection_failed' => 1,
            'refund_initiated' => 2,
            'refund_completed' => 3,
            'rejected' => 2,
            'cancelled' => 1,
        ];

        $returnCount = 0;
        $maxReturns = array_sum($statusGroups);

        foreach ($deliveredOrders as $order) {
            if ($returnCount >= $maxReturns) break;

            foreach ($order->items as $orderItem) {
                if ($returnCount >= $maxReturns) break;

                // Determine status for this return
                $status = null;
                foreach ($statusGroups as $statusKey => $count) {
                    if ($count > 0) {
                        $status = $statusKey;
                        $statusGroups[$statusKey]--;
                        break;
                    }
                }

                if (!$status) continue;

                $reason = $reasons[array_rand($reasons)];
                $returnType = $returnTypes[array_rand($returnTypes)];
                $quantity = min($orderItem->quantity, rand(1, 2));
                $refundAmount = $orderItem->price * $quantity;

                // Create return order
                $return = ReturnOrder::create([
                    'return_number' => ReturnOrder::generateReturnNumber(),
                    'order_id' => $order->id,
                    'order_item_id' => $orderItem->id,
                    'customer_id' => $order->customer_id,
                    'vendor_id' => $orderItem->vendor_id,
                    'product_id' => $orderItem->product_id,
                    'return_type' => $returnType,
                    'reason' => $reason,
                    'reason_description' => $this->getReasonDescription($reason),
                    'quantity' => $quantity,
                    'refund_amount' => $refundAmount,
                    'status' => $status,
                    'images' => null,
                    'created_at' => now()->subDays(rand(1, 15)),
                ]);

                // Add tracking history based on status
                $this->addTrackingHistory($return, $status);

                // Update timestamps based on status
                $this->updateTimestamps($return, $status);

                $returnCount++;
                $this->command->info("Created return: {$return->return_number} - Status: {$status}");
            }
        }

        $this->command->info("✅ Created {$returnCount} return orders with various statuses");
    }

    private function getReasonDescription(string $reason): string
    {
        $descriptions = [
            'defective' => 'Product is not working properly. Found defects upon opening.',
            'wrong_item' => 'Received wrong product. This is not what I ordered.',
            'not_as_described' => 'Product does not match the description on the website.',
            'damaged' => 'Product arrived damaged. Packaging was also torn.',
            'size_issue' => 'Size does not fit as expected. Need a different size.',
            'quality_issue' => 'Quality is not up to the mark. Material feels cheap.',
            'changed_mind' => 'Changed my mind. No longer need this product.',
        ];

        return $descriptions[$reason] ?? 'Return requested';
    }

    private function addTrackingHistory(ReturnOrder $return, string $status): void
    {
        $histories = [
            'pending_approval' => [
                ['requested', 'Return request submitted by customer', 'customer'],
            ],
            'approved' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
            ],
            'pickup_scheduled' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
            ],
            'in_transit' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package picked up and in transit', 'courier'],
            ],
            'picked_up' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['picked_up', 'Package picked up from customer', 'courier'],
            ],
            'received' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
            ],
            'inspecting' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
                ['inspecting', 'Product inspection in progress', 'vendor'],
            ],
            'inspection_passed' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
                ['inspection_passed', 'Inspection passed. Product is in acceptable condition.', 'vendor'],
            ],
            'inspection_failed' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
                ['inspection_failed', 'Inspection failed. Product not in acceptable condition.', 'vendor'],
            ],
            'refund_initiated' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
                ['inspection_passed', 'Inspection passed', 'vendor'],
                ['refund_initiated', 'Refund initiated via original payment method', 'vendor'],
            ],
            'refund_completed' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['approved', 'Return request approved by vendor', 'vendor'],
                ['pickup_scheduled', 'Pickup scheduled with courier', 'vendor'],
                ['in_transit', 'Package in transit', 'courier'],
                ['received', 'Package received at warehouse', 'vendor'],
                ['inspection_passed', 'Inspection passed', 'vendor'],
                ['refund_initiated', 'Refund initiated', 'vendor'],
                ['refund_completed', 'Refund completed successfully', 'system'],
            ],
            'rejected' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['rejected', 'Return request rejected: Product is beyond return window', 'vendor'],
            ],
            'cancelled' => [
                ['requested', 'Return request submitted by customer', 'customer'],
                ['cancelled', 'Return request cancelled by customer', 'customer'],
            ],
        ];

        $historyData = $histories[$status] ?? [['requested', 'Return request submitted', 'customer']];

        foreach ($historyData as $index => $history) {
            $return->trackingHistory()->create([
                'status' => $history[0],
                'description' => $history[1],
                'location' => null,
                'updated_by_type' => $history[2],
                'updated_by_id' => null,
                'scanned_at' => $return->created_at->addHours($index * 2),
                'created_at' => $return->created_at->addHours($index * 2),
            ]);
        }
    }

    private function updateTimestamps(ReturnOrder $return, string $status): void
    {
        $updates = [];

        $statusTimestamps = [
            'approved' => ['approved_at'],
            'rejected' => ['rejected_at'],
            'pickup_scheduled' => ['approved_at', 'pickup_scheduled_at'],
            'in_transit' => ['approved_at', 'pickup_scheduled_at'],
            'picked_up' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at'],
            'received' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at'],
            'inspecting' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at'],
            'inspection_passed' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at', 'inspected_at'],
            'inspection_failed' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at', 'inspected_at'],
            'refund_initiated' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at', 'inspected_at', 'refund_initiated_at'],
            'refund_completed' => ['approved_at', 'pickup_scheduled_at', 'picked_up_at', 'received_at', 'inspected_at', 'refund_initiated_at', 'refund_completed_at'],
        ];

        $timestamps = $statusTimestamps[$status] ?? [];
        $baseTime = $return->created_at;

        foreach ($timestamps as $index => $field) {
            $updates[$field] = $baseTime->copy()->addHours(($index + 1) * 6);
        }

        // Add specific fields based on status
        if ($status === 'inspection_passed') {
            $updates['inspection_passed'] = true;
            $updates['inspection_notes'] = 'Product is in good condition. Approved for refund.';
        } elseif ($status === 'inspection_failed') {
            $updates['inspection_passed'] = false;
            $updates['inspection_notes'] = 'Product shows signs of use. Not eligible for refund.';
        } elseif ($status === 'rejected') {
            $updates['rejection_reason'] = 'Product is beyond the 30-day return window.';
        } elseif (in_array($status, ['refund_initiated', 'refund_completed'])) {
            $updates['refund_method'] = 'original_payment';
            $updates['inspection_passed'] = true;
        }

        if (!empty($updates)) {
            $return->update($updates);
        }
    }
}

