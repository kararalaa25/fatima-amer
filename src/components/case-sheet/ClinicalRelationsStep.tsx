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
    canine_relation: string;
    incisor_relation: string;
    oral_hygiene: string;
  };
  onChange: (field: string, value: string | number) => void;
}

export function ClinicalRelationsStep({ data, onChange }: ClinicalRelationsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Clinical Relations</h3>
        <p className="text-sm text-muted-foreground">
          Document the patient's clinical relationships and measurements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="ap_relation">AP/Horizontal Relation</Label>
          <Select
            value={data.ap_relation}
            onValueChange={(value) => onChange('ap_relation', value)}
          >
            <SelectTrigger id="ap_relation">
              <SelectValue placeholder="Select AP relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class I">Class I</SelectItem>
              <SelectItem value="Class II div 1">Class II div 1</SelectItem>
              <SelectItem value="Class II div 2">Class II div 2</SelectItem>
              <SelectItem value="Class III">Class III</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="horizontal_relation">Horizontal Relation</Label>
          <Select
            value={data.horizontal_relation}
            onValueChange={(value) => onChange('horizontal_relation', value)}
          >
            <SelectTrigger id="horizontal_relation">
              <SelectValue placeholder="Select horizontal relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Increased">Increased</SelectItem>
              <SelectItem value="Reduced">Reduced</SelectItem>
              <SelectItem value="Edge-to-Edge">Edge-to-Edge</SelectItem>
              <SelectItem value="Crossbite">Crossbite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vertical_relation">Vertical Relation</Label>
          <Select
            value={data.vertical_relation}
            onValueChange={(value) => onChange('vertical_relation', value)}
          >
            <SelectTrigger id="vertical_relation">
              <SelectValue placeholder="Select vertical relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Deep Bite">Deep Bite</SelectItem>
              <SelectItem value="Open Bite">Open Bite</SelectItem>
              <SelectItem value="Reduced">Reduced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="overbite_mm">Overbite (mm)</Label>
          <Input
            id="overbite_mm"
            type="number"
            step="0.1"
            value={data.overbite_mm}
            onChange={(e) => onChange('overbite_mm', parseFloat(e.target.value) || '')}
            placeholder="Enter overbite measurement"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overjet_mm">Overjet (mm)</Label>
          <Input
            id="overjet_mm"
            type="number"
            step="0.1"
            value={data.overjet_mm}
            onChange={(e) => onChange('overjet_mm', parseFloat(e.target.value) || '')}
            placeholder="Enter overjet measurement"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="molar_relation">Molar Relation</Label>
          <Select
            value={data.molar_relation}
            onValueChange={(value) => onChange('molar_relation', value)}
          >
            <SelectTrigger id="molar_relation">
              <SelectValue placeholder="Select molar relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class I">Class I</SelectItem>
              <SelectItem value="Class II">Class II</SelectItem>
              <SelectItem value="Class III">Class III</SelectItem>
              <SelectItem value="Quarter-unit Class II">Quarter-unit Class II</SelectItem>
              <SelectItem value="Half-unit Class II">Half-unit Class II</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="canine_relation">Canine Relation</Label>
          <Select
            value={data.canine_relation}
            onValueChange={(value) => onChange('canine_relation', value)}
          >
            <SelectTrigger id="canine_relation">
              <SelectValue placeholder="Select canine relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class I">Class I</SelectItem>
              <SelectItem value="Class II">Class II</SelectItem>
              <SelectItem value="Class III">Class III</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incisor_relation">Incisor Relation</Label>
          <Select
            value={data.incisor_relation}
            onValueChange={(value) => onChange('incisor_relation', value)}
          >
            <SelectTrigger id="incisor_relation">
              <SelectValue placeholder="Select incisor relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class I">Class I</SelectItem>
              <SelectItem value="Class II div 1">Class II div 1</SelectItem>
              <SelectItem value="Class II div 2">Class II div 2</SelectItem>
              <SelectItem value="Class III">Class III</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="oral_hygiene">Oral Hygiene</Label>
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
