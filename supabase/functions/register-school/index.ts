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

    // Admin client — bypasses RLS entirely
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { email, password, full_name, school_name, district, edition, language } = await req.json()

    if (!email || !password || !full_name || !school_name || !edition) {
      throw new Error('Missing required fields')
    }

    // 1. Create auth user (email_confirm: true = no verification email needed)
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) throw createErr
    const userId = created.user.id

    // 2. Create the school
    const { data: school, error: schoolErr } = await adminClient
      .from('schools')
      .insert({
        name: school_name,
        district: district || null,
        edition,
        default_language: language || 'az',
      })
      .select()
      .single()

    if (schoolErr) {
      await adminClient.auth.admin.deleteUser(userId)
      throw schoolErr
    }

    // 3. Create the admin profile linked to the school
    const { error: profileErr } = await adminClient.from('profiles').insert({
      id: userId,
      full_name,
      email,
      role: 'admin',
      school_id: school.id,
      edition,
      language: language || 'az',
    })

    if (profileErr) {
      await adminClient.auth.admin.deleteUser(userId)
      await adminClient.from('schools').delete().eq('id', school.id)
      throw profileErr
    }

    // 4. Sign the user in so the client gets a valid session immediately
    const { data: session, error: signInErr } = await adminClient.auth.signInWithPassword({
      email,
      password,
    })
    if (signInErr) throw signInErr

    return new Response(
      JSON.stringify({ session: session.session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
