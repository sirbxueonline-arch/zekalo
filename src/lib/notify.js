import { supabase } from './supabase'

export async function notifyUsers(notifications) {
  // notifications: array of { profile_id, school_id, title, body, type, reference_id }
  if (!notifications.length) return
  await supabase.from('notifications').insert(
    notifications.map(n => ({
      profile_id: n.profile_id,
      school_id: n.school_id,
      title: n.title,
      body: n.body,
      type: n.type || 'info',
      reference_id: n.reference_id || null,
      read: false,
    }))
  )
  // fire and forget — don't block the UI on notification delivery
}
