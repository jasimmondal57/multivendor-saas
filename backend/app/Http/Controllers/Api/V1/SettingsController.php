<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get user settings
     */
    public function index(Request $request)
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'email_order_updates' => true,
                'email_promotional' => true,
                'email_newsletter' => false,
                'profile_public' => false,
                'show_purchase_history' => false,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update user settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'email_order_updates' => 'sometimes|boolean',
            'email_promotional' => 'sometimes|boolean',
            'email_newsletter' => 'sometimes|boolean',
            'profile_public' => 'sometimes|boolean',
            'show_purchase_history' => 'sometimes|boolean',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $settings,
        ]);
    }
}
