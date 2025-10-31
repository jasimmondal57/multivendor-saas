<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformRevenue;
use App\Models\Vendor;
use App\Models\Order;
use Carbon\Carbon;

class PlatformRevenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some vendors and orders for realistic data
        $vendors = Vendor::limit(10)->get();
        $orders = Order::where('payment_status', 'paid')->limit(20)->get();

        // Generate revenue records for the last 6 months
        $revenues = [];
        $startDate = Carbon::now()->subMonths(6);
        $endDate = Carbon::now();

        // Commission revenue from orders
        foreach ($orders as $order) {
            $commissionRate = 10; // 10% commission
            $grossAmount = $order->total_amount;
            $commissionAmount = $grossAmount * ($commissionRate / 100);
            $gstAmount = $commissionAmount * 0.18; // 18% GST on commission
            $netRevenue = $commissionAmount + $gstAmount;

            $revenues[] = [
                'revenue_number' => 'REV-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                'source_type' => 'commission',
                'source_reference' => 'Order',
                'source_id' => $order->id,
                'vendor_id' => $order->items->first()?->vendor_id,
                'vendor_name' => $order->items->first()?->vendor?->business_name,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'vendor_payout_id' => null,
                'payout_number' => null,
                'gross_amount' => $grossAmount,
                'commission_rate' => $commissionRate,
                'commission_amount' => $commissionAmount,
                'gst_rate' => 18,
                'gst_amount' => $gstAmount,
                'net_revenue' => $netRevenue,
                'listing_fee' => 0,
                'advertisement_fee' => 0,
                'penalty_amount' => 0,
                'other_fees' => 0,
                'revenue_date' => $order->created_at,
                'revenue_month' => $order->created_at->format('Y-m'),
                'revenue_quarter' => $order->created_at->format('Y') . '-Q' . $order->created_at->quarter,
                'revenue_year' => $order->created_at->format('Y'),
                'status' => 'confirmed',
                'confirmed_at' => $order->created_at,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'description' => "Commission from order {$order->order_number}",
                'metadata' => json_encode([
                    'order_total' => $grossAmount,
                    'commission_percentage' => $commissionRate,
                ]),
                'created_at' => $order->created_at,
                'updated_at' => $order->created_at,
            ];
        }

        // Add some subscription revenue
        foreach ($vendors->take(5) as $vendor) {
            $subscriptionFee = 999; // Monthly subscription
            $gstAmount = $subscriptionFee * 0.18;
            $netRevenue = $subscriptionFee + $gstAmount;

            $revenues[] = [
                'revenue_number' => 'REV-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                'source_type' => 'subscription',
                'source_reference' => 'Vendor Subscription',
                'source_id' => $vendor->id,
                'vendor_id' => $vendor->id,
                'vendor_name' => $vendor->business_name,
                'order_id' => null,
                'order_number' => null,
                'vendor_payout_id' => null,
                'payout_number' => null,
                'gross_amount' => $subscriptionFee,
                'commission_rate' => null,
                'commission_amount' => $subscriptionFee,
                'gst_rate' => 18,
                'gst_amount' => $gstAmount,
                'net_revenue' => $netRevenue,
                'listing_fee' => 0,
                'advertisement_fee' => 0,
                'penalty_amount' => 0,
                'other_fees' => 0,
                'revenue_date' => Carbon::now()->subDays(rand(1, 30)),
                'revenue_month' => Carbon::now()->format('Y-m'),
                'revenue_quarter' => Carbon::now()->format('Y') . '-Q' . Carbon::now()->quarter,
                'revenue_year' => Carbon::now()->format('Y'),
                'status' => 'confirmed',
                'confirmed_at' => Carbon::now()->subDays(rand(1, 30)),
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'description' => "Monthly subscription fee from {$vendor->business_name}",
                'metadata' => json_encode([
                    'subscription_plan' => 'pro',
                    'billing_period' => 'monthly',
                ]),
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ];
        }

        // Add some listing fees
        foreach ($vendors->take(3) as $vendor) {
            $listingFee = 499;
            $gstAmount = $listingFee * 0.18;
            $netRevenue = $listingFee + $gstAmount;

            $revenues[] = [
                'revenue_number' => 'REV-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                'source_type' => 'listing_fee',
                'source_reference' => 'Product Listing',
                'source_id' => $vendor->id,
                'vendor_id' => $vendor->id,
                'vendor_name' => $vendor->business_name,
                'order_id' => null,
                'order_number' => null,
                'vendor_payout_id' => null,
                'payout_number' => null,
                'gross_amount' => $listingFee,
                'commission_rate' => null,
                'commission_amount' => 0,
                'gst_rate' => 18,
                'gst_amount' => $gstAmount,
                'net_revenue' => $netRevenue,
                'listing_fee' => $listingFee,
                'advertisement_fee' => 0,
                'penalty_amount' => 0,
                'other_fees' => 0,
                'revenue_date' => Carbon::now()->subDays(rand(1, 60)),
                'revenue_month' => Carbon::now()->format('Y-m'),
                'revenue_quarter' => Carbon::now()->format('Y') . '-Q' . Carbon::now()->quarter,
                'revenue_year' => Carbon::now()->format('Y'),
                'status' => 'confirmed',
                'confirmed_at' => Carbon::now()->subDays(rand(1, 60)),
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'description' => "Featured product listing fee from {$vendor->business_name}",
                'metadata' => json_encode([
                    'listing_type' => 'featured',
                    'duration_days' => 30,
                ]),
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
                'updated_at' => Carbon::now()->subDays(rand(1, 60)),
            ];
        }

        // Insert all revenue records
        foreach ($revenues as $revenue) {
            PlatformRevenue::create($revenue);
        }

        $this->command->info('Platform revenue records seeded successfully!');
        $this->command->info('Total records created: ' . count($revenues));
    }
}
