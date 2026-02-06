// supabase/functions/generate-thumbnail/index.ts
// Secure backend endpoint for thumbnail generation - API keys are server-side only

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting storage (in-memory, resets on function restart)
// For production, consider using Deno KV or external Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limits per user plan
const RATE_LIMITS = {
  starter: { requestsPerMinute: 10, requestsPerHour: 200 },
  'creator-monthly': { requestsPerMinute: 20, requestsPerHour: 500 },
  'creator-yearly': { requestsPerMinute: 25, requestsPerHour: 600 },
};

// Input validation constants
const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string, userPlan: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limits = RATE_LIMITS[userPlan as keyof typeof RATE_LIMITS] || RATE_LIMITS.starter;
  
  const key = userId;
  const userLimit = rateLimitStore.get(key);
  
  // Clean up old entries
  if (userLimit && userLimit.resetTime < now) {
    rateLimitStore.delete(key);
  }
  
  // Check per-minute limit
  const minuteKey = `${key}:minute:${Math.floor(now / 60000)}`;
  const minuteLimit = rateLimitStore.get(minuteKey);
  
  if (minuteLimit && minuteLimit.count >= limits.requestsPerMinute) {
    const retryAfter = 60 - Math.floor((now % 60000) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Check per-hour limit
  const hourKey = `${key}:hour:${Math.floor(now / 3600000)}`;
  const hourLimit = rateLimitStore.get(hourKey);
  
  if (hourLimit && hourLimit.count >= limits.requestsPerHour) {
    const retryAfter = 3600 - Math.floor((now % 3600000) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Update counters
  const newMinuteCount = (minuteLimit?.count || 0) + 1;
  rateLimitStore.set(minuteKey, { count: newMinuteCount, resetTime: now + 60000 });
  
  const newHourCount = (hourLimit?.count || 0) + 1;
  rateLimitStore.set(hourKey, { count: newHourCount, resetTime: now + 3600000 });
  
  return { allowed: true };
}

/**
 * Sanitize user input
 */
function sanitizeInput(input: string): string {
  // Remove script tags and other dangerous HTML
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Limit length
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
  }
  
  return sanitized.trim();
}

/**
 * Validate image data
 */
function validateImage(imageData: string): { valid: boolean; error?: string } {
  // Check if it's a data URL
  if (!imageData.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format. Must be a data URL.' };
  }
  
  // Extract base64 data
  const base64Data = imageData.split(',')[1];
  if (!base64Data) {
    return { valid: false, error: 'Invalid image data format.' };
  }
  
  // Check size (approximate - base64 is ~33% larger than binary)
  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.` };
  }
  
  // Check image type
  const mimeType = imageData.match(/data:image\/(\w+);base64/)?.[1];
  if (!mimeType || !['png', 'jpeg', 'jpg', 'webp'].includes(mimeType.toLowerCase())) {
    return { valid: false, error: 'Invalid image type. Only PNG, JPG, and WebP are allowed.' };
  }
  
  return { valid: true };
}

/**
 * Advanced reference image analysis and prompt building
 */
function analyzeReferenceImage(referenceImage: string, prompt: string, selection?: any): string {
  let analysis = "";
  
  if (selection) {
    // Regional editing with reference
    analysis = `REGIONAL EDIT TASK:
1. ANALYZE the reference image to understand the subject, style, pose, lighting, and composition
2. ONLY MODIFY the selected region at coordinates (x:${Math.round(selection.x)}, y:${Math.round(selection.y)}, size:${Math.round(selection.width)}x${Math.round(selection.height)})
3. SEAMLESSLY INTEGRATE the reference subject/style into ONLY that selected area
4. PRESERVE all other areas of the original image completely unchanged
5. Match lighting, perspective, and scale to fit naturally in the selected region

Task: ${prompt}

CRITICAL: Do NOT change anything outside the selected area. Only modify the specified rectangular region.`;
  } else {
    // Full image with reference
    analysis = `REFERENCE-GUIDED GENERATION:
1. ANALYZE the reference image for: subject characteristics, pose, lighting, style, composition elements
2. EXTRACT key visual elements (not text or branding) that should inspire the new thumbnail
3. CREATE a new YouTube thumbnail that incorporates the visual style and subject essence from the reference
4. DO NOT copy text, logos, or branding from the reference
5. FOCUS on pose, lighting style, color palette, and composition approach

Prompt: ${prompt}

Use the reference for visual inspiration and style guidance only.`;
  }
  
  return analysis;
}

/**
 * Build sophisticated prompts for different creation modes
 */
function buildAdvancedPrompt(
  prompt: string, 
  options: any, 
  selection?: any, 
  referenceImage?: string,
  isVertical: boolean = false
): string {
  let refinedPrompt = "";
  
  // Handle regional editing
  if (selection) {
    if (referenceImage) {
      refinedPrompt = analyzeReferenceImage(referenceImage, prompt, selection);
    } else {
      refinedPrompt = `PRECISE REGIONAL EDIT:
Target area: Rectangle at x:${Math.round(selection.x)}, y:${Math.round(selection.y)} with dimensions ${Math.round(selection.width)}x${Math.round(selection.height)}

INSTRUCTIONS:
1. ONLY modify the specified rectangular region
2. Apply this change: ${prompt}
3. Keep ALL other areas completely unchanged
4. Ensure seamless blending at the edges
5. Match existing lighting and perspective

CRITICAL: Do not alter any part of the image outside the selected area.`;
    }
  } else {
    // Full thumbnail generation
    const platformContext = isVertical ? 'Instagram Reels/YouTube Shorts (vertical mobile viewing)' : 'YouTube (desktop/mobile web viewing)';
    
    refinedPrompt = `CREATE a professional, high-CTR ${platformContext} thumbnail:

SUBJECT: ${prompt}

CORE REQUIREMENTS:
- ${isVertical ? 'Vertical composition (9:16) optimized for mobile' : 'Horizontal composition (16:9) with cinematic quality'}
- High contrast and vibrant colors for maximum click-through appeal
- Clear, readable visual hierarchy
- Professional lighting and composition
- No text overlays saying "4K", "HD", "Cinematic" or similar technical terms`;

    // Handle reference image for full generation
    if (referenceImage) {
      refinedPrompt = analyzeReferenceImage(referenceImage, prompt) + "\n\n" + refinedPrompt;
    }

    // Add style specifications
    if (options?.style && options.style !== 'None') {
      refinedPrompt += `\n\nVISUAL STYLE: ${options.style}`;
      
      // Style-specific enhancements
      switch (options.style.toLowerCase()) {
        case 'cinematic':
          refinedPrompt += " - Use dramatic lighting, depth of field, film-like color grading. Avoid adding 'CINEMATIC' or '4K' text to the image.";
          break;
        case 'minimalist':
          refinedPrompt += " - Clean composition, negative space, simple color palette, uncluttered design.";
          break;
        case 'dramatic':
          refinedPrompt += " - High contrast, bold shadows, intense expressions, dynamic composition.";
          break;
        case 'bright':
          refinedPrompt += " - Vibrant colors, high energy, well-lit, cheerful atmosphere.";
          break;
        case 'dark':
          refinedPrompt += " - Moody lighting, deep shadows, atmospheric, mysterious tone.";
          break;
        case 'retro':
          refinedPrompt += " - Vintage aesthetics, retro color grading, nostalgic feel, period-appropriate elements.";
          break;
        case 'neon':
          refinedPrompt += " - Neon lighting effects, cyberpunk aesthetics, electric colors, urban nighttime vibe.";
          break;
        case 'professional':
          refinedPrompt += " - Business-like setting, professional attire, corporate aesthetics, clean presentation.";
          break;
      }
    }

    // Add lighting specifications
    if (options?.lighting && options.lighting !== 'None') {
      refinedPrompt += `\n\nLIGHTING: ${options.lighting}`;
      
      switch (options.lighting.toLowerCase()) {
        case 'natural':
          refinedPrompt += " - Soft, natural daylight, realistic shadows, outdoor or well-lit indoor setting.";
          break;
        case 'studio':
          refinedPrompt += " - Professional studio lighting, even illumination, minimal harsh shadows.";
          break;
        case 'dramatic':
          refinedPrompt += " - Strong directional lighting, pronounced shadows, high contrast between light and dark.";
          break;
        case 'soft':
          refinedPrompt += " - Diffused lighting, gentle shadows, flattering illumination, warm tone.";
          break;
        case 'backlit':
          refinedPrompt += " - Subject lit from behind, rim lighting, silhouette or halo effects.";
          break;
        case 'golden hour':
          refinedPrompt += " - Warm, golden sunlight, long shadows, magical hour lighting quality.";
          break;
        case 'neon':
          refinedPrompt += " - Colorful neon lighting, electric blues/pinks/purples, urban nighttime atmosphere.";
          break;
      }
    }

    // Add emphasis specifications
    if (options?.emphasis && options.emphasis !== 'None') {
      refinedPrompt += `\n\nEMPHASIS TECHNIQUE: ${options.emphasis}`;
      
      switch (options.emphasis.toLowerCase()) {
        case 'arrows':
          refinedPrompt += " - Include subtle directional arrows or pointer elements to guide viewer attention.";
          break;
        case 'circles':
          refinedPrompt += " - Use circular highlights or frames to emphasize important elements.";
          break;
        case 'glow':
          refinedPrompt += " - Apply subtle glow effects around key subjects or objects.";
          break;
        case 'zoom':
          refinedPrompt += " - Create visual zoom or magnification effects on important elements.";
          break;
        case 'contrast':
          refinedPrompt += " - Use high contrast between foreground and background to make subject pop.";
          break;
      }
    }

    // Handle overlay text properly
    if (options?.overlayText && options.overlayText.trim() !== "") {
      const sanitizedText = sanitizeInput(options.overlayText);
      refinedPrompt += `\n\nTEXT OVERLAY: Include this EXACT text in large, bold, readable typography: "${sanitizedText}"
- Make text highly visible and clickable-looking
- Use contrasting colors for maximum readability
- Position text strategically without covering main subject
- Choose modern, attention-grabbing font style`;
    }

    refinedPrompt += `\n\nFINAL QUALITY STANDARDS:
- Optimized for ${platformContext} platform viewing
- Maximum visual impact for high click-through rates
- Professional composition and color balance
- Clear focal point and visual hierarchy
- No technical watermarks or quality labels in the image`;
  }

  return refinedPrompt;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Validate environment variables
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing GEMINI_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwt = authHeader.split(' ')[1];

    // Create Supabase client for JWT verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authenticated user
    console.log('Verifying JWT token...');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    
    console.log('JWT verification result:', { 
      user: user ? { hasUser: true } : null, 
      error: authError ? 'verification_failed' : null 
    });
    
    if (authError || !user) {
      console.error('JWT verification failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: Invalid or expired token',
          details: authError?.message || 'No user found',
          code: 'AUTH_FAILED'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for database operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile to check plan and credits
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('plan, credits')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has credits
    if (userProfile.credits <= 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. Please upgrade your plan.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit(user.id, userProfile.plan);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitCheck.retryAfter,
          message: `Please wait ${rateLimitCheck.retryAfter} seconds before making another request.`
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitCheck.retryAfter || 60)
          } 
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request body:', { 
      prompt: requestBody.prompt?.substring(0, 100) + '...', 
      hasReferenceImage: !!requestBody.referenceImage,
      hasSelection: !!requestBody.selection,
      options: requestBody.options
    });

    // Validate required fields
    if (!requestBody.prompt || typeof requestBody.prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate prompt
    const prompt = sanitizeInput(requestBody.prompt);
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract optional fields
    const referenceImage = requestBody.referenceImage;
    const selection = requestBody.selection;
    const options = requestBody.options || {};

    // Validate reference image if provided
    if (referenceImage) {
      const imageValidation = validateImage(referenceImage);
      if (!imageValidation.valid) {
        return new Response(
          JSON.stringify({ error: imageValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate options
    const aspectRatio = options?.aspectRatio || '16:9';
    if (!['16:9', '9:16'].includes(aspectRatio)) {
      return new Response(
        JSON.stringify({ error: 'Invalid aspect ratio. Must be 16:9 or 9:16' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build sophisticated prompt using the new system
    const isVertical = aspectRatio === '9:16';
    const refinedPrompt = buildAdvancedPrompt(
      prompt,
      options,
      selection,
      referenceImage,
      isVertical
    );

    console.log('Generated sophisticated prompt:', refinedPrompt.substring(0, 200) + '...');

    // Call Gemini API directly (more reliable for Edge Functions)
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;
    
    // Build request payload
    const requestPayload: any = {
      contents: [{
        parts: [
          ...(referenceImage ? [{
            inlineData: {
              data: referenceImage.split(',')[1],
              mimeType: 'image/png'
            }
          }] : []),
          { text: refinedPrompt }
        ]
      }],
      generationConfig: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    };

    // Generate thumbnail with timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Generation timeout: Request took too long')), 60000)
    );
    
    const generatePromise = fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
      }
      return res.json();
    });
    
    const response = await Promise.race([generatePromise, timeoutPromise]);

    // Extract image data
    let imageData: string | null = null;
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error("No image data returned from Gemini");
    }

    // Deduct credit (this should be done after successful generation)
    // Note: In production, you might want to handle this in a transaction
    const { error: creditError } = await supabaseClient
      .from('users')
      .update({ credits: userProfile.credits - 1 })
      .eq('id', user.id);

    if (creditError) {
      console.error('Error deducting credit:', creditError);
      // Don't fail the request, but log the error
    }

    return new Response(
      JSON.stringify({
        image: imageData,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in generate-thumbnail function:', error);
    
    // Handle specific errors
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Generation timed out. Please try again with a simpler prompt.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message?.includes('API key')) {
      statusCode = 500;
      errorMessage = 'API configuration issue. Please contact support.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});