import portrait from '@/assets/dentist-portrait.jpg';
import { Button } from '@/components/ui/button';
import { ArrowDown, Award } from 'lucide-react';

export function HeroBio() {
  return (
    <section id="bio" className="relative overflow-hidden gradient-soft">
      <div className="container mx-auto grid min-h-[88vh] grid-cols-1 items-center gap-12 px-4 py-20 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <p className="font-script text-3xl text-primary animate-pop-in">Hello, I'm</p>
          <h1 className="mt-2 font-script text-6xl font-bold leading-tight text-foreground animate-pop-in delay-100 md:text-7xl lg:text-8xl">
            Dr. Sarah Lin
          </h1>
          <p className="mt-4 font-display text-xl text-muted-foreground animate-fade-up delay-300 md:text-2xl">
            Digital Dentist · CAD-CAM Specialist
          </p>

          <div className="mt-8 space-y-4 animate-fade-up delay-500">
            <p className="font-script text-2xl leading-relaxed text-foreground/80">
              "Where art meets precision — every smile is a digitally crafted masterpiece."
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Two years of experience designing prosthetics, surgical guides, and digital
              smile makeovers. Specialized in <span className="font-semibold text-foreground">Exocad</span>,{' '}
              <span className="font-semibold text-foreground">Blue Sky Plan</span>, and{' '}
              <span className="font-semibold text-foreground">Blender</span> workflows.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up delay-700">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Award className="h-4 w-4" />
              DDS, University Dental School
            </div>
            <div className="flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <Award className="h-4 w-4" />
              Exocad Certified Designer
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Award className="h-4 w-4" />
              DSD Master Course Graduate
            </div>
          </div>

          <div className="mt-10 flex gap-3 animate-fade-up delay-700">
            <Button asChild size="lg" className="gradient-hero shadow-soft">
              <a href="#gallery">View My Work</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="absolute -inset-4 rounded-[3rem] gradient-hero opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white shadow-soft animate-pop-in">
            <img
              src={portrait}
              alt="Dr. Sarah Lin, digital dentist and CAD-CAM specialist"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-4 shadow-card animate-fade-up delay-700">
            <p className="font-script text-2xl text-primary">2+ years</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Digital dentistry</p>
          </div>
          <div className="absolute -right-4 top-10 rounded-2xl border border-border bg-card p-4 shadow-card animate-fade-up delay-500">
            <p className="font-script text-2xl text-accent">500+</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cases delivered</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#gallery" aria-label="Scroll to gallery">
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </a>
      </div>
    </section>
  );
}
