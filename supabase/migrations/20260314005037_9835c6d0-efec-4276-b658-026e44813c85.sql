
-- Update doctor code format to DOC-XXXX
CREATE OR REPLACE FUNCTION public.generate_doctor_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'DOC-' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS (SELECT 1 FROM public.doctors WHERE doctor_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- Update patient code format to PAT-XXXX
CREATE OR REPLACE FUNCTION public.generate_patient_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := 'PAT-' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS (SELECT 1 FROM public.patients WHERE patient_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;
