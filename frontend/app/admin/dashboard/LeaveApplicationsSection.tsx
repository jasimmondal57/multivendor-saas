'use client';

import { useState, useEffect } from 'react';
import { vendorLeaveApi, VendorLeave, VendorLeaveStats } from '@/lib/admin';

export default function LeaveApplicationsSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [leaves, setLeaves] = useState<VendorLeave[]>([]);
  const [stats, setStats] = useState<VendorLeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<VendorLeave | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const response = await vendorLeaveApi.getVendorLeaves({ status: statusFilter });
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await vendorLeaveApi.getVendorLeaveStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedLeave) return;
    
    try {
      setActionLoading(true);
      await vendorLeaveApi.approveVendorLeave(selectedLeave.id, adminNotes);
      setShowApproveModal(false);
      setAdminNotes('');
      setSelectedLeave(null);
      fetchLeaves();
      fetchStats();
      alert('Leave application approved successfully!');
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave || !adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading(true);
      await vendorLeaveApi.rejectVendorLeave(selectedLeave.id, adminNotes);
      setShowRejectModal(false);
      setAdminNotes('');
      setSelectedLeave(null);
      fetchLeaves();
      fetchStats();
      alert('Leave application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (leave: VendorLeave) => {
    if (!confirm('Are you sure you want to complete this leave?')) return;
    
    try {
      await vendorLeaveApi.completeVendorLeave(leave.id);
      fetchLeaves();
      fetchStats();
      alert('Leave completed successfully!');
    } catch (error) {
      console.error('Error completing leave:', error);
      alert('Failed to complete leave');
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
      medical: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0 },
    { id: 'pending', label: 'Pending Approval', count: stats?.pending || 0 },
    { id: 'approved', label: 'Approved', count: stats?.approved || 0 },
    { id: 'active', label: 'Active', count: stats?.active || 0 },
    { id: 'completed', label: 'Completed', count: stats?.completed || 0 },
    { id: 'rejected', label: 'Rejected', count: stats?.rejected || 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave Applications</h2>
        <p className="text-gray-600">Manage vendor leave and holiday requests</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leave applications...</p>
          </div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
          <p className="mt-1 text-sm text-gray-500">No leave applications found for this filter.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{leave.vendor.business_name}</div>
                    <div className="text-sm text-gray-500">{leave.vendor.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(leave.type)}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.from_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.to_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowApproveModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowRejectModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {leave.status === 'active' && (
                      <button
                        onClick={() => handleComplete(leave)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Leave Application</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Vendor:</strong> {selectedLeave.vendor.business_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Period:</strong> {new Date(selectedLeave.from_date).toLocaleDateString()} - {new Date(selectedLeave.to_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Reason:</strong> {selectedLeave.reason || 'N/A'}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setAdminNotes('');
                  setSelectedLeave(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Application</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Vendor:</strong> {selectedLeave.vendor.business_name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Period:</strong> {new Date(selectedLeave.from_date).toLocaleDateString()} - {new Date(selectedLeave.to_date).toLocaleDateString()}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || !adminNotes.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setAdminNotes('');
                  setSelectedLeave(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

