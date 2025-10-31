<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VendorProductVariantController extends Controller
{
    /**
     * Get all variants for a product
     */
    public function index(Request $request, $productId)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Verify product belongs to vendor
        $product = Product::where('id', $productId)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $variants = ProductVariant::where('product_id', $productId)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $variants,
        ]);
    }

    /**
     * Store a new variant
     */
    public function store(Request $request, $productId)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Verify product belongs to vendor
        $product = Product::where('id', $productId)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|unique:product_variants,sku',
            'variant_name' => 'required|string|max:255',
            'attributes' => 'required|array',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $variant = ProductVariant::create([
            'product_id' => $productId,
            'sku' => $request->sku,
            'variant_name' => $request->variant_name,
            'attributes' => $request->attributes,
            'price' => $request->price,
            'compare_at_price' => $request->compare_at_price,
            'stock_quantity' => $request->stock_quantity,
            'low_stock_threshold' => $request->low_stock_threshold ?? 5,
            'weight' => $request->weight,
            'image' => $request->image,
            'is_active' => $request->is_active ?? true,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Variant created successfully',
            'data' => $variant,
        ], 201);
    }

    /**
     * Update a variant
     */
    public function update(Request $request, $productId, $variantId)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Verify product belongs to vendor
        $product = Product::where('id', $productId)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $variant = ProductVariant::where('id', $variantId)
            ->where('product_id', $productId)
            ->first();

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|unique:product_variants,sku,' . $variantId,
            'variant_name' => 'required|string|max:255',
            'attributes' => 'required|array',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $variant->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Variant updated successfully',
            'data' => $variant,
        ]);
    }

    /**
     * Delete a variant
     */
    public function destroy(Request $request, $productId, $variantId)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Verify product belongs to vendor
        $product = Product::where('id', $productId)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $variant = ProductVariant::where('id', $variantId)
            ->where('product_id', $productId)
            ->first();

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found',
            ], 404);
        }

        $variant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Variant deleted successfully',
        ]);
    }

    /**
     * Bulk update variant stock
     */
    public function bulkUpdateStock(Request $request, $productId)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Verify product belongs to vendor
        $product = Product::where('id', $productId)
            ->where('vendor_id', $vendor->id)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'variants' => 'required|array',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->variants as $variantData) {
            ProductVariant::where('id', $variantData['id'])
                ->where('product_id', $productId)
                ->update(['stock_quantity' => $variantData['stock_quantity']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
        ]);
    }
}

