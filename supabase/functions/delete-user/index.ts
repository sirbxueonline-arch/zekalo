// Wire admin Students/Teachers/Parents delete handlers to invoke this AFTER deploying (replace the direct profiles.delete()). Until then, deletes still leave orphaned auth.users (see SECURITY_REMEDIATION P0-9).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Admin client — bypasses RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verify the calling user is an admin of their school (or super_admin)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized')

    const { data: { user: caller }, error: callerErr } = await adminClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (callerErr || !caller) throw new Error('Unauthorized')

    const { data: callerProfile, error: profileErr } = await adminClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', caller.id)
      .single()

    if (profileErr || (callerProfile?.role !== 'admin' && callerProfile?.role !== 'super_admin')) {
      throw new Error('Forbidden')
    }

    // Validate input
    const { id } = await req.json()
    if (!id || typeof id !== 'string') throw new Error('Missing required field: id')

    // Look up the target's school to enforce same-school scope for admins
    const { data: targetProfile, error: targetErr } = await adminClient
      .from('profiles')
      .select('school_id')
      .eq('id', id)
      .single()
    if (targetErr || !targetProfile) throw new Error('Not found')

    // SECURITY: an admin may only delete users in their own school; super_admin is unrestricted
    if (callerProfile.role === 'admin' && targetProfile.school_id !== callerProfile.school_id) {
      throw new Error('Forbidden')
    }

    // Delete the auth user — cascades to profiles via the FK
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(id)
    if (deleteErr) throw deleteErr

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
