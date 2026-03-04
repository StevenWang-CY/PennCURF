'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import PennShieldLogo from './PennShieldLogo';

export default function NavBar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-[var(--border-subtle)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <PennShieldLogo className="h-9 w-auto text-[#011F5B] group-hover:text-[#990000] transition-colors duration-500 drop-shadow-sm" />
            <div className="flex flex-col leading-tight">
              <span className="text-[#011F5B] font-bold tracking-tight text-lg">Penn CURF</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] font-medium tracking-widest uppercase">Research Directory</span>
            </div>
          </Link>

          <div className="flex items-center space-x-8 text-sm font-medium">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated && user ? (
              <>
                <Link href="/search" className="text-[var(--color-text-secondary)] hover:text-[#011F5B] transition-colors relative group">
                  Find Research
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#011F5B] transition-all group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/profile" className="text-[var(--color-text-secondary)] hover:text-[#011F5B] transition-colors relative group">
                  My Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#011F5B] transition-all group-hover:w-full opacity-50"></span>
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[#011F5B] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#011F5B] text-xs font-bold uppercase shadow-sm">
                      {user.username.charAt(0)}
                    </div>
                    <span className="hidden sm:inline font-medium">{user.username}</span>
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-layered border border-[var(--border-subtle)] py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-700">Penn Student</p>
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
                <Link href="/auth/login" className="text-[var(--color-text-secondary)] hover:text-[#011F5B] transition-colors font-medium">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 bg-[#011F5B] text-white rounded-full text-sm font-medium hover:bg-[#003366] hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
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
