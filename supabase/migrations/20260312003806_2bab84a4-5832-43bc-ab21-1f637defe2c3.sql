
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- PATIENTS
DROP POLICY IF EXISTS "Users can view own patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;

CREATE POLICY "Users can view own patients"
ON public.patients FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Admins can view all patients"
ON public.patients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert own patients" ON public.patients;
CREATE POLICY "Users can insert own patients"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own patients" ON public.patients;
CREATE POLICY "Users can update own patients"
ON public.patients FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

DROP POLICY IF EXISTS "Users can delete own patients" ON public.patients;
CREATE POLICY "Users can delete own patients"
ON public.patients FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- SESSIONS
DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;

CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Admins can view all sessions"
ON public.sessions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
CREATE POLICY "Users can insert own sessions"
ON public.sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.sessions;
CREATE POLICY "Users can delete own sessions"
ON public.sessions FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- TREATMENT_PLANS
DROP POLICY IF EXISTS "Users can view own treatment_plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Admins can view all treatment_plans" ON public.treatment_plans;

CREATE POLICY "Users can view own treatment_plans"
ON public.treatment_plans FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Admins can view all treatment_plans"
ON public.treatment_plans FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert own treatment_plans" ON public.treatment_plans;
CREATE POLICY "Users can insert own treatment_plans"
ON public.treatment_plans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own treatment_plans" ON public.treatment_plans;
CREATE POLICY "Users can update own treatment_plans"
ON public.treatment_plans FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

DROP POLICY IF EXISTS "Users can delete own treatment_plans" ON public.treatment_plans;
CREATE POLICY "Users can delete own treatment_plans"
ON public.treatment_plans FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- USER_ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- DENTAL_CHART
DROP POLICY IF EXISTS "Users can view own dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "Users can insert own dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "Users can update own dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "Users can delete own dental_chart" ON public.dental_chart;

CREATE POLICY "Users can view own dental_chart"
ON public.dental_chart FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can insert own dental_chart"
ON public.dental_chart FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dental_chart"
ON public.dental_chart FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete own dental_chart"
ON public.dental_chart FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- INITIAL_PHOTOS
DROP POLICY IF EXISTS "Users can view own initial_photos" ON public.initial_photos;
DROP POLICY IF EXISTS "Users can insert own initial_photos" ON public.initial_photos;
DROP POLICY IF EXISTS "Users can update own initial_photos" ON public.initial_photos;
DROP POLICY IF EXISTS "Users can delete own initial_photos" ON public.initial_photos;

CREATE POLICY "Users can view own initial_photos"
ON public.initial_photos FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can insert own initial_photos"
ON public.initial_photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own initial_photos"
ON public.initial_photos FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete own initial_photos"
ON public.initial_photos FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- SESSION_IMAGES
DROP POLICY IF EXISTS "Users can view own session_images" ON public.session_images;
DROP POLICY IF EXISTS "Users can insert own session_images" ON public.session_images;
DROP POLICY IF EXISTS "Users can update own session_images" ON public.session_images;
DROP POLICY IF EXISTS "Users can delete own session_images" ON public.session_images;

CREATE POLICY "Users can view own session_images"
ON public.session_images FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can insert own session_images"
ON public.session_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session_images"
ON public.session_images FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete own session_images"
ON public.session_images FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));
