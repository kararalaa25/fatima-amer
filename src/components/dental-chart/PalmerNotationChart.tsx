import { useState } from 'react';
import { ToothStatus } from '@/types/patient';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ToothProps {
  quadrant: number;
  number: number | string;
  status: ToothStatus;
  onClick: () => void;
  isPediatric?: boolean;
}

function Tooth({ quadrant, number, status, onClick, isPediatric }: ToothProps) {
  const statusColors: Record<ToothStatus, string> = {
    present: 'bg-card hover:bg-muted text-foreground border-border',
    missing: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground border-destructive',
    filling: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
    impacted: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-all duration-150',
        isPediatric ? 'h-9 w-9' : 'h-10 w-10',
        statusColors[status]
      )}
      title={`Quadrant ${quadrant}, Tooth ${number}: ${status}`}
    >
      {number}
    </button>
  );
}

interface PalmerNotationChartProps {
  teeth: Record<string, ToothStatus>;
  onToothClick: (quadrant: number, toothNumber: number, currentStatus: ToothStatus) => void;
  readonly?: boolean;
}

export function PalmerNotationChart({ teeth, onToothClick, readonly }: PalmerNotationChartProps) {
  const [isPediatric, setIsPediatric] = useState(false);

  const getToothStatus = (quadrant: number, number: number | string): ToothStatus => {
    const key = `${quadrant}-${number}`;
    return teeth[key] || 'present';
  };

  const cycleStatus = (current: ToothStatus): ToothStatus => {
    const statuses: ToothStatus[] = ['present', 'missing', 'filling', 'impacted'];
    const currentIndex = statuses.indexOf(current);
    return statuses[(currentIndex + 1) % statuses.length];
  };

  const handleClick = (quadrant: number, number: number | string) => {
    if (readonly) return;
    const currentStatus = getToothStatus(quadrant, number);
    const newStatus = cycleStatus(currentStatus);
    onToothClick(quadrant, typeof number === 'string' ? parseInt(number) : number, newStatus);
  };

  // Adult: 1-8, Pediatric: A-E (displayed as letters) or 1-5
  const adultNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const pediatricNumbers = ['A', 'B', 'C', 'D', 'E'];

  const renderQuadrant = (quadrant: number, reverse: boolean = false) => {
    const numbers = isPediatric ? pediatricNumbers : adultNumbers;
    const orderedNumbers = reverse ? [...numbers].reverse() : numbers;

    return (
      <div className="flex gap-1">
        {orderedNumbers.map((num) => (
          <Tooth
            key={`${quadrant}-${num}`}
            quadrant={quadrant}
            number={num}
            status={getToothStatus(quadrant, typeof num === 'string' ? num.charCodeAt(0) - 64 : num)}
            onClick={() => handleClick(quadrant, typeof num === 'string' ? num.charCodeAt(0) - 64 : num)}
            isPediatric={isPediatric}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Palmer Notation Chart</h3>
        
        {/* Dentition Toggle */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-card/50 border border-border/50">
          <Label htmlFor="dentition-toggle" className={cn(
            "text-sm font-medium transition-colors",
            !isPediatric ? "text-primary" : "text-muted-foreground"
          )}>
            Adult (1-8)
          </Label>
          <Switch
            id="dentition-toggle"
            checked={isPediatric}
            onCheckedChange={setIsPediatric}
          />
          <Label htmlFor="dentition-toggle" className={cn(
            "text-sm font-medium transition-colors",
            isPediatric ? "text-primary" : "text-muted-foreground"
          )}>
            Pediatric (A-E)
          </Label>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded border-2 border-border bg-card" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-destructive" />
          <span>Missing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-green-500" />
          <span>Filling</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-amber-500" />
          <span>Impacted</span>
        </div>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-4 sm:p-6">
        {/* Upper Jaw */}
        <div className="mb-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          {/* Quadrant 2 (Upper Left from patient's view) */}
          <div className="flex flex-col items-center sm:items-end">
            <span className="mb-2 text-xs font-medium text-muted-foreground">Q2</span>
            {renderQuadrant(2, true)}
          </div>
          
          <div className="hidden sm:flex h-full w-px items-stretch bg-border" />
          <div className="sm:hidden h-px w-full bg-border my-1" />
          
          {/* Quadrant 1 (Upper Right from patient's view) */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="mb-2 text-xs font-medium text-muted-foreground">Q1</span>
            {renderQuadrant(1)}
          </div>
        </div>

        {/* Divider Line */}
        <div className="my-4 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground px-2">Patient's View</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Lower Jaw */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          {/* Quadrant 3 (Lower Left from patient's view) */}
          <div className="flex flex-col items-center sm:items-end">
            {renderQuadrant(3, true)}
            <span className="mt-2 text-xs font-medium text-muted-foreground">Q3</span>
          </div>
          
          <div className="hidden sm:flex h-full w-px items-stretch bg-border" />
          <div className="sm:hidden h-px w-full bg-border my-1" />
          
          {/* Quadrant 4 (Lower Right from patient's view) */}
          <div className="flex flex-col items-center sm:items-start">
            {renderQuadrant(4)}
            <span className="mt-2 text-xs font-medium text-muted-foreground">Q4</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Click on any tooth to cycle through: Present → Missing → Filling → Impacted → Present
      </p>
    </div>
  );
}
