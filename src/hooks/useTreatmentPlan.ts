import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TreatmentPlan } from '@/types/patient';

export function useTreatmentPlan(patientId: string) {
  return useQuery({
    queryKey: ['treatment-plan', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();
      
      if (error) throw error;
      return data as TreatmentPlan | null;
    },
    enabled: !!patientId,
  });
}

export function useUpsertTreatmentPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (plan: Omit<TreatmentPlan, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      if (plan.id) {
        const { data, error } = await supabase
          .from('treatment_plans')
          .update(plan)
          .eq('id', plan.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as TreatmentPlan;
      } else {
        const { data, error } = await supabase
          .from('treatment_plans')
          .insert(plan)
          .select()
          .single();
        
        if (error) throw error;
        return data as TreatmentPlan;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plan', variables.patient_id] });
    },
  });
}

export function useDeleteTreatmentPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientId: string) => {
      const { error } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('patient_id', patientId);
      
      if (error) throw error;
    },
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plan', patientId] });
    },
  });
}
