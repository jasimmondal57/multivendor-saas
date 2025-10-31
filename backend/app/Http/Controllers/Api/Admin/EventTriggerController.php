<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EventTrigger;
use App\Models\EmailTemplate;
use App\Models\WhatsAppTemplate;
use Illuminate\Support\Facades\Validator;

class EventTriggerController extends Controller
{
    /**
     * Get all event triggers with templates
     */
    public function index(Request $request)
    {
        $query = EventTrigger::with(['emailTemplate', 'whatsappTemplate']);

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('event_category', $request->category);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $triggers = $query->orderBy('event_category')->orderBy('event_name')->get();

        return response()->json([
            'success' => true,
            'data' => $triggers,
        ]);
    }

    /**
     * Get single event trigger
     */
    public function show($id)
    {
        $trigger = EventTrigger::with(['emailTemplate', 'whatsappTemplate'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $trigger,
        ]);
    }

    /**
     * Update event trigger
     */
    public function update(Request $request, $id)
    {
        $trigger = EventTrigger::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'email_template_id' => 'nullable|exists:email_templates,id',
            'whatsapp_template_id' => 'nullable|exists:whatsapp_templates,id',
            'email_enabled' => 'boolean',
            'whatsapp_enabled' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $trigger->update($request->only([
            'email_template_id',
            'whatsapp_template_id',
            'email_enabled',
            'whatsapp_enabled',
            'is_active',
        ]));

        $trigger->load(['emailTemplate', 'whatsappTemplate']);

        return response()->json([
            'success' => true,
            'message' => 'Event trigger updated successfully',
            'data' => $trigger,
        ]);
    }

    /**
     * Get available templates for an event
     */
    public function getAvailableTemplates($id)
    {
        $trigger = EventTrigger::findOrFail($id);

        // Get templates matching the event category
        $emailTemplates = EmailTemplate::where('category', $trigger->event_category)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'subject']);

        $whatsappTemplates = WhatsAppTemplate::where('category', $trigger->event_category)
            ->where('status', 'approved')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'body']);

        return response()->json([
            'success' => true,
            'data' => [
                'email_templates' => $emailTemplates,
                'whatsapp_templates' => $whatsappTemplates,
            ],
        ]);
    }

    /**
     * Bulk update event triggers
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'triggers' => 'required|array',
            'triggers.*.id' => 'required|exists:event_triggers,id',
            'triggers.*.email_template_id' => 'nullable|exists:email_templates,id',
            'triggers.*.whatsapp_template_id' => 'nullable|exists:whatsapp_templates,id',
            'triggers.*.email_enabled' => 'boolean',
            'triggers.*.whatsapp_enabled' => 'boolean',
            'triggers.*.is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->triggers as $triggerData) {
            $trigger = EventTrigger::find($triggerData['id']);
            if ($trigger) {
                $trigger->update([
                    'email_template_id' => $triggerData['email_template_id'] ?? $trigger->email_template_id,
                    'whatsapp_template_id' => $triggerData['whatsapp_template_id'] ?? $trigger->whatsapp_template_id,
                    'email_enabled' => $triggerData['email_enabled'] ?? $trigger->email_enabled,
                    'whatsapp_enabled' => $triggerData['whatsapp_enabled'] ?? $trigger->whatsapp_enabled,
                    'is_active' => $triggerData['is_active'] ?? $trigger->is_active,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Event triggers updated successfully',
        ]);
    }

    /**
     * Get event trigger statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => EventTrigger::count(),
            'active' => EventTrigger::where('is_active', true)->count(),
            'inactive' => EventTrigger::where('is_active', false)->count(),
            'email_enabled' => EventTrigger::where('email_enabled', true)->count(),
            'whatsapp_enabled' => EventTrigger::where('whatsapp_enabled', true)->count(),
            'by_category' => EventTrigger::selectRaw('event_category, COUNT(*) as count')
                ->groupBy('event_category')
                ->get()
                ->pluck('count', 'event_category'),
            'configured' => EventTrigger::where(function($q) {
                $q->whereNotNull('email_template_id')
                  ->orWhereNotNull('whatsapp_template_id');
            })->count(),
            'not_configured' => EventTrigger::whereNull('email_template_id')
                ->whereNull('whatsapp_template_id')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
