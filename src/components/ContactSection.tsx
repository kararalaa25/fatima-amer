import { Mail, Phone, Instagram, Linkedin } from 'lucide-react';

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-border bg-secondary/40 py-20">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2">
        <div>
          <p className="font-script text-3xl text-primary">Let's collaborate</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Get in touch
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            For case collaborations, design outsourcing, or speaking opportunities,
            feel free to reach out anytime.
          </p>
        </div>
        <div className="space-y-4">
          <a href="mailto:hello@drsmile.com" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <Mail className="h-5 w-5 text-primary" />
            <span>hello@drsmile.com</span>
          </a>
          <a href="tel:+10000000000" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <Phone className="h-5 w-5 text-primary" />
            <span>+1 (000) 000-0000</span>
          </a>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:border-primary hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:border-primary hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-16 border-t border-border px-4 pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Dr. Fatima Amer · Digital Dentistry Portfolio
      </div>
    </section>
  );
}
