import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setState(prev => ({
            ...prev,
            user: profile,
            supabaseUser: session.user,
            loading: false
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Authentication error',
          loading: false
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setState(prev => ({
            ...prev,
            user: profile,
            supabaseUser: session.user,
            loading: false,
            error: null
          }));
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            user: null,
            supabaseUser: null,
            loading: false,
            error: null
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() as { data: any; error: any };

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        username: data.username,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        country: data.country,
        defaultLanguage: data.default_language,
        role: data.role,
        status: data.status,
        points: data.points,
        level: data.level,
        readingStreak: data.reading_streak,
        lastActiveDate: data.last_active_date,
        totalReadingTime: data.total_reading_time,
        articlesRead: data.articles_read,
        socialLinks: data.social_links,
        readingPreferences: data.reading_preferences,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
        loading: false
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
        loading: false
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
        loading: false
      }));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          username: updates.username,
          bio: updates.bio,
          country: updates.country,
          default_language: updates.defaultLanguage,
          social_links: updates.socialLinks,
          reading_preferences: updates.readingPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile update failed',
        loading: false
      }));
      throw error;
    }
  };

  return {
    user: state.user,
    supabaseUser: state.supabaseUser,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refetchProfile: () => state.supabaseUser ? fetchUserProfile(state.supabaseUser.id) : null
  };
}
