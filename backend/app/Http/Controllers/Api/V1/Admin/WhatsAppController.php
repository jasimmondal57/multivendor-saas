<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppTemplate;
use App\Models\WhatsAppLog;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    private $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Get all WhatsApp templates
     */
    public function getTemplates(Request $request)
    {
        $category = $request->get('category', 'all');

        $query = WhatsAppTemplate::query();

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
     * Get single WhatsApp template
     */
    public function getTemplate($id)
    {
        $template = WhatsAppTemplate::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    /**
     * Create WhatsApp template
     */
    public function createTemplate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:whatsapp_templates,code',
            'name' => 'required|string',
            'category' => 'required|in:otp,customer,vendor,admin',
            'language' => 'required|string',
            'header' => 'nullable|string',
            'body' => 'required|string',
            'footer' => 'nullable|string',
            'button_type' => 'nullable|in:QUICK_REPLY,CALL_TO_ACTION,NONE',
            'buttons' => 'nullable|array',
            'variables' => 'nullable|array',
            'description' => 'nullable|string',
        ]);

        $template = WhatsAppTemplate::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'data' => $template,
        ], 201);
    }

    /**
     * Update WhatsApp template
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = WhatsAppTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'header' => 'nullable|string',
            'body' => 'sometimes|string',
            'footer' => 'nullable|string',
            'button_type' => 'nullable|in:QUICK_REPLY,CALL_TO_ACTION,NONE',
            'buttons' => 'nullable|array',
            'variables' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'description' => 'nullable|string',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'data' => $template,
        ]);
    }

    /**
     * Delete WhatsApp template
     */
    public function deleteTemplate($id)
    {
        $template = WhatsAppTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully',
        ]);
    }

    /**
     * Submit template to Meta for approval
     */
    public function submitToMeta(Request $request, $id)
    {
        $template = WhatsAppTemplate::findOrFail($id);

        $validated = $request->validate([
            'meta_template_name' => 'required|string',
        ]);

        $template->update([
            'meta_template_name' => $validated['meta_template_name'],
        ]);

        $result = $this->whatsappService->submitTemplateToMeta($template);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Template submitted to Meta for approval',
                'data' => $result,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to submit template to Meta',
            'error' => $result['error'],
        ], 400);
    }

    /**
     * Check template status from Meta
     */
    public function checkMetaStatus($id)
    {
        $template = WhatsAppTemplate::findOrFail($id);

        $result = $this->whatsappService->checkTemplateStatus($template);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 400);
    }

    /**
     * Get WhatsApp logs
     */
    public function getLogs(Request $request)
    {
        $query = WhatsAppLog::with(['user', 'template']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by phone
        if ($request->has('phone')) {
            $query->where('phone', 'like', '%' . $request->phone . '%');
        }

        // Filter by template
        if ($request->has('template_code')) {
            $query->where('template_code', $request->template_code);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Get WhatsApp statistics
     */
    public function getStats(Request $request)
    {
        $stats = [
            'total_sent' => WhatsAppLog::count(),
            'total_delivered' => WhatsAppLog::where('status', 'delivered')->count(),
            'total_read' => WhatsAppLog::where('status', 'read')->count(),
            'total_failed' => WhatsAppLog::where('status', 'failed')->count(),
            'today_sent' => WhatsAppLog::whereDate('created_at', today())->count(),
            'this_month_sent' => WhatsAppLog::whereMonth('created_at', now()->month)->count(),
        ];

        // Template-wise stats
        $templateStats = WhatsAppLog::selectRaw('template_code, count(*) as count, status')
            ->groupBy('template_code', 'status')
            ->get()
            ->groupBy('template_code');

        $stats['by_template'] = $templateStats;

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Test send WhatsApp message
     */
    public function testSend(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'template_code' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        $result = $this->whatsappService->sendTemplate(
            $validated['phone'],
            $validated['template_code'],
            $validated['variables'] ?? []
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Test message sent successfully',
                'data' => $result,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send test message',
            'error' => $result['error'],
        ], 400);
    }
}
