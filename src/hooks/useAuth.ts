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

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => setLoading(false), 5000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    }).catch(() => {
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear preview bypass
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