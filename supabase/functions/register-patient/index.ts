import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { doctor_code, patient_code, phone_number, password } = await req.json();

    if (!doctor_code || !patient_code || !phone_number || !password) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Find doctor
    const { data: doctor, error: docErr } = await supabaseAdmin
      .from("doctors")
      .select("id")
      .eq("doctor_code", doctor_code.toUpperCase().trim())
      .maybeSingle();

    if (docErr || !doctor) {
      return new Response(JSON.stringify({ error: "Invalid Doctor ID" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find patient
    const { data: patient, error: ptErr } = await supabaseAdmin
      .from("patients")
      .select("id, phone_number, patient_code, name")
      .eq("patient_code", patient_code.toUpperCase().trim())
      .eq("doctor_id", doctor.id)
      .maybeSingle();

    if (ptErr || !patient) {
      return new Response(JSON.stringify({ error: "Invalid Patient ID for this doctor" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verify phone
    if (patient.phone_number !== phone_number.trim()) {
      return new Response(JSON.stringify({ error: "Phone number does not match" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Check existing registration
    const { data: existingAccount } = await supabaseAdmin
      .from("patient_accounts")
      .select("is_registered, auth_user_id")
      .eq("patient_id", patient.id)
      .maybeSingle();

    if (existingAccount?.is_registered) {
      return new Response(JSON.stringify({ error: "Patient already registered. Please log in." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Create auth user with auto-confirm
    const patientEmail = `${phone_number.trim().replace(/[^0-9]/g, "")}@patient.ortho.local`;

    // Check if auth user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === patientEmail);

    let authUserId: string;

    if (existingUser) {
      // Update password
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
      authUserId = existingUser.id;
    } else {
      const { data: newUser, error: signUpErr } = await supabaseAdmin.auth.admin.createUser({
        email: patientEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: patient.name || `Patient ${patient_code}`,
          is_patient: true,
          patient_id: patient.id,
        },
      });

      if (signUpErr || !newUser.user) {
        return new Response(JSON.stringify({ error: signUpErr?.message || "Failed to create account" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      authUserId = newUser.user.id;
    }

    // 6. Upsert patient_accounts
    if (existingAccount) {
      await supabaseAdmin
        .from("patient_accounts")
        .update({ is_registered: true, auth_user_id: authUserId, updated_at: new Date().toISOString() })
        .eq("patient_id", patient.id);
    } else {
      await supabaseAdmin
        .from("patient_accounts")
        .insert({
          patient_id: patient.id,
          phone_number: phone_number.trim(),
          is_registered: true,
          auth_user_id: authUserId,
        });
    }

    return new Response(JSON.stringify({ success: true, message: "Registration successful" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
