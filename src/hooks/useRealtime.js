import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Counter used to generate unique channel name suffixes, preventing collisions
// when multiple components subscribe to the same table simultaneously.
let channelCounter = 0

export function useRealtime(table, filter, callback) {
  const channelIdRef = useRef(null)
  if (channelIdRef.current === null) {
    channelIdRef.current = ++channelCounter
  }

  useEffect(() => {
    const channelName = `${table}-changes-${channelIdRef.current}`
    const channel = supabase.channel(channelName)

    channel
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
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime channel error on "${channelName}"`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback])
}
