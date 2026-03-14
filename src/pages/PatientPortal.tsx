import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, LogOut, User, Activity, Calendar, FileText, Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface PatientData {
  id: string;
  name: string;
  age: number;
  patient_code: string;
  chief_complaint?: string;
  molar_relation?: string;
  canine_relation?: string;
  oral_hygiene?: string;
  overbite_mm?: number;
  overjet_mm?: number;
  created_at: string;
}

interface SessionData {
  id: string;
  session_date: string;
  treatment_performed?: string;
}

interface TreatmentPlanData {
  primary_goals?: string;
  appliance_types?: string[];
  extraction_plan?: string;
  estimated_duration?: string;
  special_instructions?: string;
}

interface PhotoData {
  id: string;
  image_url: string;
  image_type?: string;
}

export default function PatientPortal() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlanData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  useEffect(() => {
    if (!user) return;

    async function fetchPatientData() {
      try {
        // Find patient account linked to this auth user
        const { data: account } = await supabase
          .from('patient_accounts')
          .select('patient_id')
          .eq('auth_user_id', user!.id)
          .maybeSingle();

        if (!account) {
          setLoading(false);
          return;
        }

        // Fetch patient, sessions, treatment plan, and photos in parallel
        const [patientRes, sessionsRes, planRes, photosRes] = await Promise.all([
          supabase.from('patients').select('*').eq('id', account.patient_id).single(),
          supabase.from('sessions').select('*').eq('patient_id', account.patient_id).order('session_date', { ascending: false }),
          supabase.from('treatment_plans').select('*').eq('patient_id', account.patient_id).maybeSingle(),
          supabase.from('initial_photos').select('*').eq('patient_id', account.patient_id),
        ]);

        if (patientRes.data) setPatient(patientRes.data as any);
        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (planRes.data) setTreatmentPlan(planRes.data);
        if (photosRes.data) setPhotos(photosRes.data);
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/patient-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>No Patient Record Found</CardTitle>
            <p className="text-sm text-muted-foreground">Your account is not linked to a patient case.</p>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
              <p className="text-xs text-muted-foreground">ID: {patient.patient_code}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Patient Info */}
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

        {/* Treatment Plan */}
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

        {/* Sessions / Treatment Progress */}
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

        {/* Photos */}
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
