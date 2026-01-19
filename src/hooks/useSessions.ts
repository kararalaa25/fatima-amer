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

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, treatment_performed }: { id: string; treatment_performed: string }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ treatment_performed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', data.patient_id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, patientId }: { sessionId: string; patientId: string }) => {
      // First delete all images from storage
      const { data: images } = await supabase
        .from('session_images')
        .select('image_url')
        .eq('session_id', sessionId);
      
      if (images && images.length > 0) {
        const filePaths = images.map(img => {
          const url = img.image_url;
          const match = url.match(/patient-images\/(.+)$/);
          return match ? match[1] : null;
        }).filter(Boolean) as string[];
        
        if (filePaths.length > 0) {
          await supabase.storage.from('patient-images').remove(filePaths);
        }
      }
      
      // Delete session images from DB
      await supabase.from('session_images').delete().eq('session_id', sessionId);
      
      // Delete session
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      if (error) throw error;
      
      return { sessionId, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['session-images', data.sessionId] });
    },
  });
}

export function useUploadSessionImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, file, imageType }: { sessionId: string; file: File; imageType?: string }) => {
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
          image_type: imageType || file.type,
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

export function useDeleteSessionImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageId, imageUrl, sessionId }: { imageId: string; imageUrl: string; sessionId: string }) => {
      // Delete from storage
      const match = imageUrl.match(/patient-images\/(.+)$/);
      if (match) {
        await supabase.storage.from('patient-images').remove([match[1]]);
      }
      
      // Delete from DB
      const { error } = await supabase.from('session_images').delete().eq('id', imageId);
      if (error) throw error;
      
      return { sessionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session-images', data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['all-images'] });
    },
  });
}
