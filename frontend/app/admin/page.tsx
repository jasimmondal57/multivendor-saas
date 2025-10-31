'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to admin login
        router.push('/admin/login');
      } else if (user.user_type === 'admin') {
        // Logged in as admin, redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        // Logged in but not admin, redirect to home
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-medium text-white">Redirecting...</div>
      </div>
    </div>
  );
}

