'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, StudentProfile } from '@/lib/api';

const STORAGE_KEY = 'studentProfileId';
const AUTH_USER_KEY = 'auth_user';  // Key used by AuthContext
const BROADCAST_CHANNEL_NAME = 'penn-curf-profile-sync';

interface ProfileContextType {
  profileId: string | null;
  profile: StudentProfile | null;
  hasProfile: boolean;
  isLoading: boolean;
  setProfileId: (id: string | null) => void;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileId, setProfileIdState] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use ref to track the broadcast channel
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Helper function to sync profile ID from auth user data
  const syncFromAuthUser = useCallback(() => {
    const authUserStr = localStorage.getItem(AUTH_USER_KEY);
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        if (authUser.profile_id && authUser.has_profile) {
          // Auth user has a profile - sync it to ProfileContext
          const newProfileId = authUser.profile_id;
          if (newProfileId !== localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, newProfileId);
            setProfileIdState(newProfileId);
            return newProfileId;
          }
        }
      } catch (e) {
        console.error('Error parsing auth user:', e);
      }
    }
    return null;
  }, []);

  // Initialize from localStorage after hydration
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // First try to get profile ID from localStorage
    let storedId = localStorage.getItem(STORAGE_KEY);

    // If no stored profile ID, try to sync from auth user data
    if (!storedId) {
      storedId = syncFromAuthUser();
    }

    setProfileIdState(storedId);
    setIsHydrated(true);

    // Set up BroadcastChannel for cross-tab communication
    if ('BroadcastChannel' in window) {
      broadcastChannelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

      broadcastChannelRef.current.onmessage = (event) => {
        const { type, profileId: newProfileId, profile: newProfile } = event.data;

        if (type === 'PROFILE_UPDATED') {
          setProfileIdState(newProfileId);
          setProfile(newProfile);
        } else if (type === 'PROFILE_CLEARED') {
          setProfileIdState(null);
          setProfile(null);
        }
      };
    }

    // Also listen for storage events (fallback for browsers without BroadcastChannel)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const newId = event.newValue;
        setProfileIdState(newId);

        // If profile was cleared, clear the profile state too
        if (!newId) {
          setProfile(null);
        }
      }
      // Also listen for auth_user changes - when user logs in or profile is created
      if (event.key === AUTH_USER_KEY) {
        syncFromAuthUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom auth-user-updated event (fired in same tab when auth changes)
    const handleAuthUserUpdated = (event: CustomEvent) => {
      const authUser = event.detail;
      if (authUser?.profile_id && authUser?.has_profile) {
        const newProfileId = authUser.profile_id;
        if (newProfileId !== profileId) {
          localStorage.setItem(STORAGE_KEY, newProfileId);
          setProfileIdState(newProfileId);
        }
      }
    };

    window.addEventListener('auth-user-updated', handleAuthUserUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-user-updated', handleAuthUserUpdated as EventListener);
      broadcastChannelRef.current?.close();
    };
  }, [syncFromAuthUser, profileId]);

  // Fetch profile when profileId changes
  useEffect(() => {
    if (!isHydrated) return;

    if (!profileId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    api.getStudentProfile(profileId)
      .then(fetchedProfile => {
        setProfile(fetchedProfile);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        // If profile fetch fails, clear the invalid ID
        localStorage.removeItem(STORAGE_KEY);
        setProfileIdState(null);
        setProfile(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [profileId, isHydrated]);

  // Function to update profile ID (and sync across tabs)
  const setProfileId = useCallback((newId: string | null) => {
    if (newId) {
      localStorage.setItem(STORAGE_KEY, newId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setProfileIdState(newId);

    // Fetch the new profile
    if (newId) {
      api.getStudentProfile(newId)
        .then(fetchedProfile => {
          setProfile(fetchedProfile);

          // Broadcast to other tabs
          broadcastChannelRef.current?.postMessage({
            type: 'PROFILE_UPDATED',
            profileId: newId,
            profile: fetchedProfile,
          });
        })
        .catch(console.error);
    } else {
      setProfile(null);

      // Broadcast clear to other tabs
      broadcastChannelRef.current?.postMessage({
        type: 'PROFILE_CLEARED',
      });
    }
  }, []);

  // Function to refresh profile data from server
  const refreshProfile = useCallback(async () => {
    if (!profileId) return;

    setIsLoading(true);
    try {
      const fetchedProfile = await api.getStudentProfile(profileId);
      setProfile(fetchedProfile);

      // Broadcast updated profile to other tabs
      broadcastChannelRef.current?.postMessage({
        type: 'PROFILE_UPDATED',
        profileId,
        profile: fetchedProfile,
      });
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  // Function to clear profile
  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileIdState(null);
    setProfile(null);

    // Broadcast to other tabs
    broadcastChannelRef.current?.postMessage({
      type: 'PROFILE_CLEARED',
    });
  }, []);

  const value: ProfileContextType = {
    profileId,
    profile,
    hasProfile: !!profileId,
    isLoading,
    setProfileId,
    refreshProfile,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  return context;
}

// Custom hook for components that just need the profile ID
export function useProfileId(): string | null {
  const { profileId } = useProfile();
  return profileId;
}

// Custom hook for components that need to know if a profile exists
export function useHasProfile(): boolean {
  const { hasProfile } = useProfile();
  return hasProfile;
}
