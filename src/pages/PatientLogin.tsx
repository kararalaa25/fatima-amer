import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Phone, Lock, LogIn } from 'lucide-react';

export default function PatientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const patientEmail = `${phoneNumber.trim().replace(/[^0-9]/g, '')}@patient.ortho.local`;
      const { error } = await supabase.auth.signInWithPassword({
        email: patientEmail,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      window.location.href = '/patient-dashboard';
    } catch (error: any) {
      toast.error('Login failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <LogIn className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Patient Login</h1>
          <p className="text-muted-foreground text-sm">View your treatment progress</p>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
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
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/patient-join')}
                className="text-sm text-primary hover:underline"
              >
                New patient? Register here
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
