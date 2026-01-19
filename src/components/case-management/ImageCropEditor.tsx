import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  Crop,
  X,
  Check,
  FlipHorizontal,
  FlipVertical,
  Square,
  RectangleHorizontal,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { getCroppedImg } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface ImageCropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (croppedImage: string) => void;
}

type AspectRatioKey = 'free' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

const ASPECT_RATIOS: { key: AspectRatioKey; label: string; value: number | undefined; icon: React.ReactNode }[] = [
  { key: 'free', label: 'Free', value: undefined, icon: <Crop className="h-3.5 w-3.5" /> },
  { key: '1:1', label: '1:1', value: 1, icon: <Square className="h-3.5 w-3.5" /> },
  { key: '4:3', label: '4:3', value: 4 / 3, icon: <RectangleHorizontal className="h-3.5 w-3.5" /> },
  { key: '16:9', label: '16:9', value: 16 / 9, icon: <RectangleHorizontal className="h-3.5 w-3.5" /> },
  { key: '3:4', label: '3:4', value: 3 / 4, icon: <Smartphone className="h-3.5 w-3.5" /> },
  { key: '9:16', label: '9:16', value: 9 / 16, icon: <Smartphone className="h-3.5 w-3.5" /> },
];

export function ImageCropEditor({
  isOpen,
  onClose,
  imageSrc,
  onSave,
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('free');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentAspect = ASPECT_RATIOS.find(r => r.key === aspectRatio)?.value;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flipH,
        flipV
      );
      onSave(croppedImage);
      handleReset();
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio('free');
  };

  const handleRotate90 = (direction: 'cw' | 'ccw') => {
    setRotation((prev) => {
      const newRotation = direction === 'cw' ? prev + 90 : prev - 90;
      return ((newRotation % 360) + 360) % 360;
    });
  };

  const handleFlipH = () => setFlipH((prev) => !prev);
  const handleFlipV = () => setFlipV((prev) => !prev);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(3, Math.max(1, prev + delta)));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-4xl max-h-[95vh] p-0 overflow-hidden border-0">
        <DialogHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
            <Crop className="h-5 w-5 text-primary" />
            Edit Image
          </DialogTitle>
        </DialogHeader>

        {/* Cropper Container */}
        <div 
          className="relative h-[300px] sm:h-[400px] w-full bg-background/80"
          onWheel={handleWheel}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={currentAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            classes={{
              containerClassName: 'rounded-none',
              cropAreaClassName: 'border-2 border-primary shadow-lg',
            }}
            style={{
              containerStyle: {
                transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              },
            }}
          />
          
          {/* Live Preview Badge */}
          <div className="absolute top-3 left-3 glass-card-solid px-3 py-1.5 rounded-full">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Preview
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[40vh]">
          {/* Aspect Ratio Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Aspect Ratio</Label>
            <Tabs value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatioKey)}>
              <TabsList className="grid grid-cols-6 h-auto gap-1 p-1 glass-card-solid rounded-2xl">
                {ASPECT_RATIOS.map((ratio) => (
                  <TabsTrigger
                    key={ratio.key}
                    value={ratio.key}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "transition-all duration-200"
                    )}
                  >
                    {ratio.icon}
                    <span className="hidden sm:inline">{ratio.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate90('ccw')}
              className="glass-card-solid border-0 rounded-xl font-medium gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Rotate Left</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate90('cw')}
              className="glass-card-solid border-0 rounded-xl font-medium gap-2"
            >
              <RotateCw className="h-4 w-4" />
              <span className="hidden sm:inline">Rotate Right</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlipH}
              className={cn(
                "glass-card-solid border-0 rounded-xl font-medium gap-2",
                flipH && "bg-primary/20 text-primary"
              )}
            >
              <FlipHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Flip H</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlipV}
              className={cn(
                "glass-card-solid border-0 rounded-xl font-medium gap-2",
                flipV && "bg-primary/20 text-primary"
              )}
            >
              <FlipVertical className="h-4 w-4" />
              <span className="hidden sm:inline">Flip V</span>
            </Button>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ZoomIn className="h-4 w-4 text-primary" />
                Zoom
              </Label>
              <span className="text-sm font-medium text-muted-foreground">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full touch-pan-y"
            />
            <p className="text-xs text-muted-foreground">Use mouse wheel or slider to zoom</p>
          </div>

          {/* Fine Rotation Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <RotateCw className="h-4 w-4 text-primary" />
                Fine Rotation
              </Label>
              <span className="text-sm font-medium text-muted-foreground">{rotation}°</span>
            </div>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => setRotation(value[0])}
              className="w-full touch-pan-y"
            />
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-0 gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReset}
            className="glass-card-solid border-0 rounded-2xl font-semibold gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl font-semibold flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
