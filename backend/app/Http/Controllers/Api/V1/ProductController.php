<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products with filters
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'vendor'])
            ->approved()
            ->inStock();

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('selling_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('selling_price', '<=', $request->max_price);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by featured
        if ($request->has('featured') && $request->featured == 'true') {
            $query->featured();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'price') {
            $query->orderBy('selling_price', $sortOrder);
        } elseif ($sortBy === 'name') {
            $query->orderBy('name', $sortOrder);
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating', $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get single product by slug
     */
    public function show($slug)
    {
        $product = Product::with(['category', 'vendor'])
            ->where('slug', $slug)
            ->approved()
            ->firstOrFail();

        // Increment view count
        $product->increment('view_count');

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Get featured products
     */
    public function featured()
    {
        $products = Product::with(['category', 'vendor'])
            ->approved()
            ->inStock()
            ->featured()
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
