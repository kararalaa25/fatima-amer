import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  analysis: string;
  imageUrl: string;
  timestamp: Date;
}

export function useDentalImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (imageUrl: string, analysisType: 'initial' | 'progress' = 'initial') => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-dental-image', {
        body: { imageUrl, analysisType },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result: AnalysisResult = {
        analysis: data.analysis,
        imageUrl,
        timestamp: new Date(),
      };

      setAnalysisResult(result);
      
      toast({
        title: 'Analysis Complete',
        description: 'AI dental image analysis has been generated.',
      });

      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  return {
    analyzeImage,
    isAnalyzing,
    analysisResult,
    clearAnalysis,
  };
}
