import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send, Plus } from 'lucide-react'
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

export default function ParentConversations() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // New conversation modal
  const [showNew, setShowNew] = useState(false)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [childTeachers, setChildTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [starting, setStarting] = useState(false)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadData()
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
      .channel('conv-' + activeConv.id)
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
            // Avoid duplicates (we add optimistically on send)
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          // Mark as read if from teacher
          if (payload.new.sender_id !== profile.id) {
            supabase.from('conversation_messages')
              .update({ read: true })
              .eq('id', payload.new.id)
              .then()
          }
          // Refresh conversation list for last message
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

  async function loadData() {
    setLoading(true)
    const { data: childData } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(id, full_name)')
      .eq('parent_id', profile.id)

    const kids = (childData || []).map(d => d.child).filter(Boolean)
    setChildren(kids)

    await loadConversations()
    setLoading(false)
  }

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        teacher:profiles!conversations_teacher_id_fkey(id, full_name, avatar_color),
        student:profiles!conversations_student_id_fkey(id, full_name),
        conversation_messages(id, content, read, sender_id, created_at)
      `)
      .eq('parent_id', profile.id)
      .order('created_at', { ascending: false })

    setConversations(data || [])
  }

  async function openConversation(conv) {
    setActiveConv(conv)
    // Sort messages ascending
    const sorted = [...(conv.conversation_messages || [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )
    setMessages(sorted)

    // Mark unread messages from teacher as read
    const unreadIds = sorted
      .filter(m => m.sender_id !== profile.id && !m.read)
      .map(m => m.id)

    if (unreadIds.length) {
      await supabase
        .from('conversation_messages')
        .update({ read: true })
        .in('id', unreadIds)

      // Update local conversations list
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

    const optimistic = {
      id: 'tmp-' + Date.now(),
      conversation_id: activeConv.id,
      sender_id: profile.id,
      content: input.trim(),
      read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')

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

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    }

    loadConversations()
    setSending(false)
  }

  // When child selected, fetch their teachers
  async function handleChildSelect(childId) {
    setSelectedChild(childId)
    setSelectedTeacher('')
    setChildTeachers([])
    if (!childId) return

    setLoadingTeachers(true)
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('student_id', childId)

    const classIds = (memberData || []).map(m => m.class_id)
    if (!classIds.length) { setLoadingTeachers(false); return }

    const { data: tcData } = await supabase
      .from('teacher_classes')
      .select('teacher:profiles!teacher_id(id, full_name, avatar_color), subject:subjects(name)')
      .in('class_id', classIds)

    const seen = new Set()
    const unique = []
    ;(tcData || []).forEach(tc => {
      if (tc.teacher && !seen.has(tc.teacher.id)) {
        seen.add(tc.teacher.id)
        unique.push({ ...tc.teacher, subject: tc.subject?.name })
      }
    })
    setChildTeachers(unique)
    setLoadingTeachers(false)
  }

  async function startConversation() {
    if (!selectedChild || !selectedTeacher) return
    setStarting(true)
    try {

    // Check for existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('parent_id', profile.id)
      .eq('teacher_id', selectedTeacher)
      .eq('student_id', selectedChild)
      .maybeSingle()

    let convId = existing?.id
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          school_id: profile.school_id,
          parent_id: profile.id,
          teacher_id: selectedTeacher,
          student_id: selectedChild,
        })
        .select()
        .single()
      convId = newConv?.id
    }

    setShowNew(false)
    setSelectedChild('')
    setSelectedTeacher('')
    setChildTeachers([])

    await loadConversations()

    // Open the conversation
    const { data: freshConv } = await supabase
      .from('conversations')
      .select(`
        *,
        teacher:profiles!conversations_teacher_id_fkey(id, full_name, avatar_color),
        student:profiles!conversations_student_id_fkey(id, full_name),
        conversation_messages(id, content, read, sender_id, created_at)
      `)
      .eq('id', convId)
      .single()

    if (freshConv) openConversation(freshConv)
    } catch (err) {
      console.error('startConversation error:', err)
    } finally {
      setStarting(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden">
      {/* Left panel */}
      <div className="w-80 bg-white border-r border-border-soft flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-serif text-lg text-gray-900">Yazışmalar</h2>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-purple hover:text-purple-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-light"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni yazışma
          </button>
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
                    isActive ? 'bg-purple-light' : 'hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={conv.teacher?.full_name}
                      color={conv.teacher?.avatar_color}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {conv.teacher?.full_name || 'Müəllim'}
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
                        <p className="text-[10px] text-purple font-medium mb-0.5">
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
            description="Sol paneldən bir yazışma seçin və ya yeni yazışma başladın."
          />
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-border-soft flex items-center gap-3 bg-white">
              <Avatar
                name={activeConv.teacher?.full_name}
                color={activeConv.teacher?.avatar_color}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{activeConv.teacher?.full_name}</p>
                {activeConv.student && (
                  <p className="text-xs text-gray-400">{activeConv.student.full_name} üçün</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-surface">
              {messages.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">
                  Hələ mesaj yoxdur. İlk mesajı göndərin.
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                        isMe
                          ? 'bg-purple text-white'
                          : 'bg-white border border-border-soft text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-light opacity-80' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-border-soft flex gap-3 bg-white">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Mesaj yazın..."
                className="flex-1 border border-border-soft rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="bg-purple text-white rounded-xl px-4 hover:bg-purple-dark transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* New conversation modal */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setSelectedChild(''); setSelectedTeacher(''); setChildTeachers([]) }} title="Yeni Yazışma">
        <div className="space-y-4">
          <Select
            label="Uşaq"
            value={selectedChild}
            onChange={e => handleChildSelect(e.target.value)}
          >
            <option value="">Uşaq seçin...</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </Select>

          {selectedChild && (
            <Select
              label="Müəllim"
              value={selectedTeacher}
              onChange={e => setSelectedTeacher(e.target.value)}
            >
              <option value="">
                {loadingTeachers ? 'Yüklənir...' : childTeachers.length === 0 ? 'Müəllim tapılmadı' : 'Müəllim seçin...'}
              </option>
              {childTeachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name}{t.subject ? ` — ${t.subject}` : ''}
                </option>
              ))}
            </Select>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => { setShowNew(false); setSelectedChild(''); setSelectedTeacher(''); setChildTeachers([]) }}
            >
              Ləğv et
            </Button>
            <Button
              onClick={startConversation}
              loading={starting}
              disabled={!selectedChild || !selectedTeacher}
            >
              Yazışmanı başlat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
