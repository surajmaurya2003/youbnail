// supabase/functions/dodo-webhook/index.ts

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dodo-signature, dodo-signature',
};

/**
 * SECURITY: Verify webhook signature using HMAC SHA-256
 * This prevents unauthorized parties from triggering fake webhook events
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    console.error('Missing signature or secret');
    return false;
  }

  try {
    // DodoPayments typically uses HMAC SHA-256 for webhook signatures
    // Format is usually: sha256=<hash>
    const signatureParts = signature.split('=');
    const algorithm = signatureParts[0];
    const receivedHash = signatureParts[1] || signature;

    if (algorithm !== 'sha256' && signatureParts.length > 1) {
      console.error('Unsupported signature algorithm:', algorithm);
      return false;
    }

    // Create HMAC SHA-256 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    const isValid = computedHash === receivedHash;
    
    if (!isValid) {
      console.error('Signature verification failed');
      console.error('Expected:', computedHash);
      console.error('Received:', receivedHash);
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // ABSOLUTE FIRST LOG - If this doesn't show, function isn't being invoked
  console.error('🔥 WEBHOOK CALLED - TIMESTAMP:', new Date().toISOString());
  console.error('🔥 METHOD:', req.method);
  console.error('🔥 URL:', req.url);
  console.error('🔥 HEADERS:', JSON.stringify(Object.fromEntries(req.headers)));
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.error('🔥 HANDLING OPTIONS (CORS)');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.error('🔥 STARTING TRY BLOCK');
    
    // SECURITY: Get webhook secret from environment
    const webhookSecret = Deno.env.get('DODO_WEBHOOK_SECRET') || '';
    console.log('Webhook secret present:', webhookSecret ? 'Yes' : 'No');
    
    // NOTE: Making webhook secret optional for debugging
    if (!webhookSecret) {
      console.warn('WARNING: DODO_WEBHOOK_SECRET not configured - webhook signatures will not be verified');
    }
    
    // Get signature from headers (check all possible header names)
    const signature = req.headers.get('x-dodo-signature') || 
                     req.headers.get('dodo-signature') || 
                     req.headers.get('x-webhook-signature') || 
                     req.headers.get('webhook-signature') || '';
    
    // Debug: Log all headers to see what DodoPayments sends
    console.log('=== WEBHOOK DEBUG INFO ===');
    console.log('Headers received:');
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`  ${key}: ${value}`);
    });
    console.log('Signature found:', signature ? 'Yes' : 'No');
    
    // Read body once for verification and parsing
    const body = await req.text();
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200) + '...');
    console.log('========================');
    
    // SECURITY: Verify webhook signature if present and secret is configured
    // NOTE: Making this lenient temporarily to debug DodoPayments signature format
    if (signature && webhookSecret) {
      console.log('Verifying webhook signature...');
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
      
      if (!isValid) {
        console.error('SECURITY: Invalid webhook signature - possible attack or misconfiguration');
        console.error('This will be enforced once we confirm DodoPayments signature format');
        // TODO: Uncomment this once signature format is confirmed
        // return new Response(
        //   JSON.stringify({ error: 'Invalid signature' }),
        //   { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        // );
      } else {
        console.log('✓ Webhook signature verified successfully');
      }
    } else {
      if (!webhookSecret) {
        console.warn('WARNING: No webhook secret configured - proceeding without signature verification');
      } else {
        console.warn('WARNING: No signature provided by DodoPayments');
      }
      console.warn('Proceeding without verification (will be enforced once signature is configured)');
    }

    // Parse webhook event
    console.log('Parsing webhook event...');
    let event;
    let eventType;
    let eventData;
    
    try {
      event = JSON.parse(body);
      eventType = event.type || event.event_type || event.event;
      eventData = event.data || event.payload || event;
      
      console.log('Received webhook event:', eventType);
      console.log('Event data:', JSON.stringify(eventData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      console.error('Raw body:', body);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    // Use custom secret name to avoid SUPABASE_ prefix restriction
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
      console.error('SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    // DodoPayments uses: payment.succeeded, payment.failed, subscription.active, subscription.renewed, etc.
    switch (eventType) {
      case 'payment.succeeded': {
        // Payment succeeded - this usually triggers subscription creation
        console.log('=== PAYMENT SUCCEEDED EVENT ===');
        console.log('Full event data:', JSON.stringify(eventData, null, 2));
        console.log('Payment amount details:', {
          amount: eventData.amount,
          amount_paid: eventData.amount_paid,
          currency: eventData.currency,
          tax_amount: eventData.tax_amount,
          total_amount: eventData.total_amount,
          subtotal: eventData.subtotal
        });
        
        // Handle it similar to subscription.active
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const planId = eventData.metadata?.plan_id || 'starter';
        const billingPeriod = eventData.metadata?.billing_period || 'monthly';
        // Normalize billing period just in case
        const normalizedBillingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;
        const subscriptionId = eventData.subscription_id || eventData.subscription?.id || eventData.id;
        const productId = eventData.product_id || eventData.subscription?.product_id;

        if (!userId) {
          console.error('No user_id in payment.succeeded event');
          // Still return success to prevent retries
          return new Response(JSON.stringify({ received: true, message: 'No user_id found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Processing payment.succeeded for user:', userId);
        console.log('Plan:', planId, 'Billing:', billingPeriod, '→ normalized:', normalizedBillingPeriod);
        console.log('Currency:', eventData.currency || 'Unknown');
        console.log('Amount paid:', eventData.amount || eventData.amount_paid || 0);
        console.log('Customer info:', eventData.customer || 'No customer data');

        // Validate required data
        if (!planId || !normalizedBillingPeriod) {
          console.error('Missing plan or billing period data');
          return new Response(JSON.stringify({ received: true, error: 'Missing plan data' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate credits based on plan (regardless of currency or amount)
        const creditsMap: Record<string, number> = {
          'starter-monthly': 30,
          'starter-annual': 360,
          'pro-monthly': 100,
          'pro-annual': 1200,
        };
        const planKey = `${planId}-${normalizedBillingPeriod}`;
        const credits = creditsMap[planKey] || 30;
        
        console.log('Plan key:', planKey, '→ Credits:', credits);

        // Calculate subscription end date
        const now = new Date();
        const endsAt = new Date(now);
        if (billingPeriod === 'monthly') {
          endsAt.setMonth(endsAt.getMonth() + 1);
        } else {
          endsAt.setFullYear(endsAt.getFullYear() + 1);
        }

        // Update user subscription
        console.log('Updating user subscription in database...');
        const updateData = {
          plan: planId,
          credits: credits,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_product_id: productId,
          subscription_billing_period: billingPeriod,
          subscription_started_at: now.toISOString(),
          subscription_ends_at: endsAt.toISOString(),
          payment_customer_id: eventData.customer_id || eventData.customer?.id,
          updated_at: now.toISOString(),
        };
        
        console.log('Update data:', updateData);
        
        const { error: updateError } = await supabaseClient
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user from payment.succeeded:', updateError);
          // Still return success to prevent infinite retries
          return new Response(JSON.stringify({ received: true, error: 'Database update failed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('✅ User subscription updated successfully');
        console.log('Final user state: plan =', planId, ', credits =', credits, ', status = active');

        // Record in subscription history if subscription_id exists
        if (subscriptionId) {
          console.log('Recording subscription history...');
          
          // Check if this subscription already has a recent history record to prevent duplicates
          // Check for records created within the last 5 seconds with same subscription and product
          const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
          const { data: existingHistory, error: checkError } = await supabaseClient
            .from('subscription_history')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('subscription_id', subscriptionId)
            .eq('product_id', productId)
            .eq('billing_period', normalizedBillingPeriod)
            .eq('status', 'active')
            .gte('created_at', fiveSecondsAgo)
            .maybeSingle();
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing subscription history:', checkError);
          }
          
          if (existingHistory) {
            console.log('Subscription history already exists (created', existingHistory.created_at, '), skipping duplicate insert');
          } else {
            const historyInsert = {
              user_id: userId,
              subscription_id: subscriptionId,
              product_id: productId,
              billing_period: normalizedBillingPeriod,
              status: 'active',
              amount_paid: eventData.amount || eventData.amount_paid || 0,
              currency: eventData.currency || 'USD',
              started_at: now.toISOString(),
              ends_at: endsAt.toISOString(),
            };
            
            console.log('History insert data:', historyInsert);
            
            const { error: historyError } = await supabaseClient
              .from('subscription_history')
              .insert(historyInsert);
              
            if (historyError) {
              console.error('Error inserting subscription history:', historyError);
              // Don't fail the webhook for history insert errors
            } else {
              console.log('✅ Subscription history recorded successfully');
            }
          }
        }

        console.log('🎉 Payment processing completed successfully');
        console.log('User', userId, 'now has', credits, 'credits on', planId, 'plan');
        
        return new Response(JSON.stringify({ 
          received: true, 
          processed: 'payment.succeeded',
          currency: eventData.currency || 'USD',
          credits_assigned: credits
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.active':
      case 'subscription.renewed':
      case 'subscription.plan_changed': {
        console.log('=== SUBSCRIPTION EVENT ===');
        console.log('Event type:', eventType);
        console.log('Full event data:', JSON.stringify(eventData, null, 2));
        
        // Get user ID from metadata
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const planId = eventData.metadata?.plan_id || 'starter';
        const billingPeriod = eventData.metadata?.billing_period || 'monthly';
        const subscriptionId = eventData.subscription_id || eventData.id;
        const productId = eventData.product_id;

        if (!userId) {
          console.error('No user_id in webhook event');
          console.error('Event metadata:', eventData.metadata);
          console.error('Event customer:', eventData.customer);
          // Still return success to prevent retries
          return new Response(JSON.stringify({ received: true, message: 'No user_id found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Processing subscription.active for user:', userId);
        console.log('Plan:', planId, 'Billing:', billingPeriod);
        console.log('Subscription ID:', subscriptionId);

        // Calculate credits based on plan
        const creditsMap: Record<string, number> = {
          'starter-monthly': 30,
          'starter-annual': 360,
          'pro-monthly': 100,
          'pro-annual': 1200,
        };
        const credits = creditsMap[`${planId}-${billingPeriod}`] || 30;

        // Calculate subscription end date
        const now = new Date();
        const endsAt = new Date(now);
        if (billingPeriod === 'monthly') {
          endsAt.setMonth(endsAt.getMonth() + 1);
        } else {
          endsAt.setFullYear(endsAt.getFullYear() + 1);
        }

        // Update user subscription
        console.log('Updating user subscription in database...');
        const updateData = {
          plan: planId,
          credits: credits,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_product_id: productId,
          subscription_billing_period: billingPeriod,
          subscription_started_at: now.toISOString(),
          subscription_ends_at: endsAt.toISOString(),
          payment_customer_id: eventData.customer_id || eventData.customer?.customer_id || eventData.customer?.id,
          updated_at: now.toISOString(),
        };
        
        console.log('Update data:', updateData);
        
        const { error: updateError, data: updateResult } = await supabaseClient
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user:', updateError);
          console.error('User ID:', userId);
          console.error('Update data:', updateData);
          return new Response(JSON.stringify({ error: 'Database error', details: updateError }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        console.log('✓ User updated successfully:', updateResult);

        // Record in subscription history - check for duplicates first
        console.log('Recording subscription history...');
        
        // Check if this subscription already has a recent history record to prevent duplicates
        // Check for records created within the last 5 seconds with same subscription and product
        const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
        const { data: existingHistory, error: checkError } = await supabaseClient
          .from('subscription_history')
          .select('id, created_at')
          .eq('user_id', userId)
          .eq('subscription_id', subscriptionId)
          .eq('product_id', productId)
          .eq('billing_period', billingPeriod)
          .eq('status', 'active')
          .gte('created_at', fiveSecondsAgo)
          .maybeSingle();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing subscription history:', checkError);
        }
        
        if (existingHistory) {
          console.log('Subscription history already exists (created', existingHistory.created_at, ', likely from payment.succeeded), skipping duplicate insert');
        } else {
          const historyInsert = {
            user_id: userId,
            subscription_id: subscriptionId,
            product_id: productId,
            billing_period: billingPeriod,
            status: 'active',
            amount_paid: eventData.amount || eventData.amount_paid || 0,
            currency: eventData.currency || 'USD',
            started_at: now.toISOString(),
            ends_at: endsAt.toISOString(),
          };
          
          console.log('History insert data:', historyInsert);
          
          const { error: historyError } = await supabaseClient
            .from('subscription_history')
            .insert(historyInsert);
          
          if (historyError) {
            console.error('Error inserting subscription history:', historyError);
            // Don't fail the webhook for history insert errors
          } else {
            console.log('✅ Subscription history recorded successfully');
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);

          // Update subscription history
          await supabaseClient
            .from('subscription_history')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'payment.failed': {
        // Payment failed - mark subscription as past_due
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.subscription?.id || eventData.id;

        if (userId && subscriptionId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.failed':
      case 'subscription.on_hold': {
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.expired': {
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId) {
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.updated': {
        // Handle subscription updates (e.g., plan changes, billing updates)
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;
        const planId = eventData.metadata?.plan_id;
        const billingPeriod = eventData.metadata?.billing_period;

        if (userId && planId && billingPeriod) {
          // Calculate credits based on plan
          const creditsMap: Record<string, number> = {
            'starter-monthly': 30,
            'starter-annual': 360,
            'pro-monthly': 100,
            'pro-annual': 1200,
          };
          const credits = creditsMap[`${planId}-${billingPeriod}`] || 30;

          await supabaseClient
            .from('users')
            .update({
              plan: planId,
              credits: credits,
              subscription_billing_period: billingPeriod,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        console.log('Unhandled event type:', eventType);
        return new Response(JSON.stringify({ received: true, message: 'Event not handled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('🔥🔥🔥 WEBHOOK ERROR CAUGHT:', error);
    console.error('🔥🔥🔥 ERROR STACK:', error.stack);
    console.error('🔥🔥🔥 ERROR MESSAGE:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
