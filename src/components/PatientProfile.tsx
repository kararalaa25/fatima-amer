import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { useDentalChart } from '@/hooks/useDentalChart';
import { useTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { useSessions, useCreateSession, useUploadSessionImage } from '@/hooks/useSessions';
import { useInitialPhotos, useUploadInitialPhoto } from '@/hooks/useInitialPhotos';
import { useDoctor } from '@/hooks/useDoctor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PalmerNotationChart } from '@/components/dental-chart/PalmerNotationChart';
import { PatientGallery } from '@/components/gallery/PatientGallery';
import { ToothStatus } from '@/types/patient';
import {
  ArrowLeft,
  User,
  FileText,
  Camera,
  Plus,
  Upload,
  Calendar,
  Stethoscope,
  FolderOpen,
  Sparkles,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { SmileTransformation } from '@/components/smile-transformation/SmileTransformation';
import { QRCodeSVG } from 'qrcode.react';

export function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionFileInputRef = useRef<HTMLInputElement>(null);

  const { data: patient, isLoading: patientLoading } = usePatient(id!);
  const { data: dentalChartData } = useDentalChart(id!);
  const { data: treatmentPlan } = useTreatmentPlan(id!);
  const { data: sessions } = useSessions(id!);
  const { data: initialPhotos } = useInitialPhotos(id!);
  const { data: doctor } = useDoctor();

  const createSession = useCreateSession();
  const uploadSessionImage = useUploadSessionImage();
  const uploadInitialPhoto = useUploadInitialPhoto();

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    session_date: format(new Date(), 'yyyy-MM-dd'),
    treatment_performed: '',
  });
  const [pendingSessionImages, setPendingSessionImages] = useState<File[]>([]);

  // Convert dental chart data to the format expected by PalmerNotationChart
  const dentalChartMap: Record<string, ToothStatus> = {};
  dentalChartData?.forEach((tooth) => {
    dentalChartMap[`${tooth.quadrant}-${tooth.tooth_number}`] = tooth.status as ToothStatus;
  });

  const handleInitialPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    for (const file of Array.from(files)) {
      try {
        await uploadInitialPhoto.mutateAsync({ patientId: id, file });
        toast({ title: 'Photo uploaded successfully' });
      } catch (error) {
        console.error('Upload error:', error);
        toast({ title: 'Failed to upload photo', variant: 'destructive' });
      }
    }
  };

  const handleSessionImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPendingSessionImages(Array.from(files));
    }
  };

  const handleCreateSession = async () => {
    if (!id) return;

    try {
      const session = await createSession.mutateAsync({
        patient_id: id,
        session_date: sessionForm.session_date,
        treatment_performed: sessionForm.treatment_performed,
      });

      // Upload images for this session
      for (const file of pendingSessionImages) {
        await uploadSessionImage.mutateAsync({ sessionId: session.id, file });
      }

      toast({ title: 'Session created successfully' });
      setIsAddSessionOpen(false);
      setSessionForm({
        session_date: format(new Date(), 'yyyy-MM-dd'),
        treatment_performed: '',
      });
      setPendingSessionImages([]);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({ title: 'Failed to create session', variant: 'destructive' });
    }
  };

  if (patientLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
                  {(patient as any).patient_code && (
                    <Badge variant="outline" className="font-mono text-primary border-primary/30">
                      {(patient as any).patient_code}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{patient.age} years old</span>
                  <span>•</span>
                  <span>Created {format(new Date(patient.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(patient as any).patient_code && doctor?.doctor_code && (
                <Button variant="outline" onClick={() => setShowQR(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Access QR
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(`/case-management/${id}`)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Case Management
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInitialPhotoUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="inline-flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1 sm:w-auto sm:flex-nowrap">
            <TabsTrigger value="overview" className="flex items-center gap-2 px-3 py-2">
              <FileText className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="dental" className="flex items-center gap-2 px-3 py-2">
              <Stethoscope className="h-4 w-4" />
              <span>Dental Chart</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 px-3 py-2">
              <Calendar className="h-4 w-4" />
              <span>Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 px-3 py-2">
              <Camera className="h-4 w-4" />
              <span>Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="transformation" className="flex items-center gap-2 px-3 py-2">
              <Sparkles className="h-4 w-4" />
              <span>Smile Transformation</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Edit Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => navigate(`/patient/${id}/edit`)}>
                <FileText className="mr-2 h-4 w-4" />
                Edit Patient Details
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Name</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Chief Complaint</p>
                    <p className="font-medium">{patient.chief_complaint || 'Not Recorded'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Relations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Clinical Relations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">AP Relation</p>
                      <p className="font-medium">{patient.ap_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Molar Relation</p>
                      <p className="font-medium">{patient.molar_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Canine Relation</p>
                      <p className="font-medium">{patient.canine_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Incisor Relation</p>
                      <p className="font-medium">{patient.incisor_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Horizontal Relation</p>
                      <p className="font-medium">{patient.horizontal_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Vertical Relation</p>
                      <p className="font-medium">{patient.vertical_relation || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Overbite</p>
                      <p className="font-medium">{patient.overbite_mm != null ? `${patient.overbite_mm} mm` : 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Overjet</p>
                      <p className="font-medium">{patient.overjet_mm != null ? `${patient.overjet_mm} mm` : 'Not Recorded'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-muted-foreground">Oral Hygiene</p>
                      {patient.oral_hygiene ? (
                        <Badge variant="outline">{patient.oral_hygiene}</Badge>
                      ) : (
                        <p className="font-medium">Not Recorded</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Soft Tissue & Myofunctional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Soft Tissue & Myofunctional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Lips</p>
                      <p className="font-medium">{patient.lips || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Tongue Position</p>
                      <p className="font-medium">{patient.tongue_position || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Tongue Size</p>
                      <p className="font-medium">{patient.tongue_size || 'Not Recorded'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Habits</p>
                    <p className="font-medium text-sm">{patient.habits || 'Not Recorded'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Segment & Space Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Segment & Space Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Upper Buccal</p>
                      <p className="font-medium">{patient.upper_buccal || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Lower Buccal</p>
                      <p className="font-medium">{patient.lower_buccal || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Upper Labial</p>
                      <p className="font-medium">{patient.upper_labial || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Lower Labial</p>
                      <p className="font-medium">{patient.lower_labial || 'Not Recorded'}</p>
                    </div>
                  </div>
                  
                  {/* Upper Arch Space Analysis */}
                  {(patient.upper_buccal === 'Crowded' || patient.upper_buccal === 'Spacing' ||
                    patient.upper_labial === 'Crowded' || patient.upper_labial === 'Spacing') && (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-muted-foreground mb-2">Upper Arch Space</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">{patient.upper_space_available != null ? `${patient.upper_space_available} mm` : 'Not Recorded'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Required</p>
                          <p className="font-medium">{patient.upper_space_required != null ? `${patient.upper_space_required} mm` : 'Not Recorded'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Lower Arch Space Analysis */}
                  {(patient.lower_buccal === 'Crowded' || patient.lower_buccal === 'Spacing' ||
                    patient.lower_labial === 'Crowded' || patient.lower_labial === 'Spacing') && (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-muted-foreground mb-2">Lower Arch Space</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">{patient.lower_space_available != null ? `${patient.lower_space_available} mm` : 'Not Recorded'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Required</p>
                          <p className="font-medium">{patient.lower_space_required != null ? `${patient.lower_space_required} mm` : 'Not Recorded'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Primary Goals</p>
                    <p className="font-medium">{treatmentPlan?.primary_goals || 'Not Recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Appliance Types</p>
                    {treatmentPlan?.appliance_types && treatmentPlan.appliance_types.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {treatmentPlan.appliance_types.map((type) => (
                          <Badge key={type}>{type}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">Not Recorded</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Extraction Plan</p>
                      <p className="font-medium">{treatmentPlan?.extraction_plan || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Estimated Duration</p>
                      <p className="font-medium">{treatmentPlan?.estimated_duration || 'Not Recorded'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Special Instructions</p>
                    <p className="font-medium">{treatmentPlan?.special_instructions || 'Not Recorded'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dental Chart Preview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Dental Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <PalmerNotationChart teeth={dentalChartMap} onToothClick={() => {}} readonly />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dental Chart Tab */}
          <TabsContent value="dental">
            <Card>
              <CardContent className="p-6">
                <PalmerNotationChart teeth={dentalChartMap} onToothClick={() => {}} readonly />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Treatment Sessions</h2>
              <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session_date">Date</Label>
                      <Input
                        id="session_date"
                        type="date"
                        value={sessionForm.session_date}
                        onChange={(e) =>
                          setSessionForm((prev) => ({ ...prev, session_date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="treatment_performed">Treatment Performed</Label>
                      <Textarea
                        id="treatment_performed"
                        value={sessionForm.treatment_performed}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            treatment_performed: e.target.value,
                          }))
                        }
                        placeholder="Describe the treatment performed..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Session Photos</Label>
                      <input
                        type="file"
                        ref={sessionFileInputRef}
                        onChange={handleSessionImagesSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => sessionFileInputRef.current?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Select Photos ({pendingSessionImages.length})
                      </Button>
                    </div>
                    <Button onClick={handleCreateSession} className="w-full">
                      Create Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {sessions?.length === 0 ? (
              <Card>
                <CardContent className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                  <Calendar className="mb-2 h-12 w-12" />
                  <p>No sessions recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions?.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {format(new Date(session.session_date), 'MMMM d, yyyy')}
                        </CardTitle>
                        <Badge variant="outline">Session</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {session.treatment_performed && (
                        <p className="text-sm text-muted-foreground">
                          {session.treatment_performed}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <PatientGallery
              patientId={id!}
              initialPhotos={initialPhotos || []}
              sessions={sessions || []}
            />
          </TabsContent>

          {/* Smile Transformation Tab */}
          <TabsContent value="transformation">
            <SmileTransformation 
              patientId={id!} 
              patientName={patient.name} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
