import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SegmentAnalysisStepProps {
  data: {
    upper_buccal: string;
    lower_buccal: string;
    upper_labial: string;
    lower_labial: string;
    upper_space_available: number | '';
    upper_space_required: number | '';
    lower_space_available: number | '';
    lower_space_required: number | '';
  };
  onChange: (field: string, value: string | number) => void;
}

export function SegmentAnalysisStep({ data, onChange }: SegmentAnalysisStepProps) {
  const showUpperSpace = data.upper_buccal === 'Crowded' || data.upper_buccal === 'Spacing' ||
                         data.upper_labial === 'Crowded' || data.upper_labial === 'Spacing';
  const showLowerSpace = data.lower_buccal === 'Crowded' || data.lower_buccal === 'Spacing' ||
                         data.lower_labial === 'Crowded' || data.lower_labial === 'Spacing';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Segment Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Analyze arch segments and space requirements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="upper_buccal">Upper Buccal</Label>
          <Select
            value={data.upper_buccal}
            onValueChange={(value) => onChange('upper_buccal', value)}
          >
            <SelectTrigger id="upper_buccal">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aligned">Aligned</SelectItem>
              <SelectItem value="Crowded">Crowded</SelectItem>
              <SelectItem value="Spacing">Spacing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lower_buccal">Lower Buccal</Label>
          <Select
            value={data.lower_buccal}
            onValueChange={(value) => onChange('lower_buccal', value)}
          >
            <SelectTrigger id="lower_buccal">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aligned">Aligned</SelectItem>
              <SelectItem value="Crowded">Crowded</SelectItem>
              <SelectItem value="Spacing">Spacing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="upper_labial">Upper Labial</Label>
          <Select
            value={data.upper_labial}
            onValueChange={(value) => onChange('upper_labial', value)}
          >
            <SelectTrigger id="upper_labial">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aligned">Aligned</SelectItem>
              <SelectItem value="Crowded">Crowded</SelectItem>
              <SelectItem value="Spacing">Spacing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lower_labial">Lower Labial</Label>
          <Select
            value={data.lower_labial}
            onValueChange={(value) => onChange('lower_labial', value)}
          >
            <SelectTrigger id="lower_labial">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aligned">Aligned</SelectItem>
              <SelectItem value="Crowded">Crowded</SelectItem>
              <SelectItem value="Spacing">Spacing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional Upper Space Fields */}
      {showUpperSpace && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="mb-4 font-medium text-foreground">Upper Arch Space Analysis</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="upper_space_available">Space Available (mm)</Label>
              <Input
                id="upper_space_available"
                type="number"
                step="0.1"
                value={data.upper_space_available}
                onChange={(e) => onChange('upper_space_available', parseFloat(e.target.value) || '')}
                placeholder="Enter available space"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upper_space_required">Space Required/To Close (mm)</Label>
              <Input
                id="upper_space_required"
                type="number"
                step="0.1"
                value={data.upper_space_required}
                onChange={(e) => onChange('upper_space_required', parseFloat(e.target.value) || '')}
                placeholder="Enter required space"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Lower Space Fields */}
      {showLowerSpace && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="mb-4 font-medium text-foreground">Lower Arch Space Analysis</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lower_space_available">Space Available (mm)</Label>
              <Input
                id="lower_space_available"
                type="number"
                step="0.1"
                value={data.lower_space_available}
                onChange={(e) => onChange('lower_space_available', parseFloat(e.target.value) || '')}
                placeholder="Enter available space"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lower_space_required">Space Required/To Close (mm)</Label>
              <Input
                id="lower_space_required"
                type="number"
                step="0.1"
                value={data.lower_space_required}
                onChange={(e) => onChange('lower_space_required', parseFloat(e.target.value) || '')}
                placeholder="Enter required space"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
