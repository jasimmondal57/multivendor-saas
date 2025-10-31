/**
 * Centralized image URLs for products and categories
 * Using Unsplash for high-quality placeholder images
 */

// Product placeholder images
export const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', // Headphones
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', // Watch
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop', // Sunglasses
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop', // Smartwatch
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop', // Sneakers
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop', // Sneakers 2
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop', // Perfume
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop', // Camera
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&h=500&fit=crop', // Laptop
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop', // Phone
];

// Category images
export const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop', // Electronics
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', // Fashion
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop', // Home & Kitchen
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', // Books
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop', // Sports
];

// Product detail page images (higher resolution)
export const PRODUCT_DETAIL_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
];

// Thumbnail images for product detail page
export const PRODUCT_THUMBNAILS = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
];

// Cart/Checkout small images
export const PRODUCT_SMALL_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=200&h=200&fit=crop',
];

/**
 * Get a product image by index
 * @param index - The index of the product
 * @param size - The size variant ('small' | 'medium' | 'large')
 * @returns Image URL
 */
export function getProductImage(index: number, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const images = size === 'small' ? PRODUCT_SMALL_IMAGES : 
                 size === 'large' ? PRODUCT_DETAIL_IMAGES : 
                 PRODUCT_IMAGES;
  return images[index % images.length];
}

/**
 * Get a category image by index
 * @param index - The index of the category
 * @returns Image URL
 */
export function getCategoryImage(index: number): string {
  return CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
}

/**
 * Get product thumbnail images
 * @returns Array of thumbnail URLs
 */
export function getProductThumbnails(): string[] {
  return PRODUCT_THUMBNAILS;
}

