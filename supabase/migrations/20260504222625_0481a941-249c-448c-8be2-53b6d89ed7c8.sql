
DROP TABLE IF EXISTS public.session_images CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.initial_photos CASCADE;
DROP TABLE IF EXISTS public.dental_chart CASCADE;
DROP TABLE IF EXISTS public.treatment_plans CASCADE;
DROP TABLE IF EXISTS public.patient_accounts CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_user_activated(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_patient_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_doctor_code() CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM ('admin','viewer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles_self_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count int;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  SELECT count(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('crown_bridge','veneers_dsd','surgical_guides','exocad')),
  description text,
  tools_used text[] DEFAULT '{}',
  cover_image text,
  images text[] DEFAULT '{}',
  before_image text,
  after_image text,
  stl_file_url text,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_public_read" ON public.cases FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cases_admin_insert" ON public.cases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cases_admin_update" ON public.cases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cases_admin_delete" ON public.cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER cases_updated_at BEFORE UPDATE ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX cases_category_idx ON public.cases(category);
CREATE INDEX cases_created_at_idx ON public.cases(created_at DESC);

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media','portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "portfolio_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');
CREATE POLICY "portfolio_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "portfolio_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "portfolio_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(),'admin'));
