'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#011F5B]/95 backdrop-blur-md shadow-sm border-b border-blue-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-white text-[#011F5B] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold tracking-tight">Penn CURF</span>
              <span className="text-xs text-blue-200 font-medium tracking-wide">Research Directory</span>
            </div>
          </Link>

          <div className="flex items-center space-x-6 text-sm font-medium">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated && user ? (
              <>
                <Link href="/search" className="text-blue-100 hover:text-white transition-colors">
                  Find Research
                </Link>
                <Link href="/profile" className="text-blue-100 hover:text-white transition-colors">
                  My Profile
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <span className="hidden sm:inline">{user.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">Penn Student</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-blue-100 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 bg-white text-[#011F5B] rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
