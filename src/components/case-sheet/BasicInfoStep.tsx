import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoStepProps {
  data: {
    name: string;
    age: number | '';
    chief_complaint: string;
  };
  onChange: (field: string, value: string | number) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
        <p className="text-sm text-muted-foreground">Enter the patient's basic details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Patient Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Enter patient name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={data.age}
            onChange={(e) => onChange('age', parseInt(e.target.value) || '')}
            placeholder="Enter age"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chief_complaint">Chief Complaint</Label>
        <Textarea
          id="chief_complaint"
          value={data.chief_complaint}
          onChange={(e) => onChange('chief_complaint', e.target.value)}
          placeholder="Describe the patient's main concern or reason for visit..."
          rows={4}
        />
      </div>
    </div>
  );
}
