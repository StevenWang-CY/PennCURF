'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export default function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // If profile is required and user doesn't have one, redirect to profile page
    if (requireProfile && user && !user.has_profile) {
      router.push('/profile');
      return;
    }
  }, [isAuthenticated, isLoading, user, requireProfile, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011F5B]"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011F5B]"></div>
      </div>
    );
  }

  // Don't render if profile is required but missing
  if (requireProfile && user && !user.has_profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011F5B] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to profile setup...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
