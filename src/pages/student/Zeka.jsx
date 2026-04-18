import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { streamZekaResponse, buildStudentSystemPrompt } from '../../lib/zeka'
import Avatar from '../../components/ui/Avatar'
import Markdown from '../../components/ui/Markdown'
import { Sparkles, Send, Plus, ClipboardList } from 'lucide-react'

const subjectChips = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Ədəbiyyat', 'İngilis dili', 'Coğrafiya']

export default function StudentZeka() {
  const { profile, t } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [streaming, setStreaming] = useState(false)
  const [assignments, setAssignments] = useState([])
  const messagesEndRef = useRef(null)
  const activeConvRef = useRef(null)

  useEffect(() => {
    if (!profile) return

    // Load conversations
    supabase
      .from('zeka_conversations')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setConversations(data || []))

    // Load student's active assignments
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

    // If no active conversation, create one now
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

      // Save complete conversation
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
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden">
      <div className="w-64 bg-white border-r border-border-soft flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border-soft">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 border border-purple text-purple rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-purple-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_chat')}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate block ${
                activeConv?.id === c.id ? 'bg-purple-light text-purple font-medium' : 'text-gray-600 hover:bg-surface'
              }`}
            >
              {c.subject || c.messages?.[0]?.content?.slice(0, 30) || 'Söhbət'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border-soft overflow-x-auto flex-shrink-0">
          <div className="flex gap-2 flex-shrink-0">
            {subjectChips.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  subject === s ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-purple-light rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">{t('zeka_greeting')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('what_to_learn')}</p>

              {assignments.length > 0 && (
                <div className="w-full max-w-lg mb-6">
                  <p className="text-xs tracking-widest text-gray-400 uppercase mb-3 text-center">{t('active_assignments')}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {assignments.slice(0, 6).map(a => (
                      <button
                        key={a.id}
                        onClick={() => setInput(`"${a.title}" ${t('help_with')}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs border border-teal-mid text-teal bg-teal-light hover:bg-teal/10 transition-colors"
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
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-purple text-white whitespace-pre-wrap'
                    : 'bg-white border border-border-soft text-gray-900'
                }`}>
                  {msg.role === 'assistant' ? (
                    <>
                      <Markdown>{msg.content}</Markdown>
                      {!msg.content && streaming && (
                        <span className="inline-block w-2 h-4 bg-purple animate-pulse rounded-sm" />
                      )}
                    </>
                  ) : msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-3 border-t border-border-soft bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ask_question')}
              rows={1}
              className="flex-1 border border-border-soft rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent resize-none min-h-[40px] max-h-[120px]"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="bg-purple text-white rounded-xl w-10 h-10 flex items-center justify-center hover:bg-purple-dark transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
