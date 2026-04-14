import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { streamZekaResponse } from '../../lib/zeka'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import { Sparkles, FileText, MessageSquare, Copy, Check, Loader2 } from 'lucide-react'

const modes = [
  { key: 'report', label: 'Hesabat yaz', icon: FileText },
  { key: 'essay', label: 'Esse rəyi', icon: MessageSquare },
]

const subjectChips = ['Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix', 'Ədəbiyyat', 'Ingilis dili', 'Cografiya']

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

  // Essay mode state
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

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('zeka_ai')}</h1>
        <div className="flex gap-2 bg-surface rounded-lg p-1">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === m.key ? 'bg-white text-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card hover={false}>
            <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('reports')}</h2>
            <div className="space-y-4">
              <Select
                label={t('full_name')}
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>
                ))}
              </Select>
              <Button onClick={generateReport} loading={generating} disabled={!selectedStudent}>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('reports')}
              </Button>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest text-gray-400 uppercase">Nəticə</h2>
              {output && (
                <button
                  onClick={() => handleCopy(output)}
                  className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Kopyalandi' : 'Kopyala'}
                </button>
              )}
            </div>
            {output ? (
              <textarea
                value={output}
                onChange={e => setOutput(e.target.value)}
                rows={16}
                className="w-full border border-border-soft rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent resize-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Sparkles className="w-8 h-8 mb-2" />
                <p className="text-sm">Hesabat burada gorunəcək</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card hover={false}>
            <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('teacher_feedback')}</h2>
            <Textarea
              label={t('your_answer')}
              rows={10}
              value={essayText}
              onChange={e => setEssayText(e.target.value)}
              placeholder={t('your_answer')}
            />

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('subject')}</p>
                <div className="flex flex-wrap gap-2">
                  {subjectChips.map(s => (
                    <button
                      key={s}
                      onClick={() => setEssaySubject(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        essaySubject === s ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {profile?.edition === 'ib' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">IB Kriteriyalari</p>
                  <div className="flex gap-2">
                    {ibCriteria.map(c => (
                      <button
                        key={c.key}
                        onClick={() => toggleCriterion(c.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          essayCriteria.includes(c.key) ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={generateEssayFeedback} loading={generating} disabled={!essayText.trim()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Rəy yarat
              </Button>
            </div>
          </Card>

          {feedback && (
            <Card hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs tracking-widest text-gray-400 uppercase">AI Rəyi</h2>
                <button
                  onClick={() => handleCopy(feedback)}
                  className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Kopyalandi' : 'Kopyala'}
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {feedback}
                {generating && <span className="inline-block w-2 h-4 bg-purple animate-pulse rounded-sm ml-1" />}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
