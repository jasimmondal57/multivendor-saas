<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppTemplate extends Model
{
    protected $table = 'whatsapp_templates';

    protected $fillable = [
        'code',
        'name',
        'category',
        'language',
        'header',
        'body',
        'footer',
        'button_type',
        'buttons',
        'variables',
        'meta_template_id',
        'meta_template_name',
        'status',
        'rejection_reason',
        'submitted_at',
        'approved_at',
        'is_active',
        'description',
    ];

    protected $casts = [
        'buttons' => 'array',
        'variables' => 'array',
        'is_active' => 'boolean',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Get template by code
     */
    public static function getByCode(string $code)
    {
        return self::where('code', $code)
            ->where('status', 'approved')
            ->where('is_active', true)
            ->first();
    }

    /**
     * Render template with variables
     */
    public function render(array $data): string
    {
        $message = $this->body;

        // Replace {{1}}, {{2}}, etc. with actual values
        foreach ($data as $index => $value) {
            $placeholder = '{{' . ($index + 1) . '}}';
            $message = str_replace($placeholder, $value, $message);
        }

        return $message;
    }

    /**
     * Get Meta API payload for template submission
     */
    public function getMetaPayload(): array
    {
        $components = [];

        // Header component
        if ($this->header) {
            $components[] = [
                'type' => 'HEADER',
                'format' => 'TEXT',
                'text' => $this->header,
            ];
        }

        // Body component
        $components[] = [
            'type' => 'BODY',
            'text' => $this->body,
        ];

        // Footer component
        if ($this->footer) {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $this->footer,
            ];
        }

        // Buttons component
        if ($this->buttons && count($this->buttons) > 0) {
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => $this->buttons,
            ];
        }

        return [
            'name' => $this->meta_template_name ?: $this->code,
            'language' => $this->language,
            'category' => $this->getCategoryForMeta(),
            'components' => $components,
        ];
    }

    /**
     * Get Meta category from our category
     */
    private function getCategoryForMeta(): string
    {
        // Meta categories: AUTHENTICATION, MARKETING, UTILITY
        if ($this->category === 'otp') {
            return 'AUTHENTICATION';
        }
        return 'UTILITY';
    }

    /**
     * Logs relationship
     */
    public function logs()
    {
        return $this->hasMany(WhatsAppLog::class);
    }
}
