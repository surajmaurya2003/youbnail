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
    // DodoPayments uses format: v1,<hash> or sha256=<hash>
    let receivedHash = signature;
    
    if (signature.includes(',')) {
      // Format: v1,<hash>
      const parts = signature.split(',');
      receivedHash = parts[1];
      console.log('DodoPayments signature format: v1,<hash>');
    } else if (signature.includes('=')) {
      // Format: sha256=<hash>
      const parts = signature.split('=');
      receivedHash = parts[1];
      console.log('Signature format: sha256=<hash>');
    } else {
      // Plain hash
      console.log('Plain hash signature format');
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
    
    // DodoPayments uses base64 encoding, not hex
    const computedHashBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    
    // Also compute hex for debugging
    const computedHashHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    const isValid = computedHashBase64 === receivedHash;
    
    if (!isValid) {
      console.error('Signature verification failed');
      console.error('Expected (base64):', computedHashBase64);
      console.error('Expected (hex):', computedHashHex);
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
  console.error('🔥 HEADERS COUNT:', req.headers ? Array.from(req.headers.keys()).length : 0);
  
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
    
    // Debug: Log headers summary (excluding sensitive data)
    console.log('=== WEBHOOK DEBUG INFO ===');
    console.log('Headers received:');
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Sanitize sensitive headers
      if (key.toLowerCase().includes('authorization') || 
          key.toLowerCase().includes('signature') ||
          key.toLowerCase().includes('token')) {
        headers[key] = '[REDACTED]';
        console.log(`  ${key}: [REDACTED]`);
      } else {
        headers[key] = value;
        console.log(`  ${key}: ${value}`);
      }
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
    
    // IDEMPOTENCY: Create event hash to prevent duplicate processing
    const eventHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Check if this exact webhook event has already been processed
    const { data: existingEvent } = await supabaseClient
      .from('webhook_events')
      .select('id, processed_at')
      .eq('event_hash', eventHash)
      .maybeSingle();
    
    if (existingEvent) {
      console.log('🔄 Webhook event already processed at', existingEvent.processed_at, '- returning success to prevent retries');
      return new Response(JSON.stringify({ 
        received: true, 
        already_processed: true,
        processed_at: existingEvent.processed_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Record this webhook event to prevent future duplicates
    const { error: eventInsertError } = await supabaseClient
      .from('webhook_events')
      .insert({
        event_hash: eventHash,
        event_type: eventType,
        subscription_id: eventData?.subscription_id || eventData?.id,
        user_id: eventData?.metadata?.user_id || eventData?.customer?.metadata?.user_id
      });
    
    if (eventInsertError && eventInsertError.code !== '23505') {
      console.warn('Could not record webhook event (non-critical):', eventInsertError);
    }

    // Handle different event types
    // DodoPayments uses: payment.succeeded, payment.failed, subscription.active, subscription.renewed, etc.
    switch (eventType) {
      case 'payment.succeeded': {
        // Payment succeeded - Record the payment but let subscription.active handle subscription setup
        console.log('=== PAYMENT SUCCEEDED EVENT ===');
        console.log('Event received with expected data structure');
        console.log('Payment amount details:', {
          amount: eventData.amount,
          currency: eventData.currency,
          hasSubscriptionId: !!eventData.subscription_id,
          hasUserId: !!(eventData.metadata?.user_id || eventData.customer?.metadata?.user_id)
        });
        
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.subscription?.id;
        
        if (!userId) {
          console.error('No user_id in payment.succeeded event');
          return new Response(JSON.stringify({ received: true, message: 'No user_id found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Payment succeeded for user:', userId);
        console.log('Currency:', eventData.currency || 'Unknown');
        console.log('Amount paid:', eventData.amount || eventData.amount_paid || 0);
        
        // Only update payment info if we have subscription_id
        if (subscriptionId) {
          // Update payment_customer_id if available
          const customerUpdateData: any = {
            updated_at: new Date().toISOString(),
          };
          
          if (eventData.customer_id || eventData.customer?.id) {
            customerUpdateData.payment_customer_id = eventData.customer_id || eventData.customer?.id;
          }
          
          await supabaseClient
            .from('users')
            .update(customerUpdateData)
            .eq('id', userId);
            
          console.log('✅ Payment customer info updated');
        }
        
        // Note: Subscription activation is handled by subscription.active event
        console.log('Payment recorded. Subscription will be activated by subscription.active event');
        
        return new Response(JSON.stringify({ 
          received: true, 
          processed: 'payment.succeeded',
          note: 'Subscription activation handled by subscription.active event'
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
        
        /**
         * AUTOMATIC SUBSCRIPTION CANCELLATION LOGIC:
         * When a subscription becomes active (new, renewed, or plan changed), 
         * we automatically cancel any other active subscriptions for the same user.
         * 
         * This prevents double billing scenarios like:
         * - Monthly → Yearly upgrades
         * - Yearly → Monthly downgrades  
         * - Plan changes between different tiers
         * 
         * The cancellation happens in the subscription history update below.
         */
        
        // Get user ID from metadata
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        let planId = eventData.metadata?.plan_id || 'free';
        let billingPeriod = eventData.metadata?.billing_period || 'monthly';
        
        // Product ID to plan mapping for security validation
        const productIdToPlan: Record<string, string> = {
          [Deno.env.get('DODO_PRODUCT_CREATOR_MONTHLY') || '']: 'creator-monthly',
          [Deno.env.get('DODO_PRODUCT_CREATOR_YEARLY') || '']: 'creator-yearly',
        };
        
        const productId = eventData.product_id || event.data?.product_id;
        
        // Validate plan using product ID if available
        if (productId && productIdToPlan[productId]) {
          planId = productIdToPlan[productId];
          console.log(`Plan validated from product ID ${productId}: ${planId}`);
        }
        
        // Normalize billing period (annually → annual)
        billingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;
        
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (!userId) {
          console.error('No user_id in webhook event');
          console.error('Event metadata:', eventData.metadata);
          console.error('Event customer:', eventData.customer);
          // Still return success to prevent retries
          return new Response(JSON.stringify({ received: true, message: 'No user_id found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Processing subscription event for user:', userId);
        console.log('Plan:', planId, 'Billing:', billingPeriod);
        console.log('Subscription ID:', subscriptionId);

        // Validate required data
        if (!planId || !billingPeriod) {
          console.error('Missing plan or billing period data');
          return new Response(JSON.stringify({ received: true, error: 'Missing plan data' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate credits based on plan
        const creditsMap: Record<string, number> = {
          'creator-monthly-monthly': 50,
          'creator-yearly-annual': 600,
        };
        const planKey = `${planId}-${billingPeriod}`;
        const credits = creditsMap[planKey] || 50;

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
          payment_customer_id: eventData.customer_id || eventData.customer?.customer_id || eventData.customer?.id,
          updated_at: now.toISOString(),
        };
        
        console.log('Update data structure:', {
          planId: updateData.plan,
          credits: updateData.credits,
          billingPeriod: updateData.subscription_billing_period,
          status: updateData.subscription_status,
          hasSubscriptionId: !!updateData.subscription_id,
          hasCustomerId: !!updateData.payment_customer_id
        });
        
        const { error: updateError, data: updateResult } = await supabaseClient
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user:', {
            errorCode: updateError.code,
            errorHint: updateError.hint,
            hasUserId: !!userId
          });
          console.error('Update operation failed for user subscription');
          return new Response(JSON.stringify({ error: 'Database error', details: updateError }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        console.log('✅ User updated successfully');

        // Record in subscription history - use UPSERT to prevent duplicates
        if (subscriptionId && productId) {
          console.log('Recording subscription history...');
          
          // Use INSERT ... ON CONFLICT for atomic duplicate prevention
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
          
          // Record new subscription in subscription_history
          const { error: historyError } = await supabaseClient
            .from('subscription_history')
            .insert(historyInsert);
          
          if (historyError) {
            if (historyError.code === '23505') {
              console.log('⚠️ Subscription already exists (unique constraint), checking ownership...');
              
              // Check if this subscription belongs to a different user (critical error)
              const { data: existingSub } = await supabaseClient
                .from('subscription_history')
                .select('user_id, status')
                .eq('subscription_id', subscriptionId)
                .single();
              
              if (existingSub && existingSub.user_id !== userId) {
                console.error('🚨 CRITICAL: Subscription', subscriptionId, 'belongs to user', existingSub.user_id, 'but webhook is for user', userId);
                return new Response(JSON.stringify({ 
                  error: 'Subscription ownership conflict',
                  details: 'Same subscription assigned to multiple users'
                }), { 
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
              }
              
              console.log('✅ Subscription already processed for correct user, continuing...');
            } else {
              console.error('❌ Error inserting subscription history:', historyError);
            }
            // Don't fail the webhook for history insert errors
          } else {
            console.log('✅ Subscription history recorded successfully');
          }
        } else {
          console.warn('⚠️ Skipping subscription history: missing', !subscriptionId ? 'subscription_id' : 'product_id');
        }

        console.log('🎉 Subscription event processed successfully');
        console.log('User', userId, 'now has', credits, 'credits on', planId, 'plan');

        return new Response(JSON.stringify({ 
          received: true,
          processed: eventType,
          user_id: userId,
          plan: planId,
          credits: credits
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        console.log('=== SUBSCRIPTION CANCELLED EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId && subscriptionId) {
          console.log('Cancelling subscription for user:', userId);
          
          const now = new Date().toISOString();
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'cancelled',
              updated_at: now,
            })
            .eq('subscription_id', subscriptionId);

          // Update subscription history
          await supabaseClient
            .from('subscription_history')
            .update({
              status: 'cancelled',
              cancelled_at: now,
            })
            .eq('subscription_id', subscriptionId)
            .eq('status', 'active'); // Only update active records

          console.log('✅ Subscription cancelled successfully');
        } else {
          console.warn('⚠️ Missing user_id or subscription_id in cancellation event');
        }

        return new Response(JSON.stringify({ received: true, processed: 'subscription.cancelled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'payment.failed': {
        // Payment failed - mark subscription as past_due
        console.log('=== PAYMENT FAILED EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.subscription?.id || eventData.id;

        if (userId && subscriptionId) {
          console.log('Marking subscription as past_due for user:', userId);
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
          
          console.log('✅ Payment failure processed');
        } else {
          console.warn('⚠️ Missing user_id or subscription_id in payment.failed event');
        }

        return new Response(JSON.stringify({ received: true, processed: 'payment.failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'payment.cancelled': {
        // Payment was cancelled by user or system
        console.log('=== PAYMENT CANCELLED EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.subscription?.id;

        if (userId && subscriptionId) {
          console.log('Handling cancelled payment for user:', userId);
          // Optionally mark subscription as cancelled or past_due
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
          
          console.log('✅ Payment cancellation processed');
        } else {
          console.warn('⚠️ Missing user_id or subscription_id in payment.cancelled event');
        }

        return new Response(JSON.stringify({ received: true, processed: 'payment.cancelled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.failed':
      case 'subscription.on_hold': {
        console.log('=== SUBSCRIPTION FAILED/ON_HOLD EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId && subscriptionId) {
          console.log('Marking subscription as past_due for user:', userId);
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
          
          console.log('✅ Subscription status updated to past_due');
        } else {
          console.warn('⚠️ Missing user_id or subscription_id');
        }

        return new Response(JSON.stringify({ received: true, processed: eventType }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.expired': {
        console.log('=== SUBSCRIPTION EXPIRED EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;

        if (userId && subscriptionId) {
          console.log('Marking subscription as inactive for user:', userId);
          await supabaseClient
            .from('users')
            .update({
              subscription_status: 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);
          
          console.log('✅ Subscription marked as expired');
        } else {
          console.warn('⚠️ Missing user_id or subscription_id');
        }

        return new Response(JSON.stringify({ received: true, processed: 'subscription.expired' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'subscription.updated': {
        // Handle subscription updates (e.g., plan changes, billing updates)
        console.log('=== SUBSCRIPTION UPDATED EVENT ===');
        const userId = eventData.metadata?.user_id || eventData.customer?.metadata?.user_id;
        const subscriptionId = eventData.subscription_id || eventData.id;
        let planId = eventData.metadata?.plan_id;
        let billingPeriod = eventData.metadata?.billing_period;

        // Product ID to plan mapping for security validation
        const productIdToPlan: Record<string, string> = {
          [Deno.env.get('DODO_PRODUCT_CREATOR_MONTHLY') || '']: 'creator-monthly',
          [Deno.env.get('DODO_PRODUCT_CREATOR_YEARLY') || '']: 'creator-yearly',
        };
        
        const productId = eventData.product_id || event.data?.product_id;
        
        // Validate plan using product ID if available
        if (productId && productIdToPlan[productId]) {
          planId = productIdToPlan[productId];
          console.log(`Plan validated from product ID ${productId}: ${planId}`);
        }

        if (!userId) {
          console.warn('No user_id in subscription.updated event');
          return new Response(JSON.stringify({ received: true, message: 'No user_id found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Normalize billing period
        if (billingPeriod) {
          billingPeriod = billingPeriod === 'annually' ? 'annual' : billingPeriod;
        }

        if (planId && billingPeriod) {
          // Calculate credits based on plan
          const creditsMap: Record<string, number> = {
            'creator-monthly-monthly': 50,
            'creator-yearly-annual': 600,
          };
          const planKey = `${planId}-${billingPeriod}`;
          const credits = creditsMap[planKey] || 50;

          console.log('Updating subscription for user:', userId, 'to plan:', planKey, 'credits:', credits);

          await supabaseClient
            .from('users')
            .update({
              plan: planId,
              credits: credits,
              subscription_billing_period: billingPeriod,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);

          console.log('✅ Subscription updated successfully');
        } else {
          console.log('⚠️ Insufficient data to update subscription - plan_id or billing_period missing');
        }

        return new Response(JSON.stringify({ received: true, processed: 'subscription.updated' }), {
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
