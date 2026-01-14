import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExtraOralStepProps {
  data: {
    lips: string;
    habits: string;
    tongue_position: string;
    tongue_size: string;
    lip_strain: boolean;
    nasolabial_angle: number | '';
    mentolabial_sulcus: string;
    max_jaw_opening: number | '';
  };
  onChange: (field: string, value: string | number | boolean) => void;
}

export function ExtraOralStep({ data, onChange }: ExtraOralStepProps) {
  const nasolabialValue = typeof data.nasolabial_angle === 'number' ? data.nasolabial_angle : 90;

  const getNasolabialLabel = (angle: number) => {
    if (angle < 85) return 'Acute (Protrusive)';
    if (angle > 110) return 'Obtuse (Retrusive)';
    return 'Normal';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Extra-Oral Examination</h3>
        <p className="text-sm text-muted-foreground">
          Assess facial soft tissue characteristics and functional aspects
        </p>
      </div>

      {/* Lip Assessment */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">👄</span>
          Lip Assessment
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lips">Lip Competence</Label>
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

          <div className="space-y-3">
            <Label htmlFor="lip_strain">Lip Strain</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="lip_strain"
                checked={data.lip_strain ?? false}
                onCheckedChange={(checked) => onChange('lip_strain', checked)}
              />
              <span className="text-sm text-muted-foreground">
                {data.lip_strain ? 'Present' : 'Not Present'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Analysis */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">📐</span>
          Profile Analysis
        </h4>
        
        {/* Nasolabial Angle Slider */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label>Nasolabial Angle</Label>
            <span className="text-sm font-medium text-primary">
              {nasolabialValue}° — {getNasolabialLabel(nasolabialValue)}
            </span>
          </div>
          <div className="px-1">
            <Slider
              value={[nasolabialValue]}
              onValueChange={([value]) => onChange('nasolabial_angle', value)}
              min={70}
              max={130}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>70° (Acute)</span>
              <span>90-110° (Normal)</span>
              <span>130° (Obtuse)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mentolabial_sulcus">Mentolabial Sulcus</Label>
          <Select
            value={data.mentolabial_sulcus}
            onValueChange={(value) => onChange('mentolabial_sulcus', value)}
          >
            <SelectTrigger id="mentolabial_sulcus">
              <SelectValue placeholder="Select mentolabial sulcus depth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pronounced">Pronounced (Deep)</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Non-existing">Non-existing (Flat)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tongue Assessment */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">👅</span>
          Tongue Assessment
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
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
        </div>
      </div>

      {/* Functional Assessment */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">⚡</span>
          Functional Assessment
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="max_jaw_opening">Maximum Jaw Opening (mm)</Label>
            <Input
              id="max_jaw_opening"
              type="number"
              step="0.5"
              min={0}
              max={80}
              value={data.max_jaw_opening}
              onChange={(e) => onChange('max_jaw_opening', e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="Normal: 40-50mm"
            />
            <p className="text-xs text-muted-foreground">
              Normal range: 40-50mm. Restricted if &lt;35mm.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="habits">Oral Habits</Label>
            <Textarea
              id="habits"
              value={data.habits}
              onChange={(e) => onChange('habits', e.target.value)}
              placeholder="Thumb sucking, tongue thrusting, mouth breathing, nail biting..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
