// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { name, email, message }: ContactFormData = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid email address' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize data
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase(),
      message: message.trim().substring(0, 2000),
      timestamp: new Date().toISOString(),
      source: 'youbnail-contact-form'
    };

    // Get webhook configuration
    const webhookUrl = 'https://altagic.online/webhook/youbnailwebhookcontact';
    
    // Try to send to webhook
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'youbnail'
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!webhookResponse.ok) {
        console.error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
        // Log the data even if webhook fails
        console.log('Contact form data logged:', sanitizedData);
      } else {
        console.log('Contact form sent to webhook successfully');
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      console.log('Contact form data logged:', sanitizedData);
    }

    // Always return success to user
    return new Response(JSON.stringify({ 
      success: true, 
      message: '✅ Thank you! Your message has been received.' 
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to process contact form' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});