import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const PREVIEW_BYPASS_KEY = 'ortho_preview_bypass';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  workspace_id: string;
  is_activated: boolean;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Check for preview bypass first
    const bypassActive = localStorage.getItem(PREVIEW_BYPASS_KEY) === 'true';
    if (bypassActive) {
      setIsPreviewMode(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    // Hard safety timeout - always resolve loading after 3s
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    async function fetchProfile(userId: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (mounted) setProfile(data);
      } catch {
        // Profile fetch failed, continue without it
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        await fetchProfile(existingSession.user.id);
      }
      
      if (mounted) setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem(PREVIEW_BYPASS_KEY);
    setIsPreviewMode(false);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session || isPreviewMode,
    isActivated: profile?.is_activated ?? false,
    isPreviewMode,
    workspaceId: profile?.workspace_id ?? null,
  };
}
