import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePatient } from '@/hooks/usePatients';
import { useUpdateToothStatus } from '@/hooks/useDentalChart';
import { useUpsertTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoStep } from './BasicInfoStep';
import { ClinicalRelationsStep } from './ClinicalRelationsStep';
import { SoftTissueStep } from './SoftTissueStep';
import { SegmentAnalysisStep } from './SegmentAnalysisStep';
import { TreatmentPlanStep } from './TreatmentPlanStep';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { ToothStatus } from '@/types/patient';
import { ArrowLeft, ArrowRight, Save, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Clinical' },
  { id: 3, title: 'Soft Tissue' },
  { id: 4, title: 'Dental Chart' },
  { id: 5, title: 'Segments' },
  { id: 6, title: 'Treatment' },
];

export function CaseSheetForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const updateToothStatus = useUpdateToothStatus();
  const upsertTreatmentPlan = useUpsertTreatmentPlan();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    age: '' as number | '',
    chief_complaint: '',
    // Clinical Relations
    ap_relation: '',
    horizontal_relation: '',
    vertical_relation: '',
    overbite_mm: '' as number | '',
    overjet_mm: '' as number | '',
    molar_relation: '',
    canine_relation: '',
    incisor_relation: '',
    oral_hygiene: '',
    // Soft Tissue
    lips: '',
    habits: '',
    tongue_position: '',
    tongue_size: '',
    // Segment Analysis
    upper_buccal: '',
    lower_buccal: '',
    upper_labial: '',
    lower_labial: '',
    upper_space_available: '' as number | '',
    upper_space_required: '' as number | '',
    lower_space_available: '' as number | '',
    lower_space_required: '' as number | '',
  });

  const [treatmentData, setTreatmentData] = useState({
    primary_goals: '',
    appliance_types: [] as string[],
    extraction_plan: '',
    estimated_duration: '',
    special_instructions: '',
  });

  const [dentalChart, setDentalChart] = useState<Record<string, ToothStatus>>({});

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTreatmentChange = (field: string, value: string | string[]) => {
    setTreatmentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToothClick = (quadrant: number, toothNumber: number, newStatus: ToothStatus) => {
    const key = `${quadrant}-${toothNumber}`;
    setDentalChart((prev) => ({ ...prev, [key]: newStatus }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name and Age)',
        variant: 'destructive',
      });
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create patient
      const patientPayload = {
        name: formData.name,
        age: formData.age as number,
        chief_complaint: formData.chief_complaint || undefined,
        ap_relation: formData.ap_relation || undefined,
        horizontal_relation: formData.horizontal_relation || undefined,
        vertical_relation: formData.vertical_relation || undefined,
        overbite_mm: formData.overbite_mm ? Number(formData.overbite_mm) : undefined,
        overjet_mm: formData.overjet_mm ? Number(formData.overjet_mm) : undefined,
        molar_relation: formData.molar_relation || undefined,
        canine_relation: formData.canine_relation || undefined,
        incisor_relation: formData.incisor_relation || undefined,
        oral_hygiene: (formData.oral_hygiene as 'Good' | 'Fair' | 'Poor') || undefined,
        lips: (formData.lips as 'Competent' | 'Incompetent' | 'Potentially Competent') || undefined,
        habits: formData.habits || undefined,
        tongue_position: formData.tongue_position || undefined,
        tongue_size: formData.tongue_size || undefined,
        upper_buccal: (formData.upper_buccal as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        lower_buccal: (formData.lower_buccal as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        upper_labial: (formData.upper_labial as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        lower_labial: (formData.lower_labial as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        upper_space_available: formData.upper_space_available ? Number(formData.upper_space_available) : undefined,
        upper_space_required: formData.upper_space_required ? Number(formData.upper_space_required) : undefined,
        lower_space_available: formData.lower_space_available ? Number(formData.lower_space_available) : undefined,
        lower_space_required: formData.lower_space_required ? Number(formData.lower_space_required) : undefined,
      };

      const patient = await createPatient.mutateAsync(patientPayload);

      // Save dental chart
      for (const [key, status] of Object.entries(dentalChart)) {
        const [quadrant, toothNumber] = key.split('-').map(Number);
        await updateToothStatus.mutateAsync({
          patientId: patient.id,
          quadrant,
          toothNumber,
          status,
        });
      }

      // Save treatment plan if any data exists
      if (
        treatmentData.primary_goals ||
        treatmentData.appliance_types.length > 0 ||
        treatmentData.extraction_plan ||
        treatmentData.estimated_duration ||
        treatmentData.special_instructions
      ) {
        await upsertTreatmentPlan.mutateAsync({
          patient_id: patient.id,
          ...treatmentData,
        });
      }

      toast({
        title: 'Success',
        description: 'Patient case sheet created successfully',
      });

      navigate(`/patient/${patient.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to create patient case sheet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={formData} onChange={handleFormChange} />;
      case 2:
        return <ClinicalRelationsStep data={formData} onChange={handleFormChange} />;
      case 3:
        return <SoftTissueStep data={formData} onChange={handleFormChange} />;
      case 4:
        return <PalmerNotationChart teeth={dentalChart} onToothClick={handleToothClick} />;
      case 5:
        return <SegmentAnalysisStep data={formData} onChange={handleFormChange} />;
      case 6:
        return <TreatmentPlanStep data={treatmentData} onChange={handleTreatmentChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">New Patient Case Sheet</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  'flex min-w-max items-center gap-2 px-4 py-2 text-sm transition-colors',
                  currentStep === step.id
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.id
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.id}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mx-auto mt-6 flex max-w-4xl justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={() => setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Case Sheet'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
