import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SiteHeader } from '@/components/SiteHeader';
import { categoryLabel, CATEGORIES } from '@/lib/categories';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('category', category!)
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!category,
  });

  const valid = CATEGORIES.some((c) => c.value === category);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <Link to="/#gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to gallery
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          {valid ? categoryLabel(category!) : 'Category not found'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cases?.length ?? 0} case{cases?.length === 1 ? '' : 's'}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          ))}
          {!isLoading && cases?.length === 0 && (
            <p className="col-span-full py-20 text-center text-muted-foreground">
              No cases published yet in this category.
            </p>
          )}
          {cases?.map((c) => (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {c.cover_image ? (
                  <img
                    src={c.cover_image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                )}
                {c.tools_used && c.tools_used.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.tools_used.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
