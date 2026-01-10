import { useState } from 'react';
import { useSessionImages } from '@/hooks/useSessions';
import { InitialPhoto, Session } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientGalleryProps {
  patientId: string;
  initialPhotos: InitialPhoto[];
  sessions: Session[];
}

function SessionImages({ sessionId }: { sessionId: string }) {
  const { data: images } = useSessionImages(sessionId);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image) => (
        <ImageCard key={image.id} src={image.image_url} alt="Session photo" />
      ))}
    </div>
  );
}

function ImageCard({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
    </div>
  );
}

export function PatientGallery({ patientId, initialPhotos, sessions }: PatientGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setAllImages(images);
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'prev'
        ? (currentIndex - 1 + allImages.length) % allImages.length
        : (currentIndex + 1) % allImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const initialImages = initialPhotos.map((p) => p.image_url);

  return (
    <div className="space-y-8">
      {/* Initial Photography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Initial Photography
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialPhotos.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <Camera className="mb-2 h-12 w-12" />
              <p>No initial photos uploaded</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {initialPhotos.map((photo, index) => (
                <ImageCard
                  key={photo.id}
                  src={photo.image_url}
                  alt="Initial photo"
                  onClick={() => openLightbox(initialImages, index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Photos */}
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Session: {format(new Date(session.session_date), 'MMMM d, yyyy')}
            </CardTitle>
            {session.treatment_performed && (
              <p className="text-sm text-muted-foreground">{session.treatment_performed}</p>
            )}
          </CardHeader>
          <CardContent>
            <SessionImages sessionId={session.id} />
          </CardContent>
        </Card>
      ))}

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={() => navigate('prev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={() => navigate('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                className="h-auto max-h-[80vh] w-full rounded-lg object-contain"
              />
            )}

            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm">
                {currentIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
