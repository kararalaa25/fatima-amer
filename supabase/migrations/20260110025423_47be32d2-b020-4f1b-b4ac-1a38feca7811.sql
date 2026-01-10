-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  chief_complaint TEXT,
  
  -- Clinical Relations
  ap_relation TEXT,
  horizontal_relation TEXT,
  vertical_relation TEXT,
  overbite_mm DECIMAL(4,2),
  overjet_mm DECIMAL(4,2),
  molar_relation TEXT,
  canine_relation TEXT,
  incisor_relation TEXT,
  oral_hygiene TEXT CHECK (oral_hygiene IN ('Good', 'Fair', 'Poor')),
  
  -- Soft Tissue & Myofunctional
  lips TEXT CHECK (lips IN ('Competent', 'Incompetent', 'Potentially Competent')),
  habits TEXT,
  tongue_position TEXT,
  tongue_size TEXT,
  
  -- Segment Analysis
  upper_buccal TEXT CHECK (upper_buccal IN ('Aligned', 'Crowded', 'Spacing')),
  lower_buccal TEXT CHECK (lower_buccal IN ('Aligned', 'Crowded', 'Spacing')),
  upper_labial TEXT CHECK (upper_labial IN ('Aligned', 'Crowded', 'Spacing')),
  lower_labial TEXT CHECK (lower_labial IN ('Aligned', 'Crowded', 'Spacing')),
  
  -- Space Analysis (conditional fields)
  upper_space_available DECIMAL(5,2),
  upper_space_required DECIMAL(5,2),
  lower_space_available DECIMAL(5,2),
  lower_space_required DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dental_chart table for Palmer Notation
CREATE TABLE public.dental_chart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  quadrant INTEGER NOT NULL CHECK (quadrant BETWEEN 1 AND 4),
  tooth_number INTEGER NOT NULL CHECK (tooth_number BETWEEN 1 AND 8),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'missing', 'filling')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, quadrant, tooth_number)
);

-- Create treatment_plans table
CREATE TABLE public.treatment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  primary_goals TEXT,
  appliance_types TEXT[],
  extraction_plan TEXT,
  estimated_duration TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  treatment_performed TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_images table
CREATE TABLE public.session_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create initial_photos table for case sheet photos
CREATE TABLE public.initial_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for this clinic app)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initial_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (clinic internal use)
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dental_chart" ON public.dental_chart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on treatment_plans" ON public.treatment_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on session_images" ON public.session_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on initial_photos" ON public.initial_photos FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dental_chart_updated_at BEFORE UPDATE ON public.dental_chart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON public.treatment_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-images', 'patient-images', true);

-- Create storage policies
CREATE POLICY "Allow public read access on patient-images" ON storage.objects FOR SELECT USING (bucket_id = 'patient-images');
CREATE POLICY "Allow public insert on patient-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-images');
CREATE POLICY "Allow public update on patient-images" ON storage.objects FOR UPDATE USING (bucket_id = 'patient-images');
CREATE POLICY "Allow public delete on patient-images" ON storage.objects FOR DELETE USING (bucket_id = 'patient-images');