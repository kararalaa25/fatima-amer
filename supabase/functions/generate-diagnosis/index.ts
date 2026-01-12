import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clinicalData, dentalChartSummary, availableImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert orthodontist AI assistant with 20+ years of clinical experience. Based on the comprehensive clinical findings provided, generate a DETAILED orthodontic treatment plan.

Your response MUST be a JSON object with this EXACT structure:
{
  "diagnosis": "Comprehensive initial diagnosis based on all clinical findings",
  "leveling_alignment": {
    "starting_wire": "Specific starting wire (e.g., '0.012 NiTi' for severe crowding, '0.014 NiTi' for moderate crowding)",
    "wire_sequence": ["Array of wires in sequence, e.g., '0.012 NiTi', '0.014 NiTi', '0.016 NiTi', '0.016x0.022 NiTi', '0.017x0.025 NiTi', '0.019x0.025 SS'"],
    "rationale": "Why this wire sequence was chosen based on the crowding severity"
  },
  "space_management": {
    "approach": "Space creation / Space maintenance / Space closure",
    "coil_type": "Open Coils (to create space) or Closed Coils (to maintain space) or Power Chain (to close space)",
    "details": "Specific details about where and how to apply"
  },
  "ipr_strategy": {
    "amount_mm": 0.0,
    "timing": "Session 1 / After leveling / When 0.018x0.025 SS is reached",
    "location": "Specify teeth for IPR (e.g., 'Lower anterior 3-3' or 'Upper 2-2')",
    "rationale": "Why IPR is needed or not needed based on space analysis"
  },
  "mechanics": {
    "elastics": "Type and configuration (e.g., 'Class II elastics 3/16\" 6oz from upper canine to lower molar' or 'No elastics needed')",
    "auxiliaries": "Any auxiliaries needed (e.g., 'Laceback, Torquing springs, Power arms')",
    "adjustments": "Specific bracket adjustments or repositioning needed"
  },
  "primary_goals": "Clear treatment objectives",
  "recommended_appliances": ["Array from: Metal Braces, Ceramic Braces, Clear Aligners, Palatal Expander, Headgear, Retainers, Functional Appliance"],
  "extraction_recommendation": "Specific teeth if needed (e.g., '14, 24, 34, 44') or 'No extractions recommended'",
  "estimated_duration": "Treatment duration (e.g., '18-24 months')",
  "special_considerations": "Patient-specific notes and precautions"
}

CRITICAL CLINICAL RULES:
1. Starting wire selection based on crowding:
   - Severe crowding (>6mm space deficiency): Start with 0.012 NiTi
   - Moderate crowding (3-6mm): Start with 0.014 NiTi
   - Mild crowding (<3mm): Can start with 0.016 NiTi

2. IPR Timing:
   - If overjet > 5mm or significant crowding: Suggest IPR
   - Light IPR can be done in Session 1 for mild cases
   - Heavy IPR (>0.5mm per contact) should wait until 0.018x0.025 SS

3. Elastics based on molar relation:
   - Class II molar: Class II elastics (upper canine to lower molar)
   - Class III molar: Class III elastics (lower canine to upper molar)
   - Class I: Usually no anteroposterior elastics needed

4. Space management:
   - Positive space discrepancy: Use closed coils or power chain
   - Negative space discrepancy: Use open coils or consider IPR/extractions`;

    const userPrompt = `Please analyze the following orthodontic case and provide a DETAILED treatment plan:

**SKELETAL & JAW RELATIONS:**
- AP Relation: ${clinicalData.ap_relation || 'Not recorded'}
- Horizontal Relation: ${clinicalData.horizontal_relation || 'Not recorded'}
- Vertical Relation: ${clinicalData.vertical_relation || 'Not recorded'}

**DENTAL RELATIONS:**
- Molar Relation: ${clinicalData.molar_relation || 'Not recorded'}
- Canine Relation: ${clinicalData.canine_relation || 'Not recorded'}
- Incisor Relation: ${clinicalData.incisor_relation || 'Not recorded'}

**MEASUREMENTS:**
- Overbite: ${clinicalData.overbite_mm ? `${clinicalData.overbite_mm}mm` : 'Not recorded'}
- Overjet: ${clinicalData.overjet_mm ? `${clinicalData.overjet_mm}mm` : 'Not recorded'}

**ORAL HEALTH:**
- Oral Hygiene: ${clinicalData.oral_hygiene || 'Not recorded'}

**SOFT TISSUE ASSESSMENT:**
- Lips: ${clinicalData.lips || 'Not recorded'}
- Tongue Position: ${clinicalData.tongue_position || 'Not recorded'}
- Tongue Size: ${clinicalData.tongue_size || 'Not recorded'}
- Habits: ${clinicalData.habits || 'Not recorded'}

**SEGMENT ANALYSIS:**
- Upper Buccal: ${clinicalData.upper_buccal || 'Not recorded'}
- Lower Buccal: ${clinicalData.lower_buccal || 'Not recorded'}
- Upper Labial: ${clinicalData.upper_labial || 'Not recorded'}
- Lower Labial: ${clinicalData.lower_labial || 'Not recorded'}
- Upper Arch Space Available: ${clinicalData.upper_space_available || 'Not recorded'}mm
- Upper Arch Space Required: ${clinicalData.upper_space_required || 'Not recorded'}mm
- Lower Arch Space Available: ${clinicalData.lower_space_available || 'Not recorded'}mm
- Lower Arch Space Required: ${clinicalData.lower_space_required || 'Not recorded'}mm

**DENTAL CHART SUMMARY:**
- Missing Teeth: ${dentalChartSummary?.missingTeeth?.join(', ') || 'None recorded'}
- Total Teeth Marked: ${dentalChartSummary?.totalTeethMarked || 0}

**AVAILABLE DIAGNOSTIC IMAGES:**
${availableImages?.length > 0 ? availableImages.join(', ') : 'No images uploaded'}

**CHIEF COMPLAINT:** ${clinicalData.chief_complaint || 'Not recorded'}

Based on this comprehensive data, provide a detailed sequential treatment plan with specific wire recommendations, IPR strategy, and mechanics.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    const diagnosis = JSON.parse(content);

    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-diagnosis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
