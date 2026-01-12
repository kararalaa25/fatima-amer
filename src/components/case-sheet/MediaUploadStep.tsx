import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageViewerDialog } from './ImageViewerDialog';

const IMAGE_TYPES = [
  { value: 'panoramic', label: 'Panoramic X-Ray' },
  { value: 'cephalometric', label: 'Cephalometric X-Ray' },
  { value: 'intraoral_frontal', label: 'Intraoral Frontal' },
  { value: 'intraoral_overjet', label: 'Intraoral Overjet' },
  { value: 'intraoral_left', label: 'Intraoral Left' },
  { value: 'intraoral_right', label: 'Intraoral Right' },
  { value: 'intraoral_upper', label: 'Intraoral Upper Occlusal' },
  { value: 'intraoral_lower', label: 'Intraoral Lower Occlusal' },
  { value: 'extraoral_frontal', label: 'Extraoral Frontal' },
  { value: 'extraoral_profile', label: 'Extraoral Profile' },
  { value: 'extraoral_smile', label: 'Extraoral Smile' },
  { value: 'other', label: 'Other' },
];

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: string;
}

interface MediaUploadStepProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export function MediaUploadStep({ images, onImagesChange }: MediaUploadStepProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newImage: UploadedImage = {
          id: crypto.randomUUID(),
          file,
          preview: reader.result as string,
          type: '', // Will be selected by user
        };
        newImages.push(newImage);
        processedCount++;

        // When all files are processed, update state
        if (processedCount === files.length) {
          onImagesChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value to allow selecting same files again
    e.target.value = '';
  }, [images, onImagesChange]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTypeChange = (imageId: string, type: string) => {
    onImagesChange(
      images.map((img) => (img.id === imageId ? { ...img, type } : img))
    );
  };

  const handleRemoveImage = (imageId: string) => {
    onImagesChange(images.filter((img) => img.id !== imageId));
  };

  const handleImageUpdate = (index: number, updatedPreview: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], preview: updatedPreview };
    onImagesChange(updatedImages);
  };

  const missingTypes = images.filter((img) => !img.type).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Diagnostic Media</h3>
        <p className="text-sm text-muted-foreground">
          Upload X-rays and clinical photographs. Each image must have a type assigned.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5 glass-card hover:border-primary/50 transition-smooth">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PNG, JPG, JPEG • Multiple files allowed
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleButtonClick}
              className="glow-border transition-smooth"
            >
              <Camera className="mr-2 h-4 w-4" />
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning for missing types */}
      {missingTypes > 0 && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning flex items-center gap-2">
          <ImageIcon className="h-4 w-4 shrink-0" />
          <span>
            <strong>{missingTypes} image(s)</strong> missing required type label. Please assign a type to all images.
          </span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base text-foreground">Uploaded Images ({images.length})</Label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <Card key={image.id} className="overflow-hidden glass-card border-0 glow-border transition-smooth hover:scale-[1.02]">
                <div className="relative aspect-[4/3]">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full cursor-pointer object-contain bg-muted/50"
                    onClick={() => setSelectedImageIndex(index)}
                    loading="lazy"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {!image.type && (
                    <div className="absolute bottom-0 left-0 right-0 bg-warning/90 px-2 py-1 text-center text-xs font-medium text-warning-foreground">
                      Type Required
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <Select
                    value={image.type}
                    onValueChange={(value) => handleTypeChange(image.id, value)}
                  >
                    <SelectTrigger className={`bg-muted/50 ${!image.type ? 'border-warning' : 'border-border/50'}`}>
                      <SelectValue placeholder="Select image type *" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {IMAGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Viewer Dialog */}
      {selectedImageIndex !== null && (
        <ImageViewerDialog
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          imageSrc={images[selectedImageIndex]?.preview || ''}
          imageType={
            IMAGE_TYPES.find((t) => t.value === images[selectedImageIndex]?.type)?.label ||
            'Unknown'
          }
          onImageUpdate={(updatedPreview) => handleImageUpdate(selectedImageIndex, updatedPreview)}
        />
      )}
    </div>
  );
}
