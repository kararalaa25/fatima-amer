-- Make doctor ID generation collision-safe and enforce one doctor record per user
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
    new_code := 'DOC-' || lpad(floor(random() * 100000)::text, 5, '0');
    SELECT EXISTS (SELECT 1 FROM public.doctors WHERE doctor_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- Enforce data integrity for doctor IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'doctors_user_id_unique'
      AND conrelid = 'public.doctors'::regclass
  ) THEN
    ALTER TABLE public.doctors
      ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'doctors_doctor_code_unique'
      AND conrelid = 'public.doctors'::regclass
  ) THEN
    ALTER TABLE public.doctors
      ADD CONSTRAINT doctors_doctor_code_unique UNIQUE (doctor_code);
  END IF;
END;
$$;