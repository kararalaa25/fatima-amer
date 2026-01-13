import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Phone, MessageCircle, ArrowRight, Loader2, Shield, Zap } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

// Preview bypass key for localStorage
const PREVIEW_BYPASS_KEY = 'ortho_preview_bypass';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode] = useState('+964'); // Iraq default
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Check for preview bypass
    const bypassActive = localStorage.getItem(PREVIEW_BYPASS_KEY) === 'true';
    if (bypassActive) {
      navigate('/');
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fullPhoneNumber = `${countryCode}${phone.replace(/^0/, '')}`;

  const handleBypassPreview = () => {
    localStorage.setItem(PREVIEW_BYPASS_KEY, 'true');
    toast({
      title: 'Preview Mode Activated',
      description: 'You are now viewing as Admin/Doctor.',
    });
    navigate('/');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
      });

      if (error) throw error;

      setStep('otp');
      toast({
        title: 'Code Sent!',
        description: 'A verification code has been sent via WhatsApp.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: 'Welcome!',
        description: 'You have been successfully logged in.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
      });

      if (error) throw error;

      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend code.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card mb-4 animate-float">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Ortho Smart Suite
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Professional Clinical Management
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-8">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground glass-card-solid px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                  Secure Phone Authentication
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-semibold">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-4 rounded-2xl glass-input text-foreground font-semibold min-w-[80px]">
                    {countryCode}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="7XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 glass-input rounded-2xl text-foreground placeholder:text-muted-foreground h-12"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Iraq (+964) • Enter without leading zero
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-2xl h-12 font-semibold text-base transition-smooth"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    Send Verification Code
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-success" />
                <span>Code will be sent via WhatsApp</span>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="glass-card-solid px-3 py-1 text-muted-foreground font-medium">
                    or
                  </span>
                </div>
              </div>

              {/* Preview Bypass Button */}
              <Button 
                type="button"
                variant="outline"
                onClick={handleBypassPreview}
                className="w-full rounded-2xl h-12 font-semibold text-base glass-card border-primary/30 hover:bg-primary/10 transition-smooth"
                size="lg"
              >
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Bypass for Preview
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Skip authentication to preview the app as Admin/Doctor
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm text-success glass-card-solid px-4 py-2 rounded-full border border-success/30">
                  <MessageCircle className="h-4 w-4" />
                  Code Sent via WhatsApp
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground font-semibold">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono glass-input rounded-2xl h-14 text-foreground"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Sent to {fullPhoneNumber}
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-2xl h-12 font-semibold text-base transition-smooth"
                disabled={loading || otp.length !== 6}
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-muted-foreground hover:text-foreground transition-smooth font-medium"
                >
                  ← Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-primary hover:text-primary/80 transition-smooth disabled:opacity-50 font-medium"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
