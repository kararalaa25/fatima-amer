import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { categoryLabel } from '@/lib/categories';
import { toast } from 'sonner';

export default function Admin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const triedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && isAdmin) return;
    if (triedRef.current) return;
    triedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin-bootstrap');
        if (error || !data?.email) throw error ?? new Error('bootstrap failed');
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInErr) throw signInErr;
      } catch (e) {
        console.error('admin auto sign-in failed', e);
      }
    })();
  }, [loading, isAuthenticated, isAdmin]);

  const { data: cases } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('admin_slug').eq('id', true).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const adminUrl = `${window.location.origin}/${settings?.admin_slug ?? ''}`;

  const togglePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from('cases').update({ published: !published }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(published ? 'Unpublished' : 'Published');
    qc.invalidateQueries({ queryKey: ['admin-cases'] });
  };

  const deleteCase = async (id: string) => {
    if (!confirm('Delete this case permanently?')) return;
    const { error } = await supabase.from('cases').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    qc.invalidateQueries({ queryKey: ['admin-cases'] });
  };

  if (loading || !isAdmin) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Opening admin dashboard…</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage portfolio cases</p>
          </div>
          <Button asChild className="gradient-hero">
            <Link to="/admin/case/new"><Plus className="mr-2 h-4 w-4" />New Case</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Your private admin link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this link only with yourself. Opening it signs you straight into the dashboard — no website navigation needed.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground">
              {adminUrl}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(adminUrl);
                toast.success('Link copied');
              }}
            >
              <Copy className="mr-2 h-4 w-4" />Copy link
            </Button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases?.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No cases yet. Create your first one!</td></tr>
              )}
              {cases?.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{c.title}</td>
                  <td className="p-4 text-muted-foreground">{categoryLabel(c.category)}</td>
                  <td className="p-4">
                    {c.published ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Published</span>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="View case">
                        <Link to={`/case/${c.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => togglePublish(c.id, c.published)} title={c.published ? 'Unpublish' : 'Publish'}>
                        {c.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link to={`/admin/case/${c.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCase(c.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
