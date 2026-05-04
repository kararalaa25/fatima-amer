import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/lib/categories';

const DESCRIPTIONS: Record<string, string> = {
  crown_bridge: 'Precision-milled restorations with anatomic detail',
  veneers_dsd: 'Smile makeovers using digital mock-ups and DSD protocols',
  surgical_guides: 'Implant guides engineered for predictable surgery',
  exocad: 'Full-mouth rehab and library work in Exocad DentalCAD',
};

// Asymmetric bento grid spans (Remedy-style)
const SPANS: Record<string, string> = {
  crown_bridge: 'lg:col-span-7 lg:row-span-2',
  veneers_dsd: 'lg:col-span-5 lg:row-span-1',
  surgical_guides: 'lg:col-span-5 lg:row-span-1',
  exocad: 'lg:col-span-12 lg:row-span-1',
};

export function GallerySection() {
  return (
    <section id="gallery" className="relative py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-accent">Selected Work</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
            The Gallery
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Explore case studies organized by discipline. Each project showcases the digital
            workflow — from STL mesh to final render.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:auto-rows-[18rem]">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.value}
              to={`/gallery/${cat.value}`}
              aria-label={`View ${cat.short} cases`}
              className={`group relative flex flex-col justify-between overflow-hidden bento-card outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:-translate-y-1.5 focus-visible:shadow-glow hover:-translate-y-1.5 hover:shadow-glow ${SPANS[cat.value] ?? 'lg:col-span-6'}`}
              style={{ animation: `fade-up 0.7s ease-out ${i * 0.1}s both` }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 gradient-mint" />
              <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl transition-all duration-500 group-hover:bg-accent/40 group-focus-visible:bg-accent/40" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Discipline
                </div>
              </div>

              <div className="relative">
                <h3 className="font-display text-3xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary group-focus-visible:text-primary md:text-4xl">
                  {cat.short}
                </h3>
                <p className="mt-3 max-w-md text-base text-muted-foreground transition-colors group-hover:text-primary/80 group-focus-visible:text-primary/80">
                  {DESCRIPTIONS[cat.value]}
                </p>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 group-hover:text-primary group-focus-visible:text-primary">
                  View cases <span aria-hidden>→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
