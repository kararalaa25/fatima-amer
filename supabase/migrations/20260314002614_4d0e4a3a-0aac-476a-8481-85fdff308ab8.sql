
-- Create doctors table
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  doctor_code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own doctor record" ON public.doctors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doctor record" ON public.doctors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all doctors" ON public.doctors
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add columns to patients table
ALTER TABLE public.patients
  ADD COLUMN patient_code text UNIQUE,
  ADD COLUMN phone_number text,
  ADD COLUMN doctor_id uuid REFERENCES public.doctors(id);

-- Create patient_accounts table
CREATE TABLE public.patient_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  auth_user_id uuid UNIQUE,
  is_registered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;

-- Doctors can view patient accounts for their patients
CREATE POLICY "Doctors can view own patient accounts" ON public.patient_accounts
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON p.doctor_id = d.id
      WHERE p.id = patient_accounts.patient_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can insert patient accounts" ON public.patient_accounts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON p.doctor_id = d.id
      WHERE p.id = patient_accounts.patient_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update patient accounts" ON public.patient_accounts
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.doctors d ON p.doctor_id = d.id
      WHERE p.id = patient_accounts.patient_id AND d.user_id = auth.uid()
    )
  );

-- Patient can view own account
CREATE POLICY "Patient can view own account" ON public.patient_accounts
  FOR SELECT TO authenticated USING (auth.uid() = auth_user_id);

-- Admins can view all
CREATE POLICY "Admins can view all patient accounts" ON public.patient_accounts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique doctor code
CREATE OR REPLACE FUNCTION public.generate_doctor_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'DR-' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS (SELECT 1 FROM public.doctors WHERE doctor_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to generate unique patient code
CREATE OR REPLACE FUNCTION public.generate_patient_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'PT-' || lpad(floor(random() * 100000)::text, 5, '0');
    SELECT EXISTS (SELECT 1 FROM public.patients WHERE patient_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Allow patients (via their auth account) to view their own patient record
CREATE POLICY "Patient auth users can view own patient" ON public.patients
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patient_accounts pa
      WHERE pa.patient_id = patients.id AND pa.auth_user_id = auth.uid()
    )
  );
