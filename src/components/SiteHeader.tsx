import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

export function SiteHeader() {
  const { isAdmin, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full gradient-hero shadow-soft" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Dr. Smile<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#bio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="/#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
          <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
              <Shield className="mr-2 h-4 w-4" />Admin
            </Button>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
