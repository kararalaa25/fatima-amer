import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, analysisType } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert orthodontic AI assistant specializing in dental image analysis. 
Analyze the provided dental/orthodontic image and provide a detailed clinical assessment.

Your analysis should include:

1. **Alignment Assessment**
   - Identify any visible crowding, spacing, or rotations
   - Note any teeth that appear misaligned
   - Assess midline alignment if visible

2. **Occlusal Observations** (if applicable)
   - Comment on bite relationship if visible
   - Note any overjet or overbite concerns
   - Identify any crossbites or open bites

3. **Treatment Progress Indicators** (if comparing to typical orthodontic goals)
   - Assess overall arch form
   - Note any areas requiring attention
   - Identify positive progress indicators

4. **Clinical Notes**
   - Any additional observations relevant to orthodontic treatment
   - Recommendations for monitoring
   - Areas that may need closer examination

Format your response in clear sections with bullet points for easy reading.
Be professional and clinical in your language, but also clear and understandable.
Note: This is an AI-assisted analysis and should be verified by a qualified orthodontist.`;

    const userPrompt = analysisType === 'progress' 
      ? 'Analyze this dental image for treatment progress. Focus on alignment improvements, remaining issues, and overall treatment trajectory.'
      : 'Perform a comprehensive orthodontic analysis of this dental image. Identify alignment issues, occlusal concerns, and areas requiring treatment attention.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis generated');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-dental-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
