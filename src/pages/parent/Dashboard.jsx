import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import {
  Users, BookOpen, Calendar, Bell, ArrowRight, MessageSquare,
  Clock, ClipboardList, GraduationCap, AlertCircle, BookMarked,
} from 'lucide-react'

function todayLabel() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRelativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'İndi'
  if (mins < 60) return `${mins} dəq əvvəl`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} saat əvvəl`
  const days = Math.floor(hrs / 24)
  return `${days} gün əvvəl`
}

const SUBJECT_COLORS = [
  'bg-purple-light text-purple',
  'bg-teal-light text-teal',
  'bg-amber-50 text-amber-700',
  'bg-blue-50 text-blue-700',
  'bg-pink-50 text-pink-700',
  'bg-orange-50 text-orange-700',
]

function subjectColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

const AVATAR_COLORS = [
  '#534AB7', '#1D9E75', '#D97706', '#2563EB', '#DB2777', '#EA580C',
]

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function notifIcon(type) {
  switch (type) {
    case 'grade':       return { icon: GraduationCap, cls: 'bg-purple-light text-purple' }
    case 'absence':     return { icon: Calendar,      cls: 'bg-red-50 text-red-500' }
    case 'message':     return { icon: MessageSquare, cls: 'bg-blue-50 text-blue-500' }
    case 'assignment':  return { icon: ClipboardList, cls: 'bg-teal-light text-teal' }
    default:            return { icon: Bell,          cls: 'bg-surface text-gray-400' }
  }
}

export default function ParentDashboard() {
  const { profile } = useAuth()
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
    const today = new Date().getDay()
    const now = new Date().toISOString()

    // Get class memberships
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class:classes(id, name)')
      .eq('student_id', child.id)

    const classes = (memberData || []).map(m => m.class).filter(Boolean)
    const classIds = classes.map(c => c.id)
    const className = classes[0]?.name || null

    // Compute this-week bounds for attendance
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const [gradesRes, attRes, weekAttRes, timetableRes, upcomingRes] = await Promise.all([
      supabase
        .from('grades')
        .select('*, subject:subjects(name)')
        .eq('student_id', child.id)
        .order('date', { ascending: false })
        .limit(5),

      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', child.id),

      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', child.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]),

      classIds.length
        ? supabase
            .from('timetable_slots')
            .select('*, subject:subjects(name)')
            .in('class_id', classIds)
            .eq('day_of_week', today)
            .eq('published', true)
            .order('period')
        : { data: [] },

      classIds.length
        ? supabase
            .from('assignments')
            .select('*, subject:subjects(name)')
            .in('class_id', classIds)
            .gte('due_date', now)
            .order('due_date')
            .limit(5)
        : { data: [] },
    ])

    const grades = gradesRes.data || []
    const att = attRes.data || []
    const present = att.filter(a => a.status === 'present').length
    const attendancePct = att.length ? Math.round((present / att.length) * 100) : 0
    const daysPresent = (weekAttRes.data || []).filter(a => a.status === 'present').length
    const lastGrade = grades[0] || null

    setChildData({
      className,
      grades,
      attendancePct,
      daysPresent,
      lastGrade,
      timetable: timetableRes.data || [],
      upcomingAssignments: upcomingRes.data || [],
    })
    setLoading(false)
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq məlumatı yoxdur."
      />
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  const lastGradeScore = childData.lastGrade
    ? (childData.lastGrade.max_score > 0
      ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10)
      : childData.lastGrade.score)
    : null

  return (
    <div className="space-y-8">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight leading-tight">
          Xoş gəldiniz, {firstName}!
        </h1>
      </div>

      {/* ── Child selector tabs ──────────────────────────────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface bg-white'
              }`}
            >
              <Avatar name={child.full_name} size="sm" color={avatarColor(child.full_name)} />
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          {/* ── Child summary banner ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-6 py-5">
            <div className="flex items-center gap-4">
              <Avatar
                name={selectedChild?.full_name}
                size="lg"
                color={avatarColor(selectedChild?.full_name || '')}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">{selectedChild?.full_name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
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
                {/* Inline stat pills */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-0.5 border ${childData.attendancePct < 75 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-teal-light text-teal border-teal/20'}`}>
                    İştirak: {childData.attendancePct}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-3 py-0.5 bg-surface text-gray-600 border border-border-soft">
                    Bu həftə: {childData.daysPresent} gün
                  </span>
                  {lastGradeScore !== null && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Son qiymət:</span>
                      <GradeBadge score={lastGradeScore} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick-action cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/valideyn/yazismalar')}
              className="flex items-center gap-5 bg-purple rounded-2xl px-7 py-6 text-left hover:opacity-90 transition-opacity shadow-sm"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white">Müəllimlə Əlaqə</p>
                <p className="text-xs text-white/70 mt-0.5">Müəllimə mesaj göndər</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60" />
            </button>

            <button
              onClick={() => navigate('/valideyn/qiymetler')}
              className="flex items-center gap-5 bg-teal rounded-2xl px-7 py-6 text-left hover:opacity-90 transition-opacity shadow-sm"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-white">Qiymətlər</p>
                <p className="text-xs text-white/70 mt-0.5">Uşağın qiymətlərini gör</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* ── Three-column widget grid ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: Son Qiymətlər */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple" />
                  Son Qiymətlər
                </h2>
                <button
                  onClick={() => navigate('/valideyn/qiymetler')}
                  className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                >
                  Hamısı <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {childData.grades?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Qiymət yoxdur</p>
                </div>
              ) : (
                <div className="divide-y divide-border-soft">
                  {(childData.grades || []).map(g => {
                    const score = g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score
                    return (
                      <div key={g.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{g.subject?.name}</p>
                          {g.assessment_title && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{g.assessment_title}</p>
                          )}
                        </div>
                        <GradeBadge score={score} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CENTER: Uşağın Günün Cədvəli */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple" />
                  Günün Cədvəli
                </h2>
              </div>
              {(childData.timetable || []).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Bu gün dərs yoxdur</p>
                </div>
              ) : (
                <div className="divide-y divide-border-soft">
                  {(childData.timetable || []).map(slot => (
                    <div key={slot.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple text-white text-xs font-bold flex items-center justify-center">
                        {slot.period}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{slot.subject?.name}</p>
                        {(slot.room || slot.start_time) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[slot.start_time, slot.room].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Yaxın Tapşırıqlar */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple" />
                  Yaxın Tapşırıqlar
                </h2>
                <button
                  onClick={() => navigate('/valideyn/tapshiriqlar')}
                  className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                >
                  Hamısı <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {(childData.upcomingAssignments || []).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                    <ClipboardList className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Yaxın tapşırıq yoxdur</p>
                </div>
              ) : (
                <div className="divide-y divide-border-soft">
                  {(childData.upcomingAssignments || []).map(a => {
                    const colorClass = subjectColor(a.subject?.name)
                    return (
                      <div key={a.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 ${colorClass}`}>
                            {a.subject?.name || 'Fənn'}
                          </span>
                          <p className="text-sm font-medium text-gray-900 truncate mt-1">{a.title}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatDate(a.due_date)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Notifications ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900">Bildirişlər</h2>
              <button
                onClick={() => navigate('/valideyn/bildirisler')}
                className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
              >
                Hamısı <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Bildiriş yoxdur</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {notifications.map(n => {
                  const { icon: Icon, cls } = notifIcon(n.type)
                  return (
                    <div key={n.id} className={`flex items-start gap-4 px-8 py-4 hover:bg-surface/50 transition-colors ${!n.read ? 'bg-purple-light/10' : ''}`}>
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cls}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1.5">
                          {formatRelativeTime(n.created_at)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple mt-2" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
