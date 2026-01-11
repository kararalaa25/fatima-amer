import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InitialPhoto } from '@/types/patient';

export function useInitialPhotos(patientId: string) {
  return useQuery({
    queryKey: ['initial-photos', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initial_photos')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as InitialPhoto[];
    },
    enabled: !!patientId,
  });
}

export function useUploadInitialPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, file }: { patientId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `initial/${patientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('patient-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('patient-images')
        .getPublicUrl(fileName);
      
      const { data, error } = await supabase
        .from('initial_photos')
        .insert({
          patient_id: patientId,
          image_url: publicUrl,
          image_type: file.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as InitialPhoto;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['initial-photos', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['all-images'] });
    },
  });
}

export function useCreateInitialPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patient_id, image_url, image_type }: { patient_id: string; image_url: string; image_type: string }) => {
      const { data, error } = await supabase
        .from('initial_photos')
        .insert({
          patient_id,
          image_url,
          image_type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as InitialPhoto;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['initial-photos', variables.patient_id] });
    },
  });
}
