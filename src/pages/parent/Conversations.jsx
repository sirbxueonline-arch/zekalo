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
    <div className="flex h-[calc(100vh-9rem)] -mx-5 lg:-mx-8 -my-7 overflow-hidden">
      {/* Left panel — conversations list */}
      <div
        className="w-80 flex flex-col flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          borderRight: '1px solid rgba(124,110,224,0.15)',
        }}
      >
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.15)' }}
        >
          <h2 className="text-lg font-extrabold" style={{ color: '#1a1a2e' }}>
            <span className="pastel-text">Yazışmalar</span>
          </h2>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(124,110,224,0.10)' }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: '#7c6ee0' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Hələ yazışma yoxdur</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Müəllimlə yazışma başladın</p>
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
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    background: isActive ? 'rgba(124,110,224,0.10)' : 'transparent',
                    borderBottom: '1px solid rgba(124,110,224,0.08)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={conv.teacher?.full_name}
                      color={conv.teacher?.avatar_color}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className="text-sm truncate"
                          style={{
                            fontWeight: unreadCount > 0 ? 700 : 600,
                            color: unreadCount > 0 ? '#1a1a2e' : '#1a1a2e',
                          }}
                        >
                          {conv.teacher?.full_name || 'Müəllim'}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {lastMsg && (
                            <span className="text-[10px] whitespace-nowrap" style={{ color: '#64748b' }}>
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span
                              className="text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                              style={{ background: '#7c6ee0' }}
                            >
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {conv.student && (
                        <p className="text-[10px] font-bold mb-0.5" style={{ color: '#7c6ee0' }}>
                          {conv.student.full_name}
                        </p>
                      )}
                      {lastMsg && (
                        <p className="text-xs truncate" style={{ color: '#64748b' }}>
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
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="liquid-card p-10 text-center max-w-sm">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(124,110,224,0.12)' }}
              >
                <MessageSquare className="w-8 h-8" style={{ color: '#7c6ee0' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Yazışma seçin</h3>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                Sol paneldən bir yazışma seçin və ya yeni yazışma başladın.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: '1px solid rgba(124,110,224,0.15)',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Avatar
                name={activeConv.teacher?.full_name}
                color={activeConv.teacher?.avatar_color}
                size="sm"
              />
              <div>
                <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{activeConv.teacher?.full_name}</p>
                {activeConv.student && (
                  <p className="text-xs" style={{ color: '#64748b' }}>{activeConv.student.full_name} üçün</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Hələ mesaj yoxdur</p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>İlk mesajı göndərin</p>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[70%] rounded-2xl px-4 py-3 text-sm"
                      style={
                        isMe
                          ? {
                              background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                              color: '#fff',
                              boxShadow: '0 4px 12px rgba(124,110,224,0.2)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.85)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(124,110,224,0.15)',
                              color: '#1a1a2e',
                              boxShadow: '0 2px 8px rgba(140,120,200,0.06)',
                            }
                      }
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p
                        className="text-[10px] mt-1.5"
                        style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#64748b' }}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="px-6 py-4 flex gap-3"
              style={{
                borderTop: '1px solid rgba(124,110,224,0.15)',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Mesaj yazın..."
                className="flex-1 rounded-full px-5 py-3 text-sm focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(124,110,224,0.25)',
                  backdropFilter: 'blur(12px)',
                  color: '#1a1a2e',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="rounded-full w-12 h-12 flex items-center justify-center transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* New conversation modal */}
      <Modal
        open={showNew}
        onClose={() => { setShowNew(false); setSelectedChild(''); setSelectedTeacher(''); setChildTeachers([]) }}
        title="Yeni Yazışma"
      >
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
