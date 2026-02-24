import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Contrast,
  Crop,
  X,
  Check,
  RefreshCw,
  Save,
} from 'lucide-react';

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageType: string;
  onImageUpdate?: (newImageSrc: string) => void;
}

export function ImageViewerDialog({
  isOpen,
  onClose,
  imageSrc,
  imageType,
  onImageUpdate,
}: ImageViewerDialogProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageSrc);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setHighContrast(false);
      setIsCropping(false);
      setIsDragging(false);
      setCropStart(null);
      setCropEnd(null);
      setHasUnsavedChanges(false);
      setCurrentImage(imageSrc);
    }
  }, [isOpen, imageSrc]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom((prev) => Math.max(10, Math.min(500, prev + delta)));
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setHasUnsavedChanges(true);
  };

  const handleToggleContrast = () => {
    setHighContrast((prev) => !prev);
    setHasUnsavedChanges(true);
  };

  const handleCropStart = (e: React.MouseEvent) => {
    if (!isCropping || !containerRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    setCropStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setCropEnd(null);
  };

  const handleCropMove = (e: React.MouseEvent) => {
    if (!isCropping || !isDragging || !cropStart || !containerRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setCropEnd({
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
    });
  };

  const handleCropEnd = (e: React.MouseEvent) => {
    if (!isCropping) return;
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle mouse leaving the container while dragging
  const handleMouseLeave = () => {
    if (isDragging) {
      // Don't cancel - just stop updating but keep the selection
      setIsDragging(false);
    }
  };

  const applyCrop = () => {
    if (!cropStart || !cropEnd || !imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Scale factor from displayed size to actual image size
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Calculate offset of image within container
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    // Calculate crop area in image coordinates
    const x1 = Math.max(0, (Math.min(cropStart.x, cropEnd.x) - offsetX) * scaleX);
    const y1 = Math.max(0, (Math.min(cropStart.y, cropEnd.y) - offsetY) * scaleY);
    const x2 = Math.min(img.naturalWidth, (Math.max(cropStart.x, cropEnd.x) - offsetX) * scaleX);
    const y2 = Math.min(img.naturalHeight, (Math.max(cropStart.y, cropEnd.y) - offsetY) * scaleY);

    const cropWidth = x2 - x1;
    const cropHeight = y2 - y1;

    if (cropWidth <= 10 || cropHeight <= 10) return;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(img, x1, y1, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    setCurrentImage(canvas.toDataURL('image/png'));
    setHasUnsavedChanges(true);
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
    setIsDragging(false);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
    setHighContrast(false);
  };

  const handleSaveChanges = () => {
    // Apply rotation and contrast to the current image
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle rotation
    const isRotated90or270 = rotation === 90 || rotation === 270;
    canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
    canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    if (highContrast) {
      ctx.filter = 'contrast(1.5) brightness(1.1) saturate(0)';
    }
    
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const finalImage = canvas.toDataURL('image/png');
    onImageUpdate?.(finalImage);
    setHasUnsavedChanges(false);
    setRotation(0);
    setHighContrast(false);
  };

  const getCropRect = () => {
    if (!cropStart || !cropEnd) return null;
    return {
      left: Math.min(cropStart.x, cropEnd.x),
      top: Math.min(cropStart.y, cropEnd.y),
      width: Math.abs(cropEnd.x - cropStart.x),
      height: Math.abs(cropEnd.y - cropStart.y),
    };
  };

  const cropRect = getCropRect();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">Image Viewer - {imageType}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={10}
              max={500}
              step={10}
              className="w-32"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground ml-2">{zoom}%</span>
          </div>

          <div className="h-4 w-px bg-border mx-2" />

          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate
          </Button>

          <Button
            variant={highContrast ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleContrast}
          >
            <Contrast className="h-4 w-4 mr-1" />
            X-Ray Mode
          </Button>

          <Button
            variant={isCropping ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (isCropping) {
                cancelCrop();
              } else {
                setIsCropping(true);
              }
            }}
          >
            <Crop className="h-4 w-4 mr-1" />
            Crop
          </Button>

          <Button variant="ghost" size="sm" onClick={resetView}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset View
          </Button>

          {isCropping && cropStart && cropEnd && (
            <>
              <div className="h-4 w-px bg-border mx-2" />
              <Button variant="default" size="sm" onClick={applyCrop} className="glow-border transition-ultra">
                <Check className="h-4 w-4 mr-1" />
                Apply Crop
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelCrop}>
                Cancel
              </Button>
            </>
          )}

          {hasUnsavedChanges && !isCropping && (
            <>
              <div className="h-4 w-px bg-border mx-2" />
              <Button variant="default" size="sm" onClick={handleSaveChanges} className="glow-border-accent transition-ultra bg-accent hover:bg-accent/90">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </>
          )}
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center bg-muted/30 relative select-none"
          onWheel={handleWheel}
          onMouseDown={handleCropStart}
          onMouseMove={handleCropMove}
          onMouseUp={handleCropEnd}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isCropping ? 'crosshair' : 'default' }}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt="Clinical image"
            className="max-w-none"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              filter: highContrast
                ? 'contrast(1.5) brightness(1.1) saturate(0)'
                : 'none',
              transition: 'filter 0.15s ease',
            }}
            draggable={false}
          />

          {/* Crop Overlay */}
          {isCropping && cropRect && cropRect.width > 0 && cropRect.height > 0 && (
            <>
              {/* Darkened overlay */}
              <div
                className="absolute inset-0 bg-background/70 pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropRect.left}px ${cropRect.top}px, ${cropRect.left}px ${cropRect.top + cropRect.height}px, ${cropRect.left + cropRect.width}px ${cropRect.top + cropRect.height}px, ${cropRect.left + cropRect.width}px ${cropRect.top}px, ${cropRect.left}px ${cropRect.top}px)`,
                }}
              />
              {/* Crop selection border */}
              <div
                className="absolute border-2 border-primary border-dashed pointer-events-none glow-border"
                style={{
                  left: cropRect.left,
                  top: cropRect.top,
                  width: cropRect.width,
                  height: cropRect.height,
                }}
              >
                {/* Corner handles */}
                <div className="absolute -left-1 -top-1 w-3 h-3 bg-primary rounded-sm" />
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-sm" />
                <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-primary rounded-sm" />
                <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-sm" />
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="px-6 py-2 border-t border-border/50 text-xs text-muted-foreground text-center bg-muted/20">
          {isCropping 
            ? '🔲 Click and drag to select crop area • Release to set selection • Click "Apply Crop" to confirm'
            : '🔍 Mouse wheel to zoom • Click Crop to start selection • Save Changes to keep edits'
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
