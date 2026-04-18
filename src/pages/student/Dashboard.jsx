import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import {
  Flame, Upload, FolderOpen, BookOpen, Calendar,
  ChevronRight, Clock, CheckSquare,
  ArrowRight, Bell, TrendingUp, TrendingDown,
  Star, Target, BarChart2, Award,
} from 'lucide-react'
import { todayFull, fmtWeekday } from '../../lib/dateUtils'

// ── Helpers ────────────────────────────────────────────────────────────────

function todayLabel() {
  return todayFull()
}

function todayWeekday() {
  return fmtWeekday(new Date())
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function daysUntil(iso) {
  if (!iso) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - now) / 86400000)
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return `${diff} san. əvvəl`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

// ── Subject color palette ──────────────────────────────────────────────────

const SUBJ_HEX   = ['#534AB7','#1D9E75','#D97706','#2563EB','#DB2777','#EA580C']
const SUBJ_LIGHT = ['#EEEDFE','#E1F5EE','#FEF3C7','#DBEAFE','#FCE7F3','#FFEDD5']

function subjectHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}
function subjectHexColor(name = '')  { return SUBJ_HEX[subjectHash(name) % SUBJ_HEX.length] }
function subjectLightHex(name = '')  { return SUBJ_LIGHT[subjectHash(name) % SUBJ_LIGHT.length] }

function gradeBarColor(score) {
  if (score == null) return '#d1d5db'
  if (score >= 8.5) return '#1D9E75'
  if (score >= 7)   return '#534AB7'
  if (score >= 5)   return '#D97706'
  return '#EF4444'
}

// ── DueDateChip ─────────────────────────────────────────────────────────────

function DueDateChip({ dueDate }) {
  const days = daysUntil(dueDate)
  if (days === null) return null
  if (days < 0)  return <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">Gecikmiş</span>
  if (days === 0) return <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Bu gün!</span>
  if (days === 1) return <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">Sabah</span>
  return <span className="flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface text-gray-500 border border-border-soft">{days} gün</span>
}

// ── Notification dot ─────────────────────────────────────────────────────────

function notifDotColor(type) {
  const map = { grade: 'bg-teal', assignment: 'bg-purple', attendance: 'bg-amber-400', message: 'bg-blue-400', system: 'bg-gray-400' }
  return map[type] || 'bg-gray-400'
}

// ── Period detection ─────────────────────────────────────────────────────────

function isCurrentPeriod(slot) {
  if (!slot.start_time || !slot.end_time) return false
  const now = new Date()
  const [sh, sm] = slot.start_time.split(':').map(Number)
  const [eh, em] = slot.end_time.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = eh * 60 + em
  const curMin   = now.getHours() * 60 + now.getMinutes()
  return curMin >= startMin && curMin <= endMin
}

function isPastPeriod(slot) {
  if (!slot.end_time) return false
  const [eh, em] = slot.end_time.split(':').map(Number)
  const endMin = eh * 60 + em
  const curMin = new Date().getHours() * 60 + new Date().getMinutes()
  return curMin > endMin
}

// ── Assignment tabs ──────────────────────────────────────────────────────────

const ASSIGN_TABS = [
  { key: 'pending',   label: 'Gözləyən'  },
  { key: 'thisweek',  label: 'Bu həftə'  },
  { key: 'overdue',   label: 'Gecikmiş'  },
]

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, trend, trendLabel, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow px-5 py-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`font-serif text-3xl font-bold leading-tight mt-0.5 ${valueColor || 'text-gray-900'}`}>{value}</p>
        {trendLabel && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up'   && <TrendingUp className="w-3 h-3 text-teal" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-[11px] font-medium ${trend === 'up' ? 'text-teal-600' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { profile, t } = useAuth()
  const navigate    = useNavigate()

  const [loading,        setLoading]        = useState(true)
  const [timetable,      setTimetable]      = useState([])
  const [allAssignments, setAllAssignments] = useState([])
  const [grades,         setGrades]         = useState([])
  const [notifications,  setNotifications]  = useState([])
  const [attPct,         setAttPct]         = useState(null)
  const [assignTab,      setAssignTab]      = useState('pending')

  useEffect(() => {
    if (!profile) return
    loadAll()
  }, [profile])

  async function loadAll() {
    try {
      const { data: memberData } = await supabase
        .from('class_members').select('class_id').eq('student_id', profile.id)
      const classIds = (memberData || []).map(c => c.class_id)

      const today    = new Date()
      const dayNum   = today.getDay()
      const todayStr = today.toISOString().split('T')[0]
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const queries = [
        classIds.length
          ? supabase.from('timetable_slots')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .eq('day_of_week', dayNum)
              .eq('published', true)
              .order('period')
          : Promise.resolve({ data: [] }),
        classIds.length
          ? supabase.from('assignments')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .order('due_date')
              .limit(50)
          : Promise.resolve({ data: [] }),
        supabase.from('grades')
          .select('*, subject:subjects(name), assessment:assessments(title)')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),
        classIds.length
          ? supabase.from('attendance')
              .select('status')
              .in('class_id', classIds)
              .eq('student_id', profile.id)
              .gte('date', thirtyDaysAgo)
              .lte('date', todayStr)
              .limit(200)
          : Promise.resolve({ data: [] }),
      ]

      const [ttRes, assignRes, gradesRes, notifRes, attRes] = await Promise.all(queries)

      setTimetable(ttRes.data || [])
      setAllAssignments(assignRes.data || [])
      setGrades(gradesRes.data || [])
      setNotifications(notifRes.data || [])

      const attData = attRes.data || []
      if (attData.length) {
        const present = attData.filter(r => r.status === 'present').length
        setAttPct(Math.round((present / attData.length) * 100))
      }
    } catch (err) {
      console.error('Student dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  const firstName = profile?.full_name?.split(' ')[0] || 'Şagird'

  // Computed
  const pendingAssignments  = allAssignments.filter(a => { const d = daysUntil(a.due_date); return d !== null && d >= 0 })
  const thisWeekAssignments = allAssignments.filter(a => { const d = daysUntil(a.due_date); return d !== null && d >= 0 && d <= 7 })
  const overdueAssignments  = allAssignments.filter(a => { const d = daysUntil(a.due_date); return d !== null && d < 0 })
  const tabData = { pending: pendingAssignments, thisweek: thisWeekAssignments, overdue: overdueAssignments }

  const avgNum = (() => {
    if (!grades.length) return null
    const nums = grades.map(g => Number(g.score)).filter(n => !isNaN(n))
    if (!nums.length) return null
    return nums.reduce((a, b) => a + b, 0) / nums.length
  })()
  const avgStr = avgNum !== null ? avgNum.toFixed(1).replace('.', ',') : '—'

  const attStr = attPct !== null ? `${attPct}%` : '—'
  const attTrend = attPct !== null ? (attPct >= 85 ? 'up' : 'down') : null

  return (
    <div className="space-y-8">

      {/* ── 1. Welcome Banner ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-purple to-[#7B75D0] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-purple-100 text-sm font-medium">{todayLabel()}</p>
            <h1 className="font-serif text-4xl text-white mt-1">
              {t('hello_student')}, {firstName}!
            </h1>
            <p className="text-purple-100 text-sm mt-2">Bugünkü dərslərə hazır ol.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {profile?.streak_count > 0 && (
              <div className="flex items-center gap-2 bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-sm">
                <Flame className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold">{profile.streak_count} günlük zolaq!</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs text-white/80 font-medium capitalize">{todayWeekday()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Ortalama Qiymət"
          value={avgStr}
          trend={avgNum !== null ? (avgNum >= 7 ? 'up' : 'down') : null}
          trendLabel={avgNum !== null ? (avgNum >= 8.5 ? 'Əla nəticə' : avgNum >= 7 ? 'Yaxşı' : 'Geliştir') : null}
          iconBg="bg-purple-light"
          iconColor="text-purple"
          valueColor={avgNum !== null && avgNum >= 8.5 ? 'text-teal-700' : avgNum !== null && avgNum < 5 ? 'text-red-600' : 'text-gray-900'}
        />
        <StatCard
          icon={Calendar}
          label="Davamiyyət (30 gün)"
          value={attStr}
          trend={attTrend}
          trendLabel={attPct !== null ? (attPct >= 85 ? 'Mükəmməl' : attPct >= 75 ? 'Yaxşı' : 'Diqqət et') : null}
          iconBg="bg-teal-light"
          iconColor="text-teal"
          valueColor={attPct !== null && attPct < 75 ? 'text-red-600' : 'text-gray-900'}
        />
        <StatCard
          icon={CheckSquare}
          label="Gözləyən Tapşırıq"
          value={pendingAssignments.length}
          trend={pendingAssignments.length > 0 ? 'down' : 'up'}
          trendLabel={pendingAssignments.length === 0 ? 'Hamısı bitib!' : `${pendingAssignments.length} qalıb`}
          iconBg="bg-purple-light"
          iconColor="text-purple"
          valueColor={pendingAssignments.length > 0 ? 'text-purple' : 'text-gray-900'}
        />
        <StatCard
          icon={Target}
          label="Gecikmiş"
          value={overdueAssignments.length}
          trend={overdueAssignments.length > 0 ? 'down' : null}
          trendLabel={overdueAssignments.length > 0 ? 'Tez bitir!' : 'Hamar gedir'}
          iconBg={overdueAssignments.length > 0 ? 'bg-red-50' : 'bg-teal-light'}
          iconColor={overdueAssignments.length > 0 ? 'text-red-500' : 'text-teal'}
          valueColor={overdueAssignments.length > 0 ? 'text-red-600' : 'text-gray-900'}
        />
      </div>

      {/* ── 3. Today's timetable ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple" />
            {t('todays_lessons')}
          </h2>
          <span className="text-xs text-gray-400 font-medium capitalize">{todayWeekday()}</span>
        </div>

        {timetable.length === 0 ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{t('no_lessons_today')}</span>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin px-5 py-4">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {timetable.map(slot => {
                const current = isCurrentPeriod(slot)
                const past    = !current && isPastPeriod(slot)
                const accent  = subjectHexColor(slot.subject?.name || '')
                const light   = subjectLightHex(slot.subject?.name || '')
                return (
                  <div
                    key={slot.id}
                    className={`
                      relative flex flex-col gap-1.5 rounded-xl px-4 py-3 w-36 flex-shrink-0 transition-all
                      ${current ? 'ring-2 ring-purple shadow-md bg-white'
                        : past ? 'bg-gray-50 opacity-60'
                        : 'bg-surface border border-border-soft'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ backgroundColor: past ? '#d1d5db' : accent }}
                      >
                        {slot.period}
                      </span>
                      {current && (
                        <span className="text-[10px] font-semibold text-purple bg-purple-light px-1.5 py-0.5 rounded-full">İndi</span>
                      )}
                    </div>
                    <p className={`text-sm font-bold leading-tight truncate ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                      {slot.subject?.name || 'Fənn'}
                    </p>
                    {slot.start_time && slot.end_time && (
                      <p className="text-xs text-gray-400">{slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}</p>
                    )}
                    {slot.room && <p className="text-xs text-gray-400">Otaq {slot.room}</p>}
                    <div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ backgroundColor: past ? '#e5e7eb' : accent, opacity: past ? 0.4 : 0.6 }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Main 2-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Tapşırıqlar */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-5 pt-4 pb-0 border-b border-border-soft">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple" />
                  {t('all_assignments')}
                </h2>
                <button
                  onClick={() => navigate('/tapshiriqlar')}
                  className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                >
                  {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-1">
                {ASSIGN_TABS.map(tab => {
                  const count = tabData[tab.key]?.length || 0
                  const isOverdue = tab.key === 'overdue'
                  const active = assignTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setAssignTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors border-b-2 ${
                        active
                          ? 'text-purple border-purple bg-purple-light/40'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 ${
                          isOverdue ? 'bg-red-500 text-white' : 'bg-purple text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {tabData[assignTab].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                  <CheckSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  {assignTab === 'pending'  && 'Gözləyən tapşırıq yoxdur'}
                  {assignTab === 'thisweek' && 'Bu həftə tapşırıq yoxdur'}
                  {assignTab === 'overdue'  && 'Gecikmiş tapşırıq yoxdur'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {tabData[assignTab].slice(0, 6).map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-surface/50 transition-colors border-l-4"
                    style={{ borderLeftColor: subjectHexColor(a.subject?.name || '') }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            background: subjectLightHex(a.subject?.name || ''),
                            color: subjectHexColor(a.subject?.name || ''),
                          }}
                        >
                          {a.subject?.name || 'Fənn'}
                        </span>
                        {a.due_date && (
                          <span className="text-[11px] text-gray-400">
                            {formatDate(a.due_date)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                    </div>
                    <DueDateChip dueDate={a.due_date} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Son Qiymətlər — now with score bars */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal" />
                {t('recent_grades')}
              </h2>
              <button
                onClick={() => navigate('/qiymetler')}
                className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
              >
                {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">{t('no_grades')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {grades.map((g, i) => {
                  const score = g.score != null ? Number(g.score) : null
                  const pct = score != null ? Math.min((score / 10) * 100, 100) : 0
                  const barColor = gradeBarColor(score)
                  return (
                    <div key={g.id || i} className="px-5 py-4 hover:bg-surface/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: subjectLightHex(g.subject?.name || '') }}
                        >
                          <BookOpen
                            className="w-4 h-4"
                            style={{ color: subjectHexColor(g.subject?.name || '') }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{g.subject?.name || 'Fənn'}</p>
                          {g.assessment?.title && (
                            <p className="text-xs text-gray-400 truncate">{g.assessment.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GradeBadge score={score} />
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(g.created_at)}</span>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-11">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (4 cols) */}
        <div className="lg:col-span-4 space-y-5">

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm">{t('quick_nav')}</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: Upload,    label: 'Tapşırıq Təhvil Ver', sub: `${pendingAssignments.length} gözləyir`,    path: '/tapshiriqlar', color: 'purple' },
                { icon: BookOpen,  label: 'Qiymətlərim',          sub: `Ortalama: ${avgStr}`,                      path: '/qiymetler',    color: 'teal'   },
                { icon: Calendar,  label: 'Davamiyyət',            sub: `${attStr} iştirak`,                        path: '/davamiyyet',   color: 'blue'   },
                { icon: FolderOpen,label: 'Portfelim',             sub: 'İşlərimi gör',                             path: '/portfolio',    color: 'amber'  },
              ].map(a => {
                const bgMap  = { purple: 'bg-purple-light', teal: 'bg-teal-light', blue: 'bg-blue-50', amber: 'bg-amber-50' }
                const icMap  = { purple: 'text-purple', teal: 'text-teal', blue: 'text-blue-600', amber: 'text-amber-600' }
                return (
                  <button
                    key={a.path}
                    onClick={() => navigate(a.path)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border-soft bg-white hover:shadow-sm hover:border-purple/20 transition-all text-left w-full"
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bgMap[a.color]}`}>
                      <a.icon className={`w-4 h-4 ${icMap[a.color]}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                      <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bildirişlər */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple" />
                {t('all_notifications')}
              </h2>
              {notifications.some(n => !n.read) && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                <Bell className="w-6 h-6 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">{t('no_notifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    className={`flex items-start gap-3 px-5 py-3.5 ${n.read ? '' : 'bg-purple-light/20'}`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notifDotColor(n.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">
                        {n.message || n.title || 'Bildiriş'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
