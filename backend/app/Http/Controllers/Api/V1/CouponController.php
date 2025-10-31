<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponController extends Controller
{
    // Validate and apply coupon
    public function validate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
            'product_ids' => 'nullable|array',
            'category_ids' => 'nullable|array',
        ]);

        $coupon = Coupon::where('code', strtoupper($validated['code']))
            ->active()
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired coupon code',
            ], 404);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is no longer valid',
            ], 400);
        }

        // Check usage limit per user
        if ($coupon->usage_limit_per_user) {
            $userUsageCount = DB::table('coupon_usage')
                ->where('coupon_id', $coupon->id)
                ->where('user_id', $request->user()->id)
                ->count();

            if ($userUsageCount >= $coupon->usage_limit_per_user) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already used this coupon the maximum number of times',
                ], 400);
            }
        }

        // Check minimum order amount
        if ($validated['order_amount'] < $coupon->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => "Minimum order amount of ₹{$coupon->min_order_amount} required",
            ], 400);
        }

        // Check applicable products/categories
        if ($coupon->applicable_products && !empty($validated['product_ids'])) {
            $hasApplicableProduct = !empty(array_intersect($coupon->applicable_products, $validated['product_ids']));
            if (!$hasApplicableProduct) {
                return response()->json([
                    'success' => false,
                    'message' => 'This coupon is not applicable to the products in your cart',
                ], 400);
            }
        }

        if ($coupon->applicable_categories && !empty($validated['category_ids'])) {
            $hasApplicableCategory = !empty(array_intersect($coupon->applicable_categories, $validated['category_ids']));
            if (!$hasApplicableCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'This coupon is not applicable to the products in your cart',
                ], 400);
            }
        }

        $discount = $coupon->calculateDiscount($validated['order_amount']);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully',
            'data' => [
                'coupon' => $coupon,
                'discount_amount' => $discount,
                'final_amount' => max(0, $validated['order_amount'] - $discount),
            ],
        ]);
    }

    // Get all active coupons
    public function index()
    {
        $coupons = Coupon::active()
            ->select(['id', 'code', 'name', 'description', 'type', 'value', 'min_order_amount', 'valid_until'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ]);
    }

    // Admin: Create coupon
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed,free_shipping',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'applicable_categories' => 'nullable|array',
            'applicable_products' => 'nullable|array',
        ]);

        $validated['code'] = strtoupper($validated['code']);

        $coupon = Coupon::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully',
            'data' => $coupon,
        ], 201);
    }
}
