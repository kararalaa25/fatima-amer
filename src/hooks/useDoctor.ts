import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  user_id: string;
  doctor_code: string;
  created_at: string;
}

async function ensureDoctorRecord(userId: string): Promise<Doctor> {
  const { data: existingRows, error: existingError } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (existingError) throw existingError;

  const existingDoctor = existingRows?.[0];
  if (existingDoctor) return existingDoctor as Doctor;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: codeData, error: codeError } = await supabase.rpc('generate_doctor_code');
    if (codeError || !codeData) {
      throw codeError ?? new Error('Failed to generate doctor ID');
    }

    const { data: insertedDoctor, error: insertError } = await supabase
      .from('doctors')
      .insert({ user_id: userId, doctor_code: codeData })
      .select('*')
      .single();

    if (!insertError && insertedDoctor) {
      return insertedDoctor as Doctor;
    }

    if (insertError?.code === '23505') {
      const { data: retryRows, error: retryError } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (retryError) throw retryError;

      const retryDoctor = retryRows?.[0];
      if (retryDoctor) return retryDoctor as Doctor;
      continue;
    }

    throw insertError;
  }

  throw new Error('Failed to create doctor ID');
}

export function useDoctor() {
  return useQuery({
    queryKey: ['doctor'],
    queryFn: async (): Promise<Doctor | null> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) return null;

      return ensureDoctorRecord(userId);
    },
  });
}

export function useEnsureDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Doctor> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      return ensureDoctorRecord(userId);
    },
    onSuccess: (doctor) => {
      queryClient.setQueryData(['doctor'], doctor);
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
}
