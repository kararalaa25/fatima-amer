import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDentalImageAnalysis } from '@/hooks/useDentalImageAnalysis';
import { Sparkles, Loader2, Brain, AlertCircle } from 'lucide-react';

interface ImageAnalysisDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  analysisType?: 'initial' | 'progress';
}

// Simple markdown-like text formatter
function formatAnalysisText(text: string) {
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    // Headers
    if (line.startsWith('####')) {
      return <h4 key={index} className="mt-3 font-semibold text-foreground">{line.replace(/^####\s*/, '')}</h4>;
    }
    if (line.startsWith('###')) {
      return <h3 key={index} className="mt-4 text-lg font-semibold text-foreground">{line.replace(/^###\s*/, '')}</h3>;
    }
    if (line.startsWith('##')) {
      return <h2 key={index} className="mt-4 text-xl font-semibold text-foreground">{line.replace(/^##\s*/, '')}</h2>;
    }
    if (line.startsWith('#')) {
      return <h1 key={index} className="mt-4 text-2xl font-bold text-foreground">{line.replace(/^#\s*/, '')}</h1>;
    }
    
    // Bold headers like **Text**
    if (line.match(/^\*\*[^*]+\*\*$/)) {
      return <p key={index} className="mt-3 font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>;
    }
    
    // Bullet points
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      const content = line.replace(/^\s*[-•]\s*/, '');
      // Handle bold within bullets
      const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return (
        <li key={index} className="ml-4 text-sm text-muted-foreground" 
            dangerouslySetInnerHTML={{ __html: formattedContent }} />
      );
    }
    
    // Numbered lists
    if (line.trim().match(/^\d+\./)) {
      const content = line.replace(/^\s*\d+\.\s*/, '');
      const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return (
        <li key={index} className="ml-4 list-decimal text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formattedContent }} />
      );
    }
    
    // Empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }
    
    // Regular paragraphs with bold handling
    const formattedContent = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return (
      <p key={index} className="text-sm text-muted-foreground"
         dangerouslySetInnerHTML={{ __html: formattedContent }} />
    );
  });
}

export function ImageAnalysisDialog({
  imageUrl,
  isOpen,
  onClose,
  analysisType = 'initial',
}: ImageAnalysisDialogProps) {
  const { analyzeImage, isAnalyzing, analysisResult, clearAnalysis } = useDentalImageAnalysis();
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setHasStartedAnalysis(true);
    await analyzeImage(imageUrl, analysisType);
  };

  const handleClose = () => {
    clearAnalysis();
    setHasStartedAnalysis(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Dental Image Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Dental image for analysis"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image selected
                </div>
              )}
            </div>
            
            {!hasStartedAnalysis && (
              <Button
                onClick={handleAnalyze}
                disabled={!imageUrl || isAnalyzing}
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze with AI
              </Button>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Analysis Results</h3>
              <Badge variant={analysisType === 'progress' ? 'default' : 'secondary'}>
                {analysisType === 'progress' ? 'Progress Check' : 'Initial Assessment'}
              </Badge>
            </div>

            <Separator />

            <ScrollArea className="h-[400px] rounded-lg border border-border bg-card p-4">
              {isAnalyzing ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Analyzing dental image...</p>
                    <p className="text-sm">This may take a few moments</p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-1">
                  {formatAnalysisText(analysisResult.analysis)}
                </div>
              ) : hasStartedAnalysis ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <p>Analysis could not be completed</p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Sparkles className="h-8 w-8" />
                  <p className="text-center">
                    Click "Analyze with AI" to get a detailed assessment of this dental image
                  </p>
                </div>
              )}
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              AI analysis is for reference only and should be verified by a qualified orthodontist.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
