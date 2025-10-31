<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create Razorpay order
     */
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        try {
            $order = Order::with('items.product.vendor')->findOrFail($validated['order_id']);

            // Check if order belongs to user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to order',
                ], 403);
            }

            // Check if order is already paid
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid',
                ], 400);
            }

            // For now, return mock data (Razorpay SDK will be configured in production)
            $mockOrderId = 'order_' . uniqid();

            // Create payment transaction
            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $mockOrderId,
                'payment_method' => 'razorpay',
                'amount' => $order->total_amount,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'razorpay_order_id' => $mockOrderId,
                    'amount' => $order->total_amount,
                    'currency' => 'INR',
                    'key_id' => env('RAZORPAY_KEY_ID', 'rzp_test_key'),
                    'order' => $order,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Payment order creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify Razorpay payment
     */
    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        try {
            // Find transaction
            $transaction = PaymentTransaction::where('transaction_id', $validated['razorpay_order_id'])->firstOrFail();
            $order = $transaction->order;

            DB::beginTransaction();

            // Update transaction
            $transaction->update([
                'payment_id' => $validated['razorpay_payment_id'],
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // Update order
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'data' => [
                    'order' => $order,
                    'transaction' => $transaction,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment verification failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle COD payment
     */
    public function codPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        try {
            $order = Order::findOrFail($validated['order_id']);

            // Check if order belongs to user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to order',
                ], 403);
            }

            DB::beginTransaction();

            // Create payment transaction for COD
            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => 'COD_' . $order->order_number,
                'payment_method' => 'cod',
                'amount' => $order->total_amount,
                'status' => 'pending',
            ]);

            // Update order
            $order->update([
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'status' => 'confirmed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'COD order confirmed successfully',
                'data' => [
                    'order' => $order,
                    'transaction' => $transaction,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('COD payment failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'COD payment failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
