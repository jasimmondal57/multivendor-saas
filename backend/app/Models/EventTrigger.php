<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventTrigger extends Model
{
    protected $fillable = [
        'event_code',
        'event_name',
        'event_category',
        'description',
        'email_template_id',
        'whatsapp_template_id',
        'email_enabled',
        'whatsapp_enabled',
        'is_active',
        'available_variables',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'is_active' => 'boolean',
        'available_variables' => 'array',
    ];

    /**
     * Get the email template for this event trigger
     */
    public function emailTemplate(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class, 'email_template_id');
    }

    /**
     * Get the WhatsApp template for this event trigger
     */
    public function whatsappTemplate(): BelongsTo
    {
        return $this->belongsTo(WhatsAppTemplate::class, 'whatsapp_template_id');
    }

    /**
     * Get event trigger by code
     */
    public static function getByCode(string $code): ?self
    {
        return self::where('event_code', $code)->first();
    }

    /**
     * Check if event should send email
     */
    public function shouldSendEmail(): bool
    {
        return $this->is_active && $this->email_enabled && $this->email_template_id;
    }

    /**
     * Check if event should send WhatsApp
     */
    public function shouldSendWhatsApp(): bool
    {
        return $this->is_active && $this->whatsapp_enabled && $this->whatsapp_template_id;
    }
}
