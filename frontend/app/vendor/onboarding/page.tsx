'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function VendorOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Step 1: Business Information
  const [businessInfo, setBusinessInfo] = useState(() => {
    // Clean phone number on initialization
    let cleanPhone = user?.phone || '';
    if (cleanPhone) {
      cleanPhone = cleanPhone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '').slice(-10);
    }

    return {
      business_name: '',
      business_type: 'individual',
      business_category: '',
      business_description: '',
      business_address: '',
      business_city: '',
      business_state: '',
      business_pincode: '',
      contact_person_name: '',
      contact_person_phone: cleanPhone,
      contact_person_email: user?.email || '',
    };
  });

  // Step 2: KYC Details
  const [kycDetails, setKycDetails] = useState({
    pan_number: '',
    pan_holder_name: '',
    gstin: '',
    gst_registered: false,
  });

  // Step 3: Bank Details
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_type: 'current',
  });

  // Step 4: Store Details
  const [storeDetails, setStoreDetails] = useState({
    store_name: '',
    store_description: '',
    store_logo: '',
    store_banner: '',
    return_policy: '',
    shipping_policy: '',
    customer_support_email: '',
    customer_support_phone: '',
  });

  // Step 5: Documents
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchOnboardingStatus();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update contact email and phone when user data is loaded
    if (user) {
      // Clean phone number - remove country code and formatting
      let cleanPhone = user.phone || '';
      if (cleanPhone) {
        // Remove +91, spaces, dashes, parentheses
        cleanPhone = cleanPhone.replace(/[\s\-\(\)\+]/g, '');
        // Remove country code if present
        cleanPhone = cleanPhone.replace(/^91/, '');
        // Take only last 10 digits
        cleanPhone = cleanPhone.slice(-10);
      }

      setBusinessInfo(prev => ({
        ...prev,
        contact_person_phone: cleanPhone,
        contact_person_email: user.email || '',
      }));
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await api.get('/v1/vendor/onboarding/status');
      if (response.data.success) {
        setOnboardingData(response.data.data.onboarding);
        setCurrentStep(response.data.data.onboarding.current_step);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/business-info', businessInfo);
      if (response.data.success) {
        setCurrentStep(2);
        fetchOnboardingStatus();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save business information');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/kyc-details', kycDetails);
      if (response.data.success) {
        setCurrentStep(3);
        fetchOnboardingStatus();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save KYC details');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/bank-details', bankDetails);
      if (response.data.success) {
        setCurrentStep(4);
        fetchOnboardingStatus();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/store-details', storeDetails);
      if (response.data.success) {
        setCurrentStep(5);
        fetchOnboardingStatus();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save store details');
    } finally {
      setLoading(false);
    }
  };

  const handleStep5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/documents', { documents });
      if (response.data.success) {
        alert('Onboarding completed! Your application is under review.');
        router.push('/vendor/dashboard');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 5 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600">
        Step {currentStep} of 5: {getStepTitle(currentStep)}
      </div>
    </div>
  );

  const getStepTitle = (step: number) => {
    const titles = [
      'Business Information',
      'PAN & GST Details',
      'Bank Account Details',
      'Store Setup',
      'Document Upload',
    ];
    return titles[step - 1];
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
  const buttonClass =
    'px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Vendor Onboarding
          </h1>
          <p className="text-center text-gray-600 mb-8">Complete all steps to start selling on our platform</p>

          {renderProgressBar()}

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Business Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={businessInfo.business_name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Business Type *</label>
                  <select
                    required
                    className={inputClass}
                    value={businessInfo.business_type}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_type: e.target.value })}
                  >
                    <option value="individual">Individual</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Limited</option>
                    <option value="llp">LLP</option>
                    <option value="public_limited">Public Limited</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Business Category *</label>
                  <select
                    required
                    className={inputClass}
                    value={businessInfo.business_category}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={businessInfo.contact_person_name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, contact_person_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contact Phone *</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className={`${inputClass} bg-gray-100 cursor-not-allowed flex-1`}
                      value={businessInfo.contact_person_phone}
                      readOnly
                      title="Contact phone is taken from your registered account"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From your registered account (Indian mobile number)</p>
                </div>

                <div>
                  <label className={labelClass}>Contact Email *</label>
                  <input
                    type="email"
                    required
                    className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                    value={businessInfo.contact_person_email}
                    readOnly
                    title="Contact email is taken from your registered account"
                  />
                  <p className="text-xs text-gray-500 mt-1">From your registered account</p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Business Description</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={businessInfo.business_description}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, business_description: e.target.value })}
                  placeholder="Tell us about your business..."
                />
              </div>

              <div>
                <label className={labelClass}>Business Address *</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={businessInfo.business_address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, business_address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={businessInfo.business_city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_city: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={businessInfo.business_state}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_state: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className={inputClass}
                    value={businessInfo.business_pincode}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Saving...' : 'Next Step →'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: KYC Details */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">PAN & GST Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>PAN Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className={inputClass}
                    value={kycDetails.pan_number}
                    onChange={(e) => setKycDetails({ ...kycDetails, pan_number: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className={labelClass}>PAN Holder Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={kycDetails.pan_holder_name}
                    onChange={(e) => setKycDetails({ ...kycDetails, pan_holder_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="gst_registered"
                  checked={kycDetails.gst_registered}
                  onChange={(e) => setKycDetails({ ...kycDetails, gst_registered: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <label htmlFor="gst_registered" className="text-sm font-medium text-gray-700">
                  GST Registered
                </label>
              </div>

              {kycDetails.gst_registered && (
                <div>
                  <label className={labelClass}>GSTIN *</label>
                  <input
                    type="text"
                    required={kycDetails.gst_registered}
                    maxLength={15}
                    className={inputClass}
                    value={kycDetails.gstin}
                    onChange={(e) => setKycDetails({ ...kycDetails, gstin: e.target.value.toUpperCase() })}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Saving...' : 'Next Step →'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Bank Details */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bank Account Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={bankDetails.account_holder_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Account Number *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>IFSC Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    className={inputClass}
                    value={bankDetails.ifsc_code}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                  />
                </div>

                <div>
                  <label className={labelClass}>Bank Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Branch Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={bankDetails.branch_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, branch_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Account Type *</label>
                  <select
                    required
                    className={inputClass}
                    value={bankDetails.account_type}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_type: e.target.value })}
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Saving...' : 'Next Step →'}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Store Details */}
          {currentStep === 4 && (
            <form onSubmit={handleStep4Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Store Setup</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Store Name *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={storeDetails.store_name}
                    onChange={(e) => setStoreDetails({ ...storeDetails, store_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Customer Support Email *</label>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    value={storeDetails.customer_support_email}
                    onChange={(e) => setStoreDetails({ ...storeDetails, customer_support_email: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Customer Support Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className={inputClass}
                    value={storeDetails.customer_support_phone}
                    onChange={(e) => setStoreDetails({ ...storeDetails, customer_support_phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Store Description</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={storeDetails.store_description}
                  onChange={(e) => setStoreDetails({ ...storeDetails, store_description: e.target.value })}
                  placeholder="Describe your store..."
                />
              </div>

              <div>
                <label className={labelClass}>Return Policy</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={storeDetails.return_policy}
                  onChange={(e) => setStoreDetails({ ...storeDetails, return_policy: e.target.value })}
                  placeholder="e.g., 7 days return policy..."
                />
              </div>

              <div>
                <label className={labelClass}>Shipping Policy</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={storeDetails.shipping_policy}
                  onChange={(e) => setStoreDetails({ ...storeDetails, shipping_policy: e.target.value })}
                  placeholder="e.g., Ships within 2-3 business days..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Saving...' : 'Next Step →'}
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Document Upload */}
          {currentStep === 5 && (
            <form onSubmit={handleStep5Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Upload</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please upload clear, readable copies of the following documents. All documents
                  will be verified by our team.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-2">📄 PAN Card</p>
                  <input type="file" accept="image/*,application/pdf" className="text-sm" />
                </div>

                {kycDetails.gst_registered && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <p className="text-gray-600 mb-2">📄 GST Certificate</p>
                    <input type="file" accept="image/*,application/pdf" className="text-sm" />
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-2">🏦 Cancelled Cheque</p>
                  <input type="file" accept="image/*,application/pdf" className="text-sm" />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-2">📍 Address Proof</p>
                  <input type="file" accept="image/*,application/pdf" className="text-sm" />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

