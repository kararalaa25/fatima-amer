import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Admin email - only this email can access admin panel
const ADMIN_EMAIL = 'kararkhafaji892@gmail.com';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_activated: boolean;
  created_at: string;
  roles: AppRole[];
}

export function useAdmin() {
  const queryClient = useQueryClient();

  // Check if current user is admin by email
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check if user email matches admin email
      return user.email === ADMIN_EMAIL;
    },
  });

  // Fetch all users with their roles
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
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

  // Activate user
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
      toast.success('User activated successfully!', {
        description: 'The user can now access their private workspace.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to activate user', { description: error.message });
    },
  });

  // Ban/deactivate user
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
      toast.success('User banned', {
        description: 'The user can no longer access the platform.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to ban user', { description: error.message });
    },
  });

  // Add role to user
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

  // Remove role from user
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
  };
}
