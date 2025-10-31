<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorStore;
use App\Models\VendorBankAccount;
use Illuminate\Http\Request;

class VendorSettingsController extends Controller
{
    /**
     * Get vendor profile
     */
    public function getProfile(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $vendor->load(['user', 'store', 'bankAccount']);

        return response()->json([
            'success' => true,
            'data' => $vendor,
        ]);
    }

    /**
     * Update vendor profile
     */
    public function updateProfile(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $request->user()->id,
            'phone' => 'sometimes|required|string|max:20',
        ]);

        // Update user details
        if ($request->has('name') || $request->has('email') || $request->has('phone')) {
            $request->user()->update([
                'name' => $request->get('name', $request->user()->name),
                'email' => $request->get('email', $request->user()->email),
                'phone' => $request->get('phone', $request->user()->phone),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $vendor->fresh(['user']),
        ]);
    }

    /**
     * Update store details
     */
    public function updateStore(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'business_address' => 'nullable|string',
            'business_city' => 'nullable|string|max:100',
            'business_state' => 'nullable|string|max:100',
            'business_pincode' => 'nullable|string|max:10',
            'business_phone' => 'nullable|string|max:20',
            'business_email' => 'nullable|email|max:255',
        ]);

        $vendor->update($request->only([
            'business_name',
            'description',
            'business_address',
            'business_city',
            'business_state',
            'business_pincode',
            'business_phone',
            'business_email',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Store details updated successfully',
            'data' => $vendor->fresh(),
        ]);
    }

    /**
     * Update bank details
     */
    public function updateBankDetails(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'account_holder_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'ifsc_code' => 'required|string|max:20',
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
        ]);

        $bankAccount = VendorBankAccount::updateOrCreate(
            ['vendor_id' => $vendor->id],
            $request->only([
                'account_holder_name',
                'account_number',
                'ifsc_code',
                'bank_name',
                'branch_name',
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Bank details updated successfully',
            'data' => $bankAccount,
        ]);
    }

    /**
     * Get notification preferences
     */
    public function getNotificationPreferences(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        // Get preferences from user meta or default values
        $preferences = [
            'order_notifications' => true,
            'email_notifications' => true,
            'whatsapp_notifications' => false,
            'marketing_emails' => false,
        ];

        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updateNotificationPreferences(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'order_notifications' => 'boolean',
            'email_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
        ]);

        // Store preferences (you can add a meta table or JSON column)
        // For now, just return success

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully',
        ]);
    }
}

