import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctor_code, patient_code } = await req.json();

    if (!doctor_code || !patient_code) {
      return new Response(
        JSON.stringify({ error: "Both Doctor ID and Patient ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Find doctor by code
    const { data: doctor, error: docErr } = await supabaseAdmin
      .from("doctors")
      .select("id")
      .eq("doctor_code", doctor_code.toUpperCase().trim())
      .maybeSingle();

    if (docErr || !doctor) {
      return new Response(
        JSON.stringify({ error: "Invalid Doctor ID. Please check and try again." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Find patient by code belonging to that doctor
    const { data: patient, error: ptErr } = await supabaseAdmin
      .from("patients")
      .select("id, name, age, patient_code, chief_complaint, oral_hygiene, overbite_mm, overjet_mm, molar_relation, canine_relation, created_at")
      .eq("patient_code", patient_code.toUpperCase().trim())
      .eq("doctor_id", doctor.id)
      .maybeSingle();

    if (ptErr || !patient) {
      return new Response(
        JSON.stringify({ error: "Invalid Patient ID for this doctor. Please check and try again." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Fetch related data
    const [sessionsRes, planRes, photosRes] = await Promise.all([
      supabaseAdmin
        .from("sessions")
        .select("id, session_date, treatment_performed")
        .eq("patient_id", patient.id)
        .order("session_date", { ascending: false }),
      supabaseAdmin
        .from("treatment_plans")
        .select("primary_goals, appliance_types, extraction_plan, estimated_duration, special_instructions")
        .eq("patient_id", patient.id)
        .maybeSingle(),
      supabaseAdmin
        .from("initial_photos")
        .select("id, image_url, image_type")
        .eq("patient_id", patient.id),
    ]);

    return new Response(
      JSON.stringify({
        patient,
        sessions: sessionsRes.data || [],
        treatment_plan: planRes.data || null,
        photos: photosRes.data || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
