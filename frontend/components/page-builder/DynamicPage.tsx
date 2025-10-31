'use client';

import { useState, useEffect } from 'react';
import DynamicSection from './DynamicSection';

interface PageSection {
  id: number;
  component_type: string;
  component_name?: string;
  container_width?: string;
  background_color?: string;
  background_image?: string;
  padding_top?: number;
  padding_bottom?: number;
  settings: any;
  status: string;
}

interface Page {
  id: number;
  name: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  sections: PageSection[];
}

interface DynamicPageProps {
  slug?: string;
  isHomepage?: boolean;
}

export default function DynamicPage({ slug, isHomepage = false }: DynamicPageProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug, isHomepage]);

  const fetchPage = async () => {
    try {
      const url = isHomepage 
        ? '/api/v1/pages/homepage'
        : `/api/v1/pages/${slug}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPage(data.data);
      } else {
        setError(data.message || 'Page not found');
      }
    } catch (err) {
      setError('Failed to load page');
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The page you are looking for does not exist.'}</p>
          <a href="/" className="text-blue-600 hover:underline">Go back to homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.sections && page.sections.length > 0 ? (
        page.sections.map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))
      ) : (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">{page.name}</h1>
          <p className="text-gray-600">This page has no content yet.</p>
        </div>
      )}
    </div>
  );
}

