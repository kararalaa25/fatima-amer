export interface Patient {
  id: string;
  name: string;
  age: number;
  chief_complaint?: string;
  
  // Clinical Relations
  ap_relation?: string;
  horizontal_relation?: string;
  vertical_relation?: string;
  overbite_mm?: number;
  overjet_mm?: number;
  molar_relation?: string;
  canine_relation?: string;
  incisor_relation?: string;
  oral_hygiene?: 'Good' | 'Fair' | 'Poor';
  
  // Soft Tissue & Myofunctional
  lips?: 'Competent' | 'Incompetent' | 'Potentially Competent';
  habits?: string;
  tongue_position?: string;
  tongue_size?: string;
  
  // Segment Analysis
  upper_buccal?: 'Aligned' | 'Crowded' | 'Spacing';
  lower_buccal?: 'Aligned' | 'Crowded' | 'Spacing';
  upper_labial?: 'Aligned' | 'Crowded' | 'Spacing';
  lower_labial?: 'Aligned' | 'Crowded' | 'Spacing';
  
  // Space Analysis
  upper_space_available?: number;
  upper_space_required?: number;
  lower_space_available?: number;
  lower_space_required?: number;
  
  created_at: string;
  updated_at: string;
}

export interface DentalChartTooth {
  id?: string;
  patient_id: string;
  quadrant: 1 | 2 | 3 | 4;
  tooth_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  status: 'present' | 'missing' | 'filling' | 'impacted';
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  primary_goals?: string;
  appliance_types?: string[];
  extraction_plan?: string;
  estimated_duration?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  patient_id: string;
  session_date: string;
  treatment_performed?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionImage {
  id: string;
  session_id: string;
  image_url: string;
  image_type?: string;
  created_at: string;
}

export interface InitialPhoto {
  id: string;
  patient_id: string;
  image_url: string;
  image_type?: string;
  created_at: string;
}

export type ToothStatus = 'present' | 'missing' | 'filling' | 'impacted';
