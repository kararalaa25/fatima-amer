import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Info } from 'lucide-react';

const PREVIEW_BYPASS_KEY = 'ortho_preview_bypass';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const redirectIfAuthenticated = async (userId: string) => {
    const [profileResult, rolesResult] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);
    const isAdmin = rolesResult.data?.some(r => r.role === 'admin');
    if (profileResult.data) {
      navigate(isAdmin ? '/admin' : '/');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const bypassActive = localStorage.getItem(PREVIEW_BYPASS_KEY) === 'true';
    if (bypassActive) {
      navigate('/');
      return;
    }

    const sessionTimeout = setTimeout(() => setCheckingSession(false), 3000);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(sessionTimeout);
      if (session) {
        await redirectIfAuthenticated(session.user.id);
      }
      setCheckingSession(false);
    }).catch(() => {
      clearTimeout(sessionTimeout);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await redirectIfAuthenticated(session.user.id);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent!', {
        description: 'Check your inbox for the reset link.',
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error('Failed to send reset email', { description: error.message });
    } finally {
      setLoading(false);
    }
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
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      toast.success('Verification Email Sent!', {
        description: 'Please check your inbox and click the verification link.',
      });
    } catch (error: any) {
      toast.error('Registration failed', { description: error.message });
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const [profileResult, rolesResult] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', data.user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', data.user.id),
      ]);

      const profile = profileResult.data;
      const isAdmin = rolesResult.data?.some(r => r.role === 'admin');

      if (profile) {
        toast.success(`Welcome back, ${profile.full_name}!`);
        // Hard redirect to prevent "Signing in..." stuck state
        window.location.href = isAdmin ? '/admin' : '/';
      } else {
        window.location.href = '/';
      }
    } catch (error: any) {
      toast.error('Login failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <svg className="h-9 w-9 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.5 2 6 5 6 8c0 2 .5 3 1 4s1 2 1 4v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c0-2 .5-3 1-4s1-2 1-4c0-3-2.5-6-6-6z" />
              <path d="M9 22h6" />
              <path d="M10 2v1" />
              <path d="M14 2v1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Ortho Smart Suite
          </h1>
          <p className="text-muted-foreground text-sm">
            Private Clinical Workspace
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            {/* Tab Toggle */}
            <div className="flex mb-6 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>

              {!isLogin && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted border border-border">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your account is a <span className="text-foreground font-medium">private workspace</span>.
                    Clinical data is encrypted and accessible only by you.
                  </p>
                </div>
              )}

              {/* CTA Button — Orange accent for Sign In */}
              <Button
                type="submit"
                className={`w-full h-11 font-medium ${isLogin ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Requesting Access...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Request Private Access'
                )}
              </Button>

              {!isLogin && (
                <p className="text-xs text-center text-muted-foreground">
                  After verifying your email, you'll have instant access to your private workspace.
                </p>
              )}
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBypassPreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Demo Environment
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Explore the platform with sample data (no account needed)
            </p>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">patients</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => navigate('/patient-login')}
              >
                Patient Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => navigate('/patient-join')}
              >
                Patient Join
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
