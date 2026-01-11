import { useState, useCallback } from 'react';
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
import { Camera, Upload, X, Trash2 } from 'lucide-react';
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
  const [pendingType, setPendingType] = useState<string>('');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        const newImage: UploadedImage = {
          id: crypto.randomUUID(),
          file,
          preview: reader.result as string,
          type: '', // Will be selected by user
        };
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }, [images, onImagesChange]);

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
        <h3 className="text-lg font-semibold text-foreground">Clinical Images</h3>
        <p className="text-sm text-muted-foreground">
          Upload X-rays and clinical photographs. Each image must have a type assigned.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-border bg-muted/30">
        <CardContent className="p-8">
          <label className="flex cursor-pointer flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PNG, JPG, JPEG up to 10MB
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button type="button" variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Select Images
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Warning for missing types */}
      {missingTypes > 0 && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          <strong>{missingTypes} image(s)</strong> missing required type. Please assign a type to
          all images before saving.
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base">Uploaded Images ({images.length})</Label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full cursor-pointer object-contain bg-muted"
                    onClick={() => setSelectedImageIndex(index)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => handleRemoveImage(image.id)}
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
                    <SelectTrigger className={!image.type ? 'border-warning' : ''}>
                      <SelectValue placeholder="Select image type *" />
                    </SelectTrigger>
                    <SelectContent>
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
          imageType={images[selectedImageIndex]?.type || 'Unknown'}
          onImageUpdate={(updatedPreview) => handleImageUpdate(selectedImageIndex, updatedPreview)}
        />
      )}
    </div>
  );
}
