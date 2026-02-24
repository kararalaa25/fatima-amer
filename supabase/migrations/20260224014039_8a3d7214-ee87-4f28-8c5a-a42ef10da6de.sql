-- Update handle_new_user to auto-activate users immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, workspace_id, is_activated)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    gen_random_uuid(),
    true  -- Auto-activate immediately
  );
  
  -- Auto-assign doctor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  
  RETURN NEW;
END;
$function$;

-- Also activate any existing pending users
UPDATE profiles SET is_activated = true WHERE is_activated = false;