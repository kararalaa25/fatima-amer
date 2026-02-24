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
import { ExtraOralStep } from './ExtraOralStep';
import { SegmentAnalysisStep } from './SegmentAnalysisStep';
import { TreatmentPlanStep } from './TreatmentPlanStep';
import { MediaUploadStep, UploadedImage } from './MediaUploadStep';
import { AITreatmentPlanStep } from './AITreatmentPlanStep';
import { CephalometricStep } from './CephalometricStep';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ToothStatus } from '@/types/patient';
import { ArrowLeft, ArrowRight, Save, Stethoscope, Check, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Updated 8-step workflow
const STEPS = [
  { id: 1, title: 'Basic Info', icon: '📋' },
  { id: 2, title: 'Clinical', icon: '🔬' },
  { id: 3, title: 'Extra-Oral', icon: '👤' },
  { id: 4, title: 'Dental Chart', icon: '🦷' },
  { id: 5, title: 'Segments', icon: '📐' },
  { id: 6, title: 'Cephalometric', icon: '📊' },
  { id: 7, title: 'Media', icon: '📷' },
  { id: 8, title: 'AI Treatment', icon: '🧠' },
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

  // Form state - Basic Info (expanded)
  const [basicData, setBasicData] = useState({
    name: '',
    age: '' as number | '',
    chief_complaint: '',
    date_of_birth: '',
    address: '',
    medical_history: [] as string[],
    current_medications: [] as string[],
  });

  // Clinical Relations (enhanced)
  const [clinicalData, setClinicalData] = useState({
    ap_relation: '',
    horizontal_relation: '',
    vertical_relation: '',
    overbite_mm: '' as number | '',
    overjet_mm: '' as number | '',
    molar_relation: '',
    molar_class_subdivision: '',
    canine_relation: '',
    canine_class_subdivision: '',
    incisor_relation: '',
    oral_hygiene: '',
    crossbite_anterior: '',
    crossbite_posterior: '',
    midline_shift: '',
    midline_discrepancy: '' as number | '',
  });

  // Extra-Oral Examination (new)
  const [extraOralData, setExtraOralData] = useState({
    lips: '',
    habits: '',
    tongue_position: '',
    tongue_size: '',
    lip_strain: false,
    nasolabial_angle: '' as number | '',
    mentolabial_sulcus: '',
    max_jaw_opening: '' as number | '',
  });

  // Segment Analysis
  const [segmentData, setSegmentData] = useState({
    upper_buccal: '',
    lower_buccal: '',
    upper_labial: '',
    lower_labial: '',
    upper_space_available: '' as number | '',
    upper_space_required: '' as number | '',
    lower_space_available: '' as number | '',
    lower_space_required: '' as number | '',
  });

  // Cephalometric Analysis (new)
  const [cephData, setCephData] = useState({
    ceph_sna: '' as number | '',
    ceph_snb: '' as number | '',
    ceph_anb: '' as number | '',
    ceph_wits: '' as number | '',
    ceph_sn_mp: '' as number | '',
    ceph_fma: '' as number | '',
    ceph_facial_angle: '' as number | '',
    ceph_gonial_angle: '' as number | '',
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

  const handleBasicChange = (field: string, value: string | number | string[]) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClinicalChange = (field: string, value: string | number) => {
    setClinicalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExtraOralChange = (field: string, value: string | number | boolean) => {
    setExtraOralData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSegmentChange = (field: string, value: string | number) => {
    setSegmentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCephChange = (field: string, value: number | '') => {
    setCephData((prev) => ({ ...prev, [field]: value }));
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

  // Combine all form data for AI analysis
  const getAllFormData = () => ({
    ...basicData,
    ...clinicalData,
    ...extraOralData,
    ...segmentData,
    ...cephData,
  });

  const handleSubmit = async () => {
    if (!basicData.name || !basicData.age) {
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
      changeStep(7);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create patient with all data
      const patientPayload = {
        name: basicData.name,
        age: basicData.age as number,
        chief_complaint: basicData.chief_complaint || undefined,
        ap_relation: clinicalData.ap_relation || undefined,
        horizontal_relation: clinicalData.horizontal_relation || undefined,
        vertical_relation: clinicalData.vertical_relation || undefined,
        overbite_mm: clinicalData.overbite_mm ? Number(clinicalData.overbite_mm) : undefined,
        overjet_mm: clinicalData.overjet_mm ? Number(clinicalData.overjet_mm) : undefined,
        molar_relation: clinicalData.molar_relation || undefined,
        canine_relation: clinicalData.canine_relation || undefined,
        incisor_relation: clinicalData.incisor_relation || undefined,
        oral_hygiene: (clinicalData.oral_hygiene as 'Good' | 'Fair' | 'Poor') || undefined,
        lips: (extraOralData.lips as 'Competent' | 'Incompetent' | 'Potentially Competent') || undefined,
        habits: extraOralData.habits || undefined,
        tongue_position: extraOralData.tongue_position || undefined,
        tongue_size: extraOralData.tongue_size || undefined,
        upper_buccal: (segmentData.upper_buccal as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        lower_buccal: (segmentData.lower_buccal as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        upper_labial: (segmentData.upper_labial as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        lower_labial: (segmentData.lower_labial as 'Aligned' | 'Crowded' | 'Spacing') || undefined,
        upper_space_available: segmentData.upper_space_available ? Number(segmentData.upper_space_available) : undefined,
        upper_space_required: segmentData.upper_space_required ? Number(segmentData.upper_space_required) : undefined,
        lower_space_available: segmentData.lower_space_available ? Number(segmentData.lower_space_available) : undefined,
        lower_space_required: segmentData.lower_space_required ? Number(segmentData.lower_space_required) : undefined,
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
          return <BasicInfoStep data={basicData} onChange={handleBasicChange} />;
        case 2:
          return <ClinicalRelationsStep data={clinicalData} onChange={handleClinicalChange} />;
        case 3:
          return <ExtraOralStep data={extraOralData} onChange={handleExtraOralChange} />;
        case 4:
          return <PalmerNotationChart teeth={dentalChart} onToothClick={handleToothClick} />;
        case 5:
          return <SegmentAnalysisStep data={segmentData} onChange={handleSegmentChange} />;
        case 6:
          return <CephalometricStep data={cephData} onChange={handleCephChange} />;
        case 7:
          return <MediaUploadStep images={uploadedImages} onImagesChange={setUploadedImages} />;
        case 8:
          return (
            <AITreatmentPlanStep
              clinicalData={getAllFormData()}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flat-nav relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-2xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sticky Progress Steps with Navigation */}
      <div className="sticky top-0 z-50 flat-nav">
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
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : step.id === 8 ? (
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
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Bottom Navigation Buttons */}
        <div className="mx-auto mt-6 flex max-w-4xl justify-between">
          <Button
            variant="outline"
            onClick={() => changeStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="font-semibold"
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
