import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePatient } from '@/hooks/usePatients';
import { useDoctor, useEnsureDoctor } from '@/hooks/useDoctor';
import { useUpdateToothStatus } from '@/hooks/useDentalChart';
import { useUpsertTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { useCreateInitialPhoto } from '@/hooks/useInitialPhotos';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoStep } from './BasicInfoStep';
import { ClinicalRelationsStep } from './ClinicalRelationsStep';
import { ExtraOralStep } from './ExtraOralStep';
import { SegmentAnalysisStep } from './SegmentAnalysisStep';
import { TreatmentPlanStep } from './TreatmentPlanStep';
import { MediaUploadStep, UploadedImage } from './MediaUploadStep';
import { AITreatmentPlanStep } from './AITreatmentPlanStep';
import { CephalometricStep } from './CephalometricStep';
import { SoftTissueStep } from './SoftTissueStep';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { ToothStatus } from '@/types/patient';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Activity,
  Grid3X3,
  Circle,
  Tag,
  Image,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Clinical Relations', icon: Activity },
  { id: 3, title: 'Dental Chart', icon: Grid3X3 },
  { id: 4, title: 'Soft Tissue', icon: Circle },
  { id: 5, title: 'Segment Analysis', icon: Tag },
  { id: 6, title: 'Media', icon: Image },
  { id: 7, title: 'AI Plan', icon: Sparkles },
];

export function CaseSheetForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const { data: doctor } = useDoctor();
  const ensureDoctor = useEnsureDoctor();

  // Ensure doctor record exists on mount
  useEffect(() => {
    ensureDoctor.mutate();
  }, []);
  const updateToothStatus = useUpdateToothStatus();
  const upsertTreatmentPlan = useUpsertTreatmentPlan();
  const createInitialPhoto = useCreateInitialPhoto();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - Basic Info
  const [basicData, setBasicData] = useState({
    name: '',
    age: '' as number | '',
    chief_complaint: '',
    date_of_birth: '',
    address: '',
    phone_number: '',
    patient_code: '',
    medical_history: [] as string[],
    current_medications: [] as string[],
  });

  // Clinical Relations
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

  // Extra-Oral / Soft Tissue
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

  // Cephalometric Analysis
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

  const handleAIPlanApply = useCallback(
    (aiPlan: {
      primary_goals: string;
      appliance_types: string[];
      extraction_plan: string;
      estimated_duration: string;
      special_instructions: string;
    }) => {
      setTreatmentData(aiPlan);
    },
    []
  );

  const handleFinalizePlan = () => {
    setAiPlanFinalized(true);
    toast({
      title: 'Plan Finalized',
      description: 'The treatment plan has been finalized and is ready to save.',
    });
  };

  const changeStep = (newStep: number) => {
    if (newStep < 1 || newStep > STEPS.length) return;
    setCurrentStep(newStep);
  };

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
      // Generate patient code
      const { data: patientCode, error: codeError } = await supabase.rpc('generate_patient_code');
      if (codeError) throw codeError;

      const patientPayload = {
        name: basicData.name,
        age: basicData.age as number,
        chief_complaint: basicData.chief_complaint || undefined,
        phone_number: basicData.phone_number || undefined,
        patient_code: patientCode,
        doctor_id: doctor?.id || undefined,
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
        upper_space_available: segmentData.upper_space_available
          ? Number(segmentData.upper_space_available)
          : undefined,
        upper_space_required: segmentData.upper_space_required
          ? Number(segmentData.upper_space_required)
          : undefined,
        lower_space_available: segmentData.lower_space_available
          ? Number(segmentData.lower_space_available)
          : undefined,
        lower_space_required: segmentData.lower_space_required
          ? Number(segmentData.lower_space_required)
          : undefined,
      };

      const patient = await createPatient.mutateAsync(patientPayload);

      // Create patient account record if phone number provided
      if (basicData.phone_number && doctor?.id) {
        await supabase.from('patient_accounts').insert({
          patient_id: patient.id,
          phone_number: basicData.phone_number,
        });
      }

      for (const [key, status] of Object.entries(dentalChart)) {
        const [quadrant, toothNumber] = key.split('-').map(Number);
        await updateToothStatus.mutateAsync({
          patientId: patient.id,
          quadrant,
          toothNumber,
          status,
        });
      }

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

        const { data: urlData } = supabase.storage.from('patient-images').getPublicUrl(filePath);

        await createInitialPhoto.mutateAsync({
          patient_id: patient.id,
          image_url: urlData.publicUrl,
          image_type: image.type,
        });
      }

      // Show patient code in a prominent toast
      toast({
        title: `✅ Case Created — ${patientCode}`,
        description: `Patient ID: ${patientCode} — Share this with your patient for registration.`,
        duration: 15000,
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
        return <BasicInfoStep data={basicData} onChange={handleBasicChange} />;
      case 2:
        return <ClinicalRelationsStep data={clinicalData} onChange={handleClinicalChange} />;
      case 3:
        return <PalmerNotationChart teeth={dentalChart} onToothClick={handleToothClick} />;
      case 4:
        return <SoftTissueStep data={extraOralData} onChange={handleExtraOralChange} />;
      case 5:
        return <SegmentAnalysisStep data={segmentData} onChange={handleSegmentChange} />;
      case 6:
        return <MediaUploadStep images={uploadedImages} onImagesChange={setUploadedImages} />;
      case 7:
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
  };

  const currentStepData = STEPS[currentStep - 1];

  return (
    <div className="flex h-screen bg-sidebar text-sidebar-foreground">
      {/* Left Sidebar */}
      <aside className="flex w-72 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Back button + title */}
        <div className="p-5">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-sidebar-foreground">New Case</h1>
        </div>

        {/* Step Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => changeStep(step.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{step.title}</span>
                {isCompleted && (
                  <span className="h-2 w-2 rounded-full bg-success" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Content Header */}
        <header className="border-b border-border px-8 py-6">
          <h2 className="text-2xl font-bold text-foreground">{currentStepData?.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStep} of {STEPS.length}
          </p>
          <Separator className="mt-4" />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl">{renderStep()}</div>
        </main>

        {/* Bottom Bar */}
        <footer className="border-t border-border bg-card px-8 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => changeStep(currentStep - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button onClick={() => changeStep(currentStep + 1)}>
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Case Sheet'}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
