import { useState } from 'react';
import { useSessionImages } from '@/hooks/useSessions';
import { InitialPhoto, Session } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageAnalysisDialog } from '@/components/analysis/ImageAnalysisDialog';
import { format } from 'date-fns';
import { Camera, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface PatientGalleryProps {
  patientId: string;
  initialPhotos: InitialPhoto[];
  sessions: Session[];
}

function SessionImages({ 
  sessionId, 
  onImageClick,
  onAnalyzeClick 
}: { 
  sessionId: string;
  onImageClick: (images: string[], index: number) => void;
  onAnalyzeClick: (url: string, type: 'initial' | 'progress') => void;
}) {
  const { data: images } = useSessionImages(sessionId);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center text-sm text-muted-foreground font-medium">
        No photos for this session
      </div>
    );
  }

  const imageUrls = images.map(img => img.image_url);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image, index) => (
        <ImageCard 
          key={image.id} 
          src={image.image_url} 
          alt="Session photo"
          onClick={() => onImageClick(imageUrls, index)}
          onAnalyze={() => onAnalyzeClick(image.image_url, 'progress')}
        />
      ))}
    </div>
  );
}

function ImageCard({
  src,
  alt,
  onClick,
  onAnalyze,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
  onAnalyze?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-3xl" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full cursor-pointer object-cover transition-all duration-300 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClick}
      />
      <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/5" />
      
      {/* Analyze Button Overlay */}
      <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          className="h-8 gap-1 text-xs font-semibold"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze?.();
          }}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          Analyze
        </Button>
      </div>
    </div>
  );
}

export function PatientGallery({ patientId, initialPhotos, sessions }: PatientGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Analysis state
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'initial' | 'progress'>('initial');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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

  const openAnalysis = (imageUrl: string, type: 'initial' | 'progress') => {
    setAnalysisImageUrl(imageUrl);
    setAnalysisType(type);
    setIsAnalysisOpen(true);
  };

  const initialImages = initialPhotos.map((p) => p.image_url);

  return (
    <div className="space-y-8">
      {/* Initial Photography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-foreground">
            <Camera className="h-5 w-5 text-primary" />
            Initial Photography
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialPhotos.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
              <Camera className="mb-2 h-12 w-12" />
              <p className="font-medium">No initial photos uploaded</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {initialPhotos.map((photo, index) => (
                <ImageCard
                  key={photo.id}
                  src={photo.image_url}
                  alt="Initial photo"
                  onClick={() => openLightbox(initialImages, index)}
                  onAnalyze={() => openAnalysis(photo.image_url, 'initial')}
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
            <CardTitle className="text-base font-bold text-foreground">
              Session: {format(new Date(session.session_date), 'MMMM d, yyyy')}
            </CardTitle>
            {session.treatment_performed && (
              <p className="text-sm text-muted-foreground font-medium">{session.treatment_performed}</p>
            )}
          </CardHeader>
          <CardContent>
            <SessionImages 
              sessionId={session.id} 
              onImageClick={openLightbox}
              onAnalyzeClick={openAnalysis}
            />
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
              className="absolute right-2 top-2 z-10 bg-card border border-border rounded-md"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-card border border-border rounded-md"
                  onClick={() => navigate('prev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-card border border-border rounded-md"
                  onClick={() => navigate('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {selectedImage && (
              <>
                <img
                  src={selectedImage}
                  alt="Full size"
                  className="h-auto max-h-[80vh] w-full rounded-3xl object-contain"
                />
                
                {/* Analyze button in lightbox */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4">
                  <Button
                    className="bg-card border border-border rounded-md font-semibold"
                    variant="ghost"
                    onClick={() => {
                      setSelectedImage(null);
                      openAnalysis(selectedImage, 'progress');
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    Analyze with AI
                  </Button>
                  
                  {allImages.length > 1 && (
                    <span className="bg-card border border-border rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                      {currentIndex + 1} / {allImages.length}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <ImageAnalysisDialog
        imageUrl={analysisImageUrl}
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysisType={analysisType}
      />
    </div>
  );
}
