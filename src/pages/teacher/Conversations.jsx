import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send } from 'lucide-react'
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

  // Real-time subscription on active conversation
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
          // Mark as read if from parent
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

    // Mark unread messages from parent as read
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
      // Rollback optimistic message and restore input
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(savedInput)
      setSendError(err.message || 'Mesaj göndərilmədi')
    } finally {
      setSending(false)
    }
  }

  // Total unread across all conversations
  const totalUnread = conversations.reduce((sum, conv) => {
    const count = (conv.conversation_messages || []).filter(
      m => m.sender_id !== profile.id && !m.read
    ).length
    return sum + count
  }, 0)

  if (loading) return <PageSpinner />

  if (loadError) return (
    <div className="p-8 text-center text-sm text-red-600 bg-red-50 rounded-xl">{loadError}</div>
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden">
      {/* Left panel */}
      <div className="w-80 bg-white border-r border-border-soft flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border-soft flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg text-gray-900">Yazışmalar</h2>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">Valideynlər yazışır</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-sm text-gray-400 text-center">
              Hələ heç bir yazışma yoxdur
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
                  className={`w-full text-left px-4 py-3 border-b border-border-soft transition-colors ${
                    isActive ? 'bg-teal-light' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={conv.parent?.full_name}
                      color={conv.parent?.avatar_color}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {conv.parent?.full_name || 'Valideyn'}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {lastMsg && (
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {conv.student && (
                        <p className="text-[10px] text-teal font-medium mb-0.5">
                          {conv.student.full_name}
                        </p>
                      )}
                      {lastMsg && (
                        <p className="text-xs text-gray-500 truncate">
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

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConv ? (
          <EmptyState
            icon={MessageSquare}
            title="Yazışma seçin"
            description="Sol paneldən bir yazışma seçin və valideynin mesajına cavab verin."
          />
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-border-soft flex items-center gap-3 bg-white">
              <Avatar
                name={activeConv.parent?.full_name}
                color={activeConv.parent?.avatar_color}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{activeConv.parent?.full_name}</p>
                {activeConv.student && (
                  <p className="text-xs text-gray-400">{activeConv.student.full_name} haqqında</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-surface">
              {messages.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">
                  Hələ mesaj yoxdur.
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                        isMe
                          ? 'bg-teal text-white'
                          : 'bg-white border border-border-soft text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-teal-light opacity-90' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border-soft bg-white">
              {sendError && (
                <p className="px-6 pt-3 text-xs text-red-600">{sendError}</p>
              )}
              <div className="px-6 py-4 flex gap-3">
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); if (sendError) setSendError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Mesaj yazın..."
                  className="flex-1 border border-border-soft rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="bg-teal text-white rounded-xl px-4 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
