import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransformationRequest {
  imageUrl: string;
  treatment: 'hollywood_smile' | 'professional_bleaching';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, treatment }: TransformationRequest = await req.json();

    if (!imageUrl || !treatment) {
      throw new Error('Missing required fields: imageUrl and treatment');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Determine transformation prompt based on treatment type
    const treatmentPrompts = {
      hollywood_smile: `Transform this dental photo to show a Hollywood Smile result. 
        Apply these enhancements:
        - Perfect teeth alignment and symmetry
        - Bright, natural white color (shade B1)
        - Ideal tooth proportions and shapes
        - Beautiful gum line contour
        - Natural-looking veneers appearance
        Keep the facial features and background unchanged. 
        Make the transformation look realistic and professional.`,
      professional_bleaching: `Transform this dental photo to show Professional Bleaching result.
        Apply these enhancements:
        - Whiter teeth (3-5 shades brighter)
        - Remove stains and discoloration
        - Maintain natural tooth shape and alignment
        - Keep existing dental work visible but enhanced
        Keep the facial features and background unchanged.
        Make the transformation look realistic and achievable with bleaching treatment.`,
    };

    const prompt = treatmentPrompts[treatment];

    // Call Gemini API for image generation/editing
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageUrl.startsWith('data:') 
                      ? imageUrl.split(',')[1] 
                      : imageUrl,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the generated content
    const generatedContent = result.candidates?.[0]?.content?.parts?.[0];
    
    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    // Check if we got an image back
    if (generatedContent.inlineData) {
      return new Response(
        JSON.stringify({
          success: true,
          transformedImage: `data:${generatedContent.inlineData.mimeType};base64,${generatedContent.inlineData.data}`,
          treatment,
          description: treatment === 'hollywood_smile' 
            ? 'Hollywood Smile transformation applied with perfect veneers simulation.'
            : 'Professional bleaching simulation showing 3-5 shades whiter teeth.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If text response (analysis), return that
    return new Response(
      JSON.stringify({
        success: true,
        analysis: generatedContent.text,
        treatment,
        note: 'Image transformation requires Gemini image generation capabilities. Analysis provided instead.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smile transformation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});