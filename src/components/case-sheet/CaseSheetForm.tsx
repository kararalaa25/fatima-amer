import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePatient } from '@/hooks/usePatients';
import { useUpdateToothStatus } from '@/hooks/useDentalChart';
import { useUpsertTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { useCreateInitialPhoto } from '@/hooks/useInitialPhotos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoStep } from './BasicInfoStep';
import { ClinicalRelationsStep } from './ClinicalRelationsStep';
import { SoftTissueStep } from './SoftTissueStep';
import { SegmentAnalysisStep } from './SegmentAnalysisStep';
import { TreatmentPlanStep } from './TreatmentPlanStep';
import { MediaUploadStep, UploadedImage } from './MediaUploadStep';
import { AITreatmentPlanStep } from './AITreatmentPlanStep';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { ToothStatus } from '@/types/patient';
import { ArrowLeft, ArrowRight, Save, Stethoscope, Check, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// New step order per "Clinician-First" workflow
const STEPS = [
  { id: 1, title: 'Basic Info', icon: '📋' },
  { id: 2, title: 'Clinical', icon: '🔬' },
  { id: 3, title: 'Soft Tissue', icon: '👄' },
  { id: 4, title: 'Dental Chart', icon: '🦷' },
  { id: 5, title: 'Segments', icon: '📐' },
  { id: 6, title: 'Media', icon: '📷' },
  { id: 7, title: 'AI Treatment', icon: '🧠' },
];

export function CaseSheetForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const updateToothStatus = useUpdateToothStatus();
  const upsertTreatmentPlan = useUpsertTreatmentPlan();
  const createInitialPhoto = useCreateInitialPhoto();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [aiPlanFinalized, setAiPlanFinalized] = useState(false);

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

  const handleAIPlanApply = useCallback((aiPlan: {
    primary_goals: string;
    appliance_types: string[];
    extraction_plan: string;
    estimated_duration: string;
    special_instructions: string;
  }) => {
    setTreatmentData(aiPlan);
  }, []);

  const handleFinalizePlan = () => {
    setAiPlanFinalized(true);
    toast({
      title: 'Plan Finalized',
      description: 'The treatment plan has been finalized and is ready to save.',
    });
  };

  // Smooth step transition
  const changeStep = (newStep: number) => {
    if (newStep === currentStep || newStep < 1 || newStep > STEPS.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsTransitioning(false);
    }, 100);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name and Age)',
        variant: 'destructive',
      });
      changeStep(1);
      return;
    }

    // Check for images without types
    const missingTypes = uploadedImages.filter((img) => !img.type);
    if (missingTypes.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please assign a type to all uploaded images',
        variant: 'destructive',
      });
      changeStep(6);
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

      // Upload images to storage and save references
      for (const image of uploadedImages) {
        const fileExt = image.file.name.split('.').pop();
        const filePath = `${patient.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('patient-images')
          .upload(filePath, image.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('patient-images')
          .getPublicUrl(filePath);

        await createInitialPhoto.mutateAsync({
          patient_id: patient.id,
          image_url: urlData.publicUrl,
          image_type: image.type,
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
    const stepContent = (() => {
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
          return <MediaUploadStep images={uploadedImages} onImagesChange={setUploadedImages} />;
        case 7:
          return (
            <AITreatmentPlanStep
              clinicalData={formData}
              dentalChart={dentalChart}
              uploadedImages={uploadedImages}
              treatmentData={treatmentData}
              onTreatmentChange={handleTreatmentChange}
              onApplyAIPlan={handleAIPlanApply}
              onFinalizePlan={handleFinalizePlan}
              isFinalized={aiPlanFinalized}
            />
          );
        default:
          return null;
      }
    })();

    return (
      <div
        className={cn(
          'transition-all duration-150 ease-out',
          isTransitioning ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
        )}
      >
        {stepContent}
      </div>
    );
  };

  return (
    <div className="min-h-screen mesh-gradient-bg relative">
      {/* Header */}
      <header className="relative z-10 glass-nav">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-2xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl glass-card">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">New Patient Case Sheet</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Progress Steps with Navigation */}
      <div className="sticky top-0 z-50 glass-nav shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="shrink-0 rounded-xl font-semibold"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Step Indicators */}
            <div className="flex overflow-x-auto px-2 scrollbar-hide">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => changeStep(step.id)}
                  className={cn(
                    'flex min-w-max items-center gap-1 px-2 py-1 text-sm transition-all duration-150 sm:gap-2 sm:px-3',
                    currentStep === step.id
                      ? 'font-bold text-primary scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all duration-150',
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : currentStep > step.id
                        ? 'bg-success text-success-foreground'
                        : 'glass-card-solid text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : step.id === 7 ? (
                      <Brain className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className="hidden lg:inline font-medium">{step.title}</span>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="ml-1 h-3 w-3 text-muted-foreground/50 sm:ml-2 sm:h-4 sm:w-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Next/Save Button */}
            {currentStep < STEPS.length ? (
              <Button
                size="sm"
                onClick={() => changeStep(currentStep + 1)}
                className="shrink-0 rounded-xl font-semibold"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="shrink-0 rounded-xl font-semibold">
                <Save className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">{isSubmitting ? 'Saving...' : 'Save'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Card className="mx-auto max-w-4xl glass-card border-0">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Bottom Navigation Buttons */}
        <div className="mx-auto mt-6 flex max-w-4xl justify-between">
          <Button
            variant="outline"
            onClick={() => changeStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="rounded-2xl glass-card border-0 font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={() => changeStep(currentStep + 1)} className="rounded-2xl font-semibold">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-2xl font-semibold">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Case Sheet'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
