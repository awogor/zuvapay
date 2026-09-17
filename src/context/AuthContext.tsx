'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import type { User } from '@supabase/supabase-js';

interface SignUpData {
  title?: string;
  gender?: string;
  username?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; requiresEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local demo profile fallback for testing when no Supabase project connected yet
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: { username: 'davidadeleke', first_name: 'David', last_name: 'Adeleke', phone: '08031234567', role: 'admin' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'david@zuvapay.com',
  phone: '08031234567',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'davidadeleke',
  role: 'admin',
  status: 'active',
  is_pin_set: true,
  title: 'Mr',
  gender: 'Male',
  first_name: 'David',
  last_name: 'Adeleke',
  phone_number: '08031234567',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZuvaUser1',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  // Check if Supabase keys are configured
  const isSupabaseConfigured = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !!url && !url.includes('placeholder');
  }, []);

  const fetchProfile = async (userId: string, userMeta?: any) => {
    try {
      // 1. Try server API endpoint with full server privileges
      const apiRes = await fetch('/api/user/profile').catch(() => null);
      if (apiRes && apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.profile) {
          return apiData.profile as UserProfile;
        }
      }

      // 2. Direct Supabase query fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const metaUsername = userMeta?.username || null;
      const metaRole = userMeta?.role || (userMeta?.email === 'awogorm@gmail.com' ? 'admin' : 'customer');

      if (error) {
        console.warn('Profile fetch error or table not yet populated:', error.message);
        if (userMeta) {
          return {
            id: userId,
            role: metaRole,
            status: 'active',
            is_pin_set: false,
            title: userMeta.title || 'Mr',
            first_name: userMeta.first_name || 'User',
            last_name: userMeta.last_name || '',
            phone_number: userMeta.phone || '',
            username: metaUsername,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            created_at: new Date().toISOString(),
          } as UserProfile;
        }
        return null;
      }

      return {
        ...data,
        role: data?.role || metaRole,
        username: data?.username || metaUsername,
      } as UserProfile;
    } catch (err) {
      console.warn('Error querying profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        // Fallback to local storage or demo session for immediate verification
        const savedSession = localStorage.getItem('zuvapay_mock_user');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setUser(parsed.user);
            setProfile(parsed.profile);
          } catch {
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
          }
        } else {
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
        }
        setIsMockMode(true);
        setLoading(false);
        return;
      }

      try {
        // Enforce 10-Minute Inactivity Limit upon session restoration
        const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
        const lastActiveStr = typeof window !== 'undefined' ? localStorage.getItem('zuvapay_last_active_time') : null;
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (Date.now() - lastActive >= INACTIVITY_LIMIT_MS) {
            console.warn('[Security] Restored session expired after 10 minutes of inactivity. Logging out...');
            try {
              localStorage.removeItem('zuvapay_last_active_time');
              localStorage.setItem('zuvapay_session_expired', 'true');
              localStorage.removeItem('zuvapay_mock_user');
            } catch {}
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
            setProfile(null);
            setLoading(false);
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id, session.user.user_metadata);
          if (prof) {
            setProfile(prof);
          } else {
            // Build fallback from metadata
            setProfile({
              id: session.user.id,
              username: session.user.user_metadata?.username || null,
              role: (session.user.user_metadata?.role as any) || 'customer',
              title: session.user.user_metadata?.title || 'Mr',
              first_name: session.user.user_metadata?.first_name || 'User',
              last_name: session.user.user_metadata?.last_name || '',
              phone_number: session.user.user_metadata?.phone || '',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
              created_at: session.user.created_at,
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            const prof = await fetchProfile(session.user.id, session.user.user_metadata);
            setProfile(prof || {
              id: session.user.id,
              username: session.user.user_metadata?.username || null,
              role: (session.user.user_metadata?.role as any) || 'customer',
              title: session.user.user_metadata?.title || 'Mr',
              first_name: session.user.user_metadata?.first_name || 'User',
              last_name: session.user.user_metadata?.last_name || '',
              phone_number: session.user.user_metadata?.phone || '',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
              created_at: session.user.created_at,
            });
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [supabase, isSupabaseConfigured]);

  // =========================================================================
  // 10-Minute Inactivity Auto-Logout Tracking (FinTech / Banking Security Spec)
  // =========================================================================
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 Minutes (600,000 ms)
    const STORAGE_KEY = 'zuvapay_last_active_time';

    // Record activity timestamp
    const recordActivity = () => {
      const now = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {}
    };

    // Perform immediate check on mount / tab reload
    const lastActiveStr = localStorage.getItem(STORAGE_KEY);
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (Date.now() - lastActive >= INACTIVITY_LIMIT_MS) {
        console.warn('[Security] User session expired after 10 minutes of inactivity. Logging out...');
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem('zuvapay_session_expired', 'true');
          localStorage.removeItem('zuvapay_mock_user');
        } catch {}
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        if (isSupabaseConfigured) {
          supabase.auth.signOut().catch(() => {});
        }
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }
    }

    // Initialize timestamp on login/mount
    recordActivity();

    // Check periodically whether the user has been inactive for > 10 minutes
    const checkInterval = setInterval(async () => {
      try {
        const lastActiveStr = localStorage.getItem(STORAGE_KEY);
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
        const elapsed = Date.now() - lastActive;

        if (elapsed >= INACTIVITY_LIMIT_MS) {
          console.warn('[Security] User session expired after 10 minutes of inactivity. Logging out...');
          clearInterval(checkInterval);
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem('zuvapay_session_expired', 'true');
            localStorage.removeItem('zuvapay_mock_user');
          } catch {}

          // Synchronously trigger server-side cookie clearing
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {}

          if (isSupabaseConfigured) {
            await supabase.auth.signOut().catch(() => {});
          }
          setUser(null);
          setProfile(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (e) {
        console.error('Error during inactivity check:', e);
      }
    }, 10000); // Check every 10 seconds

    // Throttled activity listener
    let throttleTimeout: any = null;
    const handleUserInteraction = () => {
      if (!throttleTimeout) {
        recordActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 5000); // Throttle writes to once every 5 seconds
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    return () => {
      clearInterval(checkInterval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
    };
  }, [user, isSupabaseConfigured, supabase]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Mock sign in
      const mockUser = { ...DEMO_USER, email };
      const mockProfile = { ...DEMO_PROFILE, first_name: email.split('@')[0] };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('zuvapay_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data?.user) {
        setUser(data.user);
        const prof = await fetchProfile(data.user.id, data.user.user_metadata);
        if (prof) setProfile(prof);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in' };
    }
  };

  const signUp = async ({ title, gender, username, email, password, firstName, lastName, phone }: SignUpData) => {
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase().replace(/^@/, '');
    const cleanGender = gender === 'Female' ? 'Female' : 'Male';
    const effectiveTitle = title || (cleanGender === 'Female' ? 'Mrs' : 'Mr');

    if (!isSupabaseConfigured) {
      const newUserId = `kp-${Date.now()}`;
      const mockUser = {
        ...DEMO_USER,
        id: newUserId,
        email,
        user_metadata: {
          username: cleanUsername,
          title: effectiveTitle,
          gender: cleanGender,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      };
      const mockProfile: UserProfile = {
        id: newUserId,
        username: cleanUsername,
        title: effectiveTitle,
        gender: cleanGender,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserId}`,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('zuvapay_mock_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: effectiveTitle,
          gender: cleanGender,
          username: cleanUsername,
          email,
          password,
          firstName,
          lastName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { error: data.error || 'Failed to complete registration' };
      }

      return {
        error: null,
        requiresEmailVerification: Boolean(data.requiresEmailVerification),
      };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during registration' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('zuvapay_mock_user');
      localStorage.removeItem('zuvapay_last_active_time');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    // Strict KYC Lock: Name, phone number, gender, title cannot be modified after registration
    const forbiddenUpdates = ['first_name', 'last_name', 'phone_number', 'gender', 'title'];
    const hasForbidden = forbiddenUpdates.some((k) => updates[k as keyof UserProfile] !== undefined);
    if (hasForbidden) {
      return {
        error: 'Personal identity details (legal name, gender, phone number) are permanently locked for account security and KYC compliance. Only password and PIN can be changed. Contact support for assistance.',
      };
    }

    if (!isSupabaseConfigured) {
      if (profile) {
        const updated = { ...profile, ...updates };
        setProfile(updated);
        localStorage.setItem('zuvapay_mock_user', JSON.stringify({ user, profile: updated }));
      }
      return { error: null };
    }

    try {
      // Sync with auth user_metadata for resilience
      if (updates.username) {
        await supabase.auth.updateUser({
          data: {
            username: updates.username.toLowerCase().replace(/^@/, ''),
          },
        }).catch(() => {});
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error && error.code !== 'PGRST204') {
        return { error: error.message };
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile' };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    if (!isSupabaseConfigured) return;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const prof = await fetchProfile(user.id, currentUser?.user_metadata || user.user_metadata);
    if (prof) setProfile(prof);
  };

  const isAdmin =
    profile?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.email === 'awogorm@gmail.com' ||
    user?.email === 'david@zuvapay.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        isMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
