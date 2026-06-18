import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'
import { fmtDayMonth } from '../../lib/dateUtils'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  if (isToday) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  return fmtDayMonth(d)
}

function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

export default function TeacherConversations() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadConversations()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    if (!activeConv) return

    const channel = supabase
      .channel('teacher-conv-' + activeConv.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: 'conversation_id=eq.' + activeConv.id,
        },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          if (payload.new.sender_id !== profile.id) {
            supabase.from('conversation_messages')
              .update({ read: true })
              .eq('id', payload.new.id)
              .then()
          }
          loadConversations()
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [activeConv?.id])

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          parent:profiles!conversations_parent_id_fkey(id, full_name, avatar_color),
          student:profiles!conversations_student_id_fkey(id, full_name),
          conversation_messages(id, content, read, sender_id, created_at)
        `)
        .eq('teacher_id', profile.id)
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setConversations(data || [])
      setLoadError(null)
    } catch (err) {
      setLoadError(err.message || 'Yazışmaları yükləmək alınmadı')
    } finally {
      setLoading(false)
    }
  }

  async function openConversation(conv) {
    setActiveConv(conv)
    const sorted = [...(conv.conversation_messages || [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )
    setMessages(sorted)

    const unreadIds = sorted
      .filter(m => m.sender_id !== profile.id && !m.read)
      .map(m => m.id)

    if (unreadIds.length) {
      await supabase
        .from('conversation_messages')
        .update({ read: true })
        .in('id', unreadIds)

      setConversations(prev =>
        prev.map(c =>
          c.id === conv.id
            ? {
                ...c,
                conversation_messages: c.conversation_messages.map(m =>
                  unreadIds.includes(m.id) ? { ...m, read: true } : m
                ),
              }
            : c
        )
      )
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConv || sending) return
    setSending(true)
    setSendError(null)

    const optimistic = {
      id: 'tmp-' + Date.now(),
      conversation_id: activeConv.id,
      sender_id: profile.id,
      content: input.trim(),
      read: false,
      created_at: new Date().toISOString(),
    }
    const savedInput = input.trim()
    setMessages(prev => [...prev, optimistic])
    setInput('')

    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: activeConv.id,
          sender_id: profile.id,
          content: optimistic.content,
          read: false,
        })
        .select()
        .single()

      if (error) throw error

      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
      loadConversations()
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(savedInput)
      setSendError(err.message || 'Mesaj göndərilmədi')
    } finally {
      setSending(false)
    }
  }

  const totalUnread = conversations.reduce((sum, conv) => {
    const count = (conv.conversation_messages || []).filter(
      m => m.sender_id !== profile.id && !m.read
    ).length
    return sum + count
  }, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="pastel-skeleton h-12 w-72 rounded-tile" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pastel-skeleton h-96 rounded-card" />
          <div className="pastel-skeleton h-96 md:col-span-2 rounded-card" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="liquid-card p-5 flex items-center gap-3 border border-danger/25 bg-danger/5">
        <span className="icon-chip icon-chip-coral flex-shrink-0" style={{ width: 36, height: 36 }}>
          <AlertCircle className="w-4 h-4" />
        </span>
        <span className="text-sm font-semibold text-ink-900">{loadError}</span>
      </div>
    )
  }

  return (
    <div className="liquid-card overflow-hidden flex" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Left panel — conversations list */}
      <div className="w-80 flex flex-col flex-shrink-0 border-r border-hairline">
        <div className="px-4 py-4 flex items-center justify-between border-b border-hairline">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink-900">Yazışmalar</h2>
            {totalUnread > 0 && (
              <span className="pill-danger">{totalUnread}</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
              <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48 }}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-ink-600">Hələ heç bir yazışma yoxdur</p>
              <p className="text-xs text-ink-400">Valideynlər sizinlə əlaqə saxladıqda burada görünəcək</p>
            </div>
          ) : (
            conversations.map(conv => {
              const msgs = conv.conversation_messages || []
              const sorted = [...msgs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              const lastMsg = sorted[0]
              const unreadCount = msgs.filter(m => m.sender_id !== profile.id && !m.read).length
              const isActive = activeConv?.id === conv.id

              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="w-full text-left px-4 py-3 transition-colors duration-150 border-b border-hairline/60"
                  style={{
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--brand-500)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--canvas)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={conv.parent?.full_name} color={conv.parent?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className="text-sm truncate"
                          style={{ fontWeight: unreadCount > 0 ? 700 : 500, color: 'var(--ink-900)' }}
                        >
                          {conv.parent?.full_name || 'Valideyn'}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {lastMsg && (
                            <span className="text-[10px] whitespace-nowrap text-ink-400">
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="pill-danger" style={{ minWidth: 18, fontSize: 10 }}>{unreadCount}</span>
                          )}
                        </div>
                      </div>
                      {conv.student && (
                        <p className="text-[10px] mb-0.5 font-semibold text-brand-600">
                          {conv.student.full_name}
                        </p>
                      )}
                      {lastMsg && (
                        <p className="text-xs truncate text-ink-600">
                          {truncate(lastMsg.content, 40)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel — chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Yazışma seçin"
              description="Sol paneldən bir yazışma seçin və valideynin mesajına cavab verin."
              className="border-none shadow-none"
            />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-3.5 flex items-center gap-3 border-b border-hairline bg-surface">
              <Avatar name={activeConv.parent?.full_name} color={activeConv.parent?.avatar_color} size="sm" />
              <div>
                <p className="text-sm font-bold text-ink-900">{activeConv.parent?.full_name}</p>
                {activeConv.student && (
                  <p className="text-xs text-ink-400">{activeConv.student.full_name} haqqında</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 bg-canvas">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <div className="icon-chip icon-chip-periwinkle" style={{ width: 40, height: 40 }}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-ink-400">Hələ mesaj yoxdur. Söhbəti başlayın!</p>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[70%] text-sm leading-relaxed"
                      style={{
                        padding: '10px 16px',
                        background: isMe ? 'var(--brand-500)' : 'var(--surface)',
                        color: isMe ? '#fff' : 'var(--ink-900)',
                        border: isMe ? 'none' : '1px solid var(--hairline)',
                        boxShadow: isMe ? 'none' : '0 1px 2px rgba(20,22,40,.04)',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      }}
                    >
                      <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: isMe ? 'rgba(255,255,255,0.75)' : 'var(--ink-400)' }}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-hairline bg-surface">
              {sendError && (
                <p className="px-6 pt-3 text-xs flex items-center gap-1.5 text-danger">
                  <AlertCircle className="w-3.5 h-3.5" /> {sendError}
                </p>
              )}
              <div className="px-6 py-3.5 flex gap-3">
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); if (sendError) setSendError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Mesaj yazın..."
                  className="pastel-input flex-1"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="btn-pastel flex items-center justify-center"
                  style={{ padding: '0 18px', opacity: (!input.trim() || sending) ? 0.5 : 1, minWidth: 48 }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
