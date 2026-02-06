// services/geminiService.ts
// SECURE: API keys are now server-side only. This service calls the backend Edge Function.

import { supabase } from '../lib/supabase';
import { GenerationOptions, SelectionArea } from "../types";

// Client-side rate limiting (additional protection)
const RATE_LIMIT_COOLDOWN = 2000; // 2 seconds minimum between requests
let lastRequestTime = 0;

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput(input: string): string {
  // Remove script tags and other dangerous HTML
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  return sanitized.trim();
}

/**
 * Validate prompt length
 */
function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  const MAX_LENGTH = 2000;
  if (prompt.length > MAX_LENGTH) {
    return { valid: false, error: `Prompt is too long. Maximum ${MAX_LENGTH} characters allowed.` };
  }
  if (prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty.' };
  }
  return { valid: true };
}

export class ThumbnailAI {
  /**
   * Generate thumbnail using secure backend Edge Function
   * API keys are never exposed to the frontend
   */
  static async generateThumbnail(
    basePrompt: string, 
    referenceImage?: string, 
    options?: GenerationOptions,
    selection?: SelectionArea | null
  ): Promise<string> {
    // Client-side rate limiting
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_COOLDOWN) {
      const waitTime = Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastRequestTime)) / 1000);
      throw new Error(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before generating another thumbnail.`);
    }
    lastRequestTime = now;

    // Validate and sanitize prompt
    if (basePrompt) {
      const validation = validatePrompt(basePrompt);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid prompt');
      }
      basePrompt = sanitizeInput(basePrompt);
    }

    // Validate reference image if provided
    if (referenceImage && !referenceImage.startsWith('data:image/')) {
      throw new Error('Invalid image format. Must be a data URL.');
    }

    // Validate aspect ratio
    const aspectRatio = options?.aspectRatio || '16:9';
    if (!['16:9', '9:16'].includes(aspectRatio)) {
      throw new Error('Invalid aspect ratio. Must be 16:9 or 9:16.');
    }

    // Sanitize overlay text if provided
    if (options?.overlayText) {
      options.overlayText = sanitizeInput(options.overlayText);
    }

    try {
      // Call secure backend Edge Function
      const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
        body: {
          prompt: basePrompt,
          referenceImage: referenceImage,
          options: options,
          selection: selection
        }
      });

      // Enhanced error logging for debugging
      if (error) {
        console.error('Supabase function error:', error);
        
        // Handle rate limiting errors
        if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        
        // Handle API key errors
        if (error.message?.includes('API key') || error.message?.includes('GEMINI_API_KEY')) {
          throw new Error('API configuration issue. Please contact support.');
        }
        
        // Handle authentication errors
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Authentication failed. Please sign out and sign in again.');
        }
        
        throw new Error(error.message || 'Failed to generate thumbnail');
      }

      if (!data?.image) {
        console.error('No image data returned from API:', data);
        throw new Error('No image data returned from server');
      }

      return data.image;
    } catch (error: any) {
      console.error('ThumbnailAI generation error:', {
        message: error.message,
        prompt: basePrompt?.substring(0, 100) + '...',
        hasReferenceImage: !!referenceImage,
        hasSelection: !!selection,
        options
      });
      
      // Handle specific error types
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        throw new Error('Generation timed out. Please try again with a simpler prompt.');
      } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('rate limit')) {
        throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
      } else if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        throw new Error('Authentication required. Please sign in again.');
      } else if (error.message?.includes('Insufficient credits') || error.message?.includes('403')) {
        throw new Error('Insufficient credits. Please upgrade your plan.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to generate thumbnail. Please try again.');
      }
    }
  }
}
