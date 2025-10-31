<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportCategory;
use Illuminate\Http\Request;

class SupportCategoryController extends Controller
{
    /**
     * Get all support categories
     */
    public function index()
    {
        $categories = SupportCategory::orderBy('position')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Create new category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:support_categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'user_type' => 'required|in:customer,vendor,both',
            'position' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category = SupportCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Update category
     */
    public function update(Request $request, $id)
    {
        $category = SupportCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:support_categories,slug,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'user_type' => 'sometimes|required|in:customer,vendor,both',
            'position' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Delete category
     */
    public function destroy($id)
    {
        $category = SupportCategory::findOrFail($id);

        // Check if category has tickets
        if ($category->tickets()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with existing tickets',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}

