<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VendorProductController extends Controller
{
    /**
     * Get vendor's products
     */
    public function index(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $query = Product::where('vendor_id', $vendor->id)
            ->with(['category']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get vendor dashboard stats
     */
    public function dashboardStats(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $stats = [
            'total_products' => Product::where('vendor_id', $vendor->id)->count(),
            'active_products' => Product::where('vendor_id', $vendor->id)->where('status', 'approved')->count(),
            'pending_products' => Product::where('vendor_id', $vendor->id)->where('status', 'pending')->count(),
            'out_of_stock' => Product::where('vendor_id', $vendor->id)->where('stock_status', 'out_of_stock')->count(),
            'low_stock' => Product::where('vendor_id', $vendor->id)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->where('stock_status', '!=', 'out_of_stock')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get single product
     */
    public function show(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $product = Product::where('vendor_id', $vendor->id)
            ->with(['category'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create new product
     */
    public function store(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'mrp' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0|lte:mrp',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'is_returnable' => 'boolean',
            'return_period_days' => 'nullable|integer|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'gst_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $discountPercentage = 0;
        if ($request->mrp > 0) {
            $discountPercentage = (($request->mrp - $request->selling_price) / $request->mrp) * 100;
        }

        $stockStatus = $request->stock_quantity > 0 ? 'in_stock' : 'out_of_stock';

        $product = Product::create([
            'vendor_id' => $vendor->id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'sku' => $request->sku,
            'description' => $request->description,
            'short_description' => $request->short_description,
            'mrp' => $request->mrp,
            'selling_price' => $request->selling_price,
            'cost_price' => $request->cost_price,
            'discount_percentage' => $discountPercentage,
            'stock_quantity' => $request->stock_quantity,
            'low_stock_threshold' => $request->get('low_stock_threshold', 10),
            'stock_status' => $stockStatus,
            'weight' => $request->weight,
            'length' => $request->length,
            'width' => $request->width,
            'height' => $request->height,
            'is_returnable' => $request->get('is_returnable', true),
            'return_period_days' => $request->get('return_period_days', 7),
            'hsn_code' => $request->hsn_code,
            'gst_percentage' => $request->get('gst_percentage', 18),
            'status' => 'pending', // Requires admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully. Waiting for admin approval.',
            'data' => $product->load('category'),
        ], 201);
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'mrp' => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'is_returnable' => 'boolean',
            'return_period_days' => 'nullable|integer|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'gst_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $data = $request->only([
            'category_id', 'name', 'sku', 'description', 'short_description',
            'mrp', 'selling_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
            'weight', 'length', 'width', 'height', 'is_returnable', 'return_period_days',
            'hsn_code', 'gst_percentage'
        ]);

        if ($request->has('name') && $request->name !== $product->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;

            while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $data['slug'] = $slug;
        }

        if ($request->has('mrp') && $request->has('selling_price')) {
            $data['discount_percentage'] = (($request->mrp - $request->selling_price) / $request->mrp) * 100;
        }

        if ($request->has('stock_quantity')) {
            $data['stock_status'] = $request->stock_quantity > 0 ? 'in_stock' : 'out_of_stock';
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['category']),
        ]);
    }

    /**
     * Delete product
     */
    public function destroy(Request $request, $id)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Get low stock products
     */
    public function lowStockProducts(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $products = Product::where('vendor_id', $vendor->id)
            ->where('status', 'approved')
            ->whereRaw('stock_quantity <= low_stock_threshold')
            ->with(['category'])
            ->orderBy('stock_quantity', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Bulk import products from CSV
     */
    public function bulkImport(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor profile not found',
            ], 404);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $csvData = array_map('str_getcsv', file($file->getRealPath()));
            $headers = array_shift($csvData); // Remove header row

            // Normalize headers (trim and lowercase)
            $headers = array_map(function($header) {
                return strtolower(trim($header));
            }, $headers);

            $imported = 0;
            $failed = 0;
            $errors = [];

            foreach ($csvData as $index => $row) {
                $rowNumber = $index + 2; // +2 because we removed header and arrays are 0-indexed

                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // Map CSV columns to array
                $data = array_combine($headers, $row);

                // Validate required fields
                if (empty($data['name']) || empty($data['sku'])) {
                    $errors[] = "Row {$rowNumber}: Name and SKU are required";
                    $failed++;
                    continue;
                }

                // Check if SKU already exists
                if (Product::where('sku', $data['sku'])->exists()) {
                    $errors[] = "Row {$rowNumber}: SKU '{$data['sku']}' already exists";
                    $failed++;
                    continue;
                }

                // Find category by name
                $category = null;
                if (!empty($data['category'])) {
                    $category = Category::where('name', $data['category'])->first();
                    if (!$category) {
                        $errors[] = "Row {$rowNumber}: Category '{$data['category']}' not found";
                        $failed++;
                        continue;
                    }
                }

                try {
                    Product::create([
                        'vendor_id' => $vendor->id,
                        'category_id' => $category ? $category->id : null,
                        'name' => $data['name'],
                        'slug' => Str::slug($data['name']),
                        'sku' => $data['sku'],
                        'description' => $data['description'] ?? null,
                        'mrp' => $data['mrp'] ?? 0,
                        'selling_price' => $data['selling_price'] ?? 0,
                        'cost_price' => $data['cost_price'] ?? null,
                        'stock_quantity' => $data['stock'] ?? 0,
                        'stock_status' => ($data['stock'] ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
                        'status' => 'pending', // All imported products need approval
                    ]);
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row {$rowNumber}: " . $e->getMessage();
                    $failed++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Import completed. {$imported} products imported, {$failed} failed.",
                'data' => [
                    'imported' => $imported,
                    'failed' => $failed,
                    'errors' => $errors,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import products: ' . $e->getMessage(),
            ], 500);
        }
    }
}

