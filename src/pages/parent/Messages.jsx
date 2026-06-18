import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtime } from '../../hooks/useRealtime'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { MessageSquare, Send, Plus } from 'lucide-react'

export default function ParentMessages() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [input, setInput] = useState('')
  const [profiles, setProfiles] = useState({})
  const [showCompose, setShowCompose] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  async function loadData() {
    const { data: childData } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(id, full_name)')
      .eq('parent_id', profile.id)

    const kids = (childData || []).map(d => d.child).filter(Boolean)
    setChildren(kids)

    const childIds = kids.map(k => k.id)
    if (childIds.length) {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .in('student_id', childIds)

      const classIds = [...new Set((memberData || []).map(m => m.class_id))]
      if (classIds.length) {
        const { data: teacherClasses } = await supabase
          .from('teacher_classes')
          .select('teacher:profiles!teacher_id(id, full_name, avatar_color)')
          .in('class_id', classIds)

        const seen = new Set()
        const uniqueTeachers = []
        ;(teacherClasses || []).forEach(tc => {
          if (tc.teacher && !seen.has(tc.teacher.id)) {
            seen.add(tc.teacher.id)
            uniqueTeachers.push(tc.teacher)
          }
        })
        setTeachers(uniqueTeachers)
      }
    }

    await loadThreads()
  }

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

    const otherIds = [...new Set(threadList.map(thr => thr.otherId))]
    if (otherIds.length) {
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_color').in('id', otherIds)
      const map = {}
      ;(profilesData || []).forEach(p => { map[p.id] = p })
      setProfiles(prev => ({ ...prev, ...map }))
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

  async function handleCompose() {
    if (!selectedTeacher || !composeMessage.trim()) return
    setSending(true)
    const threadId = [profile.id, selectedTeacher].sort().join('_')
    const { error } = await supabase.from('messages').insert({
      thread_id: threadId,
      sender_id: profile.id,
      recipient_id: selectedTeacher,
      content: composeMessage.trim(),
    })
    if (!error) {
      setShowCompose(false)
      setSelectedTeacher('')
      setComposeMessage('')
      await loadThreads()
    }
    setSending(false)
  }

  if (loading) return <PageSpinner />

  return (
    <div className="flex h-[calc(100vh-9rem)] -mx-5 lg:-mx-8 -my-7 overflow-hidden rounded-card"
      style={{ border: '1px solid var(--hairline)' }}
    >
      {/* ── Left panel — thread list ── */}
      <div
        className="w-80 flex flex-col flex-shrink-0"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--hairline)',
        }}
      >
        {/* Panel header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--surface)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="icon-chip icon-chip-periwinkle"
              style={{ width: 36, height: 36, flexShrink: 0 }}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-700 text-ink-900">
              {t('messages')}
            </h2>
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="w-9 h-9 flex items-center justify-center rounded-pill transition-all active:translate-y-px hover:opacity-90"
            style={{
              background: 'var(--brand-500)',
              color: '#fff',
              boxShadow: '0 1px 2px rgba(20,22,40,.08)',
            }}
            aria-label={t('new_message')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6">
              <EmptyState
                pose="waving"
                mascotSize={80}
                title={t('no_messages')}
                description="Yeni mesaj başladın"
                actionLabel={t('new_message')}
                onAction={() => setShowCompose(true)}
                className="border-0 shadow-none bg-transparent p-4"
              />
            </div>
          ) : (
            threads.map(thread => {
              const other = profiles[thread.otherId]
              const isActive = activeThread?.threadId === thread.threadId
              return (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread)}
                  className="w-full text-left px-4 py-3.5 transition-colors hover:bg-brand-50 focus-visible:bg-brand-50"
                  style={{
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    borderBottom: '1px solid var(--hairline)',
                    borderLeft: isActive ? '3px solid var(--brand-500)' : '3px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                      {thread.unread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-pill border-2 border-surface"
                          style={{ background: 'var(--brand-500)' }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm truncate text-ink-900"
                        style={{ fontWeight: thread.unread ? 700 : 600 }}
                      >
                        {other?.full_name || t('teacher')}
                      </p>
                      <p className="text-xs truncate text-ink-400 mt-0.5">
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

      {/* ── Right panel — chat area ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--canvas)' }}>
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              pose="waving"
              mascotSize={96}
              title={t('select_chat')}
              description={t('select_chat_desc')}
              className="max-w-sm border-0 shadow-none bg-transparent"
            />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--hairline)',
              }}
            >
              <Avatar
                name={profiles[activeThread.otherId]?.full_name}
                color={profiles[activeThread.otherId]?.avatar_color}
                size="sm"
              />
              <div>
                <p className="text-sm font-600 text-ink-900">
                  {profiles[activeThread.otherId]?.full_name}
                </p>
                <p className="text-[11px] text-ink-400">{t('teacher')}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {threadMessages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    {!isMe && (
                      <Avatar
                        name={profiles[activeThread.otherId]?.full_name}
                        color={profiles[activeThread.otherId]?.avatar_color}
                        size="xs"
                        className="mr-2 mt-1 flex-shrink-0 self-end"
                      />
                    )}
                    <div
                      className="max-w-[68%] px-4 py-2.5 text-sm leading-relaxed"
                      style={
                        isMe
                          ? {
                              background: 'var(--brand-500)',
                              color: '#fff',
                              borderRadius: '14px 14px 4px 14px',
                            }
                          : {
                              background: 'var(--surface-2)',
                              border: '1px solid var(--hairline)',
                              color: 'var(--ink-900)',
                              borderRadius: '14px 14px 14px 4px',
                            }
                      }
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
              className="px-5 py-4 flex gap-3 items-center"
              style={{
                background: 'var(--surface)',
                borderTop: '1px solid var(--hairline)',
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t('type_message')}
                className="pastel-input flex-1 rounded-pill"
                style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="rounded-pill w-11 h-11 flex items-center justify-center transition-all active:translate-y-px disabled:opacity-40"
                style={{
                  background: input.trim() ? 'var(--brand-500)' : 'var(--hairline-strong)',
                  color: input.trim() ? '#fff' : 'var(--ink-400)',
                  boxShadow: input.trim() ? '0 1px 2px rgba(20,22,40,.08)' : 'none',
                  flexShrink: 0,
                  transition: 'all 120ms ease',
                }}
                aria-label={t('send') || 'Göndər'}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Compose modal ── */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title={t('new_message')}>
        <div className="space-y-4">
          <Select
            label={t('teacher')}
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            <option value="">{t('teacher')}...</option>
            {teachers.map(tc => (
              <option key={tc.id} value={tc.id}>{tc.full_name}</option>
            ))}
          </Select>

          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">
              {t('new_message')}
            </label>
            <textarea
              rows={4}
              value={composeMessage}
              onChange={e => setComposeMessage(e.target.value)}
              placeholder={t('type_message')}
              className="pastel-input w-full resize-none"
              style={{ borderRadius: '10px', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={() => setShowCompose(false)}>{t('cancel')}</Button>
            <Button onClick={handleCompose} loading={sending} disabled={!selectedTeacher || !composeMessage.trim()}>
              Göndər
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
