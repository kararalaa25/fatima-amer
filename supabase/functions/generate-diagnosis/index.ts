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
    const { clinicalData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an experienced orthodontist AI assistant. Based on the clinical findings provided, generate a professional orthodontic diagnosis and treatment plan recommendation.

Your response must be a JSON object with the following structure:
{
  "diagnosis": "A comprehensive initial diagnosis based on the clinical findings",
  "primary_goals": "Specific treatment objectives to address the identified issues",
  "recommended_appliances": ["Array of recommended appliance types from: Metal Braces, Ceramic Braces, Lingual Braces, Clear Aligners, Palatal Expander, Headgear, Retainers, Space Maintainer, Functional Appliance"],
  "extraction_recommendation": "If extractions are recommended, specify which teeth, otherwise state 'No extractions recommended'",
  "estimated_duration": "Estimated treatment duration (e.g., '18-24 months')",
  "special_considerations": "Any special instructions or considerations based on the findings"
}

Be professional, thorough, and base your recommendations strictly on the clinical data provided. If certain data is missing, note that in your assessment.`;

    const userPrompt = `Please analyze the following orthodontic clinical findings and provide a diagnosis with treatment recommendations:

**Skeletal & Jaw Relations:**
- AP Relation: ${clinicalData.ap_relation || 'Not recorded'}
- Horizontal Relation: ${clinicalData.horizontal_relation || 'Not recorded'}
- Vertical Relation: ${clinicalData.vertical_relation || 'Not recorded'}

**Dental Relations:**
- Molar Relation: ${clinicalData.molar_relation || 'Not recorded'}
- Canine Relation: ${clinicalData.canine_relation || 'Not recorded'}
- Incisor Relation: ${clinicalData.incisor_relation || 'Not recorded'}

**Measurements:**
- Overbite: ${clinicalData.overbite_mm ? `${clinicalData.overbite_mm}mm` : 'Not recorded'}
- Overjet: ${clinicalData.overjet_mm ? `${clinicalData.overjet_mm}mm` : 'Not recorded'}

**Oral Health:**
- Oral Hygiene: ${clinicalData.oral_hygiene || 'Not recorded'}

**Soft Tissue Assessment:**
- Lips: ${clinicalData.lips || 'Not recorded'}
- Tongue Position: ${clinicalData.tongue_position || 'Not recorded'}
- Tongue Size: ${clinicalData.tongue_size || 'Not recorded'}
- Habits: ${clinicalData.habits || 'Not recorded'}

**Segment Analysis:**
- Upper Buccal: ${clinicalData.upper_buccal || 'Not recorded'}
- Lower Buccal: ${clinicalData.lower_buccal || 'Not recorded'}
- Upper Labial: ${clinicalData.upper_labial || 'Not recorded'}
- Lower Labial: ${clinicalData.lower_labial || 'Not recorded'}
- Upper Arch Space Available: ${clinicalData.upper_space_available || 'Not recorded'}mm
- Upper Arch Space Required: ${clinicalData.upper_space_required || 'Not recorded'}mm
- Lower Arch Space Available: ${clinicalData.lower_space_available || 'Not recorded'}mm
- Lower Arch Space Required: ${clinicalData.lower_space_required || 'Not recorded'}mm

**Chief Complaint:** ${clinicalData.chief_complaint || 'Not recorded'}

Please provide your professional diagnosis and treatment recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
