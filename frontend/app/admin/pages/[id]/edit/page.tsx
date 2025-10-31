'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface PageSection {
  id: number;
  component_type: string;
  component_name: string;
  position: number;
  settings: any;
  status: string;
}

interface Page {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  sections: PageSection[];
}

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'custom',
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await api.get(`/v1/admin/pages/${params.id}`);
      if (response.data.success) {
        const pageData = response.data.data;
        setPage(pageData);
        setFormData({
          name: pageData.name,
          slug: pageData.slug,
          type: pageData.type,
          status: pageData.status,
          meta_title: pageData.meta_title || '',
          meta_description: pageData.meta_description || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
      alert('Failed to load page');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/v1/admin/pages/${params.id}`, formData);
      if (response.data.success) {
        alert('Page updated successfully!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Failed to update page:', error);
      alert('Failed to update page');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await api.delete(`/v1/admin/pages/${params.id}/sections/${sectionId}`);
      fetchPage(); // Refresh
    } catch (error) {
      console.error('Failed to delete section:', error);
      alert('Failed to delete section');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Page: {page?.name}</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Page Details</h2>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Page Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="custom">Custom</option>
                  <option value="landing">Landing Page</option>
                  <option value="category">Category Page</option>
                  <option value="home">Homepage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Page
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Page Sections ({page?.sections?.length || 0})</h2>
          
          {page?.sections && page.sections.length > 0 ? (
            <div className="space-y-4">
              {page.sections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{section.component_name || section.component_type}</h3>
                      <p className="text-sm text-gray-500">Type: {section.component_type} | Position: {section.position}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sections added yet</p>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Note: Advanced section editing coming soon. For now, you can delete sections and manage basic page settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

