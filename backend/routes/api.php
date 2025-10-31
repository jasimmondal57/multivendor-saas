<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ImageUploadController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\Vendor\VendorOrderController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\Vendor\VendorOnboardingController;
use App\Http\Controllers\Api\V1\Vendor\VendorLeaveManagementController;
use App\Http\Controllers\Api\V1\Vendor\VendorProductController;
use App\Http\Controllers\Api\V1\Vendor\VendorProductVariantController;
use App\Http\Controllers\Api\V1\Vendor\VendorPayoutController;
use App\Http\Controllers\Api\V1\Vendor\VendorSettingsController;
use App\Http\Controllers\Api\V1\Vendor\VendorAnalyticsController;
use App\Http\Controllers\Api\V1\Vendor\VendorNotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\VendorLeaveController;
use App\Http\Controllers\Api\V1\Admin\WhatsAppController;
use App\Http\Controllers\Api\Admin\EventTriggerController;
use App\Http\Controllers\Api\V1\OtpController;
use App\Http\Controllers\Api\V1\WhatsAppWebhookController;
use App\Http\Controllers\Api\Admin\PageController as AdminPageController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\MenuController;
use App\Http\Controllers\Api\V1\PageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Version 1
Route::prefix('v1')->group(function () {

    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [RegisterController::class, 'register']);
        Route::post('login', [LoginController::class, 'login']);
    });

    // Public product routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/featured', [ProductController::class, 'featured']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    // Public page builder routes
    Route::prefix('pages')->group(function () {
        Route::get('homepage', [PageController::class, 'getHomepage']);
        Route::get('{slug}', [PageController::class, 'getBySlug']);
    });

    Route::get('banners', [PageController::class, 'getBanners']);
    Route::post('banners/{id}/track-click', [PageController::class, 'trackBannerClick']);
    Route::get('menus/{location}', [PageController::class, 'getMenu']);
    Route::get('categories', [ProductController::class, 'categories']);

    // Public review routes
    Route::get('products/{productId}/reviews', [ReviewController::class, 'index']);

    // Public coupon routes
    Route::get('coupons', [CouponController::class, 'index']);

    // Public shipping routes
    Route::get('shipping/check-pincode/{pincode}', [\App\Http\Controllers\Api\V1\ShippingController::class, 'checkPincode']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [LogoutController::class, 'logout']);
            Route::get('user', [LoginController::class, 'user']);
        });

        // Customer routes
        Route::prefix('customer')->middleware('role:customer')->group(function () {
            // Dashboard
            Route::get('dashboard/stats', [OrderController::class, 'dashboardStats']);

            // Orders
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{id}', [OrderController::class, 'show']);
            Route::post('orders', [OrderController::class, 'store']);
            Route::post('orders/{id}/cancel', [OrderController::class, 'cancel']);
            Route::get('orders/{id}/track', [OrderController::class, 'track']);

            // Reviews
            Route::get('reviews', [ReviewController::class, 'myReviews']);
            Route::post('reviews', [ReviewController::class, 'store']);
            Route::put('reviews/{id}', [ReviewController::class, 'update']);
            Route::delete('reviews/{id}', [ReviewController::class, 'destroy']);
            Route::post('reviews/{id}/helpful', [ReviewController::class, 'markHelpful']);

            // Wishlist
            Route::get('wishlist', [WishlistController::class, 'index']);
            Route::post('wishlist', [WishlistController::class, 'store']);
            Route::delete('wishlist/{productId}', [WishlistController::class, 'destroy']);
            Route::get('wishlist/check/{productId}', [WishlistController::class, 'check']);

            // Coupons
            Route::post('coupons/validate', [CouponController::class, 'validate']);

            // Notifications
            Route::get('notifications', [NotificationController::class, 'index']);
            Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);

            // Payments
            Route::post('payments/create-order', [PaymentController::class, 'createOrder']);
            Route::post('payments/verify', [PaymentController::class, 'verifyPayment']);
            Route::post('payments/cod', [PaymentController::class, 'codPayment']);

            // Addresses
            Route::get('addresses', [AddressController::class, 'index']);
            Route::post('addresses', [AddressController::class, 'store']);
            Route::put('addresses/{id}', [AddressController::class, 'update']);
            Route::delete('addresses/{id}', [AddressController::class, 'destroy']);
            Route::post('addresses/{id}/set-default', [AddressController::class, 'setDefault']);

            // Settings
            Route::get('settings', [SettingsController::class, 'index']);
            Route::put('settings', [SettingsController::class, 'update']);
        });

        // Vendor routes
        Route::prefix('vendor')->middleware('role:vendor')->group(function () {
            // Image upload routes
            Route::post('images/upload', [ImageUploadController::class, 'uploadProductImage']);
            Route::post('images/upload-multiple', [ImageUploadController::class, 'uploadMultipleImages']);
            Route::delete('images/delete', [ImageUploadController::class, 'deleteProductImage']);

            // Dashboard
            Route::get('dashboard/stats', [VendorProductController::class, 'dashboardStats']);

            // Onboarding
            Route::get('onboarding/status', [VendorOnboardingController::class, 'status']);
            Route::post('onboarding/business-info', [VendorOnboardingController::class, 'updateBusinessInfo']);
            Route::post('onboarding/kyc-details', [VendorOnboardingController::class, 'updateKycDetails']);
            Route::post('onboarding/bank-details', [VendorOnboardingController::class, 'updateBankDetails']);
            Route::post('onboarding/store-details', [VendorOnboardingController::class, 'updateStoreDetails']);
            Route::post('onboarding/documents', [VendorOnboardingController::class, 'uploadDocuments']);

            // Products
            Route::get('products', [VendorProductController::class, 'index']);
            Route::post('products', [VendorProductController::class, 'store']);
            Route::post('products/bulk-import', [VendorProductController::class, 'bulkImport']);
            Route::get('products/low-stock', [VendorProductController::class, 'lowStockProducts']);
            Route::get('products/{id}', [VendorProductController::class, 'show']);
            Route::put('products/{id}', [VendorProductController::class, 'update']);
            Route::delete('products/{id}', [VendorProductController::class, 'destroy']);

            // Product Variants
            Route::get('products/{productId}/variants', [VendorProductVariantController::class, 'index']);
            Route::post('products/{productId}/variants', [VendorProductVariantController::class, 'store']);
            Route::put('products/{productId}/variants/{variantId}', [VendorProductVariantController::class, 'update']);
            Route::delete('products/{productId}/variants/{variantId}', [VendorProductVariantController::class, 'destroy']);
            Route::post('products/{productId}/variants/bulk-update-stock', [VendorProductVariantController::class, 'bulkUpdateStock']);

            // Orders
            Route::get('orders', [VendorOrderController::class, 'index']);
            Route::get('orders/{id}', [VendorOrderController::class, 'show']);
            Route::get('orders/statistics', [VendorOrderController::class, 'statistics']);
            Route::put('orders/{orderId}/items/{itemId}/status', [VendorOrderController::class, 'updateItemStatus']);
            Route::post('orders/{id}/ready-for-pickup', [VendorOrderController::class, 'readyForPickup']);

            // Reviews
            Route::post('reviews/{id}/response', [ReviewController::class, 'vendorResponse']);

            // Leave Management
            Route::get('leaves', [VendorLeaveManagementController::class, 'index']);
            Route::get('leaves/stats', [VendorLeaveManagementController::class, 'stats']);
            Route::post('leaves', [VendorLeaveManagementController::class, 'store']);
            Route::get('leaves/{id}', [VendorLeaveManagementController::class, 'show']);
            Route::put('leaves/{id}', [VendorLeaveManagementController::class, 'update']);
            Route::delete('leaves/{id}', [VendorLeaveManagementController::class, 'cancel']);

            // Payouts
            Route::get('payouts', [VendorPayoutController::class, 'index']);
            Route::get('payouts/statistics', [VendorPayoutController::class, 'statistics']);
            Route::get('payouts/{id}', [VendorPayoutController::class, 'show']);

            // Settings
            Route::get('settings/profile', [VendorSettingsController::class, 'getProfile']);
            Route::put('settings/profile', [VendorSettingsController::class, 'updateProfile']);
            Route::put('settings/store', [VendorSettingsController::class, 'updateStore']);
            Route::put('settings/bank', [VendorSettingsController::class, 'updateBankDetails']);
            Route::get('settings/notifications', [VendorSettingsController::class, 'getNotificationPreferences']);
            Route::put('settings/notifications', [VendorSettingsController::class, 'updateNotificationPreferences']);

            // Analytics
            Route::get('analytics/statistics', [VendorAnalyticsController::class, 'statistics']);
            Route::get('analytics/sales-trend', [VendorAnalyticsController::class, 'salesTrend']);
            Route::get('analytics/top-products', [VendorAnalyticsController::class, 'topProducts']);

            // Notifications (Real-time)
            Route::get('notifications', [VendorNotificationController::class, 'getNotifications']);
            Route::get('notifications/stats', [VendorNotificationController::class, 'getStats']);
            Route::get('analytics/category-sales', [VendorAnalyticsController::class, 'categorySales']);
        });

        // Admin routes
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            // Dashboard
            Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);
            Route::get('analytics', [AdminDashboardController::class, 'analytics']);
            Route::get('reports', [AdminDashboardController::class, 'reports']);

            // Image upload routes
            Route::post('images/upload', [ImageUploadController::class, 'uploadProductImage']);
            Route::post('images/upload-multiple', [ImageUploadController::class, 'uploadMultipleImages']);
            Route::delete('images/delete', [ImageUploadController::class, 'deleteProductImage']);

            // Vendor Management
            Route::get('vendors', [AdminDashboardController::class, 'vendors']);
            Route::get('vendors/pending', [VendorOnboardingController::class, 'pendingVendors']);
            Route::post('vendors/{vendorId}/approve', [VendorOnboardingController::class, 'approve']);
            Route::post('vendors/{vendorId}/reject', [VendorOnboardingController::class, 'reject']);
            Route::patch('vendors/{vendorId}/status', [AdminDashboardController::class, 'updateVendorStatus']);
            Route::post('vendors/{vendorId}/suspend', [AdminDashboardController::class, 'suspendVendor']);

            // Products
            Route::get('products', [AdminDashboardController::class, 'products']);
            Route::post('products/{productId}/approve', [AdminDashboardController::class, 'approveProduct']);
            Route::post('products/{productId}/reject', [AdminDashboardController::class, 'rejectProduct']);
            Route::post('products/{productId}/ban', [AdminDashboardController::class, 'banProduct']);
            Route::post('products/{productId}/unban', [AdminDashboardController::class, 'unbanProduct']);

            // Orders
            Route::get('orders', [AdminDashboardController::class, 'orders']);
            Route::patch('orders/{orderId}/status', [AdminDashboardController::class, 'updateOrderStatus']);

            // Customers
            Route::get('customers', [AdminDashboardController::class, 'customers']);
            Route::patch('users/{userId}/status', [AdminDashboardController::class, 'updateUserStatus']);

            // Reviews
            Route::get('reviews', [AdminDashboardController::class, 'reviews']);

            // Coupons
            Route::get('coupons', [AdminDashboardController::class, 'coupons']);
            Route::post('coupons', [CouponController::class, 'store']);

            // Categories
            Route::get('categories', [AdminDashboardController::class, 'categories']);
            Route::post('categories', [AdminDashboardController::class, 'createCategory']);
            Route::put('categories/{categoryId}', [AdminDashboardController::class, 'updateCategory']);
            Route::delete('categories/{categoryId}', [AdminDashboardController::class, 'deleteCategory']);
            Route::patch('categories/{categoryId}/toggle-status', [AdminDashboardController::class, 'toggleCategoryStatus']);

            // Payments
            Route::get('payments', [AdminDashboardController::class, 'payments']);

            // Vendor Leave Management
            Route::get('vendor-leaves', [VendorLeaveController::class, 'index']);
            Route::get('vendor-leaves/stats', [VendorLeaveController::class, 'stats']);
            Route::post('vendor-leaves/{leaveId}/approve', [VendorLeaveController::class, 'approve']);
            Route::post('vendor-leaves/{leaveId}/reject', [VendorLeaveController::class, 'reject']);
            Route::post('vendor-leaves/{leaveId}/complete', [VendorLeaveController::class, 'complete']);

            // System Settings
            Route::get('settings', [AdminDashboardController::class, 'getSettings']);
            Route::post('settings', [AdminDashboardController::class, 'updateSettings']);

            // Email Templates
            Route::get('email-templates', [AdminDashboardController::class, 'getEmailTemplates']);
            Route::get('email-templates/{id}', [AdminDashboardController::class, 'getEmailTemplate']);
            Route::put('email-templates/{id}', [AdminDashboardController::class, 'updateEmailTemplate']);
            Route::post('email-templates/{id}/reset', [AdminDashboardController::class, 'resetEmailTemplate']);
            Route::post('email-templates/{id}/test', [AdminDashboardController::class, 'testEmailTemplate']);

            // WhatsApp Templates
            Route::get('whatsapp-templates', [WhatsAppController::class, 'getTemplates']);
            Route::get('whatsapp-templates/{id}', [WhatsAppController::class, 'getTemplate']);
            Route::post('whatsapp-templates', [WhatsAppController::class, 'createTemplate']);
            Route::put('whatsapp-templates/{id}', [WhatsAppController::class, 'updateTemplate']);
            Route::delete('whatsapp-templates/{id}', [WhatsAppController::class, 'deleteTemplate']);
            Route::post('whatsapp-templates/{id}/submit-to-meta', [WhatsAppController::class, 'submitToMeta']);
            Route::get('whatsapp-templates/{id}/check-status', [WhatsAppController::class, 'checkMetaStatus']);
            Route::post('whatsapp/test-send', [WhatsAppController::class, 'testSend']);

            // WhatsApp Logs
            Route::get('whatsapp-logs', [WhatsAppController::class, 'getLogs']);
            Route::get('whatsapp-stats', [WhatsAppController::class, 'getStats']);

            // WhatsApp Webhook Management
            Route::get('whatsapp/webhook-info', [WhatsAppWebhookController::class, 'getWebhookInfo']);
            Route::post('whatsapp/generate-verify-token', [WhatsAppWebhookController::class, 'generateVerifyToken']);

            // Event Triggers Management
            Route::get('event-triggers', [EventTriggerController::class, 'index']);
            Route::get('event-triggers/statistics', [EventTriggerController::class, 'statistics']);
            Route::get('event-triggers/{id}', [EventTriggerController::class, 'show']);
            Route::put('event-triggers/{id}', [EventTriggerController::class, 'update']);
            Route::get('event-triggers/{id}/available-templates', [EventTriggerController::class, 'getAvailableTemplates']);
            Route::post('event-triggers/bulk-update', [EventTriggerController::class, 'bulkUpdate']);

            // Revenue Management
            Route::prefix('revenue')->group(function () {
                Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\RevenueController::class, 'dashboard']);
                Route::get('/', [\App\Http\Controllers\Api\Admin\RevenueController::class, 'index']);
                Route::get('/analytics', [\App\Http\Controllers\Api\Admin\RevenueController::class, 'analytics']);
                Route::get('/export', [\App\Http\Controllers\Api\Admin\RevenueController::class, 'export']);
            });

            // TDS Management
            Route::prefix('tds')->group(function () {
                Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\TDSController::class, 'dashboard']);
                Route::get('/', [\App\Http\Controllers\Api\Admin\TDSController::class, 'index']);
                Route::get('/certificate/{payout}', [\App\Http\Controllers\Api\Admin\TDSController::class, 'certificate']);
                Route::get('/certificate/{payout}/download', [\App\Http\Controllers\Api\Admin\TDSController::class, 'downloadCertificate']);
                Route::get('/vendor/{vendor}', [\App\Http\Controllers\Api\Admin\TDSController::class, 'vendorSummary']);
            });

            // Vendor Payout Management
            Route::prefix('payouts')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'index']);
                Route::get('/statistics', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'statistics']);
                Route::post('/calculate', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'calculate']);
                Route::post('/', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'store']);
                Route::get('/{payout}', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'show']);
                Route::post('/{payout}/process', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'process']);
                Route::post('/{payout}/complete', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'complete']);
                Route::post('/{payout}/fail', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'fail']);
            });

            // Page Builder Management
            Route::prefix('pages')->group(function () {
                Route::get('/', [AdminPageController::class, 'index']);
                Route::post('/', [AdminPageController::class, 'store']);
                Route::get('/{id}', [AdminPageController::class, 'show']);
                Route::put('/{id}', [AdminPageController::class, 'update']);
                Route::delete('/{id}', [AdminPageController::class, 'destroy']);
                Route::post('/{id}/publish', [AdminPageController::class, 'publish']);
                Route::post('/{id}/unpublish', [AdminPageController::class, 'unpublish']);
                Route::post('/{id}/duplicate', [AdminPageController::class, 'duplicate']);

                // Page Sections
                Route::get('/{pageId}/sections', [AdminPageController::class, 'getSections']);
                Route::post('/{pageId}/sections', [AdminPageController::class, 'addSection']);
                Route::put('/{pageId}/sections/{sectionId}', [AdminPageController::class, 'updateSection']);
                Route::delete('/{pageId}/sections/{sectionId}', [AdminPageController::class, 'deleteSection']);
                Route::post('/{pageId}/sections/reorder', [AdminPageController::class, 'reorderSections']);
            });

            // Banner Management
            Route::prefix('banners')->group(function () {
                Route::get('/', [BannerController::class, 'index']);
                Route::post('/', [BannerController::class, 'store']);
                Route::get('/analytics', [BannerController::class, 'analytics']);
                Route::get('/{id}', [BannerController::class, 'show']);
                Route::put('/{id}', [BannerController::class, 'update']);
                Route::delete('/{id}', [BannerController::class, 'destroy']);
                Route::post('/{id}/track-click', [BannerController::class, 'trackClick']);
            });

            // Menu Management
            Route::prefix('menus')->group(function () {
                Route::get('/', [MenuController::class, 'index']);
                Route::post('/', [MenuController::class, 'store']);
                Route::get('/{id}', [MenuController::class, 'show']);
                Route::put('/{id}', [MenuController::class, 'update']);
                Route::delete('/{id}', [MenuController::class, 'destroy']);

                // Menu Items
                Route::get('/{menuId}/items', [MenuController::class, 'getItems']);
                Route::post('/{menuId}/items', [MenuController::class, 'addItem']);
                Route::put('/{menuId}/items/{itemId}', [MenuController::class, 'updateItem']);
                Route::delete('/{menuId}/items/{itemId}', [MenuController::class, 'deleteItem']);
                Route::post('/{menuId}/items/reorder', [MenuController::class, 'reorderItems']);
            });
        });
    });

    // OTP Routes (public)
    Route::prefix('v1')->group(function () {
        Route::post('otp/send', [OtpController::class, 'send']);
        Route::post('otp/verify', [OtpController::class, 'verify']);
        Route::post('otp/resend', [OtpController::class, 'resend']);
    });

    // WhatsApp Webhook Routes (public - called by Meta)
    Route::prefix('whatsapp')->group(function () {
        // Webhook verification (GET request from Meta)
        Route::get('webhook', [WhatsAppWebhookController::class, 'verify']);
        Route::get('webhook/verify', [WhatsAppWebhookController::class, 'verify']);

        // Webhook events (POST request from Meta)
        Route::post('webhook', [WhatsAppWebhookController::class, 'handle']);
    });

    // Delhivery Webhook Routes (public - called by Delhivery)
    Route::prefix('webhooks')->group(function () {
        Route::post('delhivery', [\App\Http\Controllers\Api\V1\DelhiveryWebhookController::class, 'handle']);
        Route::get('delhivery/test', [\App\Http\Controllers\Api\V1\DelhiveryWebhookController::class, 'test']);
    });
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => now()->toDateTimeString()
    ]);
});

