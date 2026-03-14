import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Hash, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BasicInfoStepProps {
  data: {
    name: string;
    age: number | '';
    chief_complaint: string;
    date_of_birth: string;
    address: string;
    phone_number: string;
    patient_code: string;
    medical_history: string[];
    current_medications: string[];
  };
  onChange: (field: string, value: string | number | string[]) => void;
}

const MEDICAL_CONDITIONS = [
  { id: 'cardiac', label: 'Cardiac Issues', icon: '❤️' },
  { id: 'asthma', label: 'Asthma', icon: '🫁' },
  { id: 'allergies', label: 'Allergies', icon: '🤧' },
  { id: 'aids_hiv', label: 'AIDS/HIV', icon: '🩸' },
  { id: 'rheumatic_fever', label: 'Rheumatic Fever', icon: '🌡️' },
  { id: 'diabetes', label: 'Diabetes', icon: '💉' },
  { id: 'epilepsy', label: 'Epilepsy', icon: '⚡' },
];

const COMMON_MEDICATIONS = [
  { id: 'amoxicillin', label: 'Amoxicillin', category: 'Antibiotics' },
  { id: 'ibuprofen', label: 'Ibuprofen', category: 'Analgesics' },
  { id: 'acetaminophen', label: 'Acetaminophen', category: 'Analgesics' },
  { id: 'warfarin', label: 'Warfarin', category: 'Anticoagulants' },
  { id: 'bisphosphonates', label: 'Bisphosphonates', category: 'Bone Health' },
  { id: 'antihistamines', label: 'Antihistamines', category: 'Allergy' },
  { id: 'aspirin', label: 'Aspirin', category: 'Antiplatelet' },
  { id: 'steroids', label: 'Steroids', category: 'Anti-inflammatory' },
];

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [generatingId, setGeneratingId] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePatientId = async () => {
    setGeneratingId(true);
    try {
      const { data: code, error } = await supabase.rpc('generate_patient_code');
      if (error) throw error;
      onChange('patient_code', code);
      toast.success(`Patient ID Generated: ${code}`);
    } catch (err: any) {
      toast.error('Failed to generate Patient ID', { description: err.message });
    } finally {
      setGeneratingId(false);
    }
  };

  const handleCopyId = () => {
    if (data.patient_code) {
      navigator.clipboard.writeText(data.patient_code);
      setCopied(true);
      toast.success('Patient ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMedicalHistoryChange = (conditionId: string, checked: boolean) => {
    const current = data.medical_history || [];
    const updated = checked
      ? [...current, conditionId]
      : current.filter((id) => id !== conditionId);
    onChange('medical_history', updated);
  };

  const handleMedicationChange = (medId: string, checked: boolean) => {
    const current = data.current_medications || [];
    const updated = checked
      ? [...current, medId]
      : current.filter((id) => id !== medId);
    onChange('current_medications', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
        <p className="text-sm text-muted-foreground">Enter the patient's basic details and medical history</p>
      </div>

      {/* Patient ID Generator */}
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Patient ID
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a unique ID to share with your patient for access
            </p>
          </div>
          {data.patient_code ? (
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <span className="text-lg font-mono font-bold text-primary">{data.patient_code}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopyId}
                className="h-9 w-9"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleGeneratePatientId}
              disabled={generatingId}
              className="gap-2"
            >
              {generatingId ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Hash className="h-4 w-4" /> Generate Patient ID</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Core Details */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            value={data.phone_number || ''}
            onChange={(e) => onChange('phone_number', e.target.value)}
            placeholder="Patient phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <div className="relative">
            <Input
              id="date_of_birth"
              type="date"
              value={data.date_of_birth || ''}
              onChange={(e) => onChange('date_of_birth', e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Patient Address</Label>
        <Textarea
          id="address"
          value={data.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Enter patient's full address..."
          rows={2}
        />
      </div>

      {/* Chief Complaint */}
      <div className="space-y-2">
        <Label htmlFor="chief_complaint">Chief Complaint</Label>
        <Textarea
          id="chief_complaint"
          value={data.chief_complaint}
          onChange={(e) => onChange('chief_complaint', e.target.value)}
          placeholder="Describe the patient's main concern or reason for visit..."
          rows={3}
        />
      </div>

      {/* Medical History */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">🏥</span>
          Medical History
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MEDICAL_CONDITIONS.map((condition) => (
            <label
              key={condition.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 cursor-pointer hover:bg-accent/10 transition-colors"
            >
              <Checkbox
                id={`medical-${condition.id}`}
                checked={(data.medical_history || []).includes(condition.id)}
                onCheckedChange={(checked) =>
                  handleMedicalHistoryChange(condition.id, checked as boolean)
                }
              />
              <span className="text-lg">{condition.icon}</span>
              <span className="text-sm font-medium">{condition.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Current Medications */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
        <h4 className="mb-4 font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">💊</span>
          Current Medications
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {(data.current_medications || []).map((med) => {
            const medication = COMMON_MEDICATIONS.find((m) => m.id === med);
            return medication ? (
              <Badge key={med} variant="secondary" className="text-sm">
                {medication.label}
              </Badge>
            ) : null;
          })}
          {(data.current_medications || []).length === 0 && (
            <span className="text-sm text-muted-foreground">No medications selected</span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMMON_MEDICATIONS.map((med) => (
            <label
              key={med.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 cursor-pointer hover:bg-accent/10 transition-colors"
            >
              <Checkbox
                id={`med-${med.id}`}
                checked={(data.current_medications || []).includes(med.id)}
                onCheckedChange={(checked) =>
                  handleMedicationChange(med.id, checked as boolean)
                }
              />
              <div>
                <span className="text-sm font-medium block">{med.label}</span>
                <span className="text-xs text-muted-foreground">{med.category}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
