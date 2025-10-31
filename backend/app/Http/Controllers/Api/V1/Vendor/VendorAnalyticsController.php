<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VendorAnalyticsController extends Controller
{
    /**
     * Get analytics statistics
     */
    public function statistics(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Total sales (delivered orders)
        $totalSales = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) {
                $query->where('status', 'delivered');
            })
            ->count();

        // Total revenue
        $totalRevenue = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) {
                $query->where('status', 'delivered');
            })
            ->sum('price');

        // Product views (placeholder - you can implement view tracking)
        $productViews = Product::where('vendor_id', $vendor->id)->sum('views') ?? 0;

        // Average rating
        $avgRating = $vendor->average_rating ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_sales' => $totalSales,
                'total_revenue' => round($totalRevenue, 2),
                'product_views' => $productViews,
                'average_rating' => round($avgRating, 2),
            ],
        ]);
    }

    /**
     * Get sales trend data
     */
    public function salesTrend(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);

        $salesData = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) use ($startDate) {
                $query->where('status', 'delivered')
                    ->where('delivered_at', '>=', $startDate);
            })
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                DB::raw('DATE(orders.delivered_at) as date'),
                DB::raw('COUNT(*) as sales'),
                DB::raw('SUM(order_items.price) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Fill in missing dates with zero values
        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $existing = $salesData->firstWhere('date', $date);
            
            $result[] = [
                'date' => $date,
                'sales' => $existing ? $existing->sales : 0,
                'revenue' => $existing ? round($existing->revenue, 2) : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get top products
     */
    public function topProducts(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $limit = $request->get('limit', 10);

        $topProducts = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', function ($query) {
                $query->where('status', 'delivered');
            })
            ->select(
                'product_id',
                DB::raw('COUNT(*) as total_sales'),
                DB::raw('SUM(price) as total_revenue')
            )
            ->groupBy('product_id')
            ->orderBy('total_sales', 'desc')
            ->limit($limit)
            ->with('product:id,name,sku')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? 'Unknown',
                    'product_sku' => $item->product->sku ?? 'N/A',
                    'total_sales' => $item->total_sales,
                    'total_revenue' => round($item->total_revenue, 2),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }

    /**
     * Get category-wise sales
     */
    public function categorySales(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        try {
            $categorySales = OrderItem::where('order_items.vendor_id', $vendor->id)
                ->whereHas('order', function ($query) {
                    $query->where('status', 'delivered');
                })
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->select(
                    'categories.id as category_id',
                    'categories.name as category_name',
                    DB::raw('COUNT(order_items.id) as total_sales'),
                    DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
                )
                ->groupBy('categories.id', 'categories.name')
                ->orderBy('total_sales', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'category_id' => $item->category_id,
                        'category_name' => $item->category_name,
                        'total_sales' => (int) $item->total_sales,
                        'total_revenue' => round((float) $item->total_revenue, 2),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categorySales,
            ]);
        } catch (\Exception $e) {
            \Log::error('Category sales error: ' . $e->getMessage());

            return response()->json([
                'success' => true,
                'data' => [], // Return empty array on error
            ]);
        }
    }
}

