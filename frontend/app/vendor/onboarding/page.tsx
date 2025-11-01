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
  const [storeDetails, setStoreDetails] = useState(() => {
    let cleanPhone = user?.phone || '';
    if (cleanPhone) {
      cleanPhone = cleanPhone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '').slice(-10);
    }

    return {
      store_name: '',
      store_description: '',
      store_logo: '',
      store_banner: '',
      customer_support_email: user?.email || '',
      customer_support_phone: cleanPhone,
    };
  });

  // Step 5: Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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

      // Also update store support details
      setStoreDetails(prev => ({
        ...prev,
        customer_support_phone: cleanPhone,
        customer_support_email: user.email || '',
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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post('/v1/vendor/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const newDoc = {
          type: docType,
          url: response.data.data.full_url,
          number: '',
          filename: file.name,
        };
        setDocuments(prev => {
          // Remove existing document of same type
          const filtered = prev.filter(d => d.type !== docType);
          return [...filtered, newDoc];
        });
        alert('Document uploaded successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveDocument = (docType: string) => {
    setDocuments(prev => prev.filter(d => d.type !== docType));
  };

  const handleStep5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/vendor/onboarding/documents', { documents });
      if (response.data.success) {
        // Redirect to verification pending page instead of dashboard
        router.push('/vendor/verification-pending');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete onboarding');
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
                    className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                    value={storeDetails.customer_support_email}
                    readOnly
                    title="Support email is taken from your registered account"
                  />
                  <p className="text-xs text-gray-500 mt-1">Using your registered email address</p>
                </div>

                <div>
                  <label className={labelClass}>Customer Support Phone *</label>
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
                      value={storeDetails.customer_support_phone}
                      readOnly
                      title="Support phone is taken from your registered account"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Using your registered phone number</p>
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

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Shipping & Return Policies</h4>
                    <p className="text-sm text-blue-800">
                      Shipping and return policies are managed centrally by the platform admin to ensure consistent customer experience across all vendors.
                    </p>
                  </div>
                </div>
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

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Document Upload - Optional</h4>
                    <p className="text-sm text-blue-800">
                      Upload your KYC documents now or skip and upload later from your vendor dashboard.
                      Supported formats: JPG, PNG, PDF (Max 10MB per file)
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Upload Cards */}
              <div className="space-y-4">
                {/* PAN Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        PAN Card
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Upload a clear copy of your PAN card</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Optional</span>
                  </div>
                  {documents.find(d => d.type === 'pan_card') ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{documents.find(d => d.type === 'pan_card')?.filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('pan_card')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={(e) => handleDocumentUpload(e, 'pan_card')}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          {uploadingDoc ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 10MB)</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* GST Certificate (only if GST registered) */}
                {kycDetails.gst_registered && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          GST Certificate
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Upload your GST registration certificate</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Optional</span>
                    </div>
                    {documents.find(d => d.type === 'gst_certificate') ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{documents.find(d => d.type === 'gst_certificate')?.filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('gst_certificate')}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,application/pdf"
                          onChange={(e) => handleDocumentUpload(e, 'gst_certificate')}
                          disabled={uploadingDoc}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            {uploadingDoc ? 'Uploading...' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 10MB)</p>
                        </div>
                      </label>
                    )}
                  </div>
                )}

                {/* Cancelled Cheque */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Cancelled Cheque
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Upload a cancelled cheque for bank verification</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Optional</span>
                  </div>
                  {documents.find(d => d.type === 'cancelled_cheque') ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{documents.find(d => d.type === 'cancelled_cheque')?.filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('cancelled_cheque')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={(e) => handleDocumentUpload(e, 'cancelled_cheque')}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          {uploadingDoc ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 10MB)</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Address Proof */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address Proof
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Upload address proof (Aadhaar, Utility Bill, etc.)</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Optional</span>
                  </div>
                  {documents.find(d => d.type === 'address_proof') ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{documents.find(d => d.type === 'address_proof')?.filename}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('address_proof')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={(e) => handleDocumentUpload(e, 'address_proof')}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          {uploadingDoc ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 10MB)</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Summary */}
              {documents.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{documents.length} document(s) uploaded</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button type="submit" disabled={loading || uploadingDoc} className={buttonClass}>
                  {loading ? 'Submitting...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

