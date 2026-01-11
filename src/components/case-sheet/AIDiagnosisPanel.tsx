import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClinicalData {
  chief_complaint?: string;
  ap_relation?: string;
  horizontal_relation?: string;
  vertical_relation?: string;
  overbite_mm?: number | '';
  overjet_mm?: number | '';
  molar_relation?: string;
  canine_relation?: string;
  incisor_relation?: string;
  oral_hygiene?: string;
  lips?: string;
  habits?: string;
  tongue_position?: string;
  tongue_size?: string;
  upper_buccal?: string;
  lower_buccal?: string;
  upper_labial?: string;
  lower_labial?: string;
  upper_space_available?: number | '';
  upper_space_required?: number | '';
  lower_space_available?: number | '';
  lower_space_required?: number | '';
}

interface AIDiagnosis {
  diagnosis: string;
  primary_goals: string;
  recommended_appliances: string[];
  extraction_recommendation: string;
  estimated_duration: string;
  special_considerations: string;
}

interface AIDiagnosisPanelProps {
  clinicalData: ClinicalData;
  onApply: (data: {
    primary_goals: string;
    appliance_types: string[];
    extraction_plan: string;
    estimated_duration: string;
    special_instructions: string;
  }) => void;
}

export function AIDiagnosisPanel({ clinicalData, onApply }: AIDiagnosisPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDiagnosis = async () => {
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-diagnosis', {
        body: { clinicalData },
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setDiagnosis(data);
    } catch (err) {
      console.error('AI diagnosis error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate diagnosis';
      setError(message);
      toast({
        title: 'AI Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlan = () => {
    if (!diagnosis) return;

    onApply({
      primary_goals: diagnosis.primary_goals,
      appliance_types: diagnosis.recommended_appliances,
      extraction_plan: diagnosis.extraction_recommendation,
      estimated_duration: diagnosis.estimated_duration,
      special_instructions: diagnosis.special_considerations,
    });

    toast({
      title: 'AI Plan Applied',
      description: 'The AI-generated treatment plan has been applied to the form.',
    });

    setDiagnosis(null);
  };

  const handleDiscard = () => {
    setDiagnosis(null);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Clinical Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!diagnosis && !isLoading && (
          <>
            <p className="text-sm text-muted-foreground">
              Let AI analyze the clinical data from Steps 2-5 to generate a suggested diagnosis
              and treatment plan.
            </p>
            <Button
              onClick={handleGenerateDiagnosis}
              className="w-full"
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Suggestion
            </Button>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing clinical data...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {diagnosis && !isLoading && (
          <div className="space-y-4">
            <Badge variant="outline" className="bg-card">
              Draft Suggestion
            </Badge>

            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Initial Diagnosis</h4>
                <p className="text-sm text-muted-foreground">{diagnosis.diagnosis}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">Primary Goals</h4>
                <p className="text-sm text-muted-foreground">{diagnosis.primary_goals}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">Recommended Appliances</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {diagnosis.recommended_appliances.map((appliance) => (
                    <Badge key={appliance} variant="secondary">
                      {appliance}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">Extraction Plan</h4>
                <p className="text-sm text-muted-foreground">
                  {diagnosis.extraction_recommendation}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">Estimated Duration</h4>
                <p className="text-sm text-muted-foreground">{diagnosis.estimated_duration}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">Special Considerations</h4>
                <p className="text-sm text-muted-foreground">
                  {diagnosis.special_considerations}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyPlan} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Apply AI Plan
              </Button>
              <Button variant="outline" onClick={handleDiscard}>
                <X className="mr-2 h-4 w-4" />
                Discard
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
