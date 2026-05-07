import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtime } from '../../hooks/useRealtime'
import Avatar from '../../components/ui/Avatar'
import { MessageSquare, Send, Plus, Users, Search, X } from 'lucide-react'

export default function TeacherMessages() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [input, setInput] = useState('')
  const [profiles, setProfiles] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  const [showCompose, setShowCompose] = useState(false)
  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [sending, setSending] = useState(false)

  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [announcementClass, setAnnouncementClass] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadAll()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  async function loadAll() {
    await Promise.all([loadThreads(), loadParents(), loadClasses()])
    setLoading(false)
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

    const otherIds = [...new Set(threadList.map(th => th.otherId))]
    if (otherIds.length) {
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_color, role').in('id', otherIds)
      const map = {}
      ;(profilesData || []).forEach(p => { map[p.id] = p })
      setProfiles(map)
    }

    setThreads(threadList)
  }

  async function loadParents() {
    const { data: tcData } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', profile.id)

    const classIds = (tcData || []).map(tc => tc.class_id)
    if (!classIds.length) return

    const { data: membersData } = await supabase
      .from('class_members')
      .select('student_id')
      .in('class_id', classIds)

    const studentIds = [...new Set((membersData || []).map(m => m.student_id))]
    if (!studentIds.length) return

    const { data: pcData } = await supabase
      .from('parent_children')
      .select('parent_id, parent:profiles!parent_children_parent_id_fkey(id, full_name, avatar_color)')
      .in('child_id', studentIds)

    const uniqueParents = [...new Map((pcData || []).map(pc => [pc.parent_id, pc.parent])).values()].filter(Boolean)
    setParents(uniqueParents)
  }

  async function loadClasses() {
    const { data } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name)')
      .eq('teacher_id', profile.id)

    const unique = [...new Map((data || []).map(tc => [tc.class_id, tc.class])).values()]
    setTeacherClasses(unique)
    if (unique.length) setAnnouncementClass(unique[0].id)
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
    if (!selectedParent || !composeMessage.trim()) return
    setSending(true)
    const threadId = crypto.randomUUID()
    await supabase.from('messages').insert({
      thread_id: threadId,
      sender_id: profile.id,
      recipient_id: selectedParent,
      content: composeMessage.trim(),
    })
    setShowCompose(false)
    setComposeMessage('')
    setSelectedParent('')
    setSending(false)
    loadThreads()
  }

  async function handleAnnouncement() {
    if (!announcementClass || !announcementMessage.trim()) return
    setSending(true)

    const { data: membersData } = await supabase
      .from('class_members')
      .select('student_id')
      .eq('class_id', announcementClass)

    const studentIds = (membersData || []).map(m => m.student_id)

    const { data: pcData } = await supabase
      .from('parent_children')
      .select('parent_id')
      .in('child_id', studentIds)

    const parentIds = [...new Set((pcData || []).map(pc => pc.parent_id))]

    const inserts = parentIds.map(pid => ({
      thread_id: crypto.randomUUID(),
      sender_id: profile.id,
      recipient_id: pid,
      content: announcementMessage.trim(),
    }))

    if (inserts.length) {
      await supabase.from('messages').insert(inserts)
    }

    setShowAnnouncement(false)
    setAnnouncementMessage('')
    setSending(false)
    loadThreads()
  }

  const filteredThreads = threads.filter(th => {
    if (!searchQuery) return true
    const other = profiles[th.otherId]
    return other?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pastel-skeleton h-96" />
          <div className="pastel-skeleton h-96 md:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="liquid-card overflow-hidden flex" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Left panel */}
      <div className="w-80 flex flex-col flex-shrink-0" style={{ borderRight: '1px solid rgba(124,110,224,0.12)' }}>
        <div className="px-4 py-4 space-y-3" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
          <div className="flex gap-2">
            <button onClick={() => setShowCompose(true)} className="btn-pastel flex-1" style={{ padding: '8px 14px', fontSize: 12 }}>
              <Plus className="w-4 h-4" /> {t('new_message')}
            </button>
            <button onClick={() => setShowAnnouncement(true)} className="btn-ghost-pastel" style={{ padding: '8px 12px', fontSize: 12 }}>
              <Users className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              placeholder={t('search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pastel-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
              <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48 }}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{t('no_messages')}</p>
            </div>
          ) : (
            filteredThreads.map(thread => {
              const other = profiles[thread.otherId]
              const isActive = activeThread?.threadId === thread.threadId
              return (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread)}
                  className="w-full text-left px-4 py-3 smooth-trans"
                  style={{
                    background: isActive ? 'rgba(124,110,224,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(124,110,224,0.06)',
                    borderLeft: isActive ? '3px solid #7c6ee0' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(124,110,224,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.full_name} color={other?.avatar_color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate" style={{ fontWeight: thread.unread ? 700 : 500, color: '#1a1a2e' }}>
                          {other?.full_name || 'İstifadəçi'}
                        </p>
                        {thread.unread && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7c6ee0' }} />}
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
      <div className="flex-1 flex flex-col min-w-0">
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 64, height: 64 }}>
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>{t('select_chat')}</p>
            <p className="text-sm max-w-sm" style={{ color: '#94a3b8' }}>{t('select_chat_desc')}</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
              <Avatar name={profiles[activeThread.otherId]?.full_name} color={profiles[activeThread.otherId]?.avatar_color} size="sm" />
              <div>
                <span className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{profiles[activeThread.otherId]?.full_name}</span>
                {profiles[activeThread.otherId]?.role && (
                  <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>
                    {profiles[activeThread.otherId].role === 'parent' ? 'Valideyn' : profiles[activeThread.otherId].role}
                  </p>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {threadMessages.map(msg => {
                const isMe = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : ''}`}>
                    <div
                      className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm"
                      style={{
                        background: isMe
                          ? 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)'
                          : 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(10px)',
                        color: isMe ? '#fff' : '#1a1a2e',
                        border: isMe ? 'none' : '1px solid rgba(124,110,224,0.12)',
                        boxShadow: isMe ? '0 4px 12px rgba(124,110,224,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(124,110,224,0.12)' }}>
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
                className="btn-pastel"
                style={{ padding: '0 18px', opacity: !input.trim() ? 0.5 : 1 }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="liquid-backdrop" onClick={() => setShowCompose(false)}>
          <div className="liquid-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('new_message')}</h3>
              <button onClick={() => setShowCompose(false)} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('messages')}</label>
                <select className="pastel-input" value={selectedParent} onChange={e => setSelectedParent(e.target.value)}>
                  <option value="">{t('search')}</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('messages')}</label>
                <textarea
                  className="pastel-input"
                  rows={4}
                  value={composeMessage}
                  onChange={e => setComposeMessage(e.target.value)}
                  placeholder={t('type_message')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCompose(false)} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
                <button
                  onClick={handleCompose}
                  disabled={sending || !selectedParent || !composeMessage.trim()}
                  className="btn-pastel"
                  style={{ padding: '10px 22px', fontSize: 13, opacity: (sending || !selectedParent || !composeMessage.trim()) ? 0.5 : 1 }}
                >
                  {sending ? '...' : t('submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncement && (
        <div className="liquid-backdrop" onClick={() => setShowAnnouncement(false)}>
          <div className="liquid-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('send_to_all_parents')}</h3>
              <button onClick={() => setShowAnnouncement(false)} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('class_name')}</label>
                <select className="pastel-input" value={announcementClass} onChange={e => setAnnouncementClass(e.target.value)}>
                  {teacherClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('messages')}</label>
                <textarea
                  className="pastel-input"
                  rows={4}
                  value={announcementMessage}
                  onChange={e => setAnnouncementMessage(e.target.value)}
                  placeholder={t('type_message')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowAnnouncement(false)} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
                <button
                  onClick={handleAnnouncement}
                  disabled={sending || !announcementMessage.trim()}
                  className="btn-pastel"
                  style={{ padding: '10px 22px', fontSize: 13, opacity: (sending || !announcementMessage.trim()) ? 0.5 : 1 }}
                >
                  {sending ? '...' : t('send_to_all_parents')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
