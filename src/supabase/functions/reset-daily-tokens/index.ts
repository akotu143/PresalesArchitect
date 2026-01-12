import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];

    const { data: tokensToReset, error: fetchError } = await supabase
      .from('user_tokens')
      .select('user_id, last_reset_date')
      .neq('last_reset_date', today);

    if (fetchError) {
      throw fetchError;
    }

    if (!tokensToReset || tokensToReset.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All tokens are up to date',
          reset_count: 0,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const userIds = tokensToReset.map((token) => token.user_id);

    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        tokens_available: 100,
        tokens_used: 0,
        last_reset_date: today,
      })
      .in('user_id', userIds);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tokens reset successfully',
        reset_count: tokensToReset.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error resetting tokens:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});