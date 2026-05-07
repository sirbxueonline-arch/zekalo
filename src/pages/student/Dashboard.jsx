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

// ─── Pastel palette ──────────────────────────────────────────────────────────
const COLOR_PERI  = '#7c6ee0'
const COLOR_MINT  = '#5db8a3'
const COLOR_PEACH = '#e8a87c'
const COLOR_BLUE  = '#6b9dde'
const COLOR_ROSE  = '#ef6c6c'

const SUBJ_PALETTE = [
  { color: COLOR_PERI,  bg: 'rgba(124,110,224,0.16)', border: 'rgba(124,110,224,0.30)' },
  { color: COLOR_MINT,  bg: 'rgba(93,184,163,0.16)',  border: 'rgba(93,184,163,0.30)' },
  { color: COLOR_PEACH, bg: 'rgba(232,168,124,0.20)', border: 'rgba(232,168,124,0.35)' },
  { color: COLOR_BLUE,  bg: 'rgba(107,157,222,0.16)', border: 'rgba(107,157,222,0.30)' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────
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

function subjectHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function subjectStyle(name = '')  { return SUBJ_PALETTE[subjectHash(name) % SUBJ_PALETTE.length] }

function gradeBarColor(score) {
  if (score == null) return '#cbd5e1'
  if (score >= 8.5) return COLOR_MINT
  if (score >= 7)   return COLOR_BLUE
  if (score >= 5)   return COLOR_PEACH
  return COLOR_ROSE
}

// ─── DueDateChip ─────────────────────────────────────────────────────────────
function DueDateChip({ dueDate }) {
  const days = daysUntil(dueDate)
  if (days === null) return null
  const baseStyle = {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 999,
  }
  if (days < 0)  return <span className="pill-rose"  style={baseStyle}>Gecikmiş</span>
  if (days === 0) return <span className="pill-peach" style={baseStyle}>Bu gün!</span>
  if (days === 1) return <span className="pill-peach" style={baseStyle}>Sabah</span>
  return (
    <span
      style={{
        ...baseStyle,
        background: 'rgba(255,255,255,0.55)',
        color: '#64748b',
        border: '1px solid rgba(124,110,224,0.18)',
        backdropFilter: 'blur(12px)',
        fontWeight: 500,
      }}
    >
      {days} gün
    </span>
  )
}

// ─── Notification dot ─────────────────────────────────────────────────────────
function notifDotColor(type) {
  const map = {
    grade:      COLOR_MINT,
    assignment: COLOR_PERI,
    attendance: COLOR_PEACH,
    message:    COLOR_BLUE,
    system:     '#94a3b8',
  }
  return map[type] || '#94a3b8'
}

// ─── Period detection ────────────────────────────────────────────────────────
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

// ─── Assignment tabs ─────────────────────────────────────────────────────────
const ASSIGN_TABS = [
  { key: 'pending',   label: 'Gözləyən'  },
  { key: 'thisweek',  label: 'Bu həftə'  },
  { key: 'overdue',   label: 'Gecikmiş'  },
]

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, trendLabel, iconColor = COLOR_PERI }) {
  return (
    <div className="liquid-card pastel-hover px-5 py-5 flex items-center gap-4">
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${iconColor}26`,
          border: `1px solid ${iconColor}33`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1, marginTop: 4, letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {trendLabel && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up'   && <TrendingUp   className="w-3 h-3" style={{ color: COLOR_MINT }} />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" style={{ color: COLOR_ROSE }} />}
            <span
              className="text-xs font-semibold"
              style={{
                color: trend === 'up' ? '#2f7a64' : trend === 'down' ? '#b13838' : '#94a3b8',
              }}
            >
              {trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
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
    <div className="space-y-7">

      {/* ── 1. Welcome banner ─────────────────────────────────────────────── */}
      <div
        className="liquid-card relative overflow-hidden"
        style={{ padding: 28 }}
      >
        {/* Pastel blob accents */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-30%', right: '-10%',
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(124,110,224,0.22) 0%, transparent 65%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-40%', right: '15%',
            width: 240, height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(93,184,163,0.20) 0%, transparent 65%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>{todayLabel()}</p>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#1a1a2e',
                marginTop: 4,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {t('hello_student')}, <span className="pastel-text">{firstName}!</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: '#64748b' }}>
              Bugünkü dərslərə hazır ol.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {profile?.streak_count > 0 && (
              <div
                className="flex items-center gap-2"
                style={{
                  padding: '8px 16px',
                  borderRadius: 14,
                  background: 'rgba(232,168,124,0.16)',
                  border: '1px solid rgba(232,168,124,0.32)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Flame className="w-4 h-4" style={{ color: COLOR_PEACH }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a25e2c' }}>
                  {profile.streak_count} günlük zolaq!
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5"
              style={{
                padding: '5px 12px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(124,110,224,0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Star className="w-3.5 h-3.5" style={{ color: COLOR_PEACH }} />
              <span className="text-xs capitalize" style={{ color: '#475569', fontWeight: 600 }}>
                {todayWeekday()}
              </span>
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
          iconColor={COLOR_PERI}
        />
        <StatCard
          icon={Calendar}
          label="Davamiyyət (30 gün)"
          value={attStr}
          trend={attTrend}
          trendLabel={attPct !== null ? (attPct >= 85 ? 'Mükəmməl' : attPct >= 75 ? 'Yaxşı' : 'Diqqət et') : null}
          iconColor={COLOR_MINT}
        />
        <StatCard
          icon={CheckSquare}
          label="Gözləyən Tapşırıq"
          value={pendingAssignments.length}
          trend={pendingAssignments.length > 0 ? 'down' : 'up'}
          trendLabel={pendingAssignments.length === 0 ? 'Hamısı bitib!' : `${pendingAssignments.length} qalıb`}
          iconColor={COLOR_BLUE}
        />
        <StatCard
          icon={Target}
          label="Gecikmiş"
          value={overdueAssignments.length}
          trend={overdueAssignments.length > 0 ? 'down' : null}
          trendLabel={overdueAssignments.length > 0 ? 'Tez bitir!' : 'Hamar gedir'}
          iconColor={overdueAssignments.length > 0 ? COLOR_ROSE : COLOR_PEACH}
        />
      </div>

      {/* ── 3. Today's timetable ──────────────────────────────────────────── */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 14, color: '#1a1a2e' }}>
            <Clock className="w-4 h-4" style={{ color: COLOR_PERI }} />
            {t('todays_lessons')}
          </h2>
          <span className="text-xs capitalize" style={{ color: '#64748b', fontWeight: 600 }}>
            {todayWeekday()}
          </span>
        </div>

        {timetable.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(124,110,224,0.10)',
                border: '1px solid rgba(124,110,224,0.18)',
              }}
            >
              <Calendar className="w-5 h-5" style={{ color: COLOR_PERI }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
              {t('no_lessons_today')}
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Bu gün üçün dərs cədvəli yoxdur.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin px-5 py-4">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {timetable.map(slot => {
                const current = isCurrentPeriod(slot)
                const past    = !current && isPastPeriod(slot)
                const sStyle  = subjectStyle(slot.subject?.name || '')
                return (
                  <div
                    key={slot.id}
                    className="relative flex flex-col gap-1.5 flex-shrink-0 transition-all"
                    style={{
                      padding: '12px 16px',
                      width: 152,
                      borderRadius: 14,
                      background: current
                        ? 'rgba(255,255,255,0.85)'
                        : past
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(255,255,255,0.6)',
                      border: current
                        ? `2px solid ${COLOR_PERI}`
                        : '1px solid rgba(124,110,224,0.16)',
                      backdropFilter: 'blur(12px)',
                      opacity: past ? 0.6 : 1,
                      boxShadow: current ? '0 6px 18px rgba(124,110,224,0.18)' : '0 1px 3px rgba(140,120,200,0.05)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          width: 26, height: 26, borderRadius: 999,
                          background: past ? '#cbd5e1' : sStyle.color,
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: past ? 'none' : `0 2px 6px ${sStyle.color}40`,
                        }}
                      >
                        {slot.period}
                      </span>
                      {current && (
                        <span
                          style={{
                            fontSize: 10, fontWeight: 800,
                            color: '#5448a8',
                            background: 'rgba(124,110,224,0.18)',
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          İndi
                        </span>
                      )}
                    </div>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: past ? '#94a3b8' : '#1a1a2e',
                        lineHeight: 1.25,
                      }}
                    >
                      {slot.subject?.name || 'Fənn'}
                    </p>
                    {slot.start_time && slot.end_time && (
                      <p className="text-xs" style={{ color: '#64748b' }}>
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </p>
                    )}
                    {slot.room && (
                      <p className="text-xs" style={{ color: '#64748b' }}>Otaq {slot.room}</p>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0, left: 16, right: 16,
                        height: 2,
                        borderRadius: 999,
                        background: past ? '#e2e8f0' : sStyle.color,
                        opacity: past ? 0.4 : 0.6,
                      }}
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
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div
              className="px-5 pt-4 pb-0"
              style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 14, color: '#1a1a2e' }}>
                  <CheckSquare className="w-4 h-4" style={{ color: COLOR_PERI }} />
                  {t('all_assignments')}
                </h2>
                <button
                  onClick={() => navigate('/tapshiriqlar')}
                  className="flex items-center gap-1 transition-all"
                  style={{ fontSize: 12, color: COLOR_PERI, fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
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
                      className="flex items-center gap-1.5 transition-all"
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? COLOR_PERI : '#64748b',
                        borderBottom: active ? `2px solid ${COLOR_PERI}` : '2px solid transparent',
                        background: active ? 'rgba(124,110,224,0.08)' : 'transparent',
                        borderRadius: '10px 10px 0 0',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 20, height: 20,
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '0 6px',
                            background: isOverdue
                              ? 'linear-gradient(135deg, #ef6c6c 0%, #d94d4d 100%)'
                              : 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                            color: '#fff',
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {tabData[assignTab].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6 gap-2">
                <div
                  className="flex items-center justify-center mb-1"
                  style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(93,184,163,0.14)',
                    border: '1px solid rgba(93,184,163,0.28)',
                  }}
                >
                  <CheckSquare className="w-5 h-5" style={{ color: COLOR_MINT }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>
                  {assignTab === 'pending'  && 'Gözləyən tapşırıq yoxdur'}
                  {assignTab === 'thisweek' && 'Bu həftə tapşırıq yoxdur'}
                  {assignTab === 'overdue'  && 'Gecikmiş tapşırıq yoxdur'}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {assignTab === 'overdue' ? 'Əla iş! Hamısı vaxtında.' : 'Yeni tapşırıq görünəndə xəbər veriləcək.'}
                </p>
              </div>
            ) : (
              <div>
                {tabData[assignTab].slice(0, 6).map((a, idx, arr) => {
                  const sStyle = subjectStyle(a.subject?.name || '')
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-5 py-4 transition-colors"
                      style={{
                        borderLeft: `4px solid ${sStyle.color}`,
                        borderBottom: idx < arr.length - 1 ? '1px solid rgba(124,110,224,0.08)' : 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            style={{
                              fontSize: 11, fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 999,
                              background: sStyle.bg,
                              color: sStyle.color,
                              border: `1px solid ${sStyle.border}`,
                            }}
                          >
                            {a.subject?.name || 'Fənn'}
                          </span>
                          {a.due_date && (
                            <span className="text-xs" style={{ color: '#94a3b8' }}>
                              {formatDate(a.due_date)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold truncate" style={{ color: '#1a1a2e' }}>
                          {a.title}
                        </p>
                      </div>
                      <DueDateChip dueDate={a.due_date} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Son Qiymətlər */}
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
            >
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 14, color: '#1a1a2e' }}>
                <BarChart2 className="w-4 h-4" style={{ color: COLOR_MINT }} />
                {t('recent_grades')}
              </h2>
              <button
                onClick={() => navigate('/qiymetler')}
                className="flex items-center gap-1 transition-all"
                style={{ fontSize: 12, color: COLOR_PERI, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6 gap-2">
                <div
                  className="flex items-center justify-center mb-1"
                  style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(124,110,224,0.10)',
                    border: '1px solid rgba(124,110,224,0.18)',
                  }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: COLOR_PERI }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_grades')}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Müəlliminiz qiymət daxil etdikdə burada görünəcək.
                </p>
              </div>
            ) : (
              <div>
                {grades.map((g, i) => {
                  const score = g.score != null ? Number(g.score) : null
                  const pct = score != null ? Math.min((score / 10) * 100, 100) : 0
                  const barColor = gradeBarColor(score)
                  const sStyle = subjectStyle(g.subject?.name || '')
                  return (
                    <div
                      key={g.id || i}
                      className="px-5 py-4 transition-colors"
                      style={{
                        borderBottom: i < grades.length - 1 ? '1px solid rgba(124,110,224,0.08)' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 36, height: 36, borderRadius: 12,
                            background: sStyle.bg,
                            border: `1px solid ${sStyle.border}`,
                          }}
                        >
                          <BookOpen className="w-4 h-4" style={{ color: sStyle.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#1a1a2e' }}>
                            {g.subject?.name || 'Fənn'}
                          </p>
                          {g.assessment?.title && (
                            <p className="text-xs truncate" style={{ color: '#64748b' }}>
                              {g.assessment.title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GradeBadge score={score} />
                          <span className="text-xs whitespace-nowrap" style={{ color: '#94a3b8' }}>
                            {formatDate(g.created_at)}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 999,
                          background: 'rgba(124,110,224,0.08)',
                          overflow: 'hidden',
                          marginLeft: 48,
                        }}
                      >
                        <div
                          className="transition-all duration-500"
                          style={{
                            height: '100%',
                            borderRadius: 999,
                            width: `${pct}%`,
                            background: barColor,
                          }}
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
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}>
              <h2 className="font-bold" style={{ fontSize: 14, color: '#1a1a2e' }}>
                {t('quick_nav')}
              </h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: Upload,    label: 'Tapşırıq Təhvil Ver', sub: `${pendingAssignments.length} gözləyir`, path: '/tapshiriqlar', color: COLOR_PERI },
                { icon: BookOpen,  label: 'Qiymətlərim',          sub: `Ortalama: ${avgStr}`,                  path: '/qiymetler',    color: COLOR_MINT  },
                { icon: Calendar,  label: 'Davamiyyət',            sub: `${attStr} iştirak`,                    path: '/davamiyyet',   color: COLOR_BLUE  },
                { icon: FolderOpen,label: 'Portfelim',             sub: 'İşlərimi gör',                         path: '/portfolio',    color: COLOR_PEACH },
              ].map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 w-full transition-all text-left"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(124,110,224,0.14)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(124,110,224,0.14)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: `${a.color}22`,
                      border: `1px solid ${a.color}33`,
                    }}
                  >
                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{a.label}</p>
                    <p className="text-xs truncate" style={{ color: '#64748b' }}>{a.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#cbd5e1' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Bildirişlər */}
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
            >
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 14, color: '#1a1a2e' }}>
                <Bell className="w-4 h-4" style={{ color: COLOR_PERI }} />
                {t('all_notifications')}
              </h2>
              {notifications.some(n => !n.read) && (
                <span style={{ width: 8, height: 8, borderRadius: 999, background: COLOR_ROSE, display: 'inline-block' }} />
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5 gap-2">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: 'rgba(124,110,224,0.10)',
                    border: '1px solid rgba(124,110,224,0.18)',
                  }}
                >
                  <Bell className="w-4 h-4" style={{ color: COLOR_PERI }} />
                </div>
                <p className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{t('no_notifications')}</p>
              </div>
            ) : (
              <div>
                {notifications.map((n, i, arr) => (
                  <div
                    key={n.id || i}
                    className="flex items-start gap-3 px-5 py-3.5"
                    style={{
                      background: !n.read ? 'rgba(124,110,224,0.06)' : 'transparent',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(124,110,224,0.08)' : 'none',
                    }}
                  >
                    <span
                      className="mt-1.5 flex-shrink-0"
                      style={{
                        width: 8, height: 8, borderRadius: 999,
                        background: notifDotColor(n.type),
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2" style={{ color: '#1a1a2e', lineHeight: 1.45 }}>
                        {n.message || n.title || 'Bildiriş'}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: 11, color: '#94a3b8' }}>
                        {timeAgo(n.created_at)}
                      </p>
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
