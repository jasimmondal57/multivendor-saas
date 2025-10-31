'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PendingVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      const response = await api.get('/v1/admin/vendors/pending');
      if (response.data.success) {
        setVendors(response.data.data.vendors.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: number) => {
    if (!confirm('Are you sure you want to approve this vendor?')) return;

    try {
      const response = await api.post(`/v1/admin/vendors/${vendorId}/approve`);
      if (response.data.success) {
        alert('Vendor approved successfully!');
        fetchPendingVendors();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await api.post(`/v1/admin/vendors/${vendorId}/reject`, {
        reason: rejectionReason,
      });
      if (response.data.success) {
        alert('Vendor rejected successfully!');
        setShowModal(false);
        setRejectionReason('');
        setSelectedVendor(null);
        fetchPendingVendors();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject vendor');
    }
  };

  const openRejectModal = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Pending Vendor Approvals
          </h1>
          <p className="text-gray-600">Review and approve vendor onboarding applications</p>
        </div>

        {vendors.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
            <p className="text-gray-600">No pending vendor applications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{vendor.vendor?.business_name}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📧 {vendor.vendor?.user?.email}</span>
                      <span>📱 {vendor.vendor?.business_phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      {vendor.verification_status}
                    </span>
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {vendor.progress_percentage}% Complete
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Business Type</h3>
                    <p className="text-gray-800 capitalize">{vendor.vendor?.business_type}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Category</h3>
                    <p className="text-gray-800">{vendor.vendor?.business_category || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Location</h3>
                    <p className="text-gray-800">
                      {vendor.vendor?.business_city}, {vendor.vendor?.business_state}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Submitted</h3>
                    <p className="text-gray-800">{new Date(vendor.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* KYC Documents */}
                {vendor.vendor?.kyc_documents && vendor.vendor.kyc_documents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">KYC Documents</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vendor.vendor.kyc_documents.map((doc: any) => (
                        <div key={doc.id} className="bg-gray-50 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-2">📄</div>
                          <p className="text-xs font-semibold text-gray-600 mb-1 capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              doc.verification_status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : doc.verification_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {doc.verification_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Account */}
                {vendor.vendor?.bank_account && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Bank Account</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Account Holder:</span>
                          <p className="font-semibold">{vendor.vendor.bank_account.account_holder_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Bank:</span>
                          <p className="font-semibold">{vendor.vendor.bank_account.bank_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">IFSC:</span>
                          <p className="font-semibold">{vendor.vendor.bank_account.ifsc_code}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Store Details */}
                {vendor.vendor?.store && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Store Details</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-semibold text-gray-800 mb-2">{vendor.vendor.store.store_name}</p>
                      <p className="text-sm text-gray-600 mb-3">{vendor.vendor.store.store_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Support Email:</span>
                          <p className="font-semibold">{vendor.vendor.store.customer_support_email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Support Phone:</span>
                          <p className="font-semibold">{vendor.vendor.store.customer_support_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => openRejectModal(vendor)}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(vendor.vendor_id)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    ✅ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reject Vendor Application</h2>
            <p className="text-gray-600 mb-6">
              Please provide a reason for rejecting <strong>{selectedVendor?.vendor?.business_name}</strong>
            </p>

            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectionReason('');
                  setSelectedVendor(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedVendor?.vendor_id)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

