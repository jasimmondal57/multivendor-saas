'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function VendorVerificationPending() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/vendor/login');
    } else if (user && user.user_type !== 'vendor') {
      router.push('/');
    } else if (user) {
      checkVerificationStatus();
    }
  }, [user, authLoading, router]);

  const checkVerificationStatus = async () => {
    try {
      const response = await api.get('/v1/vendor/onboarding/status');
      if (response.data.success) {
        const data = response.data.data;
        setOnboardingData(data);

        // If not completed onboarding, redirect to onboarding
        if (!data.is_completed) {
          router.push('/vendor/onboarding');
          return;
        }

        // If approved, redirect to dashboard
        if (data.onboarding?.verification_status === 'approved') {
          router.push('/vendor/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    const status = onboardingData?.onboarding?.verification_status;
    
    switch (status) {
      case 'in_review':
      case 'pending':
        return {
          icon: '⏳',
          title: 'Application Under Review',
          message: 'Your vendor application is currently being reviewed by our team. This usually takes 1-2 business days.',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Application Rejected',
          message: onboardingData?.onboarding?.rejection_reason || 'Your application has been rejected. Please contact support for more information.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconBg: 'bg-red-100',
        };
      default:
        return {
          icon: '⏳',
          title: 'Verification Pending',
          message: 'Your application is pending verification.',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconBg: 'bg-gray-100',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Verification</h1>
          <p className="text-gray-600">Track your application status</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-6 mb-6`}>
            <div className="flex items-start gap-4">
              <div className={`${statusInfo.iconBg} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${statusInfo.textColor} mb-2`}>{statusInfo.title}</h2>
                <p className={`${statusInfo.textColor}`}>{statusInfo.message}</p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Application Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Submitted On</div>
                <div className="font-semibold text-gray-900">
                  {onboardingData?.onboarding?.submitted_at 
                    ? new Date(onboardingData.onboarding.submitted_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className="font-semibold text-gray-900 capitalize">
                  {onboardingData?.onboarding?.verification_status?.replace('_', ' ') || 'Pending'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Business Name</div>
                <div className="font-semibold text-gray-900">
                  {onboardingData?.vendor?.business_name || 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Progress</div>
                <div className="font-semibold text-gray-900">
                  {onboardingData?.onboarding?.progress_percentage || 0}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Steps Status */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Completed Steps</h3>
            <div className="space-y-2">
              {[
                { step: 1, label: 'Business Information', completed: onboardingData?.step_1_completed },
                { step: 2, label: 'KYC Details', completed: onboardingData?.step_2_completed },
                { step: 3, label: 'Bank Account', completed: onboardingData?.step_3_completed },
                { step: 4, label: 'Store Setup', completed: onboardingData?.step_4_completed },
                { step: 5, label: 'Documents', completed: onboardingData?.step_5_completed },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {item.completed ? '✓' : item.step}
                  </div>
                  <span className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={checkVerificationStatus}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh Status
          </button>
          
          {onboardingData?.onboarding?.verification_status === 'rejected' && (
            <button
              onClick={() => router.push('/vendor/onboarding')}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              📝 Resubmit Application
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your application status, please contact our support team.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:support@example.com"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </a>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/vendor/login');
            }}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

