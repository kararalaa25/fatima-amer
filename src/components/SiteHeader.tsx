import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl gradient-mint shadow-glow" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#bio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="/#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
          <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
