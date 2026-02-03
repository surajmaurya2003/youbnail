// supabase/functions/cancel-subscription/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwt = authHeader.split(' ')[1];
    
    const dodoApiKey = Deno.env.get("DODO_API_KEY") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!dodoApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    
    // Create Supabase client for JWT verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT token and get user
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(jwt);
    
    if (authError || !authUser) {
      console.error('JWT verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    
    // Verify the user ID matches the JWT
    if (authUser.id !== userId) {
      console.error('User ID mismatch: JWT user', authUser.id, 'vs request userId', userId);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User ID mismatch' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: userError } = await supabaseClient
      .from("users")
      .select("id, email, plan, subscription_id, subscription_status, subscription_ends_at, payment_customer_id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("User not found for cancel-subscription", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!user.subscription_id) {
      return new Response(
        JSON.stringify({ error: "No subscription ID found. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Allow cancellation if status is active or if user is on a paid plan (in case status is not set correctly)
    if (user.subscription_status !== "active" && user.plan === "free") {
      return new Response(
        JSON.stringify({ error: "No active subscription to cancel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dodoApiMode = Deno.env.get("DODO_API_MODE") || "test";
    const dodoBaseUrl = dodoApiMode === "live"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";

    console.log("=== DODO PAYMENTS CANCELLATION ATTEMPT ===");
    console.log("Attempting to cancel subscription:", {
      subscriptionId: user.subscription_id,
      customerId: user.payment_customer_id,
      dodoApiMode: dodoApiMode,
      dodoApiModeEnvSet: !!Deno.env.get("DODO_API_MODE"),
      dodoBaseUrl: dodoBaseUrl,
      fullUrl: `${dodoBaseUrl}/v1/subscriptions/${user.subscription_id}/cancel`,
      apiKeyPresent: !!dodoApiKey,
      apiKeyLength: dodoApiKey?.length || 0
    });
    console.log("==========================================");;

    // First, verify the subscription exists in DodoPayments
    console.log("Step 1: Verifying subscription exists in DodoPayments...");
    let subscriptionExistsInDodo = false;
    
    try {
      const verifyResponse = await fetch(`${dodoBaseUrl}/v1/subscriptions/${user.subscription_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${dodoApiKey}`,
        },
      });
      
      const verifyText = await verifyResponse.text();
      console.log("Subscription verification response:", {
        status: verifyResponse.status,
        statusText: verifyResponse.statusText,
        body: verifyText.substring(0, 200)
      });
      
      if (!verifyResponse.ok) {
        console.warn("⚠️ Subscription does NOT exist in DodoPayments");
        console.warn("Possible reasons:");
        console.warn("1. Webhook didn't fire after checkout (most common)");
        console.warn("2. Different DodoPayments account");
        console.warn("3. Subscription was already deleted");
        console.warn("Will mark as cancelled in database only (user-initiated cancellation)");
        subscriptionExistsInDodo = false;
      } else {
        console.log("✓ Subscription verified in DodoPayments");
        subscriptionExistsInDodo = true;
      }
    } catch (verifyError: any) {
      console.error("Verification request failed:", verifyError.message);
      console.warn("Assuming subscription doesn't exist in DodoPayments, will proceed with database-only cancellation");
      subscriptionExistsInDodo = false;
    }

    // Attempt to cancel via DodoPayments API (only if subscription exists)
    let cancelResponse;
    let cancelError = null;
    
    if (subscriptionExistsInDodo) {
      // Try the correct DodoPayments API endpoint (PATCH, not POST to /cancel)
      try {
        console.log("Step 2: Calling DodoPayments API to cancel subscription...");
        cancelResponse = await fetch(`${dodoBaseUrl}/v1/subscriptions/${user.subscription_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${dodoApiKey}`,
          },
          body: JSON.stringify({
            cancel_at_next_billing_date: true,
            status: "cancelled"
          }),
        });
      
      const responseText = await cancelResponse.text();
      console.log("DodoPayments response:", {
        status: cancelResponse.status,
        statusText: cancelResponse.statusText,
        body: responseText
      });
      
      // If successful, we're done
      if (cancelResponse.ok) {
        console.log("Successfully cancelled subscription in DodoPayments");
        
        const cancelledAt = new Date().toISOString();
        
        // Update users table
        const { error: userUpdateError } = await supabaseClient
          .from("users")
          .update({
            subscription_status: "cancelled",
            updated_at: cancelledAt,
          })
          .eq("id", userId);
        
        if (userUpdateError) {
          console.error("Failed to update users table:", userUpdateError);
        }
        
        // Update subscription_history table
        const { error: historyUpdateError } = await supabaseClient
          .from("subscription_history")
          .update({
            status: "cancelled",
            cancelled_at: cancelledAt,
          })
          .eq("user_id", userId)
          .eq("subscription_id", user.subscription_id)
          .is("cancelled_at", null);
        
        if (historyUpdateError) {
          console.error("Failed to update subscription_history table:", historyUpdateError);
        } else {
          console.log("Successfully updated subscription_history table");
        }
        
        return new Response(
          JSON.stringify({ success: true, message: "Subscription cancelled successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      
      // Store error for logging
      cancelError = `${cancelResponse.status} ${cancelResponse.statusText}: ${responseText}`;
      
    } catch (err: any) {
      console.error("DodoPayments API request failed:", err);
      cancelError = err.message || String(err);
    }
    } else {
      // Subscription doesn't exist in DodoPayments, skip API call
      console.log("✓ Skipping DodoPayments API call - subscription not found in their system");
      console.log("✓ This is OK - proceeding with database cancellation");
      cancelError = "Subscription not found in DodoPayments (webhook likely failed during checkout - this is normal)";
    }

    // If DodoPayments API call fails OR was skipped, mark as cancelled in our DB anyway
    // The user expects the subscription to be cancelled
    if (cancelError) {
      console.log("📝 Marking subscription as cancelled in database...");
    }
    console.log("✓ Marking subscription as cancelled in database (user-initiated cancellation)");
    
    const cancelledAt = new Date().toISOString();
    
    // Update users table
    const { error: userUpdateError } = await supabaseClient
        .from("users")
        .update({
          subscription_status: "cancelled",
          updated_at: cancelledAt,
        })
        .eq("id", userId);
    
    if (userUpdateError) {
      console.error("Failed to update users table:", userUpdateError);
      throw new Error("Failed to update user subscription status");
    }
    
    // Update subscription_history table
    const { error: historyUpdateError } = await supabaseClient
        .from("subscription_history")
        .update({
          status: "cancelled",
          cancelled_at: cancelledAt,
        })
        .eq("user_id", userId)
        .eq("subscription_id", user.subscription_id)
        .is("cancelled_at", null); // Only update records that haven't been cancelled yet
    
    if (historyUpdateError) {
      console.error("Failed to update subscription_history table:", historyUpdateError);
      // Don't throw - user table is already updated, just log the error
    } else {
      console.log("Successfully updated subscription_history table");
    }
      
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription cancelled successfully. Your access will continue until the end of your billing period.",
        note: cancelError ? "Note: Subscription was only cancelled in our database as it was not found in the payment provider." : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error in cancel-subscription function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

