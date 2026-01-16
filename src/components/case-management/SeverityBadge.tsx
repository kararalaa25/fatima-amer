import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export type SeverityLevel = 'easy' | 'moderate' | 'severe';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

const severityConfig = {
  easy: {
    label: 'Easy',
    icon: CheckCircle,
    bgClass: 'bg-success/20',
    textClass: 'text-success',
    borderClass: 'border-success/30',
    glowClass: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  },
  moderate: {
    label: 'Moderate',
    icon: AlertCircle,
    bgClass: 'bg-warning/20',
    textClass: 'text-warning',
    borderClass: 'border-warning/30',
    glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  },
  severe: {
    label: 'Severe',
    icon: AlertTriangle,
    bgClass: 'bg-destructive/20',
    textClass: 'text-destructive',
    borderClass: 'border-destructive/30',
    glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-300',
        config.bgClass,
        config.textClass,
        config.borderClass,
        config.glowClass,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-semibold text-sm">{config.label}</span>
    </div>
  );
}

// Severity calculation logic
export function calculateSeverity(description: string, imageCount: number): SeverityLevel {
  const severeKeywords = ['urgent', 'broken', 'danger', 'emergency', 'severe', 'critical', 'fracture', 'infection', 'abscess'];
  const moderateKeywords = ['pain', 'swelling', 'bleeding', 'sensitivity', 'discomfort', 'moderate', 'issue'];

  const lowerDescription = description.toLowerCase();

  // Check for severe keywords
  const hasSevereKeyword = severeKeywords.some((keyword) => lowerDescription.includes(keyword));
  if (hasSevereKeyword) {
    return 'severe';
  }

  // Check for moderate keywords
  const hasModerateKeyword = moderateKeywords.some((keyword) => lowerDescription.includes(keyword));
  
  // High image count indicates more complex case
  if (imageCount > 5) {
    return hasModerateKeyword ? 'severe' : 'moderate';
  }

  if (hasModerateKeyword || imageCount > 3) {
    return 'moderate';
  }

  return 'easy';
}
