'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  type: string;
  position: number;
  status: string;
}

export default function EditMenuPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: 'header',
    status: 'active',
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get(`/v1/admin/menus/${params.id}`);
      if (response.data.success) {
        const menuData = response.data.data;
        setMenu(menuData);
        setFormData({
          name: menuData.name,
          location: menuData.location,
          status: menuData.status,
        });
        setItems(menuData.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      alert('Failed to load menu');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/v1/admin/menus/${params.id}`, formData);
      if (response.data.success) {
        alert('Menu updated successfully!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
      alert('Failed to update menu');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await api.delete(`/v1/admin/menus/${params.id}/items/${itemId}`);
      fetchMenu(); // Refresh
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item');
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
          <h1 className="text-2xl font-bold">Edit Menu: {menu?.name}</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Menu Details</h2>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Menu Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Menu
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Menu Items ({items.length})</h2>
          
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-gray-500">URL: {item.url} | Type: {item.type}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No menu items added yet</p>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Note: Advanced menu item editing coming soon. For now, you can delete items and manage basic menu settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

