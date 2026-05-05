import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SiteHeader } from '@/components/SiteHeader';
import { Lightbox } from '@/components/Lightbox';
import { StlViewer } from '@/components/StlViewer';
import { categoryLabel } from '@/lib/categories';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: c, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cases').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20">
          <p className="text-muted-foreground">Case not found.</p>
          <Link to="/" className="mt-4 inline-block text-primary">Go home</Link>
        </div>
      </div>
    );
  }

  const allImages = [c.cover_image, ...(c.images ?? [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <Link to={`/gallery/${c.category}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {categoryLabel(c.category)}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {c.cover_image && (
              <div className="overflow-hidden rounded-2xl border border-border shadow-card">
                <img src={c.cover_image} alt={c.title} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">{c.title}</h1>
            <p className="mt-2 text-sm uppercase tracking-wider text-primary">
              {categoryLabel(c.category)}
            </p>
            {c.description && (
              <p className="mt-6 leading-relaxed text-muted-foreground">{c.description}</p>
            )}
            {c.tools_used && c.tools_used.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Digital tools</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.tools_used.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(c as any).exocad_viewer_url && (
              <a
                href={(c as any).exocad_viewer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-center transition-colors hover:border-primary hover:text-primary"
              >
                <LinkIcon className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Exocad Viewer</span>
              </a>
            )}
          </div>
        </div>

        {(c.before_image || c.after_image) && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Before & After</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {c.before_image && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="bg-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Before</div>
                  <img src={c.before_image} alt="Before" className="aspect-[4/3] w-full object-cover" />
                </div>
              )}
              {c.after_image && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">After</div>
                  <img src={c.after_image} alt="After" className="aspect-[4/3] w-full object-cover" />
                </div>
              )}
            </div>
          </section>
        )}

        {c.stl_file_url && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold">3D STL Mesh</h2>
            <p className="mt-1 text-sm text-muted-foreground">Drag to rotate · scroll to zoom</p>
            <div className="mt-4">
              <StlViewer url={c.stl_file_url} />
            </div>
          </section>
        )}

        {allImages.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Gallery</h2>
            <p className="mt-1 text-sm text-muted-foreground">Click any image to expand</p>
            <div className="mt-4">
              <Lightbox images={allImages} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
