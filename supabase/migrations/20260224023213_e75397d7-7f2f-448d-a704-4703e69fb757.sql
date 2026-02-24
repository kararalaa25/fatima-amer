
-- Allow admins to see ALL patients
CREATE POLICY "Admins can view all patients"
ON public.patients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to see ALL treatment_plans
CREATE POLICY "Admins can view all treatment_plans"
ON public.treatment_plans FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to see ALL sessions
CREATE POLICY "Admins can view all sessions"
ON public.sessions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
