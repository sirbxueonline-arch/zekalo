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
    <div className="flex h-[calc(100vh-9rem)] -mx-5 lg:-mx-8 -my-7 overflow-hidden">
      {/* Left panel */}
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
            <span className="pastel-text">{t('messages')}</span>
          </h2>
          <button
            onClick={() => setShowCompose(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(124,110,224,0.10)' }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: '#7c6ee0' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_messages')}</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Yeni mesaj başladın</p>
            </div>
          ) : (
            threads.map(thread => {
              const other = profiles[thread.otherId]
              const isActive = activeThread?.threadId === thread.threadId
              return (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread)}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    background: isActive ? 'rgba(124,110,224,0.10)' : 'transparent',
                    borderBottom: '1px solid rgba(124,110,224,0.08)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-sm truncate"
                          style={{
                            fontWeight: thread.unread ? 700 : 600,
                            color: '#1a1a2e',
                          }}
                        >
                          {other?.full_name || t('teacher')}
                        </p>
                        {thread.unread && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: '#7c6ee0' }}
                          />
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: '#64748b' }}>{thread.lastMessage.content}</p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="liquid-card p-10 text-center max-w-sm">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(124,110,224,0.12)' }}
              >
                <MessageSquare className="w-8 h-8" style={{ color: '#7c6ee0' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('select_chat')}</h3>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>{t('select_chat_desc')}</p>
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
                name={profiles[activeThread.otherId]?.full_name}
                color={profiles[activeThread.otherId]?.avatar_color}
                size="sm"
              />
              <span className="text-sm font-bold" style={{ color: '#1a1a2e' }}>
                {profiles[activeThread.otherId]?.full_name}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {threadMessages.map(msg => {
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
                borderTop: '1px solid rgba(124,110,224,0.15)',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t('type_message')}
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
                disabled={!input.trim()}
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a2e' }}>{t('new_message')}</label>
            <textarea
              rows={4}
              value={composeMessage}
              onChange={e => setComposeMessage(e.target.value)}
              placeholder={t('type_message')}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(124,110,224,0.25)',
                backdropFilter: 'blur(12px)',
                color: '#1a1a2e',
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
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
