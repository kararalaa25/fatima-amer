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
          <Input
            id="ap_relation"
            value={data.ap_relation}
            onChange={(e) => onChange('ap_relation', e.target.value)}
            placeholder="e.g., Class I, II, III"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horizontal_relation">Horizontal Relation</Label>
          <Input
            id="horizontal_relation"
            value={data.horizontal_relation}
            onChange={(e) => onChange('horizontal_relation', e.target.value)}
            placeholder="Enter horizontal relation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vertical_relation">Vertical Relation</Label>
          <Input
            id="vertical_relation"
            value={data.vertical_relation}
            onChange={(e) => onChange('vertical_relation', e.target.value)}
            placeholder="Enter vertical relation"
          />
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
          <Input
            id="molar_relation"
            value={data.molar_relation}
            onChange={(e) => onChange('molar_relation', e.target.value)}
            placeholder="e.g., Class I, II, III"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="canine_relation">Canine Relation</Label>
          <Input
            id="canine_relation"
            value={data.canine_relation}
            onChange={(e) => onChange('canine_relation', e.target.value)}
            placeholder="Enter canine relation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incisor_relation">Incisor Relation</Label>
          <Input
            id="incisor_relation"
            value={data.incisor_relation}
            onChange={(e) => onChange('incisor_relation', e.target.value)}
            placeholder="Enter incisor relation"
          />
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
