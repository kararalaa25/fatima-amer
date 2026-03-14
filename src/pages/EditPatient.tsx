import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useDentalChart, useUpdateToothStatus } from '@/hooks/useDentalChart';
import { useTreatmentPlan, useUpsertTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { BasicInfoStep } from '@/components/case-sheet/BasicInfoStep';
import { ClinicalRelationsStep } from '@/components/case-sheet/ClinicalRelationsStep';
import { ExtraOralStep } from '@/components/case-sheet/ExtraOralStep';
import { SegmentAnalysisStep } from '@/components/case-sheet/SegmentAnalysisStep';
import { TreatmentPlanStep } from '@/components/case-sheet/TreatmentPlanStep';
import { CephalometricStep } from '@/components/case-sheet/CephalometricStep';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { ToothStatus } from '@/types/patient';

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: patient, isLoading: patientLoading } = usePatient(id!);
  const { data: dentalChartData } = useDentalChart(id!);
  const { data: treatmentPlan } = useTreatmentPlan(id!);

  const updatePatient = useUpdatePatient();
  const updateToothStatus = useUpdateToothStatus();
  const upsertTreatmentPlan = useUpsertTreatmentPlan();

  // Basic info form state
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

  // Clinical relations form state
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

  // Extra-oral form state (renamed from soft tissue)
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

  // Segment analysis form state
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

  // Cephalometric data
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

  // Load patient data
  useEffect(() => {
    if (patient) {
      setBasicData({
        name: patient.name || '',
        age: patient.age || '',
        chief_complaint: patient.chief_complaint || '',
        date_of_birth: '',
        address: '',
        phone_number: (patient as any).phone_number || '',
        medical_history: [],
        current_medications: [],
      });
      setClinicalData({
        ap_relation: patient.ap_relation || '',
        horizontal_relation: patient.horizontal_relation || '',
        vertical_relation: patient.vertical_relation || '',
        overbite_mm: patient.overbite_mm ?? '',
        overjet_mm: patient.overjet_mm ?? '',
        molar_relation: patient.molar_relation || '',
        molar_class_subdivision: '',
        canine_relation: patient.canine_relation || '',
        canine_class_subdivision: '',
        incisor_relation: patient.incisor_relation || '',
        oral_hygiene: patient.oral_hygiene || '',
        crossbite_anterior: '',
        crossbite_posterior: '',
        midline_shift: '',
        midline_discrepancy: '',
      });
      setExtraOralData({
        lips: patient.lips || '',
        habits: patient.habits || '',
        tongue_position: patient.tongue_position || '',
        tongue_size: patient.tongue_size || '',
        lip_strain: false,
        nasolabial_angle: '',
        mentolabial_sulcus: '',
        max_jaw_opening: '',
      });
      setSegmentData({
        upper_buccal: patient.upper_buccal || '',
        lower_buccal: patient.lower_buccal || '',
        upper_labial: patient.upper_labial || '',
        lower_labial: patient.lower_labial || '',
        upper_space_available: patient.upper_space_available ?? '',
        upper_space_required: patient.upper_space_required ?? '',
        lower_space_available: patient.lower_space_available ?? '',
        lower_space_required: patient.lower_space_required ?? '',
      });
    }
  }, [patient]);

  // Load treatment plan
  useEffect(() => {
    if (treatmentPlan) {
      setTreatmentData({
        primary_goals: treatmentPlan.primary_goals || '',
        appliance_types: treatmentPlan.appliance_types || [],
        extraction_plan: treatmentPlan.extraction_plan || '',
        estimated_duration: treatmentPlan.estimated_duration || '',
        special_instructions: treatmentPlan.special_instructions || '',
      });
    }
  }, [treatmentPlan]);

  // Load dental chart
  useEffect(() => {
    if (dentalChartData) {
      const chartMap: Record<string, ToothStatus> = {};
      dentalChartData.forEach((tooth) => {
        chartMap[`${tooth.quadrant}-${tooth.tooth_number}`] = tooth.status as ToothStatus;
      });
      setDentalChart(chartMap);
    }
  }, [dentalChartData]);

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

  const handleToothClick = (quadrant: number, toothNumber: number, status: ToothStatus) => {
    const key = `${quadrant}-${toothNumber}`;
    setDentalChart((prev) => ({ ...prev, [key]: status }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      // Update patient
      await updatePatient.mutateAsync({
        id,
        name: basicData.name,
        age: typeof basicData.age === 'number' ? basicData.age : parseInt(String(basicData.age), 10),
        chief_complaint: basicData.chief_complaint || undefined,
        ap_relation: clinicalData.ap_relation || undefined,
        horizontal_relation: clinicalData.horizontal_relation || undefined,
        vertical_relation: clinicalData.vertical_relation || undefined,
        overbite_mm: typeof clinicalData.overbite_mm === 'number' ? clinicalData.overbite_mm : undefined,
        overjet_mm: typeof clinicalData.overjet_mm === 'number' ? clinicalData.overjet_mm : undefined,
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
        upper_space_available: typeof segmentData.upper_space_available === 'number' ? segmentData.upper_space_available : undefined,
        upper_space_required: typeof segmentData.upper_space_required === 'number' ? segmentData.upper_space_required : undefined,
        lower_space_available: typeof segmentData.lower_space_available === 'number' ? segmentData.lower_space_available : undefined,
        lower_space_required: typeof segmentData.lower_space_required === 'number' ? segmentData.lower_space_required : undefined,
      });

      // Update dental chart
      for (const [key, status] of Object.entries(dentalChart)) {
        const [quadrant, toothNumber] = key.split('-').map(Number);
        await updateToothStatus.mutateAsync({
          patientId: id,
          quadrant,
          toothNumber,
          status,
        });
      }

      // Update treatment plan
      await upsertTreatmentPlan.mutateAsync({
        id: treatmentPlan?.id,
        patient_id: id,
        primary_goals: treatmentData.primary_goals || undefined,
        appliance_types: treatmentData.appliance_types.length > 0 ? treatmentData.appliance_types : undefined,
        extraction_plan: treatmentData.extraction_plan || undefined,
        estimated_duration: treatmentData.estimated_duration || undefined,
        special_instructions: treatmentData.special_instructions || undefined,
      });

      toast({ title: 'Patient updated successfully' });
      navigate(`/patient/${id}`);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({ title: 'Failed to update patient', variant: 'destructive' });
    }
  };

  if (patientLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Patient not found</p>
        <Button variant="link" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flat-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/patient/${id}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Edit Patient: {patient.name}</h1>
                <p className="text-sm text-muted-foreground">Modify patient details and clinical data</p>
              </div>
            </div>
            <Button onClick={handleSave} className="rounded-2xl">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-auto sm:flex-nowrap">
            <TabsTrigger value="basic" className="px-3 py-2">Basic Info</TabsTrigger>
            <TabsTrigger value="clinical" className="px-3 py-2">Clinical</TabsTrigger>
            <TabsTrigger value="extra-oral" className="px-3 py-2">Extra-Oral</TabsTrigger>
            <TabsTrigger value="segment" className="px-3 py-2">Segments</TabsTrigger>
            <TabsTrigger value="dental-chart" className="px-3 py-2">Dental Chart</TabsTrigger>
            <TabsTrigger value="ceph" className="px-3 py-2">Cephalometric</TabsTrigger>
            <TabsTrigger value="treatment" className="px-3 py-2">Treatment</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-6">
              <TabsContent value="basic" className="mt-0">
                <BasicInfoStep data={basicData} onChange={handleBasicChange} />
              </TabsContent>

              <TabsContent value="clinical" className="mt-0">
                <ClinicalRelationsStep data={clinicalData} onChange={handleClinicalChange} />
              </TabsContent>

              <TabsContent value="extra-oral" className="mt-0">
                <ExtraOralStep data={extraOralData} onChange={handleExtraOralChange} />
              </TabsContent>

              <TabsContent value="segment" className="mt-0">
                <SegmentAnalysisStep data={segmentData} onChange={handleSegmentChange} />
              </TabsContent>

              <TabsContent value="dental-chart" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Dental Chart</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on teeth to toggle their status
                    </p>
                  </div>
                  <PalmerNotationChart
                    teeth={dentalChart}
                    onToothClick={handleToothClick}
                    readonly={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ceph" className="mt-0">
                <CephalometricStep data={cephData} onChange={handleCephChange} />
              </TabsContent>

              <TabsContent value="treatment" className="mt-0">
                <TreatmentPlanStep data={treatmentData} onChange={handleTreatmentChange} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
}
