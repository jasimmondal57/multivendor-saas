<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload product image
     */
    public function uploadProductImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        try {
            $image = $request->file('image');
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();

            // Store in public/products directory
            $path = $image->storeAs('products', $filename, 'public');

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => Storage::url($path),
                    'full_url' => url(Storage::url($path)),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete product image
     */
    public function deleteProductImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        try {
            if (Storage::disk('public')->exists($request->path)) {
                Storage::disk('public')->delete($request->path);

                return response()->json([
                    'success' => true,
                    'message' => 'Image deleted successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple product images
     */
    public function uploadMultipleImages(Request $request)
    {
        $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        try {
            $uploadedImages = [];

            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');

                $uploadedImages[] = [
                    'filename' => $filename,
                    'path' => $path,
                    'url' => Storage::url($path),
                    'full_url' => url(Storage::url($path)),
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => $uploadedImages,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
