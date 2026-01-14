import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClinicalRelationsStepProps {
  data: {
    ap_relation: string;
    horizontal_relation: string;
    vertical_relation: string;
    overbite_mm: number | '';
    overjet_mm: number | '';
    molar_relation: string;
    molar_class_subdivision: string;
    canine_relation: string;
    canine_class_subdivision: string;
    incisor_relation: string;
    oral_hygiene: string;
    crossbite_anterior: string;
    crossbite_posterior: string;
    midline_shift: string;
    midline_discrepancy: number | '';
  };
  onChange: (field: string, value: string | number) => void;
}

export function ClinicalRelationsStep({ data, onChange }: ClinicalRelationsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Clinical Relations & Classification</h3>
        <p className="text-sm text-muted-foreground">
          Document occlusal relationships and classifications
        </p>
      </div>

      {/* Molar & Canine Classification */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">🦷</span>
          Molar & Canine Classification
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Molar Relation */}
          <div className="space-y-3">
            <Label>Molar Relation</Label>
            <Select
              value={data.molar_relation}
              onValueChange={(value) => onChange('molar_relation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select molar class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class I">Class I</SelectItem>
                <SelectItem value="Class II">Class II</SelectItem>
                <SelectItem value="Class III">Class III</SelectItem>
              </SelectContent>
            </Select>
            
            {data.molar_relation === 'Class II' && (
              <Select
                value={data.molar_class_subdivision || ''}
                onValueChange={(value) => onChange('molar_class_subdivision', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subdivision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Division 1">Division 1</SelectItem>
                  <SelectItem value="Division 2">Division 2</SelectItem>
                  <SelectItem value="Subdivision">Subdivision (unilateral)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Canine Relation */}
          <div className="space-y-3">
            <Label>Canine Relation</Label>
            <Select
              value={data.canine_relation}
              onValueChange={(value) => onChange('canine_relation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select canine class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class I">Class I</SelectItem>
                <SelectItem value="Class II">Class II</SelectItem>
                <SelectItem value="Class III">Class III</SelectItem>
              </SelectContent>
            </Select>

            {data.canine_relation === 'Class II' && (
              <Select
                value={data.canine_class_subdivision || ''}
                onValueChange={(value) => onChange('canine_class_subdivision', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subdivision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Division 1">Division 1</SelectItem>
                  <SelectItem value="Division 2">Division 2</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Incisor Classification */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">🔬</span>
          Incisor Relation
        </h4>
        <Select
          value={data.incisor_relation}
          onValueChange={(value) => onChange('incisor_relation', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select incisor relation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Class I">Class I</SelectItem>
            <SelectItem value="Class II Division 1">Class II Division 1</SelectItem>
            <SelectItem value="Class II Division 2">Class II Division 2</SelectItem>
            <SelectItem value="Class III">Class III</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overjet & Overbite */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">📏</span>
          Overjet & Overbite
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="overjet_mm">Overjet (mm)</Label>
            <Input
              id="overjet_mm"
              type="number"
              step="0.5"
              value={data.overjet_mm}
              onChange={(e) => onChange('overjet_mm', parseFloat(e.target.value) || '')}
              placeholder="Normal: 2-4mm"
            />
            <p className="text-xs text-muted-foreground">Normal: 2-4mm. Increased if &gt;4mm.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overbite_mm">Overbite (mm)</Label>
            <Input
              id="overbite_mm"
              type="number"
              step="0.5"
              value={data.overbite_mm}
              onChange={(e) => onChange('overbite_mm', parseFloat(e.target.value) || '')}
              placeholder="Normal: 2-4mm"
            />
            <p className="text-xs text-muted-foreground">Deep bite if &gt;4mm. Open bite if negative.</p>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="vertical_relation">Vertical Relation Classification</Label>
          <Select
            value={data.vertical_relation}
            onValueChange={(value) => onChange('vertical_relation', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select vertical relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Deep Bite">Deep Bite</SelectItem>
              <SelectItem value="Open Bite">Open Bite</SelectItem>
              <SelectItem value="Edge-to-Edge">Edge-to-Edge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Crossbite */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">↔️</span>
          Crossbite Assessment
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Anterior Crossbite</Label>
            <Select
              value={data.crossbite_anterior || ''}
              onValueChange={(value) => onChange('crossbite_anterior', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select anterior crossbite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Single Tooth">Single Tooth</SelectItem>
                <SelectItem value="Multiple Teeth">Multiple Teeth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Posterior Crossbite</Label>
            <Select
              value={data.crossbite_posterior || ''}
              onValueChange={(value) => onChange('crossbite_posterior', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select posterior crossbite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Unilateral">Unilateral</SelectItem>
                <SelectItem value="Bilateral">Bilateral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Midline */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">⬆️</span>
          Midline Assessment
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Midline Shift</Label>
            <Select
              value={data.midline_shift || ''}
              onValueChange={(value) => onChange('midline_shift', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select midline deviation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Coincident (None)</SelectItem>
                <SelectItem value="Right">Shifted to Right</SelectItem>
                <SelectItem value="Left">Shifted to Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.midline_shift === 'Right' || data.midline_shift === 'Left') && (
            <div className="space-y-2">
              <Label htmlFor="midline_discrepancy">Discrepancy (mm)</Label>
              <Input
                id="midline_discrepancy"
                type="number"
                step="0.5"
                min={0}
                value={data.midline_discrepancy || ''}
                onChange={(e) => onChange('midline_discrepancy', parseFloat(e.target.value) || '')}
                placeholder="Enter shift amount in mm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Oral Hygiene */}
      <div className="space-y-2">
        <Label htmlFor="oral_hygiene">Oral Hygiene Status</Label>
        <Select
          value={data.oral_hygiene}
          onValueChange={(value) => onChange('oral_hygiene', value)}
        >
          <SelectTrigger id="oral_hygiene">
            <SelectValue placeholder="Select oral hygiene status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
