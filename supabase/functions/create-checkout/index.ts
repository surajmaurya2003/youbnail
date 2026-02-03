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
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwt = authHeader.split(' ')[1];
    console.log('JWT token length:', jwt.length);
    
    // Get environment variables
    const dodoApiKey = Deno.env.get('DODO_API_KEY') || '';
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // Use SUPABASE_SERVICE_ROLE_KEY which is the standard Supabase secret
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Validate environment variables
    if (!dodoApiKey) {
      console.error('Missing DODO_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing DODO_API_KEY' }),
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
    
    const productIdMap: Record<string, string> = {
      'starter-monthly': Deno.env.get('DODO_PRODUCT_STARTER_MONTHLY') || '',
      'starter-annual': Deno.env.get('DODO_PRODUCT_STARTER_ANNUAL') || '',
      'pro-monthly': Deno.env.get('DODO_PRODUCT_PRO_MONTHLY') || '',
      'pro-annual': Deno.env.get('DODO_PRODUCT_PRO_ANNUAL') || '',
    };
    
    console.log('Raw environment variables check:');
    console.log('DODO_PRODUCT_STARTER_MONTHLY:', Deno.env.get('DODO_PRODUCT_STARTER_MONTHLY') ? 'Set' : 'Not set');
    console.log('DODO_PRODUCT_STARTER_ANNUAL:', Deno.env.get('DODO_PRODUCT_STARTER_ANNUAL') ? 'Set' : 'Not set');
    console.log('DODO_PRODUCT_PRO_MONTHLY:', Deno.env.get('DODO_PRODUCT_PRO_MONTHLY') ? 'Set' : 'Not set');
    console.log('DODO_PRODUCT_PRO_ANNUAL:', Deno.env.get('DODO_PRODUCT_PRO_ANNUAL') ? 'Set' : 'Not set');
    
    console.log('Product IDs loaded:', {
      'starter-monthly': productIdMap['starter-monthly'] ? 'Set' : 'Missing',
      'starter-annual': productIdMap['starter-annual'] ? 'Set' : 'Missing',
      'pro-monthly': productIdMap['pro-monthly'] ? 'Set' : 'Missing',
      'pro-annual': productIdMap['pro-annual'] ? 'Set' : 'Missing',
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      userId, 
      planId, 
      billingPeriod,
      currentPlan,
      currentBillingPeriod,
      subscriptionId,
      hasActiveSubscription
    } = requestBody;

    // Validate input
    if (!userId || !planId || !billingPeriod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for JWT verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT token and get user
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
          error: `Unauthorized: Invalid authentication token`, 
          details: authError?.message || 'No user found',
          code: 'AUTH_FAILED'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the user ID matches the request
    console.log('Comparing user IDs:', { jwtUserId: user.id, requestUserId: userId });
    if (user.id !== userId) {
      console.error('User ID mismatch: JWT user', user.id, 'vs request userId', userId);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: User ID mismatch',
          code: 'USER_MISMATCH'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // DUPLICATE CHECKOUT PREVENTION: Check for recent checkout creation
    // Use a global Map to track checkout requests (in-memory, per edge function instance)
    const CHECKOUT_COOLDOWN = 5000; // 5 seconds cooldown between checkouts
    const checkoutKey = `${userId}-${planId}-${billingPeriod}`;
    const now = Date.now();
    
    // Simple in-memory rate limiting (will reset on edge function restart, but that's fine)
    const recentCheckouts = (globalThis as any).__recentCheckouts || new Map();
    (globalThis as any).__recentCheckouts = recentCheckouts;
    
    const lastCheckoutTime = recentCheckouts.get(checkoutKey);
    if (lastCheckoutTime && (now - lastCheckoutTime) < CHECKOUT_COOLDOWN) {
      console.warn('Duplicate checkout attempt detected within cooldown period');
      return new Response(
        JSON.stringify({ 
          error: 'Please wait a moment before creating another checkout',
          code: 'RATE_LIMITED'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Mark this checkout as in-progress
    recentCheckouts.set(checkoutKey, now);
    
    // Clean up old entries (older than 1 minute)
    for (const [key, time] of recentCheckouts.entries()) {
      if (now - time > 60000) {
        recentCheckouts.delete(key);
      }
    }
    
    // Get user data from Supabase (including subscription info)
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Fetching user data for userId:', userId);

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
      console.error('User data is null for userId:', userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User found, email:', userData.email);

    // Normalize billing period (frontend sends 'annually', but we need 'annual')
    const normalizedBillingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;
    const normalizedCurrentBillingPeriod = (currentBillingPeriod || userData.subscription_billing_period || 'monthly') === 'annually' ? 'annual' : (currentBillingPeriod || userData.subscription_billing_period || 'monthly');
    
    // Determine if this is a subscription change
    const actualCurrentPlan = currentPlan || userData.plan || 'free';
    const actualHasActiveSubscription = hasActiveSubscription !== undefined 
      ? hasActiveSubscription 
      : (userData.subscription_status === 'active' && userData.subscription_id);
    
    const isPlanChange = actualCurrentPlan !== planId;
    const isBillingChange = normalizedCurrentBillingPeriod !== normalizedBillingPeriod && !isPlanChange;
    const isUpgrade = (actualCurrentPlan === 'free' || actualCurrentPlan === 'starter') && planId === 'pro';
    const isDowngrade = actualCurrentPlan === 'pro' && planId === 'starter';
    
    console.log('Plan change analysis:', {
      currentPlan: actualCurrentPlan,
      newPlan: planId,
      currentBilling: normalizedCurrentBillingPeriod,
      newBilling: normalizedBillingPeriod,
      hasActiveSubscription: actualHasActiveSubscription,
      isPlanChange,
      isBillingChange,
      isUpgrade,
      isDowngrade
    });

    // Plan prices for prorating calculations
    const planPrices: Record<string, Record<string, number>> = {
      'starter': { 'monthly': 20, 'annual': 168 }, // 14 * 12
      'pro': { 'monthly': 40, 'annual': 336 }, // 28 * 12
    };

    // Calculate prorated amount if user has active subscription
    let proratedAmount = null;
    let adjustmentNote = '';
    
    if (actualHasActiveSubscription && userData.subscription_ends_at && (isPlanChange || isBillingChange)) {
      const now = new Date();
      const endsAt = new Date(userData.subscription_ends_at);
      const totalSeconds = (endsAt.getTime() - new Date(userData.subscription_started_at || now).getTime()) / 1000;
      const remainingSeconds = (endsAt.getTime() - now.getTime()) / 1000;
      const remainingRatio = remainingSeconds / totalSeconds;
      
      const currentPrice = planPrices[actualCurrentPlan]?.[normalizedCurrentBillingPeriod] || 0;
      const newPrice = planPrices[planId]?.[normalizedBillingPeriod] || 0;
      
      // Calculate unused credit from current subscription
      const unusedCredit = currentPrice * remainingRatio;
      
      // Calculate what user should pay
      if (isUpgrade) {
        // Upgrade: Pay difference for remaining period
        proratedAmount = Math.max(0, (newPrice * remainingRatio) - unusedCredit);
        adjustmentNote = `Upgrade: Paying prorated difference of $${proratedAmount.toFixed(2)} for remaining ${Math.ceil(remainingRatio * (normalizedBillingPeriod === 'annual' ? 12 : 1))} ${normalizedBillingPeriod === 'annual' ? 'months' : 'month'}`;
      } else if (isDowngrade) {
        // Downgrade: Credit unused amount, charge for new plan
        proratedAmount = Math.max(0, (newPrice * remainingRatio) - unusedCredit);
        adjustmentNote = `Downgrade: Credit of $${unusedCredit.toFixed(2)} applied, paying $${proratedAmount.toFixed(2)} for remaining period`;
      } else if (isBillingChange) {
        // Billing period change: Prorate based on remaining time
        proratedAmount = Math.max(0, (newPrice * remainingRatio) - unusedCredit);
        adjustmentNote = `Billing change: Adjusted payment of $${proratedAmount.toFixed(2)}`;
      }
      
      console.log('Prorating calculation:', {
        unusedCredit: unusedCredit.toFixed(2),
        proratedAmount: proratedAmount?.toFixed(2),
        remainingRatio: remainingRatio.toFixed(2),
        adjustmentNote
      });
    }
    
    // Get product ID
    const productKey = `${planId}-${normalizedBillingPeriod}`;
    const productId = productIdMap[productKey];
    
    console.log('Billing period:', billingPeriod, '→ normalized:', normalizedBillingPeriod);
    console.log('Product key:', productKey);

    if (!productId) {
      console.error('Product ID not found for:', productKey);
      return new Response(
        JSON.stringify({ error: `Product not found for ${productKey}. Please configure product IDs in environment variables.` }),
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
    const checkoutPayload: any = {
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
        billing_period: normalizedBillingPeriod, // Use normalized value for consistency
        current_plan: actualCurrentPlan,
        current_billing_period: normalizedCurrentBillingPeriod,
        is_plan_change: isPlanChange.toString(),
        is_billing_change: isBillingChange.toString(),
        is_upgrade: isUpgrade.toString(),
        is_downgrade: isDowngrade.toString(),
      },
    };
    
    console.log('Checkout metadata:', checkoutPayload.metadata);
    
    // If user has active subscription, include subscription update info
    if (actualHasActiveSubscription && userData.subscription_id) {
      checkoutPayload.subscription_id = userData.subscription_id;
      checkoutPayload.customer_id = userData.payment_customer_id;
      
      // Add prorating information if calculated
      if (proratedAmount !== null) {
        checkoutPayload.metadata.prorated_amount = proratedAmount.toFixed(2);
        checkoutPayload.metadata.adjustment_note = adjustmentNote;
        // Note: DodoPayments may handle prorating automatically, or you may need to
        // adjust the product price. Check DodoPayments API docs for subscription update methods.
      }
    }
    
    // DodoPayments API endpoint: /checkouts (not /v1/checkout/sessions)
    const dodoResponse = await fetch(`${dodoBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dodoApiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

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
    console.log('Checkout session created successfully');

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
    console.error('Error in create-checkout function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: error.name || 'UnknownError'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
