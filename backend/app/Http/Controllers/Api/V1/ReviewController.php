<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // Get user's own reviews
    public function myReviews(Request $request)
    {
        $reviews = ProductReview::where('user_id', $request->user()->id)
            ->with(['product:id,name,slug', 'order:id,order_number'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    // Get reviews for a product
    public function index(Request $request, $productId)
    {
        $reviews = ProductReview::where('product_id', $productId)
            ->approved()
            ->with(['user:id,name', 'order:id,order_number'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $stats = ProductReview::where('product_id', $productId)
            ->approved()
            ->select(
                DB::raw('AVG(rating) as average_rating'),
                DB::raw('COUNT(*) as total_reviews'),
                DB::raw('SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star'),
                DB::raw('SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star'),
                DB::raw('SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star'),
                DB::raw('SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star'),
                DB::raw('SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star')
            )
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'stats' => $stats,
            ],
        ]);
    }

    // Create a review
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'url',
        ]);

        // Check if user has already reviewed this product
        $existingReview = ProductReview::where('product_id', $validated['product_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this product',
            ], 400);
        }

        // Check if this is a verified purchase
        $isVerifiedPurchase = false;
        if (isset($validated['order_id'])) {
            $order = Order::where('id', $validated['order_id'])
                ->where('customer_id', $request->user()->id)
                ->where('status', 'delivered')
                ->whereHas('items', function ($query) use ($validated) {
                    $query->where('product_id', $validated['product_id']);
                })
                ->first();

            $isVerifiedPurchase = $order !== null;
        }

        $review = ProductReview::create([
            'product_id' => $validated['product_id'],
            'user_id' => $request->user()->id,
            'order_id' => $validated['order_id'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'images' => $validated['images'] ?? null,
            'is_verified_purchase' => $isVerifiedPurchase,
            'is_approved' => true, // Auto-approve for now
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully',
            'data' => $review->load('user:id,name'),
        ], 201);
    }

    // Update a review
    public function update(Request $request, $id)
    {
        $review = ProductReview::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'sometimes|string',
            'images' => 'nullable|array',
            'images.*' => 'url',
        ]);

        $review->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review,
        ]);
    }

    // Delete a review
    public function destroy(Request $request, $id)
    {
        $review = ProductReview::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully',
        ]);
    }

    // Mark review as helpful/not helpful
    public function markHelpful(Request $request, $id)
    {
        $validated = $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        $review = ProductReview::findOrFail($id);

        // Check if user already marked this review
        $existing = DB::table('review_helpfulness')
            ->where('review_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            // Update existing
            DB::table('review_helpfulness')
                ->where('review_id', $id)
                ->where('user_id', $request->user()->id)
                ->update(['is_helpful' => $validated['is_helpful']]);
        } else {
            // Create new
            DB::table('review_helpfulness')->insert([
                'review_id' => $id,
                'user_id' => $request->user()->id,
                'is_helpful' => $validated['is_helpful'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update counts
        $helpfulCount = DB::table('review_helpfulness')
            ->where('review_id', $id)
            ->where('is_helpful', true)
            ->count();

        $notHelpfulCount = DB::table('review_helpfulness')
            ->where('review_id', $id)
            ->where('is_helpful', false)
            ->count();

        $review->update([
            'helpful_count' => $helpfulCount,
            'not_helpful_count' => $notHelpfulCount,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback',
        ]);
    }

    // Vendor response to review
    public function vendorResponse(Request $request, $id)
    {
        $validated = $request->validate([
            'response' => 'required|string',
        ]);

        $review = ProductReview::findOrFail($id);

        // Check if vendor owns the product
        $product = Product::where('id', $review->product_id)
            ->where('vendor_id', $request->user()->vendor->id)
            ->firstOrFail();

        $review->update([
            'vendor_response' => $validated['response'],
            'vendor_responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Response added successfully',
            'data' => $review,
        ]);
    }
}
