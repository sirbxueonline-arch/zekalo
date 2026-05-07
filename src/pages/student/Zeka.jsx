import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { streamZekaResponse, buildStudentSystemPrompt } from '../../lib/zeka'
import Avatar from '../../components/ui/Avatar'
import Markdown from '../../components/ui/Markdown'
import { Sparkles, Send, Plus, ClipboardList } from 'lucide-react'

const subjectChips = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Ədəbiyyat', 'İngilis dili', 'Coğrafiya']

const GLASS_PANEL = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
  backdropFilter: 'blur(24px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
}

function ChipButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="transition-all whitespace-nowrap"
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: active
          ? 'linear-gradient(135deg, rgba(124,110,224,0.18) 0%, rgba(93,184,163,0.18) 100%)'
          : 'rgba(255,255,255,0.55)',
        border: active ? '1px solid rgba(124,110,224,0.5)' : '1px solid rgba(124,110,224,0.18)',
        color: active ? '#5448a8' : '#475569',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export default function StudentZeka() {
  const { profile, t } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [language] = useState(profile?.language || 'az')
  const [streaming, setStreaming] = useState(false)
  const [assignments, setAssignments] = useState([])
  const messagesEndRef = useRef(null)
  const activeConvRef = useRef(null)

  useEffect(() => {
    if (!profile) return

    supabase
      .from('zeka_conversations')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setConversations(data || []))

    async function loadAssignments() {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id)
      const classIds = (memberData || []).map(c => c.class_id)
      if (!classIds.length) return

      const { data } = await supabase
        .from('assignments')
        .select('*, subject:subjects(name)')
        .in('class_id', classIds)
        .order('due_date', { ascending: true })
        .limit(50)
      setAssignments(data || [])
    }
    loadAssignments()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function selectConversation(conv) {
    setActiveConv(conv)
    activeConvRef.current = conv
    setMessages(conv.messages || [])
    setSubject(conv.subject || '')
  }

  function startNewConversation() {
    setActiveConv(null)
    activeConvRef.current = null
    setMessages([])
    setSubject('')
    setInput('')
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    if (!activeConvRef.current) {
      const title = subject || userMsg.content.slice(0, 40)
      const { data } = await supabase.from('zeka_conversations').insert({
        user_id: profile.id,
        subject: title,
        language,
        messages: newMessages,
      }).select().single()
      if (data) {
        activeConvRef.current = data
        setActiveConv(data)
        setConversations(prev => [data, ...prev])
      }
    }

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMsg])

    try {
      const systemPrompt = buildStudentSystemPrompt(profile, subject, language, assignments)
      const fullContent = await streamZekaResponse({
        messages: newMessages,
        systemPrompt,
        onChunk: (text) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: text }
            return updated
          })
        },
      })

      const finalMessages = [...newMessages, { role: 'assistant', content: fullContent }]
      setMessages(finalMessages)

      if (activeConvRef.current) {
        await supabase.from('zeka_conversations').update({
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        }).eq('id', activeConvRef.current.id)
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: t('error') }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden" style={{ background: 'transparent' }}>

      {/* ── Sidebar ── */}
      <div
        className="w-64 flex flex-col flex-shrink-0"
        style={{
          ...GLASS_PANEL,
          borderRight: '1px solid rgba(124,110,224,0.12)',
        }}
      >
        <div
          className="p-3"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 transition-all"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: 'rgba(255,255,255,0.55)',
              color: '#5448a8',
              border: '1px solid rgba(124,110,224,0.30)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.10)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)' }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_chat')}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-center px-3 py-6" style={{ color: '#94a3b8' }}>
              Hələ söhbət yoxdur
            </p>
          ) : conversations.map(c => {
            const active = activeConv?.id === c.id
            return (
              <button
                key={c.id}
                onClick={() => selectConversation(c)}
                className="w-full text-left transition-all truncate block"
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  background: active ? 'rgba(124,110,224,0.14)' : 'transparent',
                  color: active ? '#5448a8' : '#475569',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(124,110,224,0.06)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {c.subject || c.messages?.[0]?.content?.slice(0, 30) || 'Söhbət'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main chat ── */}
      <div className="flex-1 flex flex-col min-h-0" style={{ background: 'transparent' }}>
        {/* Subject chips */}
        <div
          className="flex items-center gap-2 px-6 py-3 overflow-x-auto flex-shrink-0"
          style={{
            ...GLASS_PANEL,
            borderBottom: '1px solid rgba(124,110,224,0.10)',
          }}
        >
          <div className="flex gap-2 flex-shrink-0">
            {subjectChips.map(s => (
              <ChipButton
                key={s}
                active={subject === s}
                onClick={() => setSubject(subject === s ? '' : s)}
              >
                {s}
              </ChipButton>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: 72, height: 72, borderRadius: 22,
                  background: 'linear-gradient(135deg, rgba(124,110,224,0.20) 0%, rgba(93,184,163,0.20) 100%)',
                  border: '1px solid rgba(124,110,224,0.28)',
                  boxShadow: '0 8px 24px rgba(124,110,224,0.18)',
                }}
              >
                <Sparkles className="w-9 h-9" style={{ color: '#7c6ee0' }} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 8, letterSpacing: '-0.02em' }}>
                <span className="pastel-text">{t('zeka_greeting')}</span>
              </h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>{t('what_to_learn')}</p>

              {assignments.length > 0 && (
                <div className="w-full max-w-lg mb-6">
                  <p
                    className="mb-3 text-center"
                    style={{ fontSize: 11, fontWeight: 700, color: '#7c6ee0', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    {t('active_assignments')}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {assignments.slice(0, 6).map(a => (
                      <button
                        key={a.id}
                        onClick={() => setInput(`"${a.title}" ${t('help_with')}`)}
                        className="flex items-center gap-2 transition-all"
                        style={{
                          padding: '7px 14px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(93,184,163,0.10)',
                          color: '#2f7a64',
                          border: '1px solid rgba(93,184,163,0.30)',
                          backdropFilter: 'blur(12px)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(93,184,163,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(93,184,163,0.10)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <ClipboardList className="w-3 h-3" />
                        {a.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 36, height: 36, borderRadius: 999,
                        background: 'linear-gradient(135deg, rgba(124,110,224,0.20) 0%, rgba(93,184,163,0.20) 100%)',
                        border: '1px solid rgba(124,110,224,0.25)',
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    </div>
                  )}
                  <div
                    className="max-w-[70%] text-sm"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 18,
                      lineHeight: 1.55,
                      ...(isUser
                        ? {
                            background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                            color: '#fff',
                            whiteSpace: 'pre-wrap',
                            boxShadow: '0 6px 18px rgba(124,110,224,0.22)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.78)',
                            color: '#1a1a2e',
                            border: '1px solid rgba(124,110,224,0.16)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            boxShadow: '0 2px 8px rgba(140,120,200,0.08)',
                          }),
                      wordBreak: 'break-word',
                    }}
                  >
                    {!isUser ? (
                      <>
                        <Markdown>{msg.content}</Markdown>
                        {!msg.content && streaming && (
                          <span
                            className="inline-block animate-pulse"
                            style={{ width: 8, height: 16, background: '#7c6ee0', borderRadius: 2 }}
                          />
                        )}
                      </>
                    ) : msg.content}
                  </div>
                  {isUser && (
                    <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="px-6 py-3 flex-shrink-0"
          style={{
            ...GLASS_PANEL,
            borderTop: '1px solid rgba(124,110,224,0.10)',
          }}
        >
          <div className="flex items-center gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ask_question')}
              rows={1}
              className="pastel-input flex-1"
              style={{ resize: 'none', minHeight: 44, maxHeight: 120 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="flex items-center justify-center transition-all flex-shrink-0"
              style={{
                width: 44, height: 44, borderRadius: 999,
                background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 6px 16px rgba(124,110,224,0.28)',
                opacity: (!input.trim() || streaming) ? 0.5 : 1,
                cursor: (!input.trim() || streaming) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (input.trim() && !streaming) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
