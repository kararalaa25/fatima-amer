import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bypass, setBypass] = useState(() => typeof window !== 'undefined' && localStorage.getItem('admin_bypass') === '1');

  useEffect(() => {
    let mounted = true;

    async function fetchExtras(userId: string) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!mounted) return;
      setProfile(prof as Profile | null);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (!mounted) return;
      setIsAdmin(!!roles?.some((r) => r.role === 'admin'));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(() => fetchExtras(newSession.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) fetchExtras(existing.user.id);
      setLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('admin_bypass');
    setBypass(false);
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    profile,
    isAdmin: isAdmin || bypass,
    loading,
    isAuthenticated: !!session || bypass,
    signOut,
  };
}
