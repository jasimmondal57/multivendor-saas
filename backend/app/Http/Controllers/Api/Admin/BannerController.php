<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Get all banners
     */
    public function index(Request $request)
    {
        $query = Banner::query();

        // Filter by group
        if ($request->has('banner_group')) {
            $query->where('banner_group', $request->banner_group);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('subtitle', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'position');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $banners = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $banners->items(),
            'pagination' => [
                'total' => $banners->total(),
                'per_page' => $banners->perPage(),
                'current_page' => $banners->currentPage(),
                'last_page' => $banners->lastPage(),
            ],
        ]);
    }

    /**
     * Get single banner
     */
    public function show($id)
    {
        $banner = Banner::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $banner,
        ]);
    }

    /**
     * Create new banner
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'description' => 'nullable|string',
            'image_desktop' => 'nullable|string',
            'image_mobile' => 'nullable|string',
            'image_tablet' => 'nullable|string',
            'video_url' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string',
            'cta_style' => 'nullable|in:primary,secondary,outline',
            'text_color' => 'nullable|string',
            'background_color' => 'nullable|string',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'text_alignment' => 'nullable|in:left,center,right',
            'banner_group' => 'nullable|string',
            'position' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive,scheduled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $banner = Banner::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Banner created successfully',
            'data' => $banner,
        ], 201);
    }

    /**
     * Update banner
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string',
            'description' => 'nullable|string',
            'image_desktop' => 'nullable|string',
            'image_mobile' => 'nullable|string',
            'image_tablet' => 'nullable|string',
            'video_url' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string',
            'cta_style' => 'nullable|in:primary,secondary,outline',
            'text_color' => 'nullable|string',
            'background_color' => 'nullable|string',
            'overlay_opacity' => 'nullable|integer|min:0|max:100',
            'text_alignment' => 'nullable|in:left,center,right',
            'banner_group' => 'nullable|string',
            'position' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive,scheduled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $banner->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully',
            'data' => $banner,
        ]);
    }

    /**
     * Delete banner
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully',
        ]);
    }

    /**
     * Track banner click
     */
    public function trackClick($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->trackClick();

        return response()->json([
            'success' => true,
            'message' => 'Click tracked successfully',
        ]);
    }

    /**
     * Get banner analytics
     */
    public function analytics(Request $request)
    {
        $query = Banner::query();

        if ($request->has('banner_group')) {
            $query->where('banner_group', $request->banner_group);
        }

        $banners = $query->get()->map(function ($banner) {
            return [
                'id' => $banner->id,
                'title' => $banner->title,
                'banner_group' => $banner->banner_group,
                'views' => $banner->view_count,
                'clicks' => $banner->click_count,
                'ctr' => $banner->getClickThroughRate(),
                'status' => $banner->status,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }
}
