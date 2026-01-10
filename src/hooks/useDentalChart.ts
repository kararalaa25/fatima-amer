import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DentalChartTooth, ToothStatus } from '@/types/patient';

export function useDentalChart(patientId: string) {
  return useQuery({
    queryKey: ['dental-chart', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dental_chart')
        .select('*')
        .eq('patient_id', patientId);
      
      if (error) throw error;
      return data as DentalChartTooth[];
    },
    enabled: !!patientId,
  });
}

export function useUpdateToothStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      patientId, 
      quadrant, 
      toothNumber, 
      status 
    }: { 
      patientId: string; 
      quadrant: number; 
      toothNumber: number; 
      status: ToothStatus;
    }) => {
      const { data, error } = await supabase
        .from('dental_chart')
        .upsert({
          patient_id: patientId,
          quadrant,
          tooth_number: toothNumber,
          status,
        }, {
          onConflict: 'patient_id,quadrant,tooth_number',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dental-chart', variables.patientId] });
    },
  });
}
