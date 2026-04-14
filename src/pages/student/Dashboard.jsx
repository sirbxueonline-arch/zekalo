import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Flame, BookOpen, Calendar, ClipboardList, Sparkles, ArrowRight } from 'lucide-react'

export default function StudentDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [grades, setGrades] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({ pct: 0, total: 0 })
  const [assignments, setAssignments] = useState([])
  const [avgGrade, setAvgGrade] = useState(0)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id)
      const classIds = (memberData || []).map(c => c.class_id)

      const [gradesRes, attRes, assignRes] = await Promise.all([
        supabase.from('grades').select('*, subject:subjects(name)').eq('student_id', profile.id).order('date', { ascending: false }).limit(5),
        supabase.from('attendance').select('status').eq('student_id', profile.id),
        classIds.length
          ? supabase.from('assignments').select('*, subject:subjects(name)').in('class_id', classIds).gte('due_date', new Date().toISOString()).order('due_date').limit(3)
          : { data: [] },
      ])

      setGrades(gradesRes.data || [])
      const att = attRes.data || []
      const present = att.filter(a => a.status === 'present').length
      setAttendanceStats({ pct: att.length ? Math.round((present / att.length) * 100) : 0, total: att.length })
      setAssignments(assignRes.data || [])

      if (gradesRes.data?.length) {
        const avg = gradesRes.data.reduce((sum, g) => {
          const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
          return sum + (normalized || 0)
        }, 0) / gradesRes.data.length
        setAvgGrade(Math.round(avg * 10) / 10)
      }
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">
          {t('greeting')}, {profile?.full_name?.split(' ')[0]}!
        </h1>
      </div>

      {profile?.streak_count > 0 && (
        <div className="flex items-center gap-3 bg-white border border-border-soft rounded-xl px-6 py-4">
          <Flame className="w-6 h-6 text-amber-500" />
          <span className="text-sm font-medium text-gray-900">{profile.streak_count} {t('streak')}</span>
          <div className="flex-1 bg-border-soft rounded-full h-2 ml-4">
            <div
              className="bg-purple rounded-full h-2 transition-all"
              style={{ width: `${Math.min((profile.streak_count / 5) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={t('avg_grade')} value={avgGrade.toString().replace('.', ',')} icon={BookOpen} />
        <StatCard label={t('attendance_pct')} value={`${attendanceStats.pct}%`} icon={Calendar} />
        <StatCard label={t('pending_assignments')} value={assignments.length} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('pending_assignments')}</h2>
            <button onClick={() => navigate('/tapshiriqlar')} className="text-xs text-purple hover:text-purple-dark">
              {t('view_all')} <ArrowRight className="w-3 h-3 inline" />
            </button>
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400">{t('no_assignments')}</p>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                  <div>
                    <Badge variant="default">{a.subject?.name}</Badge>
                    <p className="text-sm text-gray-900 mt-1">{a.title}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('recent_grades')}</h2>
            <button onClick={() => navigate('/qiymetler')} className="text-xs text-purple hover:text-purple-dark">
              {t('view_all')} <ArrowRight className="w-3 h-3 inline" />
            </button>
          </div>
          {grades.length === 0 ? (
            <p className="text-sm text-gray-400">{t('no_grades')}</p>
          ) : (
            <div className="space-y-3">
              {grades.map(g => (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                  <div>
                    <p className="text-sm text-gray-900">{g.subject?.name}</p>
                    <p className="text-xs text-gray-500">{g.assessment_title}</p>
                  </div>
                  <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card hover={false} className="cursor-pointer" onClick={() => navigate('/zeka')}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-light rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{t('learn_with_zeka')}</h3>
            <p className="text-xs text-gray-500">{t('ask_zeka')}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>
    </div>
  )
}
