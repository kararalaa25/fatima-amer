import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Loader2, Check, X, AlertCircle, Brain, Edit3, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TreatmentPlanStep } from './TreatmentPlanStep';
import { ToothStatus } from '@/types/patient';
import { UploadedImage } from './MediaUploadStep';
import { cn } from '@/lib/utils';

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

interface AIDetailedPlan {
  diagnosis: string;
  leveling_alignment: {
    starting_wire: string;
    wire_sequence: string[];
    rationale: string;
  };
  space_management: {
    approach: string;
    coil_type: string;
    details: string;
  };
  ipr_strategy: {
    amount_mm: number;
    timing: string;
    location: string;
    rationale: string;
  };
  mechanics: {
    elastics: string;
    auxiliaries: string;
    adjustments: string;
  };
  primary_goals: string;
  recommended_appliances: string[];
  extraction_recommendation: string;
  estimated_duration: string;
  special_considerations: string;
}

interface AITreatmentPlanStepProps {
  clinicalData: ClinicalData;
  dentalChart: Record<string, ToothStatus>;
  uploadedImages: UploadedImage[];
  treatmentData: {
    primary_goals: string;
    appliance_types: string[];
    extraction_plan: string;
    estimated_duration: string;
    special_instructions: string;
  };
  onTreatmentChange: (field: string, value: string | string[]) => void;
  onApplyAIPlan: (data: {
    primary_goals: string;
    appliance_types: string[];
    extraction_plan: string;
    estimated_duration: string;
    special_instructions: string;
  }) => void;
  onFinalizePlan: () => void;
  isFinalized: boolean;
}

export function AITreatmentPlanStep({
  clinicalData,
  dentalChart,
  uploadedImages,
  treatmentData,
  onTreatmentChange,
  onApplyAIPlan,
  onFinalizePlan,
  isFinalized,
}: AITreatmentPlanStepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIDetailedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const hasEnoughData = Boolean(
    clinicalData.molar_relation ||
    clinicalData.canine_relation ||
    clinicalData.overjet_mm ||
    clinicalData.overbite_mm
  );

  const handleAnalyzeCase = async () => {
    setIsLoading(true);
    setError(null);
    setAiPlan(null);

    // Prepare dental chart summary
    const missingTeeth = Object.entries(dentalChart)
      .filter(([, status]) => status === 'missing')
      .map(([key]) => key);
    
    const imageTypes = uploadedImages.map(img => img.type).filter(Boolean);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-diagnosis', {
        body: { 
          clinicalData,
          dentalChartSummary: {
            missingTeeth,
            totalTeethMarked: Object.keys(dentalChart).length,
          },
          availableImages: imageTypes,
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAiPlan(data);
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
    if (!aiPlan) return;

    // Compile detailed instructions from AI plan
    const detailedInstructions = `
## Leveling & Alignment
**Starting Wire:** ${aiPlan.leveling_alignment.starting_wire}
**Wire Sequence:** ${aiPlan.leveling_alignment.wire_sequence.join(' → ')}
**Rationale:** ${aiPlan.leveling_alignment.rationale}

## Space Management
**Approach:** ${aiPlan.space_management.approach}
**Coil Type:** ${aiPlan.space_management.coil_type}
**Details:** ${aiPlan.space_management.details}

## IPR Strategy
**Amount:** ${aiPlan.ipr_strategy.amount_mm}mm
**Timing:** ${aiPlan.ipr_strategy.timing}
**Location:** ${aiPlan.ipr_strategy.location}
**Rationale:** ${aiPlan.ipr_strategy.rationale}

## Mechanics
**Elastics:** ${aiPlan.mechanics.elastics}
**Auxiliaries:** ${aiPlan.mechanics.auxiliaries}
**Adjustments:** ${aiPlan.mechanics.adjustments}

## Special Considerations
${aiPlan.special_considerations}
    `.trim();

    onApplyAIPlan({
      primary_goals: aiPlan.primary_goals,
      appliance_types: aiPlan.recommended_appliances,
      extraction_plan: aiPlan.extraction_recommendation,
      estimated_duration: aiPlan.estimated_duration,
      special_instructions: detailedInstructions,
    });

    setShowEditForm(true);

    toast({
      title: 'AI Plan Applied',
      description: 'The detailed treatment plan has been applied. You can now edit it.',
    });
  };

  const handleDiscard = () => {
    setAiPlan(null);
    setShowEditForm(false);
  };

  // If finalized, show read-only summary
  if (isFinalized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Treatment Plan Finalized</h3>
            <p className="text-sm text-muted-foreground">
              This plan has been locked. Save the case sheet to complete.
            </p>
          </div>
        </div>
        <TreatmentPlanStep data={treatmentData} onChange={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Treatment Planning
        </h3>
        <p className="text-sm text-muted-foreground">
          The AI will analyze all clinical data from Steps 2-6 to generate a detailed treatment plan.
        </p>
      </div>

      {/* Data Summary */}
      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Data Available for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={clinicalData.molar_relation ? 'default' : 'secondary'}>
              Molar Relation {clinicalData.molar_relation ? '✓' : '○'}
            </Badge>
            <Badge variant={clinicalData.canine_relation ? 'default' : 'secondary'}>
              Canine Relation {clinicalData.canine_relation ? '✓' : '○'}
            </Badge>
            <Badge variant={clinicalData.overjet_mm ? 'default' : 'secondary'}>
              Overjet {clinicalData.overjet_mm ? '✓' : '○'}
            </Badge>
            <Badge variant={clinicalData.overbite_mm ? 'default' : 'secondary'}>
              Overbite {clinicalData.overbite_mm ? '✓' : '○'}
            </Badge>
            <Badge variant={Object.keys(dentalChart).length > 0 ? 'default' : 'secondary'}>
              Dental Chart {Object.keys(dentalChart).length > 0 ? '✓' : '○'}
            </Badge>
            <Badge variant={uploadedImages.length > 0 ? 'default' : 'secondary'}>
              Images ({uploadedImages.length})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      {!aiPlan && !isLoading && !showEditForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-primary/60 mb-4" />
            <h4 className="text-lg font-semibold mb-2">Ready for AI Analysis</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Click the button below to let the AI Orthodontic Brain analyze all clinical data
              and generate a comprehensive treatment plan with wire sequences, IPR recommendations,
              and mechanics.
            </p>
            <Button
              onClick={handleAnalyzeCase}
              size="lg"
              disabled={!hasEnoughData}
              className="px-8"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze Case
            </Button>
            {!hasEnoughData && (
              <p className="text-xs text-destructive mt-3">
                Please complete at least Step 2 (Clinical Relations) before analyzing.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="border-primary/20">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              AI is analyzing clinical data and generating treatment plan...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4" onClick={handleAnalyzeCase}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Generated Plan */}
      {aiPlan && !showEditForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Generated Treatment Plan
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Draft
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Diagnosis */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Initial Diagnosis</h4>
              <p className="text-sm text-muted-foreground">{aiPlan.diagnosis}</p>
            </div>

            <Separator />

            {/* Leveling & Alignment */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                🔧 Leveling & Alignment
              </h4>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Starting Wire:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.leveling_alignment.starting_wire}</span>
                </div>
                <div>
                  <span className="font-medium">Wire Sequence:</span>{' '}
                  <span className="text-muted-foreground">
                    {aiPlan.leveling_alignment.wire_sequence.join(' → ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Rationale:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.leveling_alignment.rationale}</span>
                </div>
              </div>
            </div>

            {/* Space Management */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                📏 Space Management
              </h4>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Approach:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.space_management.approach}</span>
                </div>
                <div>
                  <span className="font-medium">Coil Type:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.space_management.coil_type}</span>
                </div>
                <div>
                  <span className="font-medium">Details:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.space_management.details}</span>
                </div>
              </div>
            </div>

            {/* IPR Strategy */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                ✂️ IPR Strategy
              </h4>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Amount:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.ipr_strategy.amount_mm}mm</span>
                </div>
                <div>
                  <span className="font-medium">Timing:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.ipr_strategy.timing}</span>
                </div>
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.ipr_strategy.location}</span>
                </div>
                <div>
                  <span className="font-medium">Rationale:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.ipr_strategy.rationale}</span>
                </div>
              </div>
            </div>

            {/* Mechanics */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                ⚙️ Mechanics
              </h4>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-medium">Elastics:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.mechanics.elastics}</span>
                </div>
                <div>
                  <span className="font-medium">Auxiliaries:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.mechanics.auxiliaries}</span>
                </div>
                <div>
                  <span className="font-medium">Adjustments:</span>{' '}
                  <span className="text-muted-foreground">{aiPlan.mechanics.adjustments}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold">Primary Goals</h4>
                <p className="text-sm text-muted-foreground">{aiPlan.primary_goals}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Appliances</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {aiPlan.recommended_appliances.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Extraction Plan</h4>
                <p className="text-sm text-muted-foreground">{aiPlan.extraction_recommendation}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Duration</h4>
                <p className="text-sm text-muted-foreground">{aiPlan.estimated_duration}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleApplyPlan} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Apply AI Plan
              </Button>
              <Button variant="outline" onClick={handleDiscard}>
                <X className="mr-2 h-4 w-4" />
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Form After Applying */}
      {showEditForm && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-semibold">Edit Treatment Plan</h4>
            </div>
            <Button onClick={handleDiscard} variant="ghost" size="sm">
              <X className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>

          <TreatmentPlanStep data={treatmentData} onChange={onTreatmentChange} />

          <div className="flex justify-end">
            <Button onClick={onFinalizePlan} size="lg" className="px-8">
              <Lock className="mr-2 h-4 w-4" />
              Finalize Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}