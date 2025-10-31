'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface VendorLeave {
  id: number;
  vendor_id: number;
  from_date: string;
  to_date: string;
  reason?: string;
  type: 'holiday' | 'emergency' | 'medical' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  admin_notes?: string;
  approved_by?: number;
  approved_at?: string;
  auto_reactivate: boolean;
  created_at: string;
  approvedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

interface LeaveStats {
  pending: number;
  approved: number;
  active: number;
  completed: number;
  rejected: number;
}

export default function VendorLeaveManagement() {
  const [leaves, setLeaves] = useState<VendorLeave[]>([]);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    type: 'holiday',
    reason: '',
    auto_reactivate: true,
  });

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const response = await api.get('/v1/vendor/leaves', {
        params: { status: statusFilter },
      });
      if (response.data.success) {
        setLeaves(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/v1/vendor/leaves/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/v1/vendor/leaves', formData);
      if (response.data.success) {
        alert('Leave application submitted successfully!');
        setShowCreateModal(false);
        setFormData({
          from_date: '',
          to_date: '',
          type: 'holiday',
          reason: '',
          auto_reactivate: true,
        });
        fetchLeaves();
        fetchStats();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit leave application');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave application?')) return;
    
    try {
      const response = await api.delete(`/v1/vendor/leaves/${id}`);
      if (response.data.success) {
        alert('Leave application cancelled successfully');
        fetchLeaves();
        fetchStats();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel leave application');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      holiday: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
      medical: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
          <p className="text-gray-600">Manage your holiday and leave applications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request Leave
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <div className="text-sm text-blue-700">Approved</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-700">Active</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-sm text-gray-700">Completed</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rejected</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {['all', 'pending', 'approved', 'active', 'completed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(leave.type)}`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(leave.from_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(leave.to_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {leave.reason || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {leave.admin_notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {leave.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(leave.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No leave applications found</p>
          </div>
        )}
      </div>

      {/* Create Leave Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Leave</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="holiday">Holiday</option>
                    <option value="emergency">Emergency</option>
                    <option value="medical">Medical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    min={formData.from_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for leave..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_reactivate"
                    checked={formData.auto_reactivate}
                    onChange={(e) => setFormData({ ...formData, auto_reactivate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="auto_reactivate" className="ml-2 text-sm text-gray-700">
                    Auto-reactivate my store after leave ends
                  </label>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

