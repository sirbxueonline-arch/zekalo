import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  Flame, BookOpen, Calendar, ClipboardList, Sparkles, ArrowRight,
  TrendingUp, TrendingDown,
} from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Sabahınız xeyir'
  if (h < 18) return 'Günortanız xeyir'
  return 'Axşamınız xeyir'
}

function todayLabel() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

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
    <div className="space-y-10">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight leading-tight">
          {greeting()}, {profile?.full_name?.split(' ')[0]}!
        </h1>
      </div>

      {/* ── Streak banner ────────────────────────────────────────────────── */}
      {profile?.streak_count > 0 && (
        <div className="flex items-center gap-4 bg-white border border-border-soft rounded-2xl px-7 py-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {profile.streak_count} {t('streak')}
            </p>
            <div className="w-full bg-border-soft rounded-full h-1.5 mt-2">
              <div
                className="bg-amber-400 rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min((profile.streak_count / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('avg_grade')}</span>
            <span className="w-9 h-9 rounded-xl bg-purple-light flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{avgGrade.toString().replace('.', ',')}</p>
            {avgGrade >= 7 ? (
              <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('attendance_pct')}</span>
            <span className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{attendanceStats.pct}%</p>
            {attendanceStats.pct >= 85 ? (
              <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('pending_assignments')}</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{assignments.length}</p>
        </div>
      </div>

      {/* ── Assignments + Grades ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending assignments */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900">{t('pending_assignments')}</h2>
            <button
              onClick={() => navigate('/tapshiriqlar')}
              className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark font-medium transition-colors"
            >
              {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 px-8 py-10">{t('no_assignments')}</p>
          ) : (
            <div className="divide-y divide-border-soft">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between px-8 py-4 hover:bg-surface/50 transition-colors">
                  <div>
                    <Badge variant="default">{a.subject?.name}</Badge>
                    <p className="text-sm font-medium text-gray-900 mt-1.5">{a.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {a.due_date
                      ? new Date(a.due_date).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent grades */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900">{t('recent_grades')}</h2>
            <button
              onClick={() => navigate('/qiymetler')}
              className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark font-medium transition-colors"
            >
              {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {grades.length === 0 ? (
            <p className="text-sm text-gray-400 px-8 py-10">{t('no_grades')}</p>
          ) : (
            <div className="divide-y divide-border-soft">
              {grades.map(g => (
                <div key={g.id} className="flex items-center justify-between px-8 py-4 hover:bg-surface/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.subject?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.assessment_title}</p>
                  </div>
                  <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Zeka AI promo ────────────────────────────────────────────────── */}
      <button
        className="w-full flex items-center gap-5 bg-white border border-border-soft rounded-2xl px-8 py-6 hover:border-purple/40 hover:shadow-sm transition-all group text-left shadow-sm"
        onClick={() => navigate('/zeka')}
      >
        <div className="w-12 h-12 bg-purple-light rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple/20 transition-colors">
          <Sparkles className="w-6 h-6 text-purple" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{t('learn_with_zeka')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('ask_zeka')}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple transition-colors" />
      </button>

    </div>
  )
}
