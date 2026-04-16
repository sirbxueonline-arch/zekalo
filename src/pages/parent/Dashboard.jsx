import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import {
  Users, BookOpen, Calendar, Bell, ArrowRight, MessageSquare,
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

export default function ParentDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [childData, setChildData] = useState({})
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadChildData(selectedChild)
  }, [selectedChild])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(*, school:schools(*))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)
    setChildren(kids)
    if (kids.length > 0) setSelectedChild(kids[0])

    const { data: notifData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications(notifData || [])
    if (!kids.length) setLoading(false)
  }

  async function loadChildData(child) {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class:classes(id, name)')
      .eq('student_id', child.id)
      .limit(1)

    const className = memberData?.[0]?.class?.name || null

    const [gradesRes, attRes] = await Promise.all([
      supabase.from('grades').select('*, subject:subjects(name)').eq('student_id', child.id).order('date', { ascending: false }).limit(5),
      supabase.from('attendance').select('status').eq('student_id', child.id),
    ])

    const grades = gradesRes.data || []
    const att = attRes.data || []
    const present = att.filter(a => a.status === 'present').length
    const pct = att.length ? Math.round((present / att.length) * 100) : 0
    const lastGrade = grades[0] || null

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const { data: weekAtt } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', child.id)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])

    const daysPresent = (weekAtt || []).filter(a => a.status === 'present').length

    setChildData({ className, grades, attendancePct: pct, lastGrade, daysPresent })
    setLoading(false)
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return <EmptyState icon={Users} title={t('error')} description={t('error')} />
  }

  const lastGradeScore = childData.lastGrade
    ? (childData.lastGrade.max_score > 0
      ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10)
      : childData.lastGrade.score)
    : null

  return (
    <div className="space-y-10">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight leading-tight">
          {greeting()}, {profile?.full_name?.split(' ')[0]}!
        </h1>
      </div>

      {/* ── Child selector ───────────────────────────────────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface bg-white'
              }`}
            >
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          {/* ── Child summary card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-8 py-7">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-purple" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedChild?.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {childData.className && (
                    <span className="text-sm text-gray-500">{childData.className}</span>
                  )}
                  {selectedChild?.school?.name && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">{selectedChild.school.name}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-5 mt-3">
                  {childData.lastGrade && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">{t('recent_grades')}:</span>
                      <GradeBadge score={lastGradeScore} />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">{t('attendance')}:</span>
                    <span className={`text-sm font-semibold ${childData.attendancePct < 75 ? 'text-red-600' : 'text-gray-800'}`}>
                      {childData.attendancePct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('this_week')}</span>
                <span className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-teal" />
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{childData.daysPresent}</p>
              <p className="text-xs text-gray-400 mt-1">gün iştirak</p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('recent_grades')}</span>
                <span className="w-9 h-9 rounded-xl bg-purple-light flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-purple" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-gray-900">
                  {lastGradeScore !== null
                    ? String(lastGradeScore).replace('.', ',')
                    : '—'}
                </p>
                {lastGradeScore !== null && (lastGradeScore >= 7 ? (
                  <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('attendance')}</span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-500" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-gray-900">{childData.attendancePct}%</p>
                {childData.attendancePct >= 85 ? (
                  <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick links ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/valideyn/mesajlar')}
              className="flex items-center gap-4 bg-white border border-border-soft rounded-2xl px-7 py-5 hover:border-purple/40 hover:shadow-sm transition-all group text-left shadow-sm"
            >
              <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-purple transition-colors">{t('messages')}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple ml-auto transition-colors" />
            </button>
            <button
              onClick={() => navigate('/valideyn/qiymetler')}
              className="flex items-center gap-4 bg-white border border-border-soft rounded-2xl px-7 py-5 hover:border-purple/40 hover:shadow-sm transition-all group text-left shadow-sm"
            >
              <span className="w-10 h-10 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0 group-hover:bg-purple/20 transition-colors">
                <BookOpen className="w-5 h-5 text-purple" />
              </span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-purple transition-colors">{t('grades')}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple ml-auto transition-colors" />
            </button>
          </div>

          {/* ── Recent grades ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900">{t('recent_grades')}</h2>
              <button
                onClick={() => navigate('/valideyn/qiymetler')}
                className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark font-medium transition-colors"
              >
                {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {childData.grades?.length === 0 ? (
              <p className="text-sm text-gray-400 px-8 py-10">{t('no_grades')}</p>
            ) : (
              <div className="divide-y divide-border-soft">
                {(childData.grades || []).map(g => (
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

          {/* ── Notifications ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900">{t('notifications')}</h2>
              <button
                onClick={() => navigate('/valideyn/bildirisler')}
                className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark font-medium transition-colors"
              >
                {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 px-8 py-10">{t('no_messages')}</p>
            ) : (
              <div className="divide-y divide-border-soft">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-4 px-8 py-4 hover:bg-surface/50 transition-colors">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${n.read ? 'bg-gray-50' : 'bg-purple-light'}`}>
                      <Bell className={`w-4 h-4 ${n.read ? 'text-gray-300' : 'text-purple'}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>}
                      <p className="text-xs text-gray-300 mt-1.5">
                        {new Date(n.created_at).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
