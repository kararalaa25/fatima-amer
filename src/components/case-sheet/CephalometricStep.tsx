import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CephalometricStepProps {
  data: {
    ceph_sna: number | '';
    ceph_snb: number | '';
    ceph_anb: number | '';
    ceph_wits: number | '';
    ceph_sn_mp: number | '';
    ceph_fma: number | '';
    ceph_facial_angle: number | '';
    ceph_gonial_angle: number | '';
  };
  onChange: (field: string, value: number | '') => void;
}

const CEPH_NORMS = {
  ceph_sna: { min: 80, max: 84, label: 'SNA', norm: '82° ± 2°', unit: '°' },
  ceph_snb: { min: 78, max: 82, label: 'SNB', norm: '80° ± 2°', unit: '°' },
  ceph_anb: { min: 1, max: 5, label: 'ANB', norm: '2-4°', unit: '°' },
  ceph_wits: { min: -1, max: 2, label: 'Wits Appraisal', norm: '0-2mm', unit: 'mm' },
  ceph_sn_mp: { min: 30, max: 36, label: 'SN-MP', norm: '32° ± 2°', unit: '°' },
  ceph_fma: { min: 22, max: 28, label: 'FMA', norm: '25° ± 3°', unit: '°' },
  ceph_facial_angle: { min: 82, max: 95, label: 'Facial Angle', norm: '87-88°', unit: '°' },
  ceph_gonial_angle: { min: 120, max: 132, label: 'Gonial Angle', norm: '120-132°', unit: '°' },
};

export function CephalometricStep({ data, onChange }: CephalometricStepProps) {
  const getValueStatus = (field: keyof typeof CEPH_NORMS, value: number | '') => {
    if (value === '' || value === undefined) return 'neutral';
    const norm = CEPH_NORMS[field];
    if (value >= norm.min && value <= norm.max) return 'normal';
    return 'abnormal';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Cephalometric Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Enter lateral cephalogram measurements for skeletal and dental analysis
        </p>
      </div>

      {/* Skeletal Analysis */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">🦴</span>
          Skeletal Analysis
        </h4>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {(['ceph_sna', 'ceph_snb', 'ceph_anb', 'ceph_wits'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="flex items-center justify-between">
                <span>{CEPH_NORMS[field].label}</span>
                <span className="text-xs text-muted-foreground">{CEPH_NORMS[field].norm}</span>
              </Label>
              <div className="relative">
                <Input
                  id={field}
                  type="number"
                  step="0.1"
                  value={data[field]}
                  onChange={(e) => onChange(field, e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder={CEPH_NORMS[field].norm}
                  className={cn(
                    'pr-8',
                    getValueStatus(field, data[field]) === 'normal' && 'border-green-500/50 focus:border-green-500',
                    getValueStatus(field, data[field]) === 'abnormal' && 'border-amber-500/50 focus:border-amber-500'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {CEPH_NORMS[field].unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Analysis */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">📐</span>
          Vertical Analysis
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          {(['ceph_sn_mp', 'ceph_fma'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="flex items-center justify-between">
                <span>{CEPH_NORMS[field].label}</span>
                <span className="text-xs text-muted-foreground">{CEPH_NORMS[field].norm}</span>
              </Label>
              <div className="relative">
                <Input
                  id={field}
                  type="number"
                  step="0.1"
                  value={data[field]}
                  onChange={(e) => onChange(field, e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder={CEPH_NORMS[field].norm}
                  className={cn(
                    'pr-8',
                    getValueStatus(field, data[field]) === 'normal' && 'border-green-500/50 focus:border-green-500',
                    getValueStatus(field, data[field]) === 'abnormal' && 'border-amber-500/50 focus:border-amber-500'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {CEPH_NORMS[field].unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dental & Facial Analysis */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">😀</span>
          Dental & Facial Analysis
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          {(['ceph_facial_angle', 'ceph_gonial_angle'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="flex items-center justify-between">
                <span>{CEPH_NORMS[field].label}</span>
                <span className="text-xs text-muted-foreground">{CEPH_NORMS[field].norm}</span>
              </Label>
              <div className="relative">
                <Input
                  id={field}
                  type="number"
                  step="0.1"
                  value={data[field]}
                  onChange={(e) => onChange(field, e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder={CEPH_NORMS[field].norm}
                  className={cn(
                    'pr-8',
                    getValueStatus(field, data[field]) === 'normal' && 'border-green-500/50 focus:border-green-500',
                    getValueStatus(field, data[field]) === 'abnormal' && 'border-amber-500/50 focus:border-amber-500'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {CEPH_NORMS[field].unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {(data.ceph_sna !== '' || data.ceph_snb !== '' || data.ceph_anb !== '') && (
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
          <h5 className="font-medium text-foreground mb-2">Quick Analysis</h5>
          <div className="text-sm text-muted-foreground space-y-1">
            {data.ceph_anb !== '' && (
              <p>
                ANB = {data.ceph_anb}°: {' '}
                {Number(data.ceph_anb) > 4 ? 'Class II skeletal pattern' :
                 Number(data.ceph_anb) < 0 ? 'Class III skeletal pattern' :
                 'Class I skeletal pattern'}
              </p>
            )}
            {data.ceph_sn_mp !== '' && (
              <p>
                SN-MP = {data.ceph_sn_mp}°: {' '}
                {Number(data.ceph_sn_mp) > 36 ? 'Hyperdivergent (high angle)' :
                 Number(data.ceph_sn_mp) < 30 ? 'Hypodivergent (low angle)' :
                 'Normal vertical pattern'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
