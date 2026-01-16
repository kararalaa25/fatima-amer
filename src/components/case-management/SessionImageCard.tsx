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

export function SessionImageCard({
  id,
  src,
  onRemove,
  onEdit,
  onView,
}: SessionImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'group relative glass-image-card aspect-[4/3] overflow-hidden transition-all duration-300',
        isHovered && 'scale-[1.02] shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-3xl" />
      )}

      <img
        src={src}
        alt="Session image"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          isHovered && 'scale-105'
        )}
        onClick={() => onView(src)}
      />

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Action Buttons */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 transition-all duration-300',
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onView(src)}
          className="h-9 w-9 glass-card-solid rounded-xl hover:bg-primary/10"
        >
          <ZoomIn className="h-4 w-4 text-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(id, src)}
          className="h-9 w-9 glass-card-solid rounded-xl hover:bg-primary/10"
        >
          <Edit2 className="h-4 w-4 text-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(id)}
          className="h-9 w-9 glass-card-solid rounded-xl hover:bg-destructive/10"
        >
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Remove button (always visible, top-right) */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(id)}
        className={cn(
          'absolute top-2 right-2 h-7 w-7 glass-card-solid rounded-xl hover:bg-destructive/10 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100'
        )}
      >
        <X className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}
