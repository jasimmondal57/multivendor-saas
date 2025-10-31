<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupportTicket extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'user_type',
        'vendor_id',
        'support_category_id',
        'subject',
        'description',
        'attachments',
        'order_id',
        'product_id',
        'return_order_id',
        'priority',
        'status',
        'assigned_to',
        'assigned_at',
        'resolution_notes',
        'resolved_at',
        'closed_at',
        'rating',
        'feedback',
        'first_response_at',
        'last_response_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'first_response_at' => 'datetime',
        'last_response_at' => 'datetime',
        'rating' => 'integer',
    ];

    /**
     * Generate unique ticket number
     */
    public static function generateTicketNumber(): string
    {
        do {
            $number = 'TKT-' . strtoupper(substr(uniqid(), -10));
        } while (self::where('ticket_number', $number)->exists());

        return $number;
    }

    /**
     * Get the user who created the ticket
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vendor (if vendor created the ticket)
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the category
     */
    public function category()
    {
        return $this->belongsTo(SupportCategory::class, 'support_category_id');
    }

    /**
     * Get the assigned admin
     */
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get related order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get related product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get related return order
     */
    public function returnOrder()
    {
        return $this->belongsTo(ReturnOrder::class);
    }

    /**
     * Get all messages
     */
    public function messages()
    {
        return $this->hasMany(SupportTicketMessage::class);
    }

    /**
     * Get public messages (exclude internal notes)
     */
    public function publicMessages()
    {
        return $this->hasMany(SupportTicketMessage::class)->where('is_internal_note', false);
    }

    /**
     * Get internal notes (admin only)
     */
    public function internalNotes()
    {
        return $this->hasMany(SupportTicketMessage::class)->where('is_internal_note', true);
    }

    /**
     * Scope for open tickets
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'assigned', 'in_progress', 'waiting_customer', 'waiting_vendor']);
    }

    /**
     * Scope for closed tickets
     */
    public function scopeClosed($query)
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }

    /**
     * Scope for customer tickets
     */
    public function scopeCustomer($query)
    {
        return $query->where('user_type', 'customer');
    }

    /**
     * Scope for vendor tickets
     */
    public function scopeVendor($query)
    {
        return $query->where('user_type', 'vendor');
    }

    /**
     * Scope for assigned tickets
     */
    public function scopeAssigned($query)
    {
        return $query->whereNotNull('assigned_to');
    }

    /**
     * Scope for unassigned tickets
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope for high priority
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Check if ticket is open
     */
    public function isOpen(): bool
    {
        return in_array($this->status, ['open', 'assigned', 'in_progress', 'waiting_customer', 'waiting_vendor']);
    }

    /**
     * Check if ticket is closed
     */
    public function isClosed(): bool
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    /**
     * Get unread messages count for user
     */
    public function getUnreadCountForUser(int $userId): int
    {
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->where('is_internal_note', false)
            ->count();
    }

    /**
     * Mark all messages as read for user
     */
    public function markAsReadForUser(int $userId): void
    {
        $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }
}

