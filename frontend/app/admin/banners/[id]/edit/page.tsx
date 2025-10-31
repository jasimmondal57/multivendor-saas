'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    banner_group: 'homepage_hero',
    cta_text: '',
    cta_link: '',
    status: 'active',
  });

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await api.get(`/v1/admin/banners/${params.id}`);
      if (response.data.success) {
        const banner = response.data.data;
        setFormData({
          title: banner.title,
          subtitle: banner.subtitle || '',
          description: banner.description || '',
          banner_group: banner.banner_group,
          cta_text: banner.cta_text || '',
          cta_link: banner.cta_link || '',
          status: banner.status,
        });
      }
    } catch (error) {
      console.error('Failed to fetch banner:', error);
      alert('Failed to load banner');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/v1/admin/banners/${params.id}`, formData);
      if (response.data.success) {
        alert('Banner updated successfully!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Failed to update banner:', error);
      alert('Failed to update banner');
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Banner</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Banner Group</label>
              <select
                value={formData.banner_group}
                onChange={(e) => setFormData({ ...formData, banner_group: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="homepage_hero">Homepage Hero</option>
                <option value="category_electronics">Category - Electronics</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">CTA Text</label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Banner
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

