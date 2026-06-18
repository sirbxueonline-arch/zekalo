import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { streamZekaResponse, buildStudentSystemPrompt } from '../../lib/zeka'
import Avatar from '../../components/ui/Avatar'
import Markdown from '../../components/ui/Markdown'
import Mascot from '../../components/ui/Mascot'
import { Sparkles, Send, Plus, ClipboardList, MessageSquare } from 'lucide-react'

const subjectChips = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Ədəbiyyat', 'İngilis dili', 'Coğrafiya']

// Subject pill filter — active = solid brand fill, inactive = ghost
function ChipButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="transition-all whitespace-nowrap"
      style={{
        padding: '6px 16px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        background: active ? 'var(--brand-500)' : 'var(--surface)',
        border: active ? '1px solid var(--brand-500)' : '1px solid var(--hairline-strong)',
        color: active ? '#fff' : 'var(--ink-600)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// Typing cursor pulse for streaming state
function TypingCursor() {
  return (
    <span
      className="inline-block align-middle ml-0.5 animate-pulse"
      style={{
        width: 8,
        height: 16,
        background: 'var(--brand-400)',
        borderRadius: 2,
        verticalAlign: 'middle',
      }}
    />
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
    <div
      className="flex -m-8 overflow-hidden"
      style={{ height: 'calc(100vh - 4rem)', background: 'var(--canvas)' }}
    >
      {/* ── Sidebar ── */}
      <div
        className="w-64 flex flex-col flex-shrink-0"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--hairline)',
        }}
      >
        {/* Sidebar header — brand gradient mark */}
        <div
          className="p-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'var(--brand-500)',
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold leading-none" style={{ fontSize: 15, color: 'var(--ink-900)' }}>
              Zeka AI
            </p>
            <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--ink-400)' }}>
              Şəxsi köməkçin
            </p>
          </div>
        </div>

        {/* New chat button — 3D press */}
        <div className="p-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 btn-3d"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_chat')}</span>
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <MessageSquare className="w-7 h-7" style={{ color: 'var(--hairline-strong)' }} />
              <p className="text-xs" style={{ color: 'var(--ink-400)' }}>
                Hələ söhbət yoxdur
              </p>
            </div>
          ) : conversations.map(c => {
            const active = activeConv?.id === c.id
            return (
              <button
                key={c.id}
                onClick={() => selectConversation(c)}
                className="w-full text-left transition-all truncate block"
                style={{
                  padding: '9px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  background: active ? 'var(--brand-50)' : 'transparent',
                  color: active ? 'var(--brand-600)' : 'var(--ink-700)',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  borderLeft: active ? '3px solid var(--brand-500)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--brand-50)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {c.subject || c.messages?.[0]?.content?.slice(0, 30) || 'Söhbət'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div
        className="flex-1 flex flex-col min-h-0"
        style={{ background: 'var(--canvas)' }}
      >
        {/* Subject filter chips bar */}
        <div
          className="flex items-center gap-2 px-6 py-3 overflow-x-auto flex-shrink-0"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--hairline)',
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

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 ? (
            /* ── Welcome / empty state ── */
            <div className="flex flex-col items-center justify-center h-full pb-8 text-center">
              <Mascot pose="waving" size={140} bob />

              <h2
                className="font-display mt-5"
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--ink-900)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                {t('zeka_greeting')}
              </h2>
              <p
                className="mt-2 text-sm max-w-xs"
                style={{ color: 'var(--ink-400)', lineHeight: 1.65 }}
              >
                {t('what_to_learn')}
              </p>

              {/* Active assignment quick-starts */}
              {assignments.length > 0 && (
                <div className="w-full max-w-lg mt-8">
                  <p
                    className="mb-3 text-center uppercase tracking-wider"
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-400)' }}
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
                          padding: '8px 16px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'var(--brand-50)',
                          color: 'var(--brand-600)',
                          border: '1px solid var(--brand-200)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--brand-100)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--brand-50)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
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
              const isLastAssistant = !isUser && i === messages.length - 1
              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Zeka avatar — gradient orb */}
                  {!isUser && (
                    <div
                      className="flex items-center justify-center flex-shrink-0 self-end"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: 'var(--brand-500)',
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="max-w-[72%] text-sm"
                    style={{
                      padding: '12px 16px',
                      borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                      lineHeight: 1.65,
                      wordBreak: 'break-word',
                      ...(isUser
                        ? {
                            background: 'var(--brand-500)',
                            color: '#fff',
                            whiteSpace: 'pre-wrap',
                          }
                        : {
                            background: 'var(--surface)',
                            color: 'var(--ink-900)',
                            border: '1px solid var(--hairline)',
                          }),
                    }}
                  >
                    {!isUser ? (
                      <>
                        <Markdown>{msg.content}</Markdown>
                        {!msg.content && isLastAssistant && streaming && <TypingCursor />}
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className="self-end flex-shrink-0">
                      <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div
          className="px-6 py-4 flex-shrink-0"
          style={{
            background: 'var(--surface)',
            borderTop: '1px solid var(--hairline)',
          }}
        >
          <div className="flex items-end gap-3">
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
              aria-label="Göndər"
              className="flex items-center justify-center transition-all flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 9999,
                background: 'var(--brand-500)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 1px 2px rgba(20,22,40,.08)',
                opacity: !input.trim() || streaming ? 0.45 : 1,
                cursor: !input.trim() || streaming ? 'not-allowed' : 'pointer',
                transition: 'all .15s ease',
              }}
              onMouseEnter={e => {
                if (input.trim() && !streaming) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--ink-400)' }}>
            Enter ilə göndər · Shift+Enter yeni sətir
          </p>
        </div>
      </div>
    </div>
  )
}
