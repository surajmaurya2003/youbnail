// supabase/functions/delete-account/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore - Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// @ts-ignore - Deno runtime
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // @ts-ignore - Deno env
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno env
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.split(' ')[1];

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

    const { userId, confirmationText } = body;

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

    // Verify confirmation text
    if (confirmationText !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Get user data for cleanup
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('subscription_id, payment_customer_id, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Failed to fetch user data:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting account deletion for user:', userId, userData?.email);

    // Step 2: Cancel subscription if exists
    if (userData?.subscription_id) {
      try {
        console.log('Cancelling subscription:', userData.subscription_id);
        
        // Call DodoPayments to cancel subscription
        // @ts-ignore - Deno env
        const dodoApiKey = Deno.env.get('DODO_API_KEY');
        if (dodoApiKey) {
          const cancelResponse = await fetch('https://api.dodopayments.com/v1/subscriptions/cancel', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${dodoApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscription_id: userData.subscription_id })
          });

          if (!cancelResponse.ok) {
            console.warn('DodoPayments subscription cancellation failed:', await cancelResponse.text());
          } else {
            console.log('Subscription cancelled successfully');
          }
        }
      } catch (error) {
        console.warn('Subscription cancellation failed:', error);
        // Continue with account deletion even if subscription cancellation fails
      }
    }

    // Step 3: Delete user storage files
    console.log('Cleaning up storage files...');
    try {
      const { data: thumbnails } = await supabaseClient
        .from('thumbnails')
        .select('storage_path')
        .eq('user_id', userId);

      if (thumbnails && thumbnails.length > 0) {
        console.log(`Deleting ${thumbnails.length} thumbnail files`);
        const storagePaths = thumbnails.map(t => t.storage_path);
        
        const { error: storageError } = await supabaseClient.storage
          .from('thumbnails')
          .remove(storagePaths);
        
        if (storageError) {
          console.warn('Storage cleanup failed:', storageError);
        } else {
          console.log('Storage files deleted successfully');
        }
      }
    } catch (error) {
      console.warn('Storage cleanup error:', error);
      // Continue with account deletion even if storage cleanup fails
    }

    // Step 4: Delete from auth.users (this will cascade to all related tables due to foreign key constraints)
    console.log('Deleting user account from auth...');
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Failed to delete user from auth:', deleteError);
      throw deleteError;
    }

    console.log('Account deletion completed successfully for user:', userId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account deleted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(JSON.stringify({ 
      error: 'Account deletion failed',
      details: error.message 
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});