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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Admin client — bypasses RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verify the calling user is an admin of their school
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

    if (profileErr || callerProfile?.role !== 'admin') throw new Error('Forbidden')

    const { email, password, full_name, role, school_id } = await req.json()

    // Validate the school_id matches the admin's school
    if (school_id !== callerProfile.school_id) throw new Error('Forbidden')

    // Create auth user WITHOUT logging the browser in
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no email verification required
    })
    if (createErr) throw createErr

    const userId = created.user.id

    // Insert profile using service role (bypasses RLS — admin is creating for another user)
    const { error: insertErr } = await adminClient.from('profiles').insert({
      id: userId,
      full_name,
      email,
      role,
      school_id,
    })
    if (insertErr) {
      // Roll back the auth user if profile insert fails
      await adminClient.auth.admin.deleteUser(userId)
      throw insertErr
    }

    return new Response(
      JSON.stringify({ user_id: userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
