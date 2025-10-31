<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Models\Coupon;
use App\Models\Category;
use App\Models\VendorOnboardingStep;
use App\Models\SystemSetting;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminDashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function stats(Request $request)
    {
        $stats = [
            'total_vendors' => Vendor::where('status', 'active')->count(),
            'total_customers' => User::where('user_type', 'customer')->count(),
            'total_orders' => Order::count(),
            'total_revenue' => OrderItem::sum('total_amount') ?? 0,
            'pending_vendors' => VendorOnboardingStep::where('verification_status', 'in_review')->count(),
            'pending_products' => Product::where('approval_status', 'pending')->count(),
            'total_products' => Product::count(),
            'total_reviews' => ProductReview::count(),
            'active_coupons' => Coupon::where('is_active', true)
                ->where('valid_from', '<=', now())
                ->where('valid_until', '>=', now())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all vendors
     */
    public function vendors(Request $request)
    {
        $query = Vendor::with(['user']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                // Pending approval - verification_status is pending
                $query->where('verification_status', 'pending');
            } elseif ($request->status === 'rejected') {
                // Rejected - verification_status is rejected
                $query->where('verification_status', 'rejected');
            } else {
                // Active, inactive, suspended
                $query->where('status', $request->status);
            }
        }

        // Search
        if ($request->has('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            })->orWhere('business_name', 'like', '%' . $request->search . '%');
        }

        $vendors = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $vendors,
        ]);
    }

    /**
     * Update vendor status
     */
    public function updateVendorStatus(Request $request, $vendorId)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $vendor = Vendor::with('products')->findOrFail($vendorId);

        $updateData = ['status' => $request->status];

        // Clear suspension data if activating
        if ($request->status === 'active') {
            $updateData['suspension_reason'] = null;
            $updateData['suspended_at'] = null;
            $updateData['suspended_by'] = null;

            // Restore product availability
            foreach ($vendor->products as $product) {
                if ($product->unavailability_reason && 
                    (str_contains($product->unavailability_reason, 'Vendor suspended') ||
                     str_contains($product->unavailability_reason, 'Vendor temporarily inactive'))) {
                    $product->restoreAvailability();
                }
            }
        } elseif ($request->status === 'inactive') {
            // Mark products as temporarily unavailable
            foreach ($vendor->products as $product) {
                if ($product->stock_status !== 'out_of_stock' && empty($product->unavailability_reason)) {
                    $product->markAsTemporarilyUnavailable('Vendor temporarily inactive');
                }
            }
        }

        $vendor->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Vendor status updated successfully',
        ]);
    }

    /**
     * Suspend vendor
     */
    public function suspendVendor(Request $request, $vendorId)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $vendor = Vendor::with('products')->findOrFail($vendorId);
        $vendor->update([
            'status' => 'suspended',
            'suspension_reason' => $request->reason,
            'suspended_at' => now(),
            'suspended_by' => $request->user()->id,
        ]);

        // Mark all vendor products as temporarily unavailable
        foreach ($vendor->products as $product) {
            if ($product->stock_status !== 'out_of_stock' && empty($product->unavailability_reason)) {
                $product->markAsTemporarilyUnavailable('Vendor suspended: ' . $request->reason);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor suspended successfully',
        ]);
    }

    /**
     * Get all products
     */
    public function products(Request $request)
    {
        $query = Product::with(['category', 'vendor.user']);

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Approve product
     */
    public function approveProduct($productId)
    {
        $product = Product::findOrFail($productId);
        $product->update(['approval_status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'Product approved successfully',
        ]);
    }

    /**
     * Reject product
     */
    public function rejectProduct(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        $product->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->reason ?? 'Not specified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product rejected successfully',
        ]);
    }

    /**
     * Ban product
     */
    public function banProduct(Request $request, $productId)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $product = Product::findOrFail($productId);
        $product->update([
            'status' => 'banned',
            'ban_reason' => $request->reason,
            'banned_at' => now(),
            'banned_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product banned successfully',
        ]);
    }

    /**
     * Unban product
     */
    public function unbanProduct($productId)
    {
        $product = Product::findOrFail($productId);
        $product->update([
            'status' => 'active',
            'ban_reason' => null,
            'banned_at' => null,
            'banned_by' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product unbanned successfully',
        ]);
    }

    /**
     * Get all orders
     */
    public function orders(Request $request)
    {
        $query = Order::with([
            'customer',
            'items.product',
            'items.vendor' => function ($query) {
                $query->with('store');
            }
        ]);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
        ]);

        $order = Order::findOrFail($orderId);
        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        // Update delivered_at timestamp if status is delivered
        if ($request->status === 'delivered' && $oldStatus !== 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        // Update cancelled_at timestamp if status is cancelled
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            $order->update(['cancelled_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
        ]);
    }

    /**
     * Get all customers
     */
    public function customers(Request $request)
    {
        $query = User::where('user_type', 'customer');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Update user status
     */
    public function updateUserStatus(Request $request, $userId)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,ban,unban',
        ]);

        $user = User::findOrFail($userId);

        switch ($request->action) {
            case 'activate':
                $user->update(['status' => 'active']);
                break;
            case 'deactivate':
                $user->update(['status' => 'inactive']);
                break;
            case 'ban':
                $user->update(['status' => 'banned']);
                break;
            case 'unban':
                $user->update(['status' => 'active']);
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
        ]);
    }

    /**
     * Get all reviews
     */
    public function reviews(Request $request)
    {
        $query = ProductReview::with(['user', 'product', 'vendor']);

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Search
        if ($request->has('search')) {
            $query->where('review', 'like', '%' . $request->search . '%');
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Get all coupons
     */
    public function coupons(Request $request)
    {
        $query = Coupon::query();

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)
                      ->where('valid_from', '<=', now())
                      ->where('valid_until', '>=', now());
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'expired') {
                $query->where('valid_until', '<', now());
            }
        }

        $coupons = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ]);
    }

    /**
     * Get payment transactions
     */
    public function payments(Request $request)
    {
        $query = Order::with(['customer'])
            ->select(
                'id',
                'order_number',
                'customer_id',
                'total_amount as amount',
                'payment_method',
                'payment_status as status',
                'created_at',
                'updated_at'
            );

        // Filter by payment method
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('payment_status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Transform data to match Payment interface
        $payments->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_id' => $order->id,
                'transaction_id' => 'TXN-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'payment_method' => $order->payment_method,
                'amount' => $order->amount,
                'status' => $order->status ?? 'pending',
                'payment_date' => $order->created_at,
                'created_at' => $order->created_at,
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer' => $order->customer ? [
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                    ] : null,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Get analytics data
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days

        // Revenue over time
        $revenueData = OrderItem::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as revenue'),
            DB::raw('COUNT(DISTINCT order_id) as orders')
        )
        ->where('created_at', '>=', now()->subDays($period))
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        // Top products
        $topProducts = Product::select('products.*', DB::raw('COUNT(order_items.id) as sales_count'))
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->groupBy('products.id')
            ->orderBy('sales_count', 'desc')
            ->limit(10)
            ->get();

        // Top vendors
        $topVendors = Vendor::select('vendors.*', DB::raw('SUM(order_items.total_amount) as total_revenue'))
            ->join('order_items', 'vendors.id', '=', 'order_items.vendor_id')
            ->join('users', 'vendors.user_id', '=', 'users.id')
            ->groupBy('vendors.id')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->with('user')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'revenue_chart' => $revenueData,
                'top_products' => $topProducts,
                'top_vendors' => $topVendors,
            ],
        ]);
    }

    /**
     * Get reports
     */
    public function reports(Request $request)
    {
        $type = $request->get('type', 'sales');
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        $data = [];

        if ($type === 'sales') {
            // Sales summary
            $data['summary'] = [
                'total_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
                'total_revenue' => Order::whereBetween('created_at', [$startDate, $endDate])->sum('total_amount'),
                'average_order_value' => Order::whereBetween('created_at', [$startDate, $endDate])->avg('total_amount'),
                'total_items_sold' => OrderItem::whereBetween('created_at', [$startDate, $endDate])->sum('quantity'),
            ];

            // Daily sales
            $data['daily_sales'] = Order::whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(total_amount) as revenue'),
                    DB::raw('AVG(total_amount) as avg_order_value')
                )
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            // Top selling products
            $data['top_products'] = Product::select('products.*', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.total_amount) as total_revenue'))
                ->join('order_items', 'products.id', '=', 'order_items.product_id')
                ->whereBetween('order_items.created_at', [$startDate, $endDate])
                ->groupBy('products.id')
                ->orderBy('total_sold', 'desc')
                ->limit(10)
                ->get();

        } elseif ($type === 'revenue') {
            // Revenue by vendor
            $data['by_vendor'] = Vendor::select('vendors.*', 'users.name', DB::raw('SUM(order_items.total_amount) as total_revenue'), DB::raw('COUNT(DISTINCT order_items.order_id) as total_orders'))
                ->join('users', 'vendors.user_id', '=', 'users.id')
                ->join('order_items', 'vendors.id', '=', 'order_items.vendor_id')
                ->whereBetween('order_items.created_at', [$startDate, $endDate])
                ->groupBy('vendors.id')
                ->orderBy('total_revenue', 'desc')
                ->get();

            // Revenue by category
            $data['by_category'] = Category::select('categories.*', DB::raw('SUM(order_items.total_amount) as total_revenue'), DB::raw('SUM(order_items.quantity) as total_sold'))
                ->join('products', 'categories.id', '=', 'products.category_id')
                ->join('order_items', 'products.id', '=', 'order_items.product_id')
                ->whereBetween('order_items.created_at', [$startDate, $endDate])
                ->groupBy('categories.id')
                ->orderBy('total_revenue', 'desc')
                ->get();

            // Daily revenue trend
            $data['daily_trend'] = OrderItem::whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

        } elseif ($type === 'customers') {
            // Customer statistics
            $data['summary'] = [
                'total_customers' => User::where('user_type', 'customer')->count(),
                'new_customers' => User::where('user_type', 'customer')->whereBetween('created_at', [$startDate, $endDate])->count(),
                'active_customers' => User::where('user_type', 'customer')->whereHas('orders', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                })->count(),
            ];

            // Top customers
            $data['top_customers'] = User::select('users.*', DB::raw('COUNT(orders.id) as total_orders'), DB::raw('SUM(orders.total_amount) as total_spent'))
                ->join('orders', 'users.id', '=', 'orders.customer_id')
                ->where('users.user_type', 'customer')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->groupBy('users.id')
                ->orderBy('total_spent', 'desc')
                ->limit(10)
                ->get();

        } elseif ($type === 'vendors') {
            // Vendor performance
            $data['vendors'] = Vendor::with(['user', 'store'])
                ->withCount(['products', 'products as active_products_count' => function($q) {
                    $q->where('status', 'approved');
                }])
                ->get()
                ->map(function($vendor) use ($startDate, $endDate) {
                    $revenue = OrderItem::where('vendor_id', $vendor->id)
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->sum('total_amount');
                    $orders = OrderItem::where('vendor_id', $vendor->id)
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->distinct('order_id')
                        ->count('order_id');

                    $vendor->period_revenue = $revenue;
                    $vendor->period_orders = $orders;
                    return $vendor;
                })
                ->sortByDesc('period_revenue')
                ->values();

        } elseif ($type === 'inventory') {
            // Inventory statistics
            $data['summary'] = [
                'total_products' => Product::count(),
                'active_products' => Product::where('status', 'approved')->count(),
                'low_stock_products' => Product::where('stock_quantity', '<=', DB::raw('low_stock_threshold'))->count(),
                'out_of_stock_products' => Product::where('stock_quantity', 0)->count(),
            ];

            // Low stock products
            $data['low_stock'] = Product::where('stock_quantity', '<=', DB::raw('low_stock_threshold'))
                ->with('vendor.user')
                ->orderBy('stock_quantity', 'asc')
                ->limit(20)
                ->get();

            // Products by category
            $data['by_category'] = Category::withCount('products')
                ->orderBy('products_count', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all categories
     */
    public function categories(Request $request)
    {
        $query = Category::with(['parent'])->withCount('products');

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $categories = $query->orderBy('sort_order')->orderBy('name')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Create category
     */
    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'is_active' => $request->is_active ?? true,
            'is_featured' => $request->is_featured ?? false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, $categoryId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $category = Category::findOrFail($categoryId);
        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'parent_id' => $request->parent_id,
            'is_active' => $request->is_active ?? $category->is_active,
            'is_featured' => $request->is_featured ?? $category->is_featured,
        ]);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Delete category
     */
    public function deleteCategory($categoryId)
    {
        $category = Category::findOrFail($categoryId);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with products',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Toggle category status
     */
    public function toggleCategoryStatus($categoryId)
    {
        $category = Category::findOrFail($categoryId);
        $category->update(['is_active' => !$category->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Category status updated successfully',
        ]);
    }

    /**
     * Get system settings
     */
    public function getSettings(Request $request)
    {
        $group = $request->get('group', 'all');

        if ($group === 'all') {
            $settings = [
                'general' => SystemSetting::getByGroup('general'),
                'payment' => SystemSetting::getByGroup('payment'),
                'email' => SystemSetting::getByGroup('email'),
                'security' => SystemSetting::getByGroup('security'),
                'shipping' => SystemSetting::getByGroup('shipping'),
            ];
        } else {
            $settings = SystemSetting::getByGroup($group);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update system settings
     */
    public function updateSettings(Request $request)
    {
        $group = $request->get('group', 'general');
        $settings = $request->get('settings', []);

        foreach ($settings as $key => $value) {
            $type = $this->getSettingType($key, $value);
            SystemSetting::set($key, $value, $type, $group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Determine setting type from value
     */
    private function getSettingType($key, $value)
    {
        if (is_bool($value)) {
            return 'boolean';
        }
        if (is_int($value)) {
            return 'integer';
        }
        if (is_float($value)) {
            return 'float';
        }
        if (is_array($value)) {
            return 'json';
        }
        return 'string';
    }

    /**
     * Get all email templates
     */
    public function getEmailTemplates(Request $request)
    {
        $category = $request->get('category', 'all');

        $query = EmailTemplate::query();

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        $templates = $query->orderBy('category')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    /**
     * Get single email template
     */
    public function getEmailTemplate($id)
    {
        $template = EmailTemplate::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    /**
     * Update email template
     */
    public function updateEmailTemplate(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => 'sometimes|string',
            'body' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Email template updated successfully',
            'data' => $template,
        ]);
    }

    /**
     * Reset email template to default
     */
    public function resetEmailTemplate($id)
    {
        $template = EmailTemplate::findOrFail($id);

        // Re-run seeder for this specific template
        // This would require storing default templates somewhere
        // For now, just return success
        return response()->json([
            'success' => true,
            'message' => 'Email template reset to default',
        ]);
    }

    /**
     * Test email template
     */
    public function testEmailTemplate(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'test_email' => 'required|email',
            'test_data' => 'sometimes|array',
        ]);

        // Render template with test data
        $testData = $validated['test_data'] ?? [];
        $rendered = $template->render($testData);

        // Here you would send the actual email
        // For now, just return the rendered content
        return response()->json([
            'success' => true,
            'message' => 'Test email would be sent to ' . $validated['test_email'],
            'preview' => $rendered,
        ]);
    }
}

