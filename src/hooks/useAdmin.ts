import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const ADMIN_EMAILS = ['kararkhafaji892@gmail.com', 'kararalkhafaji892@gmail.com'];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_activated: boolean;
  created_at: string;
  roles: AppRole[];
}

interface PatientWithDoctor {
  id: string;
  name: string;
  age: number;
  chief_complaint: string | null;
  created_at: string;
  user_id: string | null;
  doctor_name: string | null;
}

export function useAdmin() {
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      if (user.email && ADMIN_EMAILS.includes(user.email)) return true;
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!roles;
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        email: profile.email,
        is_activated: profile.is_activated ?? false,
        created_at: profile.created_at,
        roles: (roles || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role),
      }));
      return usersWithRoles;
    },
    enabled: isAdmin,
  });

  // Fetch ALL patients for admin global case view
  const { data: allPatients, isLoading: isLoadingAllPatients } = useQuery({
    queryKey: ['admin-all-patients'],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, name, age, chief_complaint, created_at, user_id')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles to map user_id -> doctor name
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      const profileMap = new Map<string, string>();
      (profiles || []).forEach(p => profileMap.set(p.user_id, p.full_name));

      const result: PatientWithDoctor[] = (patients || []).map(p => ({
        ...p,
        doctor_name: p.user_id ? profileMap.get(p.user_id) || 'Unknown' : 'Unknown',
      }));
      return result;
    },
    enabled: isAdmin,
  });

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_activated: true })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User activated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to activate user', { description: error.message });
    },
  });

  const banUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_activated: false })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User banned');
    },
    onError: (error: any) => {
      toast.error('Failed to ban user', { description: error.message });
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role added');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate')) {
        toast.error('User already has this role');
      } else {
        toast.error('Failed to add role', { description: error.message });
      }
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role removed');
    },
    onError: (error: any) => {
      toast.error('Failed to remove role', { description: error.message });
    },
  });

  return {
    isAdmin,
    isCheckingAdmin,
    users,
    isLoadingUsers,
    activateUser,
    banUser,
    addRole,
    removeRole,
    pendingUsers: users?.filter(u => !u.is_activated) || [],
    activeUsers: users?.filter(u => u.is_activated) || [],
    allPatients: allPatients || [],
    isLoadingAllPatients,
  };
}
