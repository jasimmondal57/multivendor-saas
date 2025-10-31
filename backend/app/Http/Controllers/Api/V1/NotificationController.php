<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    // Get user notifications
    public function index(Request $request)
    {
        $notifications = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    // Mark notification as read
    public function markAsRead(Request $request, $id)
    {
        DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    // Mark all notifications as read
    public function markAllAsRead(Request $request)
    {
        DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    // Get unread count
    public function unreadCount(Request $request)
    {
        $count = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count],
        ]);
    }
}
