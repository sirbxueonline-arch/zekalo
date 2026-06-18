import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtime } from '../../hooks/useRealtime'
import Avatar from '../../components/ui/Avatar'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send, Inbox } from 'lucide-react'

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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) {
      console.error('Messages fetch error:', error)
      setLoading(false)
      return
    }

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
    <div
      className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Thread sidebar */}
      <div
        className="w-80 flex flex-col"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--hairline)',
        }}
      >
        {/* Sidebar header */}
        <div
          className="p-4 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <span
            className="icon-chip icon-chip-periwinkle"
            style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0 }}
          >
            <Inbox className="w-4 h-4" />
          </span>
          <h2 className="text-ink-900" style={{ fontSize: 16, fontWeight: 700 }}>
            {t('messages')}
          </h2>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <span
                className="icon-chip icon-chip-periwinkle"
                style={{ width: 52, height: 52, borderRadius: 14 }}
              >
                <MessageSquare className="w-6 h-6" />
              </span>
              <p className="text-sm font-semibold text-ink-900">{t('no_messages')}</p>
              <p className="text-xs text-ink-400">Mesajlarınız burada görünəcək</p>
            </div>
          ) : (
            threads.map(thread => {
              const other = profiles[thread.otherId]
              const isActive = activeThread?.threadId === thread.threadId
              return (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread)}
                  className="w-full text-left transition-all"
                  style={{
                    padding: '13px 16px',
                    borderBottom: '1px solid var(--hairline)',
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--brand-500)' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--brand-50)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className="truncate text-sm"
                          style={{
                            fontWeight: thread.unread ? 700 : 500,
                            color: thread.unread ? 'var(--ink-900)' : 'var(--ink-600)',
                          }}
                        >
                          {other?.full_name || 'İstifadəçi'}
                        </p>
                        {thread.unread && (
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: 999,
                              background: 'var(--brand-500)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5 text-ink-400">
                        {thread.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--canvas)' }}>
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              pose="waving"
              title={t('select_chat')}
              description={t('select_chat_desc')}
            />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: '1px solid var(--hairline)',
                background: 'var(--surface)',
              }}
            >
              <Avatar
                name={profiles[activeThread.otherId]?.full_name}
                color={profiles[activeThread.otherId]?.avatar_color}
                size="sm"
              />
              <span className="font-semibold text-ink-900" style={{ fontSize: 14 }}>
                {profiles[activeThread.otherId]?.full_name}
              </span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {threadMessages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[70%] text-sm"
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMe
                          ? 'var(--brand-500)'
                          : 'var(--surface-2)',
                        color: isMe ? '#fff' : 'var(--ink-900)',
                        border: isMe ? 'none' : '1px solid var(--hairline)',
                        boxShadow: 'none',
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div
              className="px-6 py-4 flex gap-3 items-center"
              style={{
                borderTop: '1px solid var(--hairline)',
                background: 'var(--surface)',
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t('type_message')}
                className="pastel-input flex-1"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex items-center justify-center transition-all"
                style={{
                  width: 44, height: 44, borderRadius: 999,
                  background: 'var(--brand-500)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 1px 2px rgba(20,22,40,.08)',
                  opacity: !input.trim() ? 0.45 : 1,
                  cursor: !input.trim() ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  transition: 'opacity .15s, transform .12s',
                }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
