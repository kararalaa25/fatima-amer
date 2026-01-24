import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { toast } from 'sonner';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async (): Promise<Patient[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Patient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async (): Promise<Patient | null> => {
      if (!id) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Patient | null;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const patientData = {
        ...patient,
        user_id: user?.id ?? null,
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create patient', { description: error.message });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...patient }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(patient)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
      toast.success('Patient updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update patient', { description: error.message });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete patient', { description: error.message });
    },
  });
}
