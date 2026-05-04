import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/admin');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent');
        setMode('signin');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (result.error) {
      toast.error('Google sign-in failed');
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-soft px-4">
      <Card className="w-full max-w-md p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold">Publisher Access</h1>
            <p className="text-xs text-muted-foreground">
              {mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Sign in to manage cases'}
            </p>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== 'reset' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full gradient-hero" disabled={loading}>
            {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
          </Button>
        </form>

        {mode !== 'reset' && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-6 flex justify-between text-sm">
          {mode === 'signin' && (
            <>
              <button onClick={() => setMode('signup')} className="text-primary hover:underline">Create account</button>
              <button onClick={() => setMode('reset')} className="text-muted-foreground hover:underline">Forgot password?</button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('signin')} className="text-primary hover:underline">Have an account? Sign in</button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} className="text-primary hover:underline">Back to sign in</button>
          )}
        </div>
      </Card>
    </div>
  );
}
