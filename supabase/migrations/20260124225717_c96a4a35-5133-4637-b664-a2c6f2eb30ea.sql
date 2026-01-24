-- Fix RLS policies for other tables to use user-based access

-- Update dental_chart RLS
DROP POLICY IF EXISTS "Allow all operations on dental_chart" ON public.dental_chart;

ALTER TABLE public.dental_chart ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own dental_chart"
ON public.dental_chart FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own dental_chart"
ON public.dental_chart FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dental_chart"
ON public.dental_chart FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own dental_chart"
ON public.dental_chart FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update initial_photos RLS
DROP POLICY IF EXISTS "Allow all operations on initial_photos" ON public.initial_photos;

ALTER TABLE public.initial_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own initial_photos"
ON public.initial_photos FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own initial_photos"
ON public.initial_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own initial_photos"
ON public.initial_photos FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own initial_photos"
ON public.initial_photos FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update session_images RLS
DROP POLICY IF EXISTS "Allow all operations on session_images" ON public.session_images;

ALTER TABLE public.session_images ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own session_images"
ON public.session_images FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own session_images"
ON public.session_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session_images"
ON public.session_images FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own session_images"
ON public.session_images FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update sessions RLS
DROP POLICY IF EXISTS "Allow all operations on sessions" ON public.sessions;

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own sessions"
ON public.sessions FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update treatment_plans RLS
DROP POLICY IF EXISTS "Allow all operations on treatment_plans" ON public.treatment_plans;

ALTER TABLE public.treatment_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own treatment_plans"
ON public.treatment_plans FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own treatment_plans"
ON public.treatment_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treatment_plans"
ON public.treatment_plans FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own treatment_plans"
ON public.treatment_plans FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);