import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const APPLIANCE_OPTIONS = [
  'Metal Braces',
  'Ceramic Braces',
  'Lingual Braces',
  'Clear Aligners',
  'Palatal Expander',
  'Headgear',
  'Retainers',
  'Space Maintainer',
  'Functional Appliance',
  'Other',
];

interface TreatmentPlanStepProps {
  data: {
    primary_goals: string;
    appliance_types: string[];
    extraction_plan: string;
    estimated_duration: string;
    special_instructions: string;
  };
  onChange: (field: string, value: string | string[]) => void;
}

export function TreatmentPlanStep({ data, onChange }: TreatmentPlanStepProps) {
  const handleApplianceChange = (appliance: string, checked: boolean) => {
    if (checked) {
      onChange('appliance_types', [...data.appliance_types, appliance]);
    } else {
      onChange('appliance_types', data.appliance_types.filter((a) => a !== appliance));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Treatment Plan</h3>
        <p className="text-sm text-muted-foreground">
          Define the treatment goals and approach
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_goals">Primary Goals</Label>
        <Textarea
          id="primary_goals"
          value={data.primary_goals}
          onChange={(e) => onChange('primary_goals', e.target.value)}
          placeholder="Describe the primary treatment objectives..."
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <Label>Appliance Type</Label>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {APPLIANCE_OPTIONS.map((appliance) => (
            <div key={appliance} className="flex items-center space-x-2">
              <Checkbox
                id={appliance}
                checked={data.appliance_types.includes(appliance)}
                onCheckedChange={(checked) =>
                  handleApplianceChange(appliance, checked as boolean)
                }
              />
              <label
                htmlFor={appliance}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {appliance}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="extraction_plan">Extraction Plan</Label>
          <Input
            id="extraction_plan"
            value={data.extraction_plan}
            onChange={(e) => onChange('extraction_plan', e.target.value)}
            placeholder="e.g., 14, 24, 34, 44"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_duration">Estimated Duration</Label>
          <Input
            id="estimated_duration"
            value={data.estimated_duration}
            onChange={(e) => onChange('estimated_duration', e.target.value)}
            placeholder="e.g., 18 months"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea
          id="special_instructions"
          value={data.special_instructions}
          onChange={(e) => onChange('special_instructions', e.target.value)}
          placeholder="Any special instructions or considerations..."
          rows={4}
        />
      </div>
    </div>
  );
}
