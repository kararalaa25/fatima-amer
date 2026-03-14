import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, UserPlus, Hash, Phone, Lock, Stethoscope } from 'lucide-react';

export default function PatientJoin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !patientId || !phoneNumber || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // 1. Find doctor by code
      const { data: doctor, error: docError } = await supabase
        .from('doctors')
        .select('id')
        .eq('doctor_code', doctorId.toUpperCase().trim())
        .maybeSingle();

      if (docError || !doctor) {
        toast.error('Invalid Doctor ID', { description: 'No doctor found with this ID.' });
        return;
      }

      // 2. Find patient by code belonging to that doctor
      const { data: patient, error: ptError } = await supabase
        .from('patients')
        .select('id, phone_number, patient_code')
        .eq('patient_code', patientId.toUpperCase().trim())
        .eq('doctor_id', doctor.id)
        .maybeSingle();

      if (ptError || !patient) {
        toast.error('Invalid Patient ID', { description: 'No patient found with this ID for this doctor.' });
        return;
      }

      // 3. Check phone number matches
      if (patient.phone_number !== phoneNumber.trim()) {
        toast.error('Phone number mismatch', { description: 'The phone number does not match our records.' });
        return;
      }

      // 4. Check if already registered
      const { data: existingAccount } = await supabase
        .from('patient_accounts')
        .select('is_registered')
        .eq('patient_id', patient.id)
        .maybeSingle();

      if (existingAccount?.is_registered) {
        toast.error('Already registered', { description: 'This patient account is already registered. Please log in.' });
        return;
      }

      // 5. Create Supabase auth account using phone as email identifier
      const patientEmail = `${phoneNumber.trim().replace(/[^0-9]/g, '')}@patient.ortho.local`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: patientEmail,
        password,
        options: {
          data: {
            full_name: `Patient ${patientId}`,
            is_patient: true,
            patient_id: patient.id,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 6. Update patient_accounts
      if (existingAccount) {
        await supabase
          .from('patient_accounts')
          .update({
            is_registered: true,
            auth_user_id: authData.user?.id,
          })
          .eq('patient_id', patient.id);
      } else {
        await supabase
          .from('patient_accounts')
          .insert({
            patient_id: patient.id,
            phone_number: phoneNumber.trim(),
            is_registered: true,
            auth_user_id: authData.user?.id,
          });
      }

      toast.success('Registration successful!', { description: 'You can now log in with your phone number and password.' });
      navigate('/patient-login');
    } catch (error: any) {
      toast.error('Registration failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <UserPlus className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Patient Registration</h1>
          <p className="text-muted-foreground text-sm">Join your doctor's workspace</p>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId" className="text-sm font-medium">Doctor ID</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="doctorId"
                    placeholder="DR-1234"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="pl-10 uppercase"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientId" className="text-sm font-medium">Patient ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patientId"
                    placeholder="PT-12345"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="pl-10 uppercase"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  'Register & Join'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/patient-login')}
                className="text-sm text-primary hover:underline"
              >
                Already registered? Log in
              </button>
            </div>
            <div className="mt-2 text-center">
              <button
                onClick={() => navigate('/auth')}
                className="text-xs text-muted-foreground hover:underline"
              >
                Are you a doctor? Sign in here
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
