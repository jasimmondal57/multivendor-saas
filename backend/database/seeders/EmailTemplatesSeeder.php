<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ==================== CUSTOMER NOTIFICATIONS ====================
            [
                'code' => 'customer_order_confirmation',
                'name' => 'Order Confirmation',
                'category' => 'customer',
                'subject' => 'Order Confirmed - {{order_number}}',
                'body' => '<h1>Thank You for Your Order!</h1>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> has been confirmed successfully.</p>
<h3>Order Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Order Date: {{order_date}}</li>
<li>Total Amount: ₹{{total_amount}}</li>
<li>Payment Method: {{payment_method}}</li>
</ul>
<h3>Delivery Address:</h3>
<p>{{delivery_address}}</p>
<p>You can track your order status anytime by visiting your account.</p>
<p>Thank you for shopping with us!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'order_date', 'total_amount', 'payment_method', 'delivery_address', 'site_name']),
                'description' => 'Sent when customer places an order',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_shipped',
                'name' => 'Order Shipped',
                'category' => 'customer',
                'subject' => 'Your Order {{order_number}} Has Been Shipped!',
                'body' => '<h1>Your Order is On the Way!</h1>
<p>Dear {{customer_name}},</p>
<p>Great news! Your order <strong>{{order_number}}</strong> has been shipped.</p>
<h3>Shipping Details:</h3>
<ul>
<li>Tracking Number: {{tracking_number}}</li>
<li>Courier: {{courier_name}}</li>
<li>Estimated Delivery: {{estimated_delivery}}</li>
</ul>
<p><a href="{{tracking_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Your Order</a></p>
<p>Thank you for your patience!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'tracking_number', 'courier_name', 'estimated_delivery', 'tracking_url', 'site_name']),
                'description' => 'Sent when order is shipped',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_out_for_delivery',
                'name' => 'Out for Delivery',
                'category' => 'customer',
                'subject' => 'Your Order {{order_number}} is Out for Delivery',
                'body' => '<h1>Your Order is Out for Delivery!</h1>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> is out for delivery and will reach you soon.</p>
<h3>Delivery Details:</h3>
<ul>
<li>Expected Delivery: {{expected_delivery_time}}</li>
<li>Delivery Partner: {{delivery_partner}}</li>
<li>Contact: {{delivery_contact}}</li>
</ul>
<p>Please keep your phone handy for delivery updates.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'expected_delivery_time', 'delivery_partner', 'delivery_contact', 'site_name']),
                'description' => 'Sent when order is out for delivery',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_delivered',
                'name' => 'Order Delivered',
                'category' => 'customer',
                'subject' => 'Your Order {{order_number}} Has Been Delivered',
                'body' => '<h1>Order Delivered Successfully!</h1>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> has been delivered successfully.</p>
<p>Delivered on: {{delivery_date}}</p>
<p>We hope you love your purchase! Please take a moment to rate your experience.</p>
<p><a href="{{review_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Write a Review</a></p>
<p>Thank you for shopping with us!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'delivery_date', 'review_url', 'site_name']),
                'description' => 'Sent when order is delivered',
                'is_active' => true,
            ],
            [
                'code' => 'customer_order_cancelled',
                'name' => 'Order Cancelled',
                'category' => 'customer',
                'subject' => 'Order {{order_number}} Has Been Cancelled',
                'body' => '<h1>Order Cancelled</h1>
<p>Dear {{customer_name}},</p>
<p>Your order <strong>{{order_number}}</strong> has been cancelled.</p>
<h3>Cancellation Details:</h3>
<ul>
<li>Reason: {{cancellation_reason}}</li>
<li>Cancelled on: {{cancellation_date}}</li>
<li>Refund Amount: ₹{{refund_amount}}</li>
</ul>
<p>If you paid online, the refund will be processed within 5-7 business days.</p>
<p>If you have any questions, please contact our support team.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'cancellation_reason', 'cancellation_date', 'refund_amount', 'site_name']),
                'description' => 'Sent when order is cancelled',
                'is_active' => true,
            ],
            [
                'code' => 'customer_refund_processed',
                'name' => 'Refund Processed',
                'category' => 'customer',
                'subject' => 'Refund Processed for Order {{order_number}}',
                'body' => '<h1>Refund Processed Successfully</h1>
<p>Dear {{customer_name}},</p>
<p>Your refund for order <strong>{{order_number}}</strong> has been processed.</p>
<h3>Refund Details:</h3>
<ul>
<li>Refund Amount: ₹{{refund_amount}}</li>
<li>Transaction ID: {{transaction_id}}</li>
<li>Refund Method: {{refund_method}}</li>
<li>Processing Date: {{processing_date}}</li>
</ul>
<p>The amount will be credited to your account within 5-7 business days.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'refund_amount', 'transaction_id', 'refund_method', 'processing_date', 'site_name']),
                'description' => 'Sent when refund is processed',
                'is_active' => true,
            ],
            [
                'code' => 'customer_abandoned_cart',
                'name' => 'Abandoned Cart Reminder',
                'category' => 'customer',
                'subject' => 'You Left Something Behind! Complete Your Order',
                'body' => '<h1>Don\'t Miss Out!</h1>
<p>Dear {{customer_name}},</p>
<p>You have {{item_count}} item(s) waiting in your cart.</p>
<h3>Cart Summary:</h3>
<p>{{cart_items}}</p>
<p>Total: ₹{{cart_total}}</p>
<p><a href="{{cart_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Your Purchase</a></p>
<p>Hurry! Items in your cart are selling fast.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'item_count', 'cart_items', 'cart_total', 'cart_url', 'site_name']),
                'description' => 'Sent when customer abandons cart',
                'is_active' => true,
            ],
            [
                'code' => 'customer_wishlist_price_drop',
                'name' => 'Wishlist Price Drop',
                'category' => 'customer',
                'subject' => 'Price Drop Alert! {{product_name}}',
                'body' => '<h1>Great News! Price Dropped!</h1>
<p>Dear {{customer_name}},</p>
<p>The product <strong>{{product_name}}</strong> from your wishlist is now available at a lower price!</p>
<h3>Price Details:</h3>
<ul>
<li>Original Price: ₹{{original_price}}</li>
<li>New Price: ₹{{new_price}}</li>
<li>You Save: ₹{{savings}} ({{discount_percentage}}% OFF)</li>
</ul>
<p><a href="{{product_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Buy Now</a></p>
<p>Don\'t miss this opportunity!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'original_price', 'new_price', 'savings', 'discount_percentage', 'product_url', 'site_name']),
                'description' => 'Sent when wishlist item price drops',
                'is_active' => true,
            ],
            [
                'code' => 'customer_product_back_in_stock',
                'name' => 'Product Back in Stock',
                'category' => 'customer',
                'subject' => '{{product_name}} is Back in Stock!',
                'body' => '<h1>Good News! Product is Back!</h1>
<p>Dear {{customer_name}},</p>
<p>The product <strong>{{product_name}}</strong> you were waiting for is now back in stock!</p>
<h3>Product Details:</h3>
<ul>
<li>Product: {{product_name}}</li>
<li>Price: ₹{{product_price}}</li>
<li>Stock: {{stock_quantity}} units available</li>
</ul>
<p><a href="{{product_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Shop Now</a></p>
<p>Hurry! Limited stock available.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'product_name', 'product_price', 'stock_quantity', 'product_url', 'site_name']),
                'description' => 'Sent when out-of-stock product is back',
                'is_active' => true,
            ],
            [
                'code' => 'customer_return_request_received',
                'name' => 'Return Request Received',
                'category' => 'customer',
                'subject' => 'Return Request Received for Order {{order_number}}',
                'body' => '<h1>Return Request Received</h1>
<p>Dear {{customer_name}},</p>
<p>We have received your return request for order <strong>{{order_number}}</strong>.</p>
<h3>Return Details:</h3>
<ul>
<li>Return ID: {{return_id}}</li>
<li>Reason: {{return_reason}}</li>
<li>Requested on: {{request_date}}</li>
</ul>
<p>Our team will review your request and get back to you within 24-48 hours.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'return_id', 'return_reason', 'request_date', 'site_name']),
                'description' => 'Sent when customer requests return',
                'is_active' => true,
            ],
            [
                'code' => 'customer_return_approved',
                'name' => 'Return Request Approved',
                'category' => 'customer',
                'subject' => 'Return Approved for Order {{order_number}}',
                'body' => '<h1>Return Request Approved</h1>
<p>Dear {{customer_name}},</p>
<p>Your return request for order <strong>{{order_number}}</strong> has been approved.</p>
<h3>Next Steps:</h3>
<ul>
<li>Return ID: {{return_id}}</li>
<li>Pickup Date: {{pickup_date}}</li>
<li>Pickup Address: {{pickup_address}}</li>
</ul>
<p>Please keep the product ready for pickup. Our courier partner will collect it on the scheduled date.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'order_number', 'return_id', 'pickup_date', 'pickup_address', 'site_name']),
                'description' => 'Sent when return request is approved',
                'is_active' => true,
            ],
            [
                'code' => 'customer_welcome',
                'name' => 'Welcome Email',
                'category' => 'customer',
                'subject' => 'Welcome to {{site_name}}!',
                'body' => '<h1>Welcome to {{site_name}}!</h1>
<p>Dear {{customer_name}},</p>
<p>Thank you for joining us! We\'re excited to have you as part of our community.</p>
<h3>Get Started:</h3>
<ul>
<li>Browse thousands of products</li>
<li>Enjoy exclusive deals and offers</li>
<li>Track your orders in real-time</li>
<li>Save your favorite items to wishlist</li>
</ul>
<p><a href="{{shop_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a></p>
<p>Happy Shopping!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'shop_url', 'site_name']),
                'description' => 'Sent when customer registers',
                'is_active' => true,
            ],
            [
                'code' => 'customer_password_reset',
                'name' => 'Password Reset',
                'category' => 'customer',
                'subject' => 'Reset Your Password',
                'body' => '<h1>Password Reset Request</h1>
<p>Dear {{customer_name}},</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<p><a href="{{reset_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
<p>This link will expire in {{expiry_time}} minutes.</p>
<p>If you didn\'t request this, please ignore this email.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['customer_name', 'reset_url', 'expiry_time', 'site_name']),
                'description' => 'Sent when customer requests password reset',
                'is_active' => true,
            ],

            // ==================== VENDOR NOTIFICATIONS ====================
            [
                'code' => 'vendor_new_order',
                'name' => 'New Order Received',
                'category' => 'vendor',
                'subject' => 'New Order Received - {{order_number}}',
                'body' => '<h1>New Order Received!</h1>
<p>Dear {{vendor_name}},</p>
<p>You have received a new order <strong>{{order_number}}</strong>.</p>
<h3>Order Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Order Date: {{order_date}}</li>
<li>Customer: {{customer_name}}</li>
<li>Items: {{item_count}}</li>
<li>Order Amount: ₹{{order_amount}}</li>
<li>Your Earnings: ₹{{vendor_earnings}}</li>
</ul>
<p><a href="{{order_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
<p>Please process this order as soon as possible.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'order_number', 'order_date', 'customer_name', 'item_count', 'order_amount', 'vendor_earnings', 'order_url', 'site_name']),
                'description' => 'Sent when vendor receives new order',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_approved',
                'name' => 'Product Approved',
                'category' => 'vendor',
                'subject' => 'Product Approved - {{product_name}}',
                'body' => '<h1>Product Approved!</h1>
<p>Dear {{vendor_name}},</p>
<p>Congratulations! Your product <strong>{{product_name}}</strong> has been approved and is now live on the marketplace.</p>
<h3>Product Details:</h3>
<ul>
<li>Product Name: {{product_name}}</li>
<li>SKU: {{product_sku}}</li>
<li>Price: ₹{{product_price}}</li>
<li>Approved on: {{approval_date}}</li>
</ul>
<p><a href="{{product_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'product_sku', 'product_price', 'approval_date', 'product_url', 'site_name']),
                'description' => 'Sent when product is approved',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_product_rejected',
                'name' => 'Product Rejected',
                'category' => 'vendor',
                'subject' => 'Product Rejected - {{product_name}}',
                'body' => '<h1>Product Rejected</h1>
<p>Dear {{vendor_name}},</p>
<p>Unfortunately, your product <strong>{{product_name}}</strong> has been rejected.</p>
<h3>Rejection Details:</h3>
<ul>
<li>Product Name: {{product_name}}</li>
<li>Reason: {{rejection_reason}}</li>
<li>Rejected on: {{rejection_date}}</li>
</ul>
<p>Please review the reason and make necessary changes before resubmitting.</p>
<p><a href="{{product_edit_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Product</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'rejection_reason', 'rejection_date', 'product_edit_url', 'site_name']),
                'description' => 'Sent when product is rejected',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_low_stock_alert',
                'name' => 'Low Stock Alert',
                'category' => 'vendor',
                'subject' => 'Low Stock Alert - {{product_name}}',
                'body' => '<h1>Low Stock Alert!</h1>
<p>Dear {{vendor_name}},</p>
<p>Your product <strong>{{product_name}}</strong> is running low on stock.</p>
<h3>Stock Details:</h3>
<ul>
<li>Product: {{product_name}}</li>
<li>Current Stock: {{current_stock}} units</li>
<li>Threshold: {{threshold}} units</li>
</ul>
<p>Please restock this product to avoid missing out on sales.</p>
<p><a href="{{product_edit_url}}" style="background-color: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Stock</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'current_stock', 'threshold', 'product_edit_url', 'site_name']),
                'description' => 'Sent when product stock is low',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_payout_initiated',
                'name' => 'Payout Initiated',
                'category' => 'vendor',
                'subject' => 'Payout Initiated - ₹{{payout_amount}}',
                'body' => '<h1>Payout Initiated</h1>
<p>Dear {{vendor_name}},</p>
<p>Your payout of <strong>₹{{payout_amount}}</strong> has been initiated.</p>
<h3>Payout Details:</h3>
<ul>
<li>Payout ID: {{payout_id}}</li>
<li>Amount: ₹{{payout_amount}}</li>
<li>Period: {{payout_period}}</li>
<li>Initiated on: {{initiation_date}}</li>
<li>Bank Account: {{bank_account}}</li>
</ul>
<p>The amount will be credited to your account within 3-5 business days.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'payout_amount', 'payout_id', 'payout_period', 'initiation_date', 'bank_account', 'site_name']),
                'description' => 'Sent when payout is initiated',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_payout_completed',
                'name' => 'Payout Completed',
                'category' => 'vendor',
                'subject' => 'Payout Completed - ₹{{payout_amount}}',
                'body' => '<h1>Payout Completed Successfully</h1>
<p>Dear {{vendor_name}},</p>
<p>Your payout of <strong>₹{{payout_amount}}</strong> has been completed successfully.</p>
<h3>Payout Details:</h3>
<ul>
<li>Payout ID: {{payout_id}}</li>
<li>Amount: ₹{{payout_amount}}</li>
<li>Transaction ID: {{transaction_id}}</li>
<li>Completed on: {{completion_date}}</li>
</ul>
<p>The amount has been credited to your registered bank account.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'payout_amount', 'payout_id', 'transaction_id', 'completion_date', 'site_name']),
                'description' => 'Sent when payout is completed',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_new_review',
                'name' => 'New Review Received',
                'category' => 'vendor',
                'subject' => 'New Review for {{product_name}}',
                'body' => '<h1>New Review Received</h1>
<p>Dear {{vendor_name}},</p>
<p>You have received a new review for your product <strong>{{product_name}}</strong>.</p>
<h3>Review Details:</h3>
<ul>
<li>Product: {{product_name}}</li>
<li>Rating: {{rating}}/5 stars</li>
<li>Customer: {{customer_name}}</li>
<li>Review: {{review_text}}</li>
</ul>
<p><a href="{{product_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Review</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'product_name', 'rating', 'customer_name', 'review_text', 'product_url', 'site_name']),
                'description' => 'Sent when vendor receives new review',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_return_request',
                'name' => 'Return Request Received',
                'category' => 'vendor',
                'subject' => 'Return Request for Order {{order_number}}',
                'body' => '<h1>Return Request Received</h1>
<p>Dear {{vendor_name}},</p>
<p>A return request has been received for order <strong>{{order_number}}</strong>.</p>
<h3>Return Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Product: {{product_name}}</li>
<li>Reason: {{return_reason}}</li>
<li>Customer: {{customer_name}}</li>
</ul>
<p>Please review and take appropriate action.</p>
<p><a href="{{order_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'order_number', 'product_name', 'return_reason', 'customer_name', 'order_url', 'site_name']),
                'description' => 'Sent when return request is received',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_account_approved',
                'name' => 'Vendor Account Approved',
                'category' => 'vendor',
                'subject' => 'Welcome to {{site_name}} - Account Approved!',
                'body' => '<h1>Congratulations! Your Account is Approved</h1>
<p>Dear {{vendor_name}},</p>
<p>Great news! Your vendor account has been approved and you can now start selling on {{site_name}}.</p>
<h3>Next Steps:</h3>
<ul>
<li>Login to your vendor dashboard</li>
<li>Add your products</li>
<li>Set up your store profile</li>
<li>Start receiving orders</li>
</ul>
<p><a href="{{dashboard_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
<p>We\'re excited to have you on board!</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'dashboard_url', 'site_name']),
                'description' => 'Sent when vendor account is approved',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_account_rejected',
                'name' => 'Vendor Account Rejected',
                'category' => 'vendor',
                'subject' => 'Vendor Application Status',
                'body' => '<h1>Vendor Application Update</h1>
<p>Dear {{vendor_name}},</p>
<p>Thank you for your interest in selling on {{site_name}}.</p>
<p>Unfortunately, we are unable to approve your vendor application at this time.</p>
<h3>Rejection Reason:</h3>
<p>{{rejection_reason}}</p>
<p>If you believe this is an error or would like to reapply, please contact our support team.</p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'rejection_reason', 'site_name']),
                'description' => 'Sent when vendor account is rejected',
                'is_active' => true,
            ],
            [
                'code' => 'vendor_subscription_expiring',
                'name' => 'Subscription Expiring Soon',
                'category' => 'vendor',
                'subject' => 'Your Subscription Expires in {{days_left}} Days',
                'body' => '<h1>Subscription Expiring Soon</h1>
<p>Dear {{vendor_name}},</p>
<p>Your subscription plan <strong>{{plan_name}}</strong> will expire in <strong>{{days_left}} days</strong>.</p>
<h3>Subscription Details:</h3>
<ul>
<li>Plan: {{plan_name}}</li>
<li>Expiry Date: {{expiry_date}}</li>
<li>Renewal Amount: ₹{{renewal_amount}}</li>
</ul>
<p>Renew now to continue enjoying uninterrupted service.</p>
<p><a href="{{renewal_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
<p>Best regards,<br>{{site_name}}</p>',
                'variables' => json_encode(['vendor_name', 'plan_name', 'days_left', 'expiry_date', 'renewal_amount', 'renewal_url', 'site_name']),
                'description' => 'Sent when vendor subscription is expiring',
                'is_active' => true,
            ],

            // ==================== ADMIN NOTIFICATIONS ====================
            [
                'code' => 'admin_new_vendor_registration',
                'name' => 'New Vendor Registration',
                'category' => 'admin',
                'subject' => 'New Vendor Registration - {{vendor_name}}',
                'body' => '<h1>New Vendor Registration</h1>
<p>A new vendor has registered on the platform.</p>
<h3>Vendor Details:</h3>
<ul>
<li>Name: {{vendor_name}}</li>
<li>Email: {{vendor_email}}</li>
<li>Phone: {{vendor_phone}}</li>
<li>Business Name: {{business_name}}</li>
<li>Registration Date: {{registration_date}}</li>
</ul>
<p><a href="{{vendor_review_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Application</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['vendor_name', 'vendor_email', 'vendor_phone', 'business_name', 'registration_date', 'vendor_review_url', 'site_name']),
                'description' => 'Sent when new vendor registers',
                'is_active' => true,
            ],
            [
                'code' => 'admin_new_product_pending',
                'name' => 'New Product Pending Approval',
                'category' => 'admin',
                'subject' => 'New Product Pending Approval - {{product_name}}',
                'body' => '<h1>New Product Pending Approval</h1>
<p>A new product has been submitted for approval.</p>
<h3>Product Details:</h3>
<ul>
<li>Product Name: {{product_name}}</li>
<li>Vendor: {{vendor_name}}</li>
<li>Category: {{category}}</li>
<li>Price: ₹{{price}}</li>
<li>Submitted on: {{submission_date}}</li>
</ul>
<p><a href="{{product_review_url}}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Product</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['product_name', 'vendor_name', 'category', 'price', 'submission_date', 'product_review_url', 'site_name']),
                'description' => 'Sent when new product needs approval',
                'is_active' => true,
            ],
            [
                'code' => 'admin_payment_gateway_failure',
                'name' => 'Payment Gateway Failure',
                'category' => 'admin',
                'subject' => 'Payment Gateway Failure Alert',
                'body' => '<h1>Payment Gateway Failure</h1>
<p>A payment gateway failure has been detected.</p>
<h3>Failure Details:</h3>
<ul>
<li>Gateway: {{gateway_name}}</li>
<li>Order Number: {{order_number}}</li>
<li>Amount: ₹{{amount}}</li>
<li>Error: {{error_message}}</li>
<li>Time: {{failure_time}}</li>
</ul>
<p>Please investigate and take necessary action.</p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['gateway_name', 'order_number', 'amount', 'error_message', 'failure_time', 'site_name']),
                'description' => 'Sent when payment gateway fails',
                'is_active' => true,
            ],
            [
                'code' => 'admin_high_value_order',
                'name' => 'High Value Order Alert',
                'category' => 'admin',
                'subject' => 'High Value Order - {{order_number}}',
                'body' => '<h1>High Value Order Alert</h1>
<p>A high-value order has been placed on the platform.</p>
<h3>Order Details:</h3>
<ul>
<li>Order Number: {{order_number}}</li>
<li>Customer: {{customer_name}}</li>
<li>Amount: ₹{{order_amount}}</li>
<li>Payment Method: {{payment_method}}</li>
<li>Order Date: {{order_date}}</li>
</ul>
<p><a href="{{order_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['order_number', 'customer_name', 'order_amount', 'payment_method', 'order_date', 'order_url', 'site_name']),
                'description' => 'Sent when high-value order is placed',
                'is_active' => true,
            ],
            [
                'code' => 'admin_system_error',
                'name' => 'System Error Alert',
                'category' => 'admin',
                'subject' => 'System Error Alert - {{error_type}}',
                'body' => '<h1>System Error Alert</h1>
<p>A system error has been detected.</p>
<h3>Error Details:</h3>
<ul>
<li>Error Type: {{error_type}}</li>
<li>Error Message: {{error_message}}</li>
<li>File: {{error_file}}</li>
<li>Line: {{error_line}}</li>
<li>Time: {{error_time}}</li>
</ul>
<p>Please investigate and resolve this issue immediately.</p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['error_type', 'error_message', 'error_file', 'error_line', 'error_time', 'site_name']),
                'description' => 'Sent when system error occurs',
                'is_active' => true,
            ],
            [
                'code' => 'admin_new_customer_registration',
                'name' => 'New Customer Registration',
                'category' => 'admin',
                'subject' => 'New Customer Registration - {{customer_name}}',
                'body' => '<h1>New Customer Registration</h1>
<p>A new customer has registered on the platform.</p>
<h3>Customer Details:</h3>
<ul>
<li>Name: {{customer_name}}</li>
<li>Email: {{customer_email}}</li>
<li>Phone: {{customer_phone}}</li>
<li>Registration Date: {{registration_date}}</li>
</ul>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['customer_name', 'customer_email', 'customer_phone', 'registration_date', 'site_name']),
                'description' => 'Sent when new customer registers',
                'is_active' => true,
            ],
            [
                'code' => 'admin_bulk_order_alert',
                'name' => 'Bulk Order Alert',
                'category' => 'admin',
                'subject' => 'Bulk Order Alert - {{order_count}} Orders',
                'body' => '<h1>Bulk Order Alert</h1>
<p>Multiple orders have been placed in a short time period.</p>
<h3>Details:</h3>
<ul>
<li>Number of Orders: {{order_count}}</li>
<li>Total Value: ₹{{total_value}}</li>
<li>Time Period: {{time_period}}</li>
<li>Customer: {{customer_name}}</li>
</ul>
<p>This may require special attention for fulfillment.</p>
<p>Best regards,<br>{{site_name}} System</p>',
                'variables' => json_encode(['order_count', 'total_value', 'time_period', 'customer_name', 'site_name']),
                'description' => 'Sent when bulk orders are placed',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['code' => $template['code']],
                $template
            );
        }
    }
}
