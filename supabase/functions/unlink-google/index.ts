import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // Verify the user's JWT token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's current identity links
    const { data: identities, error: identitiesError } = await supabaseAdmin
      .from('auth.identities')
      .select('*')
      .eq('user_id', user.id);

    if (identitiesError) {
      throw new Error('Failed to fetch user identities');
    }

    // Check if user has non-Google authentication method
    const hasNonGoogleAuth = identities?.some(identity => 
      identity.provider !== 'google' || identity.provider === 'email'
    );

    if (!hasNonGoogleAuth && identities?.length === 1) {
      throw new Error('Cannot unlink Google account. You must have another authentication method (email/password) before unlinking Google.');
    }

    // Find Google identity
    const googleIdentity = identities?.find(identity => identity.provider === 'google');
    
    if (!googleIdentity) {
      throw new Error('Google account is not linked');
    }

    // Use admin client to unlink the Google provider
    const { error: unlinkError } = await supabaseAdmin.auth.admin.unlinkIdentity({
      identity_id: googleIdentity.id
    });

    if (unlinkError) {
      throw new Error(`Failed to unlink Google account: ${unlinkError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Google account unlinked successfully',
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error unlinking Google account:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to unlink Google account',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});