<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    /**
     * Get all menus
     */
    public function index(Request $request)
    {
        $query = Menu::query()->with('items.children');

        if ($request->has('location')) {
            $query->where('location', $request->location);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $menus = $query->get();

        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }

    /**
     * Get single menu
     */
    public function show($id)
    {
        $menu = Menu::with('items.children')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    /**
     * Create new menu
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|unique:menus,location',
            'status' => 'nullable|in:active,inactive',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $menu = Menu::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Menu created successfully',
            'data' => $menu,
        ], 201);
    }

    /**
     * Update menu
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|unique:menus,location,' . $id,
            'status' => 'nullable|in:active,inactive',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $menu->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Menu updated successfully',
            'data' => $menu,
        ]);
    }

    /**
     * Delete menu
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu deleted successfully',
        ]);
    }

    /**
     * Get menu items
     */
    public function getItems($menuId)
    {
        $items = MenuItem::where('menu_id', $menuId)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('position')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Add menu item
     */
    public function addItem(Request $request, $menuId)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'url' => 'nullable|string',
            'type' => 'required|in:link,category,page,custom',
            'target' => 'nullable|in:_self,_blank',
            'parent_id' => 'nullable|exists:menu_items,id',
            'icon' => 'nullable|string',
            'position' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get max position if not provided
        if (!$request->has('position')) {
            $maxPosition = MenuItem::where('menu_id', $menuId)
                ->where('parent_id', $request->parent_id)
                ->max('position');
            $request->merge(['position' => ($maxPosition ?? -1) + 1]);
        }

        $item = MenuItem::create(array_merge(
            $request->all(),
            ['menu_id' => $menuId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Menu item added successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Update menu item
     */
    public function updateItem(Request $request, $menuId, $itemId)
    {
        $item = MenuItem::where('menu_id', $menuId)
            ->where('id', $itemId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'label' => 'sometimes|required|string|max:255',
            'url' => 'nullable|string',
            'type' => 'sometimes|required|in:link,category,page,custom',
            'target' => 'nullable|in:_self,_blank',
            'parent_id' => 'nullable|exists:menu_items,id',
            'icon' => 'nullable|string',
            'position' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $item->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Delete menu item
     */
    public function deleteItem($menuId, $itemId)
    {
        $item = MenuItem::where('menu_id', $menuId)
            ->where('id', $itemId)
            ->firstOrFail();

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully',
        ]);
    }

    /**
     * Reorder menu items
     */
    public function reorderItems(Request $request, $menuId)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.position' => 'required|integer',
            'items.*.parent_id' => 'nullable|exists:menu_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($request->items as $itemData) {
                MenuItem::where('id', $itemData['id'])
                    ->where('menu_id', $menuId)
                    ->update([
                        'position' => $itemData['position'],
                        'parent_id' => $itemData['parent_id'] ?? null,
                    ]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Menu items reordered successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder menu items',
            ], 500);
        }
    }
}
