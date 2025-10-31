<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PageController extends Controller
{
    /**
     * Get all pages
     */
    public function index(Request $request)
    {
        $query = Page::query()->with('sections');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('slug', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $pages = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $pages->items(),
            'pagination' => [
                'total' => $pages->total(),
                'per_page' => $pages->perPage(),
                'current_page' => $pages->currentPage(),
                'last_page' => $pages->lastPage(),
            ],
        ]);
    }

    /**
     * Get single page
     */
    public function show($id)
    {
        $page = Page::with('sections')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    /**
     * Create new page
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:pages,slug',
            'type' => 'required|in:home,category,landing,custom',
            'template' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $page = Page::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Page created successfully',
            'data' => $page,
        ], 201);
    }

    /**
     * Update page
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:pages,slug,' . $id,
            'type' => 'sometimes|required|in:home,category,landing,custom',
            'template' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $page->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Page updated successfully',
            'data' => $page,
        ]);
    }

    /**
     * Delete page
     */
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'Page deleted successfully',
        ]);
    }

    /**
     * Publish page
     */
    public function publish($id)
    {
        $page = Page::findOrFail($id);
        $page->publish();

        return response()->json([
            'success' => true,
            'message' => 'Page published successfully',
            'data' => $page,
        ]);
    }

    /**
     * Unpublish page
     */
    public function unpublish($id)
    {
        $page = Page::findOrFail($id);
        $page->unpublish();

        return response()->json([
            'success' => true,
            'message' => 'Page unpublished successfully',
            'data' => $page,
        ]);
    }

    /**
     * Duplicate page
     */
    public function duplicate($id)
    {
        $page = Page::findOrFail($id);
        $newPage = $page->duplicate();

        return response()->json([
            'success' => true,
            'message' => 'Page duplicated successfully',
            'data' => $newPage,
        ]);
    }

    /**
     * Get page sections
     */
    public function getSections($pageId)
    {
        $sections = PageSection::where('page_id', $pageId)
            ->orderBy('position')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    /**
     * Add section to page
     */
    public function addSection(Request $request, $pageId)
    {
        $validator = Validator::make($request->all(), [
            'component_type' => 'required|string',
            'component_name' => 'nullable|string',
            'position' => 'nullable|integer',
            'container_width' => 'nullable|in:full,boxed',
            'settings' => 'required|array',
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
            $maxPosition = PageSection::where('page_id', $pageId)->max('position');
            $request->merge(['position' => ($maxPosition ?? -1) + 1]);
        }

        $section = PageSection::create(array_merge(
            $request->all(),
            ['page_id' => $pageId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Section added successfully',
            'data' => $section,
        ], 201);
    }

    /**
     * Update section
     */
    public function updateSection(Request $request, $pageId, $sectionId)
    {
        $section = PageSection::where('page_id', $pageId)
            ->where('id', $sectionId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'component_type' => 'sometimes|required|string',
            'component_name' => 'nullable|string',
            'position' => 'nullable|integer',
            'container_width' => 'nullable|in:full,boxed',
            'settings' => 'sometimes|required|array',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $section->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully',
            'data' => $section,
        ]);
    }

    /**
     * Delete section
     */
    public function deleteSection($pageId, $sectionId)
    {
        $section = PageSection::where('page_id', $pageId)
            ->where('id', $sectionId)
            ->firstOrFail();

        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section deleted successfully',
        ]);
    }

    /**
     * Reorder sections
     */
    public function reorderSections(Request $request, $pageId)
    {
        $validator = Validator::make($request->all(), [
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:page_sections,id',
            'sections.*.position' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($request->sections as $sectionData) {
                PageSection::where('id', $sectionData['id'])
                    ->where('page_id', $pageId)
                    ->update(['position' => $sectionData['position']]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sections reordered successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder sections',
            ], 500);
        }
    }
}
