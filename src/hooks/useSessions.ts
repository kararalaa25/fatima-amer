import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Session, SessionImage } from '@/types/patient';

export function useSessions(patientId: string) {
  return useQuery({
    queryKey: ['sessions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });
      
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!patientId,
  });
}

export function useSessionImages(sessionId: string) {
  return useQuery({
    queryKey: ['session-images', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_images')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as SessionImage[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (session: Omit<Session, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.patient_id] });
    },
  });
}

export function useUploadSessionImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, file }: { sessionId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('patient-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('patient-images')
        .getPublicUrl(fileName);
      
      const { data, error } = await supabase
        .from('session_images')
        .insert({
          session_id: sessionId,
          image_url: publicUrl,
          image_type: file.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SessionImage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-images', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['all-images'] });
    },
  });
}
