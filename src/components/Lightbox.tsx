import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
  images: string[];
}

export function Lightbox({ images }: LightboxProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  if (!images.length) return null;

  const openAt = (i: number) => { setIdx(i); setOpen(true); };
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
          >
            <img
              src={src}
              alt={`Case image ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl border-none bg-black/95 p-0">
          <div className="relative flex h-[85vh] items-center justify-center">
            <img src={images[idx]} alt="" className="max-h-full max-w-full object-contain" />
            {images.length > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={prev} className="absolute left-4 text-white hover:bg-white/10">
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={next} className="absolute right-4 text-white hover:bg-white/10">
                  <ChevronRight className="h-8 w-8" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {idx + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
