import { useState } from 'react';
import { ToothStatus } from '@/types/patient';
import { cn } from '@/lib/utils';

interface ToothProps {
  quadrant: number;
  number: number;
  status: ToothStatus;
  onClick: () => void;
}

function Tooth({ quadrant, number, status, onClick }: ToothProps) {
  const statusColors = {
    present: 'bg-card hover:bg-muted text-foreground',
    missing: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
    filling: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border-2 border-border font-mono text-sm font-bold transition-all',
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
  const getToothStatus = (quadrant: number, number: number): ToothStatus => {
    const key = `${quadrant}-${number}`;
    return teeth[key] || 'present';
  };

  const cycleStatus = (current: ToothStatus): ToothStatus => {
    if (current === 'present') return 'missing';
    if (current === 'missing') return 'filling';
    return 'present';
  };

  const handleClick = (quadrant: number, number: number) => {
    if (readonly) return;
    const currentStatus = getToothStatus(quadrant, number);
    const newStatus = cycleStatus(currentStatus);
    onToothClick(quadrant, number, newStatus);
  };

  const renderQuadrant = (quadrant: number, reverse: boolean = false) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const orderedNumbers = reverse ? [...numbers].reverse() : numbers;

    return (
      <div className="flex gap-1">
        {orderedNumbers.map((num) => (
          <Tooth
            key={`${quadrant}-${num}`}
            quadrant={quadrant}
            number={num}
            status={getToothStatus(quadrant, num)}
            onClick={() => handleClick(quadrant, num)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Palmer Notation Chart</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded border-2 border-border bg-card" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-destructive" />
            <span>Missing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span>Filling</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-6">
        {/* Upper Jaw */}
        <div className="mb-4 flex justify-center gap-4">
          {/* Quadrant 2 (Upper Left from patient's view) */}
          <div className="flex flex-col items-end">
            <span className="mb-2 text-xs font-medium text-muted-foreground">Q2</span>
            {renderQuadrant(2, true)}
          </div>
          
          <div className="flex h-full w-px items-stretch bg-border" />
          
          {/* Quadrant 1 (Upper Right from patient's view) */}
          <div className="flex flex-col items-start">
            <span className="mb-2 text-xs font-medium text-muted-foreground">Q1</span>
            {renderQuadrant(1)}
          </div>
        </div>

        {/* Divider Line */}
        <div className="my-4 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Patient's View</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Lower Jaw */}
        <div className="flex justify-center gap-4">
          {/* Quadrant 3 (Lower Left from patient's view) */}
          <div className="flex flex-col items-end">
            {renderQuadrant(3, true)}
            <span className="mt-2 text-xs font-medium text-muted-foreground">Q3</span>
          </div>
          
          <div className="flex h-full w-px items-stretch bg-border" />
          
          {/* Quadrant 4 (Lower Right from patient's view) */}
          <div className="flex flex-col items-start">
            {renderQuadrant(4)}
            <span className="mt-2 text-xs font-medium text-muted-foreground">Q4</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Click on any tooth to cycle through: Present → Missing → Filling → Present
      </p>
    </div>
  );
}
