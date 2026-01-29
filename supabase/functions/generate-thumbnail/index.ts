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
  free: { requestsPerMinute: 5, requestsPerHour: 50 },
  starter: { requestsPerMinute: 10, requestsPerHour: 200 },
  pro: { requestsPerMinute: 20, requestsPerHour: 500 },
};

// Input validation constants
const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string, userPlan: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limits = RATE_LIMITS[userPlan as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  
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
    console.log('JWT token length:', jwt.length);

    // Create Supabase client for JWT verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authenticated user
    console.log('Verifying JWT token...');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    
    console.log('JWT verification result:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: authError ? authError.message : null 
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

    const { 
      prompt, 
      referenceImage, 
      options,
      selection 
    } = requestBody;

    // Validate required fields
    if (!prompt && !referenceImage) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt or referenceImage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize prompt
    if (prompt) {
      const sanitizedPrompt = sanitizeInput(prompt);
      if (sanitizedPrompt.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Prompt cannot be empty after sanitization' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestBody.prompt = sanitizedPrompt;
    }

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

    // Build refined prompt
    let refinedPrompt = "";
    
    if (selection) {
      refinedPrompt = `In the selected region (approximately at x:${Math.round(selection.x)} y:${Math.round(selection.y)} with size ${Math.round(selection.width)}x${Math.round(selection.height)}), perform the following change: ${requestBody.prompt}. Keep the rest of the image exactly as it is.`;
    } else {
      refinedPrompt = `Create a professional, high-CTR YouTube thumbnail. Subject: ${requestBody.prompt}.`;
      
      if (options?.overlayText && options.overlayText.trim() !== "") {
        const sanitizedText = sanitizeInput(options.overlayText);
        refinedPrompt += ` Include the following large, readable, eye-catching text: "${sanitizedText}". Use bold, modern typography.`;
      }
      
      if (options?.style && options.style !== 'None') {
        refinedPrompt += ` Aesthetic Style: ${options.style}.`;
      }
      
      if (options?.lighting && options.lighting !== 'None') {
        refinedPrompt += ` Lighting: ${options.lighting}.`;
      }
      
      if (options?.emphasis && options.emphasis !== 'None') {
        refinedPrompt += ` Emphasis: ${options.emphasis}.`;
      }
    }

    const isVertical = aspectRatio === '9:16';
    const platformName = isVertical ? 'Instagram Reels/YouTube Shorts' : 'YouTube';
    
    refinedPrompt += ` Aspect ratio is ${aspectRatio}. This is for ${platformName} content. Use vibrant colors, high contrast, and ensure the main subject stands out. ${isVertical ? 'Optimize for vertical mobile viewing with the main subject centered vertically.' : 'Cinematic 4k quality.'}`;

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
