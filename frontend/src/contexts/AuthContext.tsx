'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  username: string;
  penn_verified: boolean;
  has_profile: boolean;
  profile_id?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (username: string, password: string, confirmPassword: string, pennConfirmed: boolean) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Verify token on mount and refresh user data
  useEffect(() => {
    if (!token) return;

    // Verify token is still valid by fetching user data
    fetchWithAuth('/api/auth/me')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token invalid');
        }
        return response.json();
      })
      .then((userData: User) => {
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      })
      .catch(() => {
        // Token is invalid, clear auth state
        logout();
      });
  }, [token]);

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }, [token]);

  const login = useCallback(async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: AuthResponse = await response.json();

    // Store auth data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    // Dispatch custom event to notify ProfileContext about auth changes
    window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: data.user }));

    return data;
  }, []);

  const register = useCallback(async (
    username: string,
    password: string,
    confirmPassword: string,
    pennConfirmed: boolean
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        confirm_password: confirmPassword,
        penn_confirmed: pennConfirmed,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data: AuthResponse = await response.json();

    // Store auth data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetchWithAuth('/api/auth/me');
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        // Dispatch custom event to notify ProfileContext about auth changes
        window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: userData }));
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  }, [token, fetchWithAuth]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Hook for getting the auth token for API calls
export function useAuthToken(): string | null {
  const { token } = useAuth();
  return token;
}

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
