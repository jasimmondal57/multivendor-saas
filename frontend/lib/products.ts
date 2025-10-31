import api from './api';

export interface Product {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  mrp: string;
  selling_price: string;
  discount_percentage: string;
  gst_percentage: string;
  stock_quantity: number;
  stock_status: string;
  is_featured: boolean;
  rating: string;
  review_count: number;
  category: Category;
  vendor: Vendor;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string | null;
}

export interface Vendor {
  id: number;
  uuid: string;
  business_name: string;
  rating: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const productsService = {
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>('/v1/products', { params });
    return response.data;
  },

  async getFeaturedProducts(): Promise<{ success: boolean; data: Product[] }> {
    const response = await api.get<{ success: boolean; data: Product[] }>('/v1/products/featured');
    return response.data;
  },

  async getProduct(slug: string): Promise<{ success: boolean; data: Product }> {
    const response = await api.get<{ success: boolean; data: Product }>(`/v1/products/${slug}`);
    return response.data;
  },

  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    const response = await api.get<{ success: boolean; data: Category[] }>('/v1/categories');
    return response.data;
  },
};

