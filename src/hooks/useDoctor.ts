import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  user_id: string;
  doctor_code: string;
  created_at: string;
}

export function useDoctor() {
  return useQuery({
    queryKey: ['doctor'],
    queryFn: async (): Promise<Doctor | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useEnsureDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Doctor> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if doctor record exists
      const { data: existing } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) return existing;

      // Generate code via DB function
      const { data: codeData, error: codeError } = await supabase.rpc('generate_doctor_code');
      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('doctors')
        .insert({ user_id: user.id, doctor_code: codeData })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
}
