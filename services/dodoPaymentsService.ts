// services/dodoPaymentsService.ts

// Note: This service will be used by Supabase Edge Functions
// Frontend will call Supabase functions, which will use this service

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  planId: 'creator-monthly' | 'creator-yearly';
  billingPeriod: 'monthly' | 'annual';
}

export interface CheckoutSession {
  checkout_url: string;
  session_id: string;
}

/**
 * Creates a checkout session with DodoPayments
 * This should be called from a Supabase Edge Function (backend)
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutSession> {
  const apiKey = Deno.env.get('DODO_API_KEY') || '';
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

  // Map plan and billing period to product ID
  const productIdMap: Record<string, string> = {
    'creator-monthly': 'pdt_0NXpM255yChszOw8NtD8E',
    'creator-yearly': 'pdt_0NXpMC6CaDirXTzbauyd1',
  };

  const productKey = `${params.planId}-${params.billingPeriod}`;
  const productId = productIdMap[productKey];

  if (!productId) {
    throw new Error(`Product ID not found for ${productKey}`);
  }

  // Call DodoPayments API to create checkout session
  // NOTE: Update this URL to match DodoPayments actual API endpoint
  const response = await fetch('https://test.dodopayments.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      product_id: productId,
      customer_email: params.userEmail,
      success_url: `${appUrl}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/plans?canceled=true`,
      metadata: {
        user_id: params.userId,
        plan_id: params.planId,
        billing_period: params.billingPeriod,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  const data = await response.json();
  
  return {
    checkout_url: data.checkout_url || data.url,
    session_id: data.session_id || data.id,
  };
}

/**
 * Verifies webhook signature from DodoPayments
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // DodoPayments webhook verification logic
  // This is a simplified version - check DodoPayments docs for exact implementation
  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  // Note: Actual implementation depends on DodoPayments' signature method
  // Check their documentation for the exact algorithm
  // For now, this is a placeholder - implement actual verification based on DodoPayments docs
  return true; // Placeholder - implement actual verification
}

/**
 * Maps DodoPayments subscription status to our status
 */
export function mapSubscriptionStatus(dodoStatus: string): 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing' {
  const statusMap: Record<string, 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'inactive': 'inactive',
  };
  
  return statusMap[dodoStatus.toLowerCase()] || 'inactive';
}
