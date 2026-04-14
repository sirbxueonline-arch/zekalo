import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useRealtime } from '../../hooks/useRealtime'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Select, Textarea } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { MessageSquare, Send, Plus, Users, Search } from 'lucide-react'

export default function TeacherMessages() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [input, setInput] = useState('')
  const [profiles, setProfiles] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  // Compose modal
  const [showCompose, setShowCompose] = useState(false)
  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Announcement modal
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

    // Get all parents of students in selected class
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

  if (loading) return <PageSpinner />

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden">
      <div className="w-80 bg-white border-r border-border-soft flex flex-col">
        <div className="p-4 border-b border-border-soft space-y-3">
          <div className="flex gap-2">
            <Button onClick={() => setShowCompose(true)} className="flex-1" variant="ghost">
              <span className="flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" />
                {t('new_message')}
              </span>
            </Button>
            <Button onClick={() => setShowAnnouncement(true)} variant="secondary">
              <Users className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder={t('search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-border-soft rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">{t('no_messages')}</div>
          ) : (
            filteredThreads.map(thread => {
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
                          {other?.full_name || 'Istifadeci'}
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
              <div>
                <span className="text-sm font-medium text-gray-900">{profiles[activeThread.otherId]?.full_name}</span>
                {profiles[activeThread.otherId]?.role && (
                  <p className="text-xs text-gray-400 capitalize">{profiles[activeThread.otherId].role === 'parent' ? 'Valideyn' : profiles[activeThread.otherId].role}</p>
                )}
              </div>
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

      <Modal open={showCompose} onClose={() => setShowCompose(false)} title={t('new_message')}>
        <div className="space-y-4">
          <Select label={t('messages')} value={selectedParent} onChange={e => setSelectedParent(e.target.value)}>
            <option value="">{t('search')}</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </Select>
          <Textarea
            label={t('messages')}
            rows={4}
            value={composeMessage}
            onChange={e => setComposeMessage(e.target.value)}
            placeholder={t('type_message')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCompose(false)}>{t('cancel')}</Button>
            <Button onClick={handleCompose} loading={sending} disabled={!selectedParent || !composeMessage.trim()}>{t('submit')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showAnnouncement} onClose={() => setShowAnnouncement(false)} title={t('send_to_all_parents')}>
        <div className="space-y-4">
          <Select label={t('class_name')} value={announcementClass} onChange={e => setAnnouncementClass(e.target.value)}>
            {teacherClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Textarea
            label={t('messages')}
            rows={4}
            value={announcementMessage}
            onChange={e => setAnnouncementMessage(e.target.value)}
            placeholder={t('type_message')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAnnouncement(false)}>{t('cancel')}</Button>
            <Button onClick={handleAnnouncement} loading={sending} disabled={!announcementMessage.trim()}>{t('send_to_all_parents')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
