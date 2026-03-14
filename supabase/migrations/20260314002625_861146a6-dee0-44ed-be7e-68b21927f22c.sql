
-- Fix search_path on generate_doctor_code
CREATE OR REPLACE FUNCTION public.generate_doctor_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path on generate_patient_code
CREATE OR REPLACE FUNCTION public.generate_patient_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
