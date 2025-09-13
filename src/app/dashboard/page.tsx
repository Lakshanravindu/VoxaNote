"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Role-based redirect
      switch (user.role) {
        case 'reader':
          router.push('/reader');
          break;
        case 'writer':
          router.push('/writer');
          break;
        case 'admin':
          router.push('/admin');
          break;
        default:
          // If role is not recognized, redirect to login
          router.push('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router, isAuthenticated, user]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
