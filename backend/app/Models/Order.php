<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'order_number',
        'invoice_number',
        'invoice_generated_at',
        'customer_id',
        'subtotal',
        'tax_amount',
        'shipping_charge',
        'discount_amount',
        'total_amount',
        'shipping_name',
        'shipping_phone',
        'shipping_email',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_pincode',
        'shipping_country',
        'billing_name',
        'billing_phone',
        'billing_email',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_pincode',
        'billing_country',
        'payment_method',
        'payment_status',
        'paid_at',
        'status',
        'awb_number',
        'courier_name',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'customer_notes',
        'admin_notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_charge' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'invoice_generated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(Str::random(10));
            }
            // Auto-generate invoice number when order is created
            if (empty($order->invoice_number)) {
                $order->invoice_number = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(8));
                $order->invoice_generated_at = now();
            }
        });
    }

    /**
     * Get the customer that owns the order
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the payment transactions
     */
    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Get the shipments for this order
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed', 'processing']);
    }

    /**
     * Check if order is delivered
     */
    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'processing' => 'indigo',
            'shipped' => 'purple',
            'out_for_delivery' => 'orange',
            'delivered' => 'green',
            'cancelled' => 'red',
            'returned' => 'gray',
            'refunded' => 'pink',
            default => 'gray',
        };
    }
}
