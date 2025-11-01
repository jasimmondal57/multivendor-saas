'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VendorPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && user.user_type === 'vendor') {
        // If logged in as vendor, redirect to dashboard
        router.push('/vendor/dashboard');
      } else {
        // If not logged in or not a vendor, redirect to seller landing page
        router.push('/seller');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Redirecting...</div>
      </div>
    </div>
  );
}

