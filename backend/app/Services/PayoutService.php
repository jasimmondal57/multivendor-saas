<?php

namespace App\Services;

use App\Models\BankHoliday;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SystemSetting;
use App\Models\Vendor;
use App\Models\VendorPayout;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayoutService
{
    /**
     * Calculate payout for a vendor for a given period
     */
    public function calculatePayout(Vendor $vendor, string $periodStart, string $periodEnd): array
    {
        // Get all delivered orders in the period
        $orderItems = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) use ($periodStart, $periodEnd) {
                $query->where('status', 'delivered')
                    ->whereBetween('delivered_at', [$periodStart, $periodEnd]);
            })
            ->with('order')
            ->get();

        if ($orderItems->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No delivered orders found for this period',
            ];
        }

        // Calculate totals
        $totalSales = $orderItems->sum('total_amount');
        $totalOrders = $orderItems->pluck('order_id')->unique()->count();
        $orderIds = $orderItems->pluck('order_id')->unique()->values()->toArray();

        // Get earliest and latest delivery dates
        $deliveryDates = $orderItems->map(fn($item) => $item->order->delivered_at)->filter();
        $earliestDeliveryDate = $deliveryDates->min();
        $latestDeliveryDate = $deliveryDates->max();

        // Calculate scheduled payout date
        // Latest delivery date + 30 days return period + 1 day, skipping bank holidays
        $scheduledPayoutDate = $this->calculateScheduledPayoutDate($latestDeliveryDate);

        // Get commission rate (vendor-specific or global)
        $commissionRate = $vendor->commission_percentage
            ?? SystemSetting::get('platform_commission_rate', 10);

        // Calculate commission (excluding GST)
        $platformCommission = ($totalSales * $commissionRate) / 100;

        // Calculate GST on commission (18% on commission amount)
        $commissionGstRate = SystemSetting::get('commission_gst_percentage', 18);
        $commissionGst = ($platformCommission * $commissionGstRate) / 100;

        // Total commission including GST
        $totalCommissionWithGst = $platformCommission + $commissionGst;

        // Calculate TDS (Section 194-O: 1% on total sales)
        $tdsRate = SystemSetting::get('tds_rate', 1);
        $tdsAmount = ($totalSales * $tdsRate) / 100;

        // Calculate return shipping fees for customer-initiated returns in this period
        $returnShippingFees = \App\Models\ReturnOrder::where('vendor_id', $vendor->id)
            ->where('is_customer_return', true)
            ->whereIn('status', ['refund_completed', 'completed'])
            ->whereBetween('refund_completed_at', [$periodStart, $periodEnd])
            ->sum('return_shipping_fee');

        // Calculate net amount
        // Net = Total Sales - Commission (excl GST) - GST on Commission - TDS - Return Shipping Fees
        $netAmount = $totalSales - $platformCommission - $commissionGst - $tdsAmount - $returnShippingFees;

        return [
            'success' => true,
            'data' => [
                'total_sales' => round($totalSales, 2),
                'platform_commission' => round($platformCommission, 2),
                'commission_rate' => $commissionRate,
                'commission_gst' => round($commissionGst, 2),
                'commission_gst_rate' => $commissionGstRate,
                'total_commission_with_gst' => round($totalCommissionWithGst, 2),
                'tds_amount' => round($tdsAmount, 2),
                'tds_rate' => $tdsRate,
                'return_shipping_fees' => round($returnShippingFees, 2),
                'net_amount' => round($netAmount, 2),
                'total_orders' => $totalOrders,
                'order_ids' => $orderIds,
                'earliest_delivery_date' => $earliestDeliveryDate?->format('Y-m-d'),
                'latest_delivery_date' => $latestDeliveryDate?->format('Y-m-d'),
                'scheduled_payout_date' => $scheduledPayoutDate?->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Calculate scheduled payout date
     * Formula: Latest delivery date + 30 days return period + 1 day, skipping bank holidays and weekends
     */
    private function calculateScheduledPayoutDate(?Carbon $latestDeliveryDate): ?Carbon
    {
        if (!$latestDeliveryDate) {
            return null;
        }

        // Get return period from system settings (default 30 days)
        $returnPeriodDays = SystemSetting::get('return_period_days', 30);

        // Add return period days to latest delivery date
        $returnPeriodEndDate = $latestDeliveryDate->copy()->addDays($returnPeriodDays);

        // Add 1 day after return period ends
        $scheduledDate = $returnPeriodEndDate->addDay();

        // Skip weekends and bank holidays to get next working day
        $scheduledDate = BankHoliday::getNextWorkingDay($scheduledDate);

        return $scheduledDate;
    }

    /**
     * Create a payout record
     */
    public function createPayout(Vendor $vendor, array $data): VendorPayout
    {
        // Get bank account details
        $bankAccount = $vendor->bankAccount;

        return VendorPayout::create([
            'vendor_id' => $vendor->id,
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'scheduled_payout_date' => $data['scheduled_payout_date'] ?? null,
            'earliest_delivery_date' => $data['earliest_delivery_date'] ?? null,
            'latest_delivery_date' => $data['latest_delivery_date'] ?? null,
            'total_sales' => $data['total_sales'],
            'platform_commission' => $data['platform_commission'],
            'commission_rate' => $data['commission_rate'],
            'commission_gst' => $data['commission_gst'],
            'commission_gst_rate' => $data['commission_gst_rate'],
            'total_commission_with_gst' => $data['total_commission_with_gst'],
            'tds_amount' => $data['tds_amount'],
            'tds_rate' => $data['tds_rate'],
            'return_shipping_fees' => $data['return_shipping_fees'] ?? 0,
            'adjustment_amount' => $data['adjustment_amount'] ?? 0,
            'adjustment_reason' => $data['adjustment_reason'] ?? null,
            'net_amount' => $data['net_amount'] + ($data['adjustment_amount'] ?? 0),
            'total_orders' => $data['total_orders'],
            'order_ids' => $data['order_ids'],
            'status' => 'pending',
            'account_holder_name' => $bankAccount->account_holder_name ?? null,
            'account_number' => $bankAccount->account_number ?? null,
            'ifsc_code' => $bankAccount->ifsc_code ?? null,
            'bank_name' => $bankAccount->bank_name ?? null,
        ]);
    }

    /**
     * Process payout (mark as processing and initiate payment)
     */
    public function processPayout(VendorPayout $payout, int $processedBy): array
    {
        if ($payout->status !== 'pending') {
            return [
                'success' => false,
                'message' => 'Payout is not in pending status',
            ];
        }

        try {
            DB::beginTransaction();

            $payout->update([
                'status' => 'processing',
                'processed_at' => now(),
                'processed_by' => $processedBy,
            ]);

            // TODO: Integrate with payment gateway (Razorpay Payout, Cashfree, etc.)
            // For now, we'll mark it as completed immediately
            // In production, this would be async and updated via webhook

            DB::commit();

            return [
                'success' => true,
                'message' => 'Payout processing initiated',
                'payout' => $payout,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payout processing error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to process payout: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Complete payout (called after successful payment)
     */
    public function completePayout(VendorPayout $payout, array $paymentData): array
    {
        try {
            DB::beginTransaction();

            // Update payout status
            $payout->update([
                'status' => 'completed',
                'completed_at' => now(),
                'payment_method' => $paymentData['payment_method'] ?? 'bank_transfer',
                'payment_reference' => $paymentData['payment_reference'] ?? null,
                'payment_gateway' => $paymentData['payment_gateway'] ?? null,
                'payment_response' => $paymentData['payment_response'] ?? null,
            ]);

            // Update vendor wallet
            $wallet = VendorWallet::firstOrCreate(
                ['vendor_id' => $payout->vendor_id],
                [
                    'available_balance' => 0,
                    'pending_balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                ]
            );

            $wallet->update([
                'total_withdrawn' => $wallet->total_withdrawn + $payout->net_amount,
                'last_payout_at' => now(),
                'last_payout_amount' => $payout->net_amount,
            ]);

            // Create wallet transaction
            WalletTransaction::create([
                'vendor_id' => $payout->vendor_id,
                'type' => 'debit',
                'category' => 'payout',
                'amount' => $payout->net_amount,
                'balance_before' => $wallet->available_balance,
                'balance_after' => $wallet->available_balance,
                'reference_type' => 'VendorPayout',
                'reference_id' => $payout->id,
                'description' => "Payout for period {$payout->period_start->format('d M Y')} to {$payout->period_end->format('d M Y')}",
                'metadata' => [
                    'payout_number' => $payout->payout_number,
                    'payment_reference' => $paymentData['payment_reference'] ?? null,
                ],
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Payout completed successfully',
                'payout' => $payout->fresh(),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payout completion error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to complete payout: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fail payout
     */
    public function failPayout(VendorPayout $payout, string $reason): array
    {
        try {
            $payout->update([
                'status' => 'failed',
                'failed_at' => now(),
                'failure_reason' => $reason,
            ]);

            return [
                'success' => true,
                'message' => 'Payout marked as failed',
                'payout' => $payout->fresh(),
            ];
        } catch (\Exception $e) {
            Log::error('Payout failure update error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to update payout status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get pending payouts for all vendors
     */
    public function getPendingPayouts()
    {
        return VendorPayout::with(['vendor', 'processedBy'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get vendor payout statistics
     */
    public function getVendorStats(Vendor $vendor): array
    {
        $wallet = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor->id],
            [
                'available_balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
            ]
        );

        $totalPayouts = VendorPayout::where('vendor_id', $vendor->id)
            ->where('status', 'completed')
            ->count();

        $pendingPayouts = VendorPayout::where('vendor_id', $vendor->id)
            ->where('status', 'pending')
            ->count();

        return [
            'wallet' => $wallet,
            'total_payouts' => $totalPayouts,
            'pending_payouts' => $pendingPayouts,
        ];
    }
}

