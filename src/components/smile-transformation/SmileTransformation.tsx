import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Upload, Sparkles, Image as ImageIcon, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SmileTransformationProps {
  patientId: string;
  patientName: string;
}

type TreatmentType = 'hollywood_smile' | 'professional_bleaching';

export function SmileTransformation({ patientId, patientName }: SmileTransformationProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<TreatmentType>('hollywood_smile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', { description: 'Please upload JPG, PNG, or WEBP images.' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setTransformedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smile-transformation', {
        body: {
          imageUrl: selectedImage,
          treatment,
        },
      });

      if (error) throw error;

      if (data.transformedImage) {
        setTransformedImage(data.transformedImage);
        toast.success('Transformation complete!', {
          description: data.description,
        });
      } else if (data.analysis) {
        toast.info('Analysis Complete', {
          description: data.analysis.substring(0, 100) + '...',
        });
      }
    } catch (error: any) {
      console.error('Transformation error:', error);
      
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        toast.error('Rate limit exceeded', {
          description: 'Please wait a moment and try again.',
        });
      } else if (error.message?.includes('402')) {
        toast.error('Service unavailable', {
          description: 'Please contact support to continue using this feature.',
        });
      } else {
        toast.error('Transformation failed', {
          description: error.message || 'Please try again.',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smile Transformation
        </CardTitle>
        <CardDescription>
          Preview treatment results for {patientName} using AI-powered visualization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Treatment</Label>
          <RadioGroup
            value={treatment}
            onValueChange={(v) => setTreatment(v as TreatmentType)}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="hollywood_smile" id="hollywood" />
              <Label htmlFor="hollywood" className="cursor-pointer">
                <span className="font-medium">Hollywood Smile</span>
                <p className="text-xs text-muted-foreground">Perfect veneers simulation</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="professional_bleaching" id="bleaching" />
              <Label htmlFor="bleaching" className="cursor-pointer">
                <span className="font-medium">Professional Bleaching</span>
                <p className="text-xs text-muted-foreground">3-5 shades whiter</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Patient Photo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Click to upload a photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or WEBP (max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Before/After Comparison */}
              {transformedImage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span>Drag slider to compare</span>
                  </div>
                  <div
                    ref={sliderRef}
                    className="relative rounded-xl overflow-hidden cursor-ew-resize select-none"
                    onMouseMove={handleSliderMove}
                    onTouchMove={handleSliderMove}
                    style={{ aspectRatio: '4/3' }}
                  >
                    {/* After Image (full width, bottom layer) */}
                    <img
                      src={transformedImage}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Before Image (clipped, top layer) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={selectedImage}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: `${100 / (sliderPosition / 100)}%` }}
                      />
                    </div>

                    {/* Slider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <ArrowLeftRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">
                      Before
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">
                      After
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">
                    Original
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setTransformedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex-1"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                <Button
                  onClick={handleTransform}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Transform
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          AI-generated preview for visualization purposes only. Actual results may vary.
        </p>
      </CardContent>
    </Card>
  );
}