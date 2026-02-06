// supabase/functions/create-checkout/index.ts

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  try {
    console.log('=== CREATE-CHECKOUT FUNCTION STARTED ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Missing Authorization header',
          code: 'AUTH_MISSING' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token extracted, length:', jwt.length);

    // Get environment variables
    const dodoApiKey = Deno.env.get('DODO_API_KEY') || '';
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
    
    // These are automatically provided by Supabase Edge Runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://wawfgjzpwykvjgmuaueb.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    console.log('Environment check:', {
      dodoApiKey: dodoApiKey ? 'SET' : 'MISSING',
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING', 
      supabaseServiceKey: supabaseServiceKey ? 'SET' : 'MISSING'
    });
    
    // Validate environment variables
    if (!dodoApiKey) {
      console.error('Missing DODO_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing DODO_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Supabase config loaded:', { 
      url: supabaseUrl.substring(0, 20) + '...', 
      hasServiceKey: !!supabaseServiceKey 
    });
    
    const productIdMap: Record<string, string> = {
      'creator-monthly': Deno.env.get('DODO_PRODUCT_CREATOR_MONTHLY') || '',
      'creator-yearly': Deno.env.get('DODO_PRODUCT_CREATOR_YEARLY') || '',
      'creator-annual': Deno.env.get('DODO_PRODUCT_CREATOR_YEARLY') || '', // Map annual to yearly product
    };
    
    console.log('Raw environment variables check:');
    console.log('Using environment variable Creator plan product IDs:', {
      monthly: productIdMap['creator-monthly'],
      yearly: productIdMap['creator-yearly']
    });
    
    console.log('Product IDs loaded:', {
      'creator-monthly': productIdMap['creator-monthly'] ? 'Set' : 'Missing',
      'creator-yearly': productIdMap['creator-yearly'] ? 'Set' : 'Missing',
      'creator-annual': productIdMap['creator-annual'] ? 'Set' : 'Missing',
    });
    
    // Validate product IDs are loaded
    if (!productIdMap['creator-monthly'] || (!productIdMap['creator-yearly'] && !productIdMap['creator-annual'])) {
      console.error('Missing product IDs from environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing product IDs',
          details: 'Product environment variables not properly set'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request body
    let requestBody;
    try {
      console.log('Parsing request body...');
      requestBody = await req.json();
      console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body', 
          code: 'PARSE_ERROR',
          details: parseError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      planId, 
      billingPeriod,
      currentPlan,
      currentBillingPeriod,
      subscriptionId,
      hasActiveSubscription
    } = requestBody;

    // Validate input
    if (!planId || !billingPeriod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planId and billingPeriod' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for user verification
    let supabaseAuth;
    try {
      console.log('Creating Supabase client...');
      supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
      console.log('Supabase client created successfully');
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          code: 'CLIENT_ERROR',
          details: 'Failed to initialize authentication service'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from JWT token
    console.log('Getting user from JWT token...');
    let user, authError;
    
    try {
      const result = await supabaseAuth.auth.getUser(jwt);
      user = result.data.user;
      authError = result.error;
      
      console.log('Auth result:', { 
        hasUserId: !!user?.id,
        hasEmail: !!user?.email,
        hasError: !!authError
      });
      
    } catch (exception) {
      console.error('Exception during JWT validation:', exception);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          code: 'JWT_EXCEPTION', 
          message: 'Invalid token format',
          details: exception.message
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (authError || !user) {
      console.error('Failed to authenticate user:', authError?.message);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          code: 'AUTH_FAILED', 
          message: 'Please sign in again',
          details: authError?.message
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use user ID from JWT token
    const userId = user.id;
    console.log('Using user ID from JWT');
    
    // Get user data from Supabase (including subscription info)
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Fetching user data...');

    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('email, plan, subscription_id, subscription_status, subscription_billing_period, subscription_started_at, subscription_ends_at, payment_customer_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userData) {
      console.error('User data is null');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User found, ready for checkout');

    // Frontend already sends the correct planId (creator-monthly, creator-yearly)
    // No need to concatenate with billing period
    const productId = productIdMap[planId];
    
    console.log('Plan ID received:', planId);
    console.log('Product ID from mapping:', productId);

    if (!productId) {
      console.error('Product ID not found for planId:', planId);
      console.error('Available mappings:', Object.keys(productIdMap));
      return new Response(
        JSON.stringify({ 
          error: `Product not found for plan: ${planId}. Available plans: ${Object.keys(productIdMap).join(', ')}`,
          details: 'Product environment variables not properly set'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Creating checkout session with productId:', productId);

    // Create checkout session with DodoPayments
    // Use live mode for production, sandbox mode for testing
    const dodoApiMode = Deno.env.get('DODO_API_MODE') || 'test';
    const dodoBaseUrl = dodoApiMode === 'live' 
      ? 'https://live.dodopayments.com' 
      : 'https://test.dodopayments.com';
    
    console.log('DodoPayments API Mode:', dodoApiMode);
    console.log('Calling DodoPayments API at:', dodoBaseUrl);
    
    // Prepare checkout payload
    const checkoutPayload = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: userData.email,
      },
      return_url: `${appUrl}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        billing_period: billingPeriod,
      },
    };
    
    console.log('Checkout payload:', JSON.stringify(checkoutPayload, null, 2));
    
    // DodoPayments API endpoint: /checkouts (not /v1/checkout/sessions)
    const dodoResponse = await fetch(`${dodoBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    console.log('DodoPayments response status:', dodoResponse.status);

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error('DodoPayments API error:', dodoResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout session', 
          details: errorText,
          status: dodoResponse.status 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutData = await dodoResponse.json();
    console.log('Checkout session created successfully:', checkoutData);

    return new Response(
      JSON.stringify({
        checkout_url: checkoutData.checkout_url || checkoutData.url,
        session_id: checkoutData.session_id || checkoutData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== ERROR IN CREATE-CHECKOUT ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        code: 'FUNCTION_ERROR',
        type: error.name || 'UnknownError',
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
