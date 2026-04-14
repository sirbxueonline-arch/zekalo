import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtime(table, filter, callback) {
  useEffect(() => {
    let channel = supabase.channel(`${table}-changes`)

    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback])
}
