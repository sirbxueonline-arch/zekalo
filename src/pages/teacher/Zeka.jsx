import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { streamZekaResponse } from '../../lib/zeka'
import { Sparkles, FileText, MessageSquare, Copy, Check } from 'lucide-react'

const modes = [
  { key: 'report', label: 'Hesabat yaz', icon: FileText },
  { key: 'essay', label: 'Esse rəyi', icon: MessageSquare },
]

const subjectChips = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Ədəbiyyat', 'İngilis dili', 'Coğrafiya']

const ibCriteria = [
  { key: 'A', label: 'Kriteriya A' },
  { key: 'B', label: 'Kriteriya B' },
  { key: 'C', label: 'Kriteriya C' },
  { key: 'D', label: 'Kriteriya D' },
]

export default function TeacherZeka() {
  const { profile, t } = useAuth()
  const [mode, setMode] = useState('report')
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const [essayText, setEssayText] = useState('')
  const [essaySubject, setEssaySubject] = useState('')
  const [essayCriteria, setEssayCriteria] = useState([])
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!profile) return
    loadStudents()
  }, [profile])

  async function loadStudents() {
    const { data: tcData } = await supabase
      .from('teacher_classes')
      .select('class_id')
      .eq('teacher_id', profile.id)

    const classIds = (tcData || []).map(tc => tc.class_id)
    if (!classIds.length) { setLoading(false); return }

    const { data: membersData } = await supabase
      .from('class_members')
      .select('*, student:profiles(id, full_name), class:classes(name)')
      .in('class_id', classIds)

    const studentList = (membersData || []).map(m => ({
      id: m.student?.id,
      full_name: m.student?.full_name,
      class_name: m.class?.name,
    })).filter(s => s.id)

    setStudents(studentList)
    if (studentList.length) setSelectedStudent(studentList[0].id)
    setLoading(false)
  }

  async function generateReport() {
    if (!selectedStudent) return
    setGenerating(true)
    setOutput('')

    try {
      const student = students.find(s => s.id === selectedStudent)
      const systemPrompt = `Sənin adın Zəka. Sən müəllim köməkçisisən. Azərbaycan dilində hesabat yaz. Peşəkar, konstruktiv və həvəsləndirici ol.`
      await streamZekaResponse({
        messages: [{ role: 'user', content: `${student.full_name} adlı şagird üçün hesabat yaz. Sinif: ${student.class_name}. Müəllim: ${profile.full_name}.` }],
        systemPrompt,
        onChunk: (text) => setOutput(text),
      })
    } catch {
      setOutput(t('error'))
    } finally {
      setGenerating(false)
    }
  }

  async function generateEssayFeedback() {
    if (!essayText.trim()) return
    setGenerating(true)
    setFeedback('')

    try {
      const criteriaInfo = profile?.edition === 'ib' ? ` IB kriteriyası: ${essayCriteria}.` : ''
      const systemPrompt = `Sənin adın Zəka. Sən müəllim köməkçisisən. Esse rəyi yaz. Fənn: ${essaySubject}.${criteriaInfo} Azərbaycan dilində, konstruktiv, ətraflı rəy ver.`
      await streamZekaResponse({
        messages: [{ role: 'user', content: `Bu esseyə rəy ver:\n\n${essayText}` }],
        systemPrompt,
        onChunk: (text) => setFeedback(text),
      })
    } catch {
      setFeedback(t('error'))
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleCriterion(key) {
    setEssayCriteria(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="pastel-skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">{t('zeka_ai')}</span>
        </h1>
        <div className="pastel-tabs">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={mode === m.key ? 'pastel-tab active' : 'pastel-tab'}
            >
              <m.icon className="w-3.5 h-3.5 inline mr-1.5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="liquid-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32, borderRadius: 10 }}>
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>{t('reports')}</h2>
            </div>
            <div className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Hələ şagird tapılmadı</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('full_name')}</label>
                    <select className="pastel-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={generateReport}
                    disabled={generating || !selectedStudent}
                    className="btn-pastel"
                    style={{ padding: '12px 22px', fontSize: 13, opacity: (generating || !selectedStudent) ? 0.5 : 1 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Yaradılır...' : t('reports')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>Nəticə</h2>
              {output && (
                <button
                  onClick={() => handleCopy(output)}
                  className="flex items-center gap-1 text-xs font-semibold smooth-trans hover:opacity-70"
                  style={{ color: '#7c6ee0' }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              )}
            </div>
            {output ? (
              <textarea
                value={output}
                onChange={e => setOutput(e.target.value)}
                rows={16}
                className="pastel-input"
                style={{ resize: 'none' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="icon-chip icon-chip-mint mb-3" style={{ width: 56, height: 56 }}>
                  <Sparkles className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Zəka köməkçiniz</p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Hesabat burada görünəcək</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="liquid-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="icon-chip icon-chip-mint" style={{ width: 32, height: 32, borderRadius: 10 }}>
                <MessageSquare className="w-4 h-4" />
              </span>
              <h2 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>{t('teacher_feedback')}</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('your_answer')}</label>
              <textarea
                rows={10}
                className="pastel-input"
                value={essayText}
                onChange={e => setEssayText(e.target.value)}
                placeholder={t('your_answer')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('subject')}</p>
                <div className="flex flex-wrap gap-2">
                  {subjectChips.map(s => (
                    <button
                      key={s}
                      onClick={() => setEssaySubject(s)}
                      className={essaySubject === s ? 'pastel-tab active' : 'pastel-tab'}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {profile?.edition === 'ib' && (
                <div>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>IB Kriteriyaları</p>
                  <div className="flex gap-2 flex-wrap">
                    {ibCriteria.map(c => (
                      <button
                        key={c.key}
                        onClick={() => toggleCriterion(c.key)}
                        className={essayCriteria.includes(c.key) ? 'pastel-tab active' : 'pastel-tab'}
                        style={{ padding: '6px 14px', fontSize: 12 }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={generateEssayFeedback}
                disabled={generating || !essayText.trim()}
                className="btn-pastel"
                style={{ padding: '12px 22px', fontSize: 13, opacity: (generating || !essayText.trim()) ? 0.5 : 1 }}
              >
                <Sparkles className="w-4 h-4" /> {generating ? 'Yaradılır...' : 'Rəy yarat'}
              </button>
            </div>
          </div>

          {feedback && (
            <div className="liquid-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>AI Rəyi</h2>
                <button
                  onClick={() => handleCopy(feedback)}
                  className="flex items-center gap-1 text-xs font-semibold smooth-trans hover:opacity-70"
                  style={{ color: '#7c6ee0' }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
              <div className="text-sm whitespace-pre-wrap" style={{ color: '#1a1a2e', lineHeight: 1.6 }}>
                {feedback}
                {generating && <span className="inline-block w-2 h-4 rounded-sm ml-1" style={{ background: '#7c6ee0', animation: 'pastel-pulse 1s infinite' }} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
