import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SoftTissueStepProps {
  data: {
    lips: string;
    habits: string;
    tongue_position: string;
    tongue_size: string;
  };
  onChange: (field: string, value: string) => void;
}

export function SoftTissueStep({ data, onChange }: SoftTissueStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Soft Tissue & Myofunctional</h3>
        <p className="text-sm text-muted-foreground">
          Assess soft tissue characteristics and myofunctional patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lips">Lips</Label>
          <Select value={data.lips} onValueChange={(value) => onChange('lips', value)}>
            <SelectTrigger id="lips">
              <SelectValue placeholder="Select lip competence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Competent">Competent</SelectItem>
              <SelectItem value="Incompetent">Incompetent</SelectItem>
              <SelectItem value="Potentially Competent">Potentially Competent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tongue_size">Tongue Size</Label>
          <Select
            value={data.tongue_size}
            onValueChange={(value) => onChange('tongue_size', value)}
          >
            <SelectTrigger id="tongue_size">
              <SelectValue placeholder="Select tongue size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Macroglossia">Macroglossia</SelectItem>
              <SelectItem value="Microglossia">Microglossia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tongue_position">Tongue Position</Label>
        <Select
          value={data.tongue_position}
          onValueChange={(value) => onChange('tongue_position', value)}
        >
          <SelectTrigger id="tongue_position">
            <SelectValue placeholder="Select tongue position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Normal/Dorsum">Normal/Dorsum</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Forward/Thrust">Forward/Thrust</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="habits">Habits</Label>
        <Textarea
          id="habits"
          value={data.habits}
          onChange={(e) => onChange('habits', e.target.value)}
          placeholder="List any oral habits (e.g., thumb sucking, tongue thrusting, mouth breathing...)"
          rows={3}
        />
      </div>
    </div>
  );
}
