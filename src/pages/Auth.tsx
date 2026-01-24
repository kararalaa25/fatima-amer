import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Shield, Eye, EyeOff, Info, Stethoscope, Clock, CheckCircle } from 'lucide-react';

const PREVIEW_BYPASS_KEY = 'ortho_preview_bypass';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPendingScreen, setShowPendingScreen] = useState(false);
  const [pendingUserName, setPendingUserName] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check for preview bypass
    const bypassActive = localStorage.getItem(PREVIEW_BYPASS_KEY) === 'true';
    if (bypassActive) {
      navigate('/');
      return;
    }

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user email is verified and if they're activated
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_activated, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile?.is_activated) {
          navigate('/');
        } else if (profile) {
          // User exists but not activated - show pending screen
          setPendingUserName(profile.full_name);
          setShowPendingScreen(true);
        }
      }
      setCheckingSession(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check activation status
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_activated, full_name')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profile?.is_activated) {
            navigate('/');
          } else if (profile) {
            // User verified email but not activated
            setPendingUserName(profile.full_name);
            setShowPendingScreen(true);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleBypassPreview = () => {
    localStorage.setItem(PREVIEW_BYPASS_KEY, 'true');
    toast.success('Demo Environment Activated', {
      description: 'You are viewing the demo environment with sample data.',
    });
    navigate('/');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowPendingScreen(false);
    setPendingUserName('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast.success('Verification Email Sent!', {
        description: 'Please check your inbox and click the verification link.',
      });
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is activated
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_activated, full_name')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profile?.is_activated) {
        toast.success(`Welcome back, ${profile.full_name}!`);
        navigate('/');
      } else {
        // Show pending activation screen
        setPendingUserName(profile?.full_name || 'User');
        setShowPendingScreen(true);
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen mesh-gradient-bg flex items-center justify-center">
        <div className="glass-card p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Pending Activation Screen
  if (showPendingScreen) {
    return (
      <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-card-solid">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Email Verified</CardTitle>
            <CardDescription className="text-base mt-2">
              Please wait for admin activation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Hello, {pendingUserName}!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your email has been verified successfully. Our admin will review and activate your private clinical workspace within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Once activated, you'll have access to your encrypted, private workspace where only you can see your patient data.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Check Activation Status
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-4">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Ortho Smart Suite
          </h1>
          <p className="text-muted-foreground">
            Private Clinical Workspace
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card-solid p-8">
          {/* Tab Toggle */}
          <div className="flex mb-6 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {/* Full Name - Only for Registration */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 glass-input"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 glass-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Private Workspace Disclaimer - Only for Registration */}
            {!isLogin && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your account is a <span className="text-foreground font-medium">private workspace</span>. 
                  Clinical data is encrypted and accessible only by you.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Requesting Access...'}
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {isLogin ? 'Sign In' : 'Request Private Access'}
                </>
              )}
            </Button>

            {/* Admin Activation Notice - Only for Registration */}
            {!isLogin && (
              <p className="text-xs text-center text-muted-foreground">
                After verifying your email, our admin will activate your private suite within 24 hours.
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Demo Environment Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full glass-input"
            onClick={handleBypassPreview}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Demo Environment
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Explore the platform with sample data (no account needed)
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
