<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Banner;
use App\Models\Menu;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Get page by slug
     */
    public function getBySlug($slug)
    {
        $page = Page::where('slug', $slug)
            ->with(['activeSections' => function ($query) {
                $query->where(function ($q) {
                    $q->whereNull('start_date')
                        ->orWhere('start_date', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                });
            }])
            ->firstOrFail();

        // Check if published
        if (!$page->isPublished()) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        // Increment view count
        $page->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    /**
     * Get homepage
     */
    public function getHomepage()
    {
        $page = Page::where('type', 'home')
            ->where('status', 'published')
            ->with(['activeSections' => function ($query) {
                $query->where(function ($q) {
                    $q->whereNull('start_date')
                        ->orWhere('start_date', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                });
            }])
            ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Homepage not configured',
            ], 404);
        }

        // Increment view count
        $page->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }

    /**
     * Get active banners by group
     */
    public function getBanners(Request $request)
    {
        $group = $request->get('group', 'homepage_hero');

        $banners = Banner::active()
            ->byGroup($group)
            ->orderBy('position')
            ->get();

        // Track views
        foreach ($banners as $banner) {
            $banner->trackView();
        }

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    /**
     * Get menu by location
     */
    public function getMenu($location)
    {
        $menu = Menu::where('location', $location)
            ->where('status', 'active')
            ->with(['activeItems.activeChildren'])
            ->first();

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    /**
     * Track banner click
     */
    public function trackBannerClick($bannerId)
    {
        $banner = Banner::findOrFail($bannerId);
        $banner->trackClick();

        return response()->json([
            'success' => true,
            'message' => 'Click tracked',
        ]);
    }
}
