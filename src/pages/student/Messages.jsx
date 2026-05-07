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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          borderRight: '1px solid rgba(124,110,224,0.12)',
        }}
      >
        <div
          className="p-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(124,110,224,0.14)',
            }}
          >
            <Inbox className="w-3.5 h-3.5" style={{ color: '#7c6ee0' }} />
          </span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
            {t('messages')}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6 flex flex-col items-center text-center gap-2">
              <span
                className="flex items-center justify-center"
                style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: 'rgba(124,110,224,0.10)',
                  border: '1px solid rgba(124,110,224,0.18)',
                }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: '#7c6ee0' }} />
              </span>
              <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                {t('no_messages')}
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Mesajlarınız burada görünəcək
              </p>
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
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(124,110,224,0.06)',
                    background: isActive ? 'rgba(124,110,224,0.10)' : 'transparent',
                    borderLeft: isActive ? '3px solid #7c6ee0' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(124,110,224,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="truncate"
                          style={{
                            fontSize: 14,
                            fontWeight: thread.unread ? 700 : 500,
                            color: thread.unread ? '#1a1a2e' : '#475569',
                          }}
                        >
                          {other?.full_name || 'İstifadəçi'}
                        </p>
                        {thread.unread && (
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: 999,
                              background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>
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
      <div className="flex-1 flex flex-col" style={{ background: 'transparent' }}>
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState icon={MessageSquare} title={t('select_chat')} description={t('select_chat_desc')} />
          </div>
        ) : (
          <>
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: '1px solid rgba(124,110,224,0.10)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
                backdropFilter: 'blur(24px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
              }}
            >
              <Avatar name={profiles[activeThread.otherId]?.full_name} color={profiles[activeThread.otherId]?.avatar_color} size="sm" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
                {profiles[activeThread.otherId]?.full_name}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {threadMessages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : ''}`}>
                    <div
                      className="max-w-[70%] text-sm"
                      style={{
                        padding: '10px 16px',
                        borderRadius: 18,
                        background: isMe
                          ? 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)'
                          : 'rgba(255,255,255,0.75)',
                        color: isMe ? '#fff' : '#1a1a2e',
                        border: isMe ? 'none' : '1px solid rgba(124,110,224,0.18)',
                        backdropFilter: !isMe ? 'blur(12px)' : undefined,
                        WebkitBackdropFilter: !isMe ? 'blur(12px)' : undefined,
                        boxShadow: isMe
                          ? '0 4px 14px rgba(124,110,224,0.20)'
                          : '0 2px 6px rgba(140,120,200,0.06)',
                        lineHeight: 1.5,
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
            <div
              className="px-6 py-4 flex gap-3"
              style={{
                borderTop: '1px solid rgba(124,110,224,0.10)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
                backdropFilter: 'blur(24px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
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
                  background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 6px 16px rgba(124,110,224,0.28)',
                  opacity: !input.trim() ? 0.5 : 1,
                  cursor: !input.trim() ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = 'translateY(-1px)' }}
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
