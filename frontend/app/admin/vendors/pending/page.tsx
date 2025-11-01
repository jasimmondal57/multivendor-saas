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
        setVendors(response.data.data.data || []);
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

                {/* Business Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Business Type</h4>
                      <p className="text-gray-900 font-medium capitalize">{vendor.vendor?.business_type || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Category</h4>
                      <p className="text-gray-900 font-medium">{vendor.vendor?.business_category || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Submitted On</h4>
                      <p className="text-gray-900 font-medium">
                        {vendor.submitted_at ? new Date(vendor.submitted_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Business Address</h4>
                      <p className="text-gray-900 font-medium text-sm">{vendor.vendor?.business_address || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">City & State</h4>
                      <p className="text-gray-900 font-medium">
                        {vendor.vendor?.business_city}, {vendor.vendor?.business_state}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Pincode</h4>
                      <p className="text-gray-900 font-medium">{vendor.vendor?.business_pincode || 'N/A'}</p>
                    </div>
                  </div>
                  {vendor.vendor?.business_description && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Business Description</h4>
                      <p className="text-gray-900 text-sm">{vendor.vendor.business_description}</p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Person
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Name</h4>
                      <p className="text-gray-900 font-medium">{vendor.vendor?.contact_person_name || vendor.vendor?.user?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Email</h4>
                      <p className="text-gray-900 font-medium text-sm">{vendor.vendor?.contact_person_email || vendor.vendor?.user?.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Phone</h4>
                      <p className="text-gray-900 font-medium">+91 {vendor.vendor?.contact_person_phone || vendor.vendor?.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* KYC Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    KYC Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">PAN Number</h4>
                      <p className="text-gray-900 font-medium font-mono">{vendor.vendor?.pan_number || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">PAN Holder Name</h4>
                      <p className="text-gray-900 font-medium">{vendor.vendor?.pan_holder_name || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">GST Registered</h4>
                      <p className="text-gray-900 font-medium">
                        {vendor.vendor?.gst_registered ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-gray-500">✗ No</span>
                        )}
                      </p>
                    </div>
                    {vendor.vendor?.gst_registered && vendor.vendor?.gstin && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-600 mb-1">GSTIN</h4>
                        <p className="text-gray-900 font-medium font-mono">{vendor.vendor.gstin}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Uploaded Documents
                  </h3>
                  {vendor.vendor?.kycDocuments && vendor.vendor.kycDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendor.vendor.kycDocuments.map((doc: any) => (
                        <div key={doc.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {doc.document_type.replace(/_/g, ' ')}
                                </p>
                                {doc.document_number && (
                                  <p className="text-xs text-gray-600 font-mono">{doc.document_number}</p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-semibold ${
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
                          {doc.document_url && (
                            <a
                              href={doc.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ No documents uploaded yet. Vendor can upload documents from their dashboard.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bank Account */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Bank Account Details
                  </h3>
                  {vendor.vendor?.bankAccount ? (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Account Holder Name</h4>
                          <p className="text-gray-900 font-semibold">{vendor.vendor.bankAccount.account_holder_name}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Account Number</h4>
                          <p className="text-gray-900 font-semibold font-mono">{vendor.vendor.bankAccount.account_number}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Bank Name</h4>
                          <p className="text-gray-900 font-semibold">{vendor.vendor.bankAccount.bank_name}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">IFSC Code</h4>
                          <p className="text-gray-900 font-semibold font-mono">{vendor.vendor.bankAccount.ifsc_code}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Branch</h4>
                          <p className="text-gray-900 font-semibold">{vendor.vendor.bankAccount.branch_name || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Account Type</h4>
                          <p className="text-gray-900 font-semibold capitalize">{vendor.vendor.bankAccount.account_type || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <p className="text-yellow-800 text-sm">⚠️ Bank account details not provided</p>
                    </div>
                  )}
                </div>

                {/* Store Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Store Information
                  </h3>
                  {vendor.vendor?.store ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{vendor.vendor.store.store_name}</h4>
                        {vendor.vendor.store.store_description && (
                          <p className="text-gray-700 text-sm">{vendor.vendor.store.store_description}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Customer Support Email</h4>
                          <p className="text-gray-900 font-medium text-sm">{vendor.vendor.store.customer_support_email}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-600 mb-1">Customer Support Phone</h4>
                          <p className="text-gray-900 font-medium">+91 {vendor.vendor.store.customer_support_phone}</p>
                        </div>
                        {vendor.vendor.store.store_logo && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-xs font-semibold text-gray-600 mb-2">Store Logo</h4>
                            <img src={vendor.vendor.store.store_logo} alt="Store Logo" className="h-12 object-contain" />
                          </div>
                        )}
                        {vendor.vendor.store.store_banner && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-xs font-semibold text-gray-600 mb-2">Store Banner</h4>
                            <img src={vendor.vendor.store.store_banner} alt="Store Banner" className="h-12 object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <p className="text-yellow-800 text-sm">⚠️ Store details not provided</p>
                    </div>
                  )}
                </div>

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

