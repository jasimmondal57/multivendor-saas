'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  products_count?: number;
}

interface CategoryGridProps {
  settings: {
    title?: string;
    subtitle?: string;
    category_ids?: number[];
    layout?: string;
    columns?: number;
    show_product_count?: boolean;
    show_image?: boolean;
  };
}

export default function CategoryGrid({ settings }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.slice(0, 8)); // Limit to 8 categories
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = settings.columns || 4;
  const gridClass = `grid grid-cols-2 md:grid-cols-${columns} gap-6`;

  if (loading) {
    return (
      <div className="py-12">
        {settings.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{settings.title}</h2>
            {settings.subtitle && <p className="text-gray-600">{settings.subtitle}</p>}
          </div>
        )}
        <div className={gridClass}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {settings.title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{settings.title}</h2>
          {settings.subtitle && <p className="text-gray-600">{settings.subtitle}</p>}
        </div>
      )}

      <div className={gridClass}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            {settings.show_image && (
              <div className="relative h-40 bg-gray-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              {settings.show_product_count && category.products_count !== undefined && (
                <p className="text-sm text-gray-500">{category.products_count} products</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

