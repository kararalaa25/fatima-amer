import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Edit2, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionImageCardProps {
  id: string;
  src: string;
  onRemove: (id: string) => void;
  onEdit: (id: string, src: string) => void;
  onView: (src: string) => void;
}

export function SessionImageCard({ id, src, onRemove, onEdit, onView }: SessionImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      <img
        src={src}
        alt="Session image"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'h-full w-full object-cover',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onView(src)}
      />

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Action Buttons */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button size="icon" variant="secondary" onClick={() => onView(src)} className="h-8 w-8">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => onEdit(id, src)} className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => onRemove(id)} className="h-8 w-8">
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Remove button top-right */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() => onRemove(id)}
        className={cn(
          'absolute top-2 right-2 h-7 w-7 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100'
        )}
      >
        <X className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}
