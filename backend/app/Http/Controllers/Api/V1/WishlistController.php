<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    // Get user's wishlist
    public function index(Request $request)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->with(['product' => function ($query) {
                $query->with(['images', 'vendor:id,business_name']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    // Add product to wishlist
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        // Check if already in wishlist
        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in wishlist',
            ], 400);
        }

        $wishlist = Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist',
            'data' => $wishlist->load('product'),
        ], 201);
    }

    // Remove product from wishlist
    public function destroy(Request $request, $productId)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $wishlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist',
        ]);
    }

    // Check if product is in wishlist
    public function check(Request $request, $productId)
    {
        $inWishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'success' => true,
            'data' => ['in_wishlist' => $inWishlist],
        ]);
    }
}
