import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Upload,
  ImagePlus,
  Trash2,
  Save,
  FolderOpen,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { SessionImageCard } from './SessionImageCard';
import { ImageCropEditor } from './ImageCropEditor';
import { SeverityBadge, calculateSeverity, SeverityLevel } from './SeverityBadge';
import { validateImageFile, formatFileSize, MAX_FILE_SIZE } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface SessionImage {
  id: string;
  src: string;
  fileName?: string;
  fileSize?: number;
}

const CATEGORIES = [
  'General Checkup',
  'Orthodontic Consultation',
  'Emergency',
  'Follow-up',
  'Treatment Plan Review',
  'Pre-Treatment Documentation',
  'Post-Treatment Documentation',
];

export function CaseManagementDashboard() {
  const [images, setImages] = useState<SessionImage[]>([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingImage, setEditingImage] = useState<{ id: string; src: string } | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate severity based on description and image count
  const severity: SeverityLevel = calculateSeverity(description, images.length);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    Array.from(files).forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      setUploadErrors(errors);
      errors.forEach((error) => toast.error(error));
    }

    // Process valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: SessionImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          src: e.target?.result as string,
          fileName: file.name,
          fileSize: file.size,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.onerror = () => {
        toast.error(`Failed to read file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added`);
    }
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    setUploadErrors([]);
    processFiles(files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success('Image removed');
  }, []);

  const handleEditImage = useCallback((id: string, src: string) => {
    setEditingImage({ id, src });
  }, []);

  const handleSaveCroppedImage = useCallback((croppedSrc: string) => {
    if (!editingImage) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === editingImage.id ? { ...img, src: croppedSrc } : img
      )
    );
    setEditingImage(null);
    toast.success('Image updated');
  }, [editingImage]);

  const handleViewImage = useCallback((src: string) => {
    const index = images.findIndex((img) => img.src === src);
    setCurrentViewIndex(index);
    setViewingImage(src);
  }, [images]);

  const navigateViewer = useCallback((direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'prev'
        ? (currentViewIndex - 1 + images.length) % images.length
        : (currentViewIndex + 1) % images.length;
    setCurrentViewIndex(newIndex);
    setViewingImage(images[newIndex].src);
  }, [currentViewIndex, images]);

  const handleUpdateSession = useCallback(() => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    if (!description.trim()) {
      toast.error('Please add a case description');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    toast.success('Session updated successfully');
  }, [images, description, category]);

  const handleDeleteSession = useCallback(() => {
    setImages([]);
    setDescription('');
    setCategory('');
    setUploadErrors([]);
    toast.success('Session deleted');
  }, []);

  return (
    <div className="space-y-6">
      {/* Severity Assessment Card */}
      <Card className="glass-card border-0 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-3 text-foreground font-bold">
              <FolderOpen className="h-5 w-5 text-primary" />
              Case Assessment
            </CardTitle>
            <SeverityBadge severity={severity} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Case Description */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Case Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the case details, symptoms, and observations..."
                className="glass-input min-h-[120px] rounded-2xl resize-none text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Keywords like "urgent", "broken", "danger" will increase severity assessment
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="glass-input rounded-2xl h-11 text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 rounded-2xl">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="rounded-xl focus:bg-primary/10"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass-card-solid p-4 rounded-2xl text-center">
                  <div className="text-2xl font-bold text-foreground">{images.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Images</div>
                </div>
                <div className="glass-card-solid p-4 rounded-2xl text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {description.split(/\s+/).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Words</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <ImagePlus className="h-5 w-5 text-primary" />
            Session Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="glass-card-solid border border-destructive/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                Upload Errors
              </div>
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-sm text-muted-foreground">{error}</p>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                'h-16 w-16 rounded-3xl flex items-center justify-center transition-colors',
                isDragging ? 'bg-primary/20' : 'glass-card-solid'
              )}>
                <Upload className={cn(
                  'h-8 w-8 transition-colors',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG, WebP • Max {formatFileSize(MAX_FILE_SIZE)} per file
                </p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((image) => (
                <SessionImageCard
                  key={image.id}
                  id={image.id}
                  src={image.src}
                  onRemove={handleRemoveImage}
                  onEdit={handleEditImage}
                  onView={handleViewImage}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="text-center py-8">
              <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">
                No images uploaded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleDeleteSession}
          className="glass-card-solid border-0 rounded-2xl font-semibold hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Full Session
        </Button>
        <Button
          onClick={handleUpdateSession}
          className="rounded-2xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          Update Session
        </Button>
      </div>

      {/* Image Crop Editor Modal */}
      {editingImage && (
        <ImageCropEditor
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          imageSrc={editingImage.src}
          onSave={handleSaveCroppedImage}
        />
      )}

      {/* Image Viewer Modal */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 glass-card-solid rounded-xl hover:bg-primary/10"
              onClick={() => setViewingImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 glass-card-solid rounded-xl hover:bg-primary/10"
                  onClick={() => navigateViewer('prev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 glass-card-solid rounded-xl hover:bg-primary/10"
                  onClick={() => navigateViewer('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {viewingImage && (
              <>
                <img
                  src={viewingImage}
                  alt="Full size preview"
                  className="h-auto max-h-[80vh] w-full rounded-3xl object-contain"
                />

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <span className="glass-card-solid rounded-full px-4 py-2 text-sm font-semibold text-foreground">
                      {currentViewIndex + 1} / {images.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
