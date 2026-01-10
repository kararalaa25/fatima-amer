import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { useDentalChart } from '@/hooks/useDentalChart';
import { useTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { useSessions, useCreateSession, useUploadSessionImage } from '@/hooks/useSessions';
import { useInitialPhotos, useUploadInitialPhoto } from '@/hooks/useInitialPhotos';
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
} from 'lucide-react';
import { format } from 'date-fns';

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

  const createSession = useCreateSession();
  const uploadSessionImage = useUploadSessionImage();
  const uploadInitialPhoto = useUploadInitialPhoto();

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
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
                <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{patient.age} years old</span>
                  <span>•</span>
                  <span>Created {format(new Date(patient.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="dental" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Dental Chart</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                  </div>
                  {patient.chief_complaint && (
                    <div>
                      <p className="text-sm text-muted-foreground">Chief Complaint</p>
                      <p className="font-medium">{patient.chief_complaint}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Relations */}
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Relations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {patient.ap_relation && (
                      <div>
                        <p className="text-muted-foreground">AP Relation</p>
                        <p className="font-medium">{patient.ap_relation}</p>
                      </div>
                    )}
                    {patient.molar_relation && (
                      <div>
                        <p className="text-muted-foreground">Molar Relation</p>
                        <p className="font-medium">{patient.molar_relation}</p>
                      </div>
                    )}
                    {patient.overbite_mm && (
                      <div>
                        <p className="text-muted-foreground">Overbite</p>
                        <p className="font-medium">{patient.overbite_mm} mm</p>
                      </div>
                    )}
                    {patient.overjet_mm && (
                      <div>
                        <p className="text-muted-foreground">Overjet</p>
                        <p className="font-medium">{patient.overjet_mm} mm</p>
                      </div>
                    )}
                    {patient.oral_hygiene && (
                      <div>
                        <p className="text-muted-foreground">Oral Hygiene</p>
                        <Badge variant="outline">{patient.oral_hygiene}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              {treatmentPlan && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Treatment Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {treatmentPlan.primary_goals && (
                      <div>
                        <p className="text-sm text-muted-foreground">Primary Goals</p>
                        <p className="font-medium">{treatmentPlan.primary_goals}</p>
                      </div>
                    )}
                    {treatmentPlan.appliance_types && treatmentPlan.appliance_types.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">Appliances</p>
                        <div className="flex flex-wrap gap-2">
                          {treatmentPlan.appliance_types.map((type) => (
                            <Badge key={type}>{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {treatmentPlan.extraction_plan && (
                        <div>
                          <p className="text-sm text-muted-foreground">Extraction Plan</p>
                          <p className="font-medium">{treatmentPlan.extraction_plan}</p>
                        </div>
                      )}
                      {treatmentPlan.estimated_duration && (
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{treatmentPlan.estimated_duration}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
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
        </Tabs>
      </main>
    </div>
  );
}
