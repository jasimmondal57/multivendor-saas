<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    protected $table = 'whatsapp_logs';

    protected $fillable = [
        'user_id',
        'whatsapp_template_id',
        'phone',
        'template_code',
        'message',
        'variables',
        'status',
        'message_id',
        'error_message',
        'response',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'variables' => 'array',
        'response' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    /**
     * User relationship
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Template relationship
     */
    public function template()
    {
        return $this->belongsTo(WhatsAppTemplate::class, 'whatsapp_template_id');
    }
}
