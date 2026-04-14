import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtime } from '../../hooks/useRealtime'
import Avatar from '../../components/ui/Avatar'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send } from 'lucide-react'

export default function StudentMessages() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [input, setInput] = useState('')
  const [profiles, setProfiles] = useState({})
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadThreads()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  async function loadThreads() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })

    const threadMap = {}
    ;(data || []).forEach(msg => {
      if (!threadMap[msg.thread_id]) threadMap[msg.thread_id] = []
      threadMap[msg.thread_id].push(msg)
    })

    const threadList = Object.entries(threadMap).map(([threadId, msgs]) => {
      const last = msgs[0]
      const otherId = last.sender_id === profile.id ? last.recipient_id : last.sender_id
      const unread = msgs.some(m => m.recipient_id === profile.id && !m.read)
      return { threadId, lastMessage: last, otherId, unread, messages: msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }
    })

    const otherIds = [...new Set(threadList.map(th => th.otherId))]
    if (otherIds.length) {
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_color').in('id', otherIds)
      const map = {}
      ;(profilesData || []).forEach(p => { map[p.id] = p })
      setProfiles(map)
    }

    setThreads(threadList)
    setLoading(false)
  }

  function selectThread(thread) {
    setActiveThread(thread)
    setThreadMessages(thread.messages)
    thread.messages.forEach(msg => {
      if (msg.recipient_id === profile.id && !msg.read) {
        supabase.from('messages').update({ read: true, read_at: new Date().toISOString() }).eq('id', msg.id).then()
      }
    })
  }

  const handleRealtime = useCallback((payload) => {
    if (payload.new) {
      loadThreads()
      if (activeThread && payload.new.thread_id === activeThread.threadId) {
        setThreadMessages(prev => [...prev, payload.new])
      }
    }
  }, [activeThread])

  useRealtime('messages', `recipient_id=eq.${profile?.id}`, handleRealtime)

  async function sendMessage() {
    if (!input.trim() || !activeThread) return
    const { error } = await supabase.from('messages').insert({
      thread_id: activeThread.threadId,
      sender_id: profile.id,
      recipient_id: activeThread.otherId,
      content: input.trim(),
    })
    if (!error) {
      setInput('')
      loadThreads()
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden">
      <div className="w-80 bg-white border-r border-border-soft flex flex-col">
        <div className="p-4 border-b border-border-soft">
          <h2 className="text-sm font-medium text-gray-900">{t('messages')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">{t('no_messages')}</div>
          ) : (
            threads.map(thread => {
              const other = profiles[thread.otherId]
              return (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread)}
                  className={`w-full text-left px-4 py-3 border-b border-border-soft transition-colors ${
                    activeThread?.threadId === thread.threadId ? 'bg-purple-light' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${thread.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {other?.full_name || 'İstifadəçi'}
                        </p>
                        {thread.unread && <div className="w-2 h-2 rounded-full bg-purple flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{thread.lastMessage.content}</p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!activeThread ? (
          <EmptyState icon={MessageSquare} title={t('select_chat')} description={t('select_chat_desc')} />
        ) : (
          <>
            <div className="px-6 py-4 border-b border-border-soft flex items-center gap-3">
              <Avatar name={profiles[activeThread.otherId]?.full_name} color={profiles[activeThread.otherId]?.avatar_color} size="sm" />
              <span className="text-sm font-medium text-gray-900">{profiles[activeThread.otherId]?.full_name}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {threadMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === profile.id ? 'justify-end' : ''}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                    msg.sender_id === profile.id
                      ? 'bg-purple text-white'
                      : 'bg-white border border-border-soft text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-6 py-4 border-t border-border-soft flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t('type_message')}
                className="flex-1 border border-border-soft rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-purple text-white rounded-xl px-4 hover:bg-purple-dark transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
