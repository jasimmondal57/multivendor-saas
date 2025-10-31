<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Get all addresses for the authenticated user
     */
    public function index(Request $request)
    {
        $addresses = UserAddress::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses,
        ]);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:home,work,other',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'country' => 'nullable|string|max:100',
            'landmark' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['country'] = $validated['country'] ?? 'India';

        // If this is the first address or is_default is true, set as default
        $existingAddressCount = UserAddress::where('user_id', $request->user()->id)->count();
        if ($existingAddressCount === 0 || ($validated['is_default'] ?? false)) {
            $validated['is_default'] = true;

            // Unset other default addresses
            UserAddress::where('user_id', $request->user()->id)
                ->update(['is_default' => false]);
        }

        $address = UserAddress::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address added successfully',
            'data' => $address,
        ], 201);
    }

    /**
     * Update an address
     */
    public function update(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:home,work,other',
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'address_line_1' => 'sometimes|string',
            'address_line_2' => 'nullable|string',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
            'country' => 'sometimes|string|max:100',
            'landmark' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);

        // If setting as default, unset other defaults
        if (isset($validated['is_default']) && $validated['is_default']) {
            UserAddress::where('user_id', $request->user()->id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully',
            'data' => $address,
        ]);
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $wasDefault = $address->is_default;
        $address->delete();

        // If deleted address was default, set another as default
        if ($wasDefault) {
            $newDefault = UserAddress::where('user_id', $request->user()->id)
                ->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully',
        ]);
    }

    /**
     * Set an address as default
     */
    public function setDefault(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Unset all other defaults
        UserAddress::where('user_id', $request->user()->id)
            ->where('id', '!=', $id)
            ->update(['is_default' => false]);

        // Set this as default
        $address->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Default address updated successfully',
            'data' => $address,
        ]);
    }
}
