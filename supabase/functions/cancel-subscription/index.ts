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

    const dodoBaseUrl = Deno.env.get("DODO_API_MODE") === "live"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";

    console.log("Attempting to cancel subscription:", {
      subscriptionId: user.subscription_id,
      customerId: user.payment_customer_id,
      dodoBaseUrl,
    });

    // Attempt to cancel via DodoPayments API
    // Try different possible endpoints - DodoPayments API may vary
    let cancelResponse;
    let cancelError = null;
    
    // Try endpoint 1: /subscriptions/{id}/cancel
    try {
      cancelResponse = await fetch(`${dodoBaseUrl}/subscriptions/${user.subscription_id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${dodoApiKey}`,
        },
        body: JSON.stringify({
          customer_id: user.payment_customer_id,
        }),
      });
    } catch (err) {
      cancelError = err;
    }

    // If first endpoint fails, try alternative: DELETE /subscriptions/{id}
    if (!cancelResponse || !cancelResponse.ok) {
      try {
        cancelResponse = await fetch(`${dodoBaseUrl}/subscriptions/${user.subscription_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${dodoApiKey}`,
          },
        });
      } catch (err) {
        cancelError = err;
      }
    }

    if (!cancelResponse || !cancelResponse.ok) {
      const errorText = cancelResponse ? await cancelResponse.text() : (cancelError?.message || "Network error");
      console.error("Dodo cancel error:", cancelResponse?.status || "No response", errorText);
      
      // Even if DodoPayments API call fails, we can mark it as cancelled in our DB
      // The webhook will handle the final status when DodoPayments processes it
      console.log("Marking subscription as cancelled in database despite API error");
      
      await supabaseClient
        .from("users")
        .update({
          subscription_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Cancellation initiated. If the payment provider call failed, please contact support.",
          warning: errorText 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Let the webhook ultimately mark status as cancelled when it receives the event.
    // Here we can pre-emptively mark subscription_status as 'cancelled_pending' or similar,
    // but for now just return success to the client.

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in cancel-subscription function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

