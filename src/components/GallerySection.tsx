import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/lib/categories';
import { Crown, Sparkles, Scissors, Box } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  crown_bridge: Crown,
  veneers_dsd: Sparkles,
  surgical_guides: Scissors,
  exocad: Box,
};

const DESCRIPTIONS: Record<string, string> = {
  crown_bridge: 'Precision-milled restorations with anatomic detail',
  veneers_dsd: 'Smile makeovers using digital mock-ups and DSD protocols',
  surgical_guides: 'Implant guides engineered for predictable surgery',
  exocad: 'Full-mouth rehab and library work in Exocad DentalCAD',
};

export function GallerySection() {
  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-primary">Selected Work</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            The Gallery
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore case studies organized by discipline. Each project showcases the digital
            workflow — from STL mesh to final render.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.value];
            return (
              <Link
                key={cat.value}
                to={`/gallery/${cat.value}`}
                className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                style={{ animation: `fade-up 0.6s ease-out ${i * 0.1}s both` }}
              >
                <div className="absolute inset-0 gradient-hero opacity-0 transition-opacity duration-500 group-hover:opacity-95" />
                <div className="relative" />

                <div className="relative">
                  <h3 className="font-display text-2xl font-semibold leading-tight transition-colors group-hover:text-white">
                    {cat.short}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground transition-colors group-hover:text-white/90">
                    {DESCRIPTIONS[cat.value]}
                  </p>
                  <p className="mt-6 text-sm font-medium text-primary transition-colors group-hover:text-white">
                    View cases →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
