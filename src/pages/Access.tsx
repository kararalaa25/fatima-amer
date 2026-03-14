import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2, Search, Stethoscope, Hash, User, Activity, Calendar,
  FileText, Image as ImageIcon, ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';

interface PatientViewData {
  id: string;
  name: string;
  age: number;
  patient_code: string;
  chief_complaint?: string;
  oral_hygiene?: string;
  created_at: string;
}

interface SessionViewData {
  id: string;
  session_date: string;
  treatment_performed?: string;
}

interface TreatmentViewData {
  primary_goals?: string;
  appliance_types?: string[];
  extraction_plan?: string;
  estimated_duration?: string;
  special_instructions?: string;
}

interface PhotoViewData {
  id: string;
  image_url: string;
  image_type?: string;
}

export default function Access() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctorCode, setDoctorCode] = useState(searchParams.get('doc') || '');
  const [patientCode, setPatientCode] = useState(searchParams.get('pat') || '');
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientViewData | null>(null);
  const [sessions, setSessions] = useState<SessionViewData[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentViewData | null>(null);
  const [photos, setPhotos] = useState<PhotoViewData[]>([]);
  const [autoLoaded, setAutoLoaded] = useState(false);

  useEffect(() => {
    if (searchParams.get('doc') && searchParams.get('pat') && !autoLoaded) {
      setAutoLoaded(true);
      handleLookup();
    }
  }, [searchParams]);

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!doctorCode.trim() || !patientCode.trim()) {
      toast.error('Please enter both Doctor ID and Patient ID');
      return;
    }

    setLoading(true);
    setPatient(null);

    try {
      const { data, error } = await supabase.functions.invoke('patient-access', {
        body: {
          doctor_code: doctorCode.trim().toUpperCase(),
          patient_code: patientCode.trim().toUpperCase(),
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPatient(data.patient);
      setSessions(data.sessions || []);
      setTreatmentPlan(data.treatment_plan || null);
      setPhotos(data.photos || []);
    } catch (err: any) {
      toast.error('Lookup failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setPatient(null);
    setSessions([]);
    setTreatmentPlan(null);
    setPhotos([]);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
              <Search className="h-9 w-9 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">View My Case</h1>
            <p className="text-muted-foreground text-sm">
              Enter your Doctor ID and Patient ID to view your treatment details
            </p>
          </div>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="docCode" className="text-sm font-medium">Doctor ID</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="docCode"
                      placeholder="DOC-5521"
                      value={doctorCode}
                      onChange={(e) => setDoctorCode(e.target.value)}
                      className="pl-10 uppercase font-mono"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patCode" className="text-sm font-medium">Patient ID</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="patCode"
                      placeholder="PAT-9932"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      className="pl-10 uppercase font-mono"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Looking up...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4" /> View My Case</>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Are you a doctor? Sign in here
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ask your doctor for your Doctor ID and Patient ID to access your case
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">{patient.patient_code}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Read-Only Access</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{patient.age}</p>
              </div>
              {patient.chief_complaint && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Chief Complaint</p>
                  <p className="font-medium text-foreground">{patient.chief_complaint}</p>
                </div>
              )}
              {patient.oral_hygiene && (
                <div>
                  <p className="text-xs text-muted-foreground">Oral Hygiene</p>
                  <Badge variant="secondary">{patient.oral_hygiene}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {treatmentPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {treatmentPlan.primary_goals && (
                <div>
                  <p className="text-xs text-muted-foreground">Goals</p>
                  <p className="text-sm text-foreground">{treatmentPlan.primary_goals}</p>
                </div>
              )}
              {treatmentPlan.appliance_types && treatmentPlan.appliance_types.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Appliances</p>
                  <div className="flex flex-wrap gap-1">
                    {treatmentPlan.appliance_types.map((a) => (
                      <Badge key={a} variant="outline">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {treatmentPlan.estimated_duration && (
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Duration</p>
                  <p className="text-sm text-foreground">{treatmentPlan.estimated_duration}</p>
                </div>
              )}
              {treatmentPlan.special_instructions && (
                <div>
                  <p className="text-xs text-muted-foreground">Instructions</p>
                  <p className="text-sm text-foreground">{treatmentPlan.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Treatment Sessions
              <Badge variant="secondary" className="ml-auto">{sessions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(session.session_date), 'MMM d, yyyy')}
                      </p>
                      {session.treatment_performed && (
                        <p className="text-xs text-muted-foreground mt-1">{session.treatment_performed}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Clinical Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.image_url}
                      alt={photo.image_type || 'Clinical photo'}
                      className="w-full h-full object-cover"
                    />
                    {photo.image_type && (
                      <Badge className="absolute bottom-1 left-1 text-[10px]" variant="secondary">
                        {photo.image_type}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
