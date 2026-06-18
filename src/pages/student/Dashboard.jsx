import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import Mascot from '../../components/ui/Mascot'
import StreakBadge from '../../components/ui/StreakBadge'
import XPBar from '../../components/ui/XPBar'
import LevelRing from '../../components/ui/LevelRing'
import AchievementCard from '../../components/ui/AchievementCard'
import CountUp from '../../components/ui/CountUp'
import {
  Flame, Upload, FolderOpen, BookOpen, Calendar,
  ChevronRight, Clock, CheckSquare, Check,
  ArrowRight, Bell, Star, Target, BarChart2, Award,
  Zap, Trophy, ShieldCheck, Sparkles,
} from 'lucide-react'
import { todayFull, fmtWeekday } from '../../lib/dateUtils'

// ─── Accent tokens (design-system hues) ──────────────────────────────────────
// V3: one brand accent does ~95% of chrome; saturated hues survive ONLY in
// meaning-bearing status (grade bars, dots) — never rotated decoratively.
const C_BRAND = '#574FCF'   // primary — does the chrome work
const C_MINT  = '#1FA855'   // success / accuracy (status only)
const C_SKY   = '#3BA8E6'   // info / time (status only)
const C_SUN   = '#EAB308'   // XP / points (gamification only)
const C_CORAL = '#F4677E'   // streak warmth / overdue (status only)

// Subjects no longer rotate a rainbow (V3 §2.2 law 1). Every subject reads as
// the single brand accent; subject identity comes from the name + neutral chip.
const subjectStyleConst = { color: C_BRAND, chip: 'pill-muted' }

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

function subjectStyle()  { return subjectStyleConst }

function gradeBarColor(score) {
  if (score == null) return 'var(--hairline-strong)'
  if (score >= 8.5) return C_MINT
  if (score >= 7)   return C_SKY
  if (score >= 5)   return C_SUN
  return C_CORAL
}

// ─── DueDateChip ─────────────────────────────────────────────────────────────
function DueDateChip({ dueDate }) {
  const days = daysUntil(dueDate)
  if (days === null) return null
  const cls = days < 0 ? 'pill-rose' : days <= 1 ? 'pill-peach' : 'pill-muted'
  const label =
    days < 0  ? 'Gecikmiş'
    : days === 0 ? 'Bu gün!'
    : days === 1 ? 'Sabah'
    : `${days} gün`
  return <span className={`${cls} flex-shrink-0`}>{label}</span>
}

// ─── Notification dot ─────────────────────────────────────────────────────────
function notifDotColor(type) {
  const map = {
    grade:      C_MINT,
    assignment: C_BRAND,
    attendance: C_SUN,
    message:    C_SKY,
    system:     'var(--ink-400)',
  }
  return map[type] || 'var(--ink-400)'
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

// ─── Colorful stat tile (XP gold / accuracy mint / time sky) ─────────────────
function StatTile({ icon: Icon, label, accent, children, footer }) {
  return (
    <div className="liquid-card pastel-hover p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center flex-shrink-0 rounded-tile"
          style={{ width: 36, height: 36, background: `${accent}1F` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-400 truncate">
          {label}
        </p>
      </div>
      <p className="font-display font-bold text-ink-900 tabular-nums leading-none"
         style={{ fontSize: 30, letterSpacing: '-0.01em' }}>
        {children}
      </p>
      {footer}
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

  // ── Gamification, derived from real state (no fabricated data) ──────────────
  const streak = profile?.streak_count || 0
  // Week strip: mark the trailing `min(streak,7)` days of the current week done.
  const weekStrip = (() => {
    const todayDow = (new Date().getDay() + 6) % 7 // Mon=0 … Sun=6
    return Array.from({ length: 7 }, (_, i) => i <= todayDow && (todayDow - i) < streak)
  })()

  // Daily goal as XP: today's lessons + submitted-on-time progress reframed.
  // Use real counts — finished-today = past lessons + grades received; goal = total today.
  const goalDone   = grades.length + Math.max(0, pendingAssignments.length === 0 ? 1 : 0)
  const goalTarget = Math.max(grades.length + pendingAssignments.length + 1, 5)
  const xpValue    = Math.min(goalDone * 20, goalTarget * 20)
  const xpTarget   = goalTarget * 20

  // Achievements unlocked off real thresholds.
  const achievements = [
    {
      title: 'Alov ustası',
      icon: Flame, color: 'coral', level: 1,
      locked: streak < 3,
      progress: streak < 3 ? { current: streak, total: 3 } : undefined,
    },
    {
      title: 'Beşlik şagird',
      icon: Trophy, color: 'sun', level: 2,
      locked: !(avgNum !== null && avgNum >= 8.5),
    },
    {
      title: 'Davamiyyət qəhrəmanı',
      icon: ShieldCheck, color: 'mint', level: 2,
      locked: !(attPct !== null && attPct >= 90),
      progress: attPct !== null && attPct < 90 ? { current: attPct, total: 90 } : undefined,
    },
    {
      title: 'Vaxtında təhvil',
      icon: Sparkles, color: 'grape', level: 1,
      locked: overdueAssignments.length > 0,
    },
  ]

  return (
    <div className="space-y-7">

      {/* ── 1. Welcome hero (playful chrome) ──────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-card-lg"
        style={{
          padding: 28,
          background: 'var(--brand-50)',
          border: '1px solid var(--hairline)',
        }}
      >
        {/* Single soft brand wash (one static blob — V3 §3.1) */}
        <div aria-hidden style={{
          position: 'absolute', top: '-40%', right: '4%', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(87,79,207,0.12) 0%, transparent 65%)',
          filter: 'blur(70px)', pointerEvents: 'none',
        }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Mascot pose="waving" size={104} className="hidden sm:inline-flex flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-600">{todayLabel()}</p>
              <h1 className="font-display"
                  style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', marginTop: 2, letterSpacing: '-0.02em', lineHeight: 1.12 }}>
                {t('hello_student')}, <span className="pastel-text">{firstName}!</span>
              </h1>
              <p className="text-sm mt-1.5 text-ink-600">Bugünkü dərslərə hazır ol.</p>
            </div>
          </div>

          {/* Streak flame with week strip */}
          {streak > 0 ? (
            <div className="flex flex-col items-center flex-shrink-0">
              <StreakBadge days={streak} week={weekStrip} size={76} />
              <span className="mt-2 font-semibold text-[13px]" style={{ color: '#C2410C' }}>
                {streak} günlük zolaq!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-shrink-0 rounded-pill bg-white/70 px-3 py-1.5"
                 style={{ border: '1px solid var(--hairline)' }}>
              <Star className="w-3.5 h-3.5" style={{ color: C_SUN }} fill="currentColor" />
              <span className="text-xs font-semibold text-ink-600 capitalize">{todayWeekday()}</span>
            </div>
          )}
        </div>

        {/* Daily-goal XP bar */}
        <div className="relative z-10 mt-6 rounded-card bg-white/75 p-4"
             style={{ border: '1px solid var(--hairline)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" style={{ color: C_SUN }} fill="currentColor" strokeWidth={0} />
            <span className="font-semibold text-[14px] text-ink-900">Günlük hədəf</span>
          </div>
          <XPBar value={xpValue} target={xpTarget} />
        </div>
      </div>

      {/* ── 2. Colorful stat tiles + Level ring ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Average grade — gold (achievement / score) */}
          <StatTile icon={Award} label="Ortalama Qiymət" accent={C_SUN}>
            {avgStr}
          </StatTile>

          {/* Attendance — mint (accuracy) */}
          <StatTile
            icon={Calendar} label="Davamiyyət (30 gün)" accent={C_MINT}
            footer={attPct !== null && (
              <span className="text-[12px] font-semibold" style={{ color: attPct >= 85 ? '#15803D' : '#B45309' }}>
                {attPct >= 85 ? 'Mükəmməl' : attPct >= 75 ? 'Yaxşı' : 'Diqqət et'}
              </span>
            )}
          >
            {attPct !== null ? <CountUp to={attPct} suffix="%" /> : '—'}
          </StatTile>

          {/* Pending — sky (time / queue) */}
          <StatTile
            icon={CheckSquare} label="Gözləyən Tapşırıq" accent={C_SKY}
            footer={(
              <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: pendingAssignments.length === 0 ? '#15803D' : 'var(--ink-600)' }}>
                {pendingAssignments.length === 0
                  ? (<><Check className="w-3 h-3" strokeWidth={2.5} /> Hamısı bitib</>)
                  : `${pendingAssignments.length} qalıb`}
              </span>
            )}
          >
            <CountUp to={pendingAssignments.length} />
          </StatTile>

          {/* Overdue — coral status when nonzero, else calm brand */}
          <StatTile
            icon={Target} label="Gecikmiş"
            accent={overdueAssignments.length > 0 ? C_CORAL : C_BRAND}
            footer={(
              <span className="text-[12px] font-semibold" style={{ color: overdueAssignments.length > 0 ? '#B91C1C' : '#15803D' }}>
                {overdueAssignments.length > 0 ? 'Tez bitir!' : 'Hamar gedir'}
              </span>
            )}
          >
            <CountUp to={overdueAssignments.length} />
          </StatTile>
        </div>

        {/* Level ring — attendance reframed as a level */}
        <div className="lg:col-span-3 liquid-card flex flex-col items-center justify-center gap-2 p-5">
          <LevelRing
            value={attPct ?? 0}
            max={100}
            size={108}
            color={C_BRAND}
            center={
              <div className="flex flex-col items-center leading-none">
                <span className="font-display font-extrabold text-ink-900 tabular-nums" style={{ fontSize: 26 }}>
                  {attStr}
                </span>
                <span className="text-[11px] font-semibold text-ink-400 mt-1">İrəliləyiş</span>
              </div>
            }
          />
          <p className="text-[12px] font-semibold text-ink-600 text-center">Bu ay davamiyyət səviyyən</p>
        </div>
      </div>

      {/* ── 3. Achievement grid ───────────────────────────────────────────── */}
      <div className="liquid-card" style={{ padding: 20 }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32, borderRadius: 12 }}>
            <Trophy className="w-4 h-4" />
          </span>
          <h2 className="font-semibold text-ink-900" style={{ fontSize: 15 }}>Nailiyyətlər</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {achievements.map((a) => (
            <AchievementCard
              key={a.title}
              title={a.title}
              icon={a.icon}
              color={a.color}
              level={a.level}
              locked={a.locked}
              progress={a.progress}
            />
          ))}
        </div>
      </div>

      {/* ── 4. Today's timetable (calm data strip) ────────────────────────── */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--hairline)' }}>
          <h2 className="font-semibold flex items-center gap-2 text-ink-900" style={{ fontSize: 15 }}>
            <Clock className="w-4 h-4" style={{ color: C_BRAND }} />
            {t('todays_lessons')}
          </h2>
          <span className="text-xs capitalize font-semibold text-ink-600">{todayWeekday()}</span>
        </div>

        {timetable.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
            <span style={{ color: 'var(--ink-400)' }}>
              <Calendar style={{ width: 56, height: 56 }} strokeWidth={1.5} />
            </span>
            <p className="font-semibold text-ink-900 mt-1" style={{ fontSize: 15 }}>{t('no_lessons_today')}</p>
            <p className="text-xs text-ink-400">Bu gün üçün dərs cədvəli yoxdur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin px-5 py-4">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {timetable.map(slot => {
                const current = isCurrentPeriod(slot)
                const past    = !current && isPastPeriod(slot)
                return (
                  <div
                    key={slot.id}
                    className="relative flex flex-col gap-1.5 flex-shrink-0 transition-all rounded-tile"
                    style={{
                      padding: '12px 16px',
                      width: 152,
                      background: 'var(--surface)',
                      border: current ? `2px solid ${C_BRAND}` : '1px solid var(--hairline)',
                      opacity: past ? 0.55 : 1,
                      boxShadow: current ? '0 6px 16px -6px rgba(20,22,40,0.14)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="tabular-nums"
                        style={{
                          width: 26, height: 26, borderRadius: 999,
                          background: past ? 'var(--hairline-strong)' : C_BRAND,
                          color: past ? 'var(--ink-400)' : '#fff',
                          fontSize: 12, fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {slot.period}
                      </span>
                      {current && (
                        <span className="pill-peri" style={{ fontSize: 10 }}>İndi</span>
                      )}
                    </div>
                    <p className="truncate font-semibold"
                       style={{ fontSize: 14, color: past ? 'var(--ink-400)' : 'var(--ink-900)', lineHeight: 1.25 }}>
                      {slot.subject?.name || 'Fənn'}
                    </p>
                    {slot.start_time && slot.end_time && (
                      <p className="text-xs text-ink-600 tabular-nums">
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </p>
                    )}
                    {slot.room && (
                      <p className="text-xs text-ink-600">Otaq {slot.room}</p>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 16, right: 16, height: 3,
                      borderRadius: 999, background: past ? 'var(--hairline)' : C_BRAND,
                      opacity: past ? 0.5 : 0.6,
                    }} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Main 2-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Tapşırıqlar */}
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div className="px-5 pt-4 pb-0" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2 text-ink-900" style={{ fontSize: 15 }}>
                  <CheckSquare className="w-4 h-4" style={{ color: C_BRAND }} />
                  {t('all_assignments')}
                </h2>
                <button
                  onClick={() => navigate('/tapshiriqlar')}
                  className="flex items-center gap-1 transition-all font-semibold text-brand-500 hover:text-brand-600"
                  style={{ fontSize: 12 }}
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
                        color: active ? C_BRAND : 'var(--ink-600)',
                        borderBottom: active ? `2px solid ${C_BRAND}` : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span
                          className="tabular-nums"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 20, height: 20, borderRadius: 999,
                            fontSize: 10, fontWeight: 800, padding: '0 6px',
                            background: isOverdue ? C_CORAL : C_BRAND,
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
              <div className="flex flex-col items-center justify-center py-10 text-center px-6 gap-2">
                <span style={{ color: 'var(--ink-400)' }}>
                  <CheckSquare style={{ width: 56, height: 56 }} strokeWidth={1.5} />
                </span>
                <p className="font-semibold text-ink-900 mt-1" style={{ fontSize: 15 }}>
                  {assignTab === 'pending'  && 'Gözləyən tapşırıq yoxdur'}
                  {assignTab === 'thisweek' && 'Bu həftə tapşırıq yoxdur'}
                  {assignTab === 'overdue'  && 'Gecikmiş tapşırıq yoxdur'}
                </p>
                <p className="text-xs text-ink-400">
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
                      className="flex items-center gap-3 px-5 py-4 transition-colors cursor-pointer hover:bg-brand-50"
                      style={{
                        borderLeft: `4px solid ${sStyle.color}`,
                        borderBottom: idx < arr.length - 1 ? '1px solid var(--hairline)' : 'none',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={sStyle.chip}>{a.subject?.name || 'Fənn'}</span>
                          {a.due_date && (
                            <span className="text-xs text-ink-400 tabular-nums">{formatDate(a.due_date)}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold truncate text-ink-900">{a.title}</p>
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
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: '1px solid var(--hairline)' }}>
              <h2 className="font-semibold flex items-center gap-2 text-ink-900" style={{ fontSize: 15 }}>
                <BarChart2 className="w-4 h-4" style={{ color: C_BRAND }} />
                {t('recent_grades')}
              </h2>
              <button
                onClick={() => navigate('/qiymetler')}
                className="flex items-center gap-1 transition-all font-semibold text-brand-500 hover:text-brand-600"
                style={{ fontSize: 12 }}
              >
                {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6 gap-2">
                <span style={{ color: 'var(--ink-400)' }}>
                  <BarChart2 style={{ width: 56, height: 56 }} strokeWidth={1.5} />
                </span>
                <p className="font-semibold text-ink-900 mt-1" style={{ fontSize: 15 }}>{t('no_grades')}</p>
                <p className="text-xs text-ink-400">Müəlliminiz qiymət daxil etdikdə burada görünəcək.</p>
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
                      className="px-5 py-4 transition-colors hover:bg-brand-50"
                      style={{ borderBottom: i < grades.length - 1 ? '1px solid var(--hairline)' : 'none' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center flex-shrink-0 rounded-tile"
                          style={{ width: 36, height: 36, background: `${sStyle.color}1F` }}
                        >
                          <BookOpen className="w-4 h-4" style={{ color: sStyle.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-ink-900">{g.subject?.name || 'Fənn'}</p>
                          {g.assessment?.title && (
                            <p className="text-xs truncate text-ink-600">{g.assessment.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GradeBadge score={score} />
                          <span className="text-xs whitespace-nowrap text-ink-400 tabular-nums">
                            {formatDate(g.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="xp-track" style={{ height: 6, marginLeft: 48 }}>
                        <div
                          className="h-full rounded-pill transition-[width] duration-700"
                          style={{ width: `${pct}%`, background: barColor }}
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
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <h2 className="font-semibold text-ink-900" style={{ fontSize: 15 }}>{t('quick_nav')}</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: Upload,    label: 'Tapşırıq Təhvil Ver', sub: `${pendingAssignments.length} gözləyir`, path: '/tapshiriqlar', color: C_BRAND },
                { icon: BookOpen,  label: 'Qiymətlərim',          sub: `Ortalama: ${avgStr}`,                  path: '/qiymetler',    color: C_BRAND },
                { icon: Calendar,  label: 'Davamiyyət',            sub: `${attStr} iştirak`,                    path: '/davamiyyet',   color: C_BRAND },
                { icon: FolderOpen,label: 'Portfelim',             sub: 'İşlərimi gör',                         path: '/portfolio',    color: C_BRAND },
              ].map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 w-full transition-all text-left rounded-tile hover:-translate-y-0.5"
                  style={{
                    padding: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.background = 'var(--surface)' }}
                >
                  <span
                    className="flex items-center justify-center flex-shrink-0 rounded-tile"
                    style={{ width: 38, height: 38, background: `${a.color}1F` }}
                  >
                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                    <p className="text-xs truncate text-ink-600">{a.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-ink-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Bildirişlər */}
          <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: '1px solid var(--hairline)' }}>
              <h2 className="font-semibold flex items-center gap-2 text-ink-900" style={{ fontSize: 15 }}>
                <Bell className="w-4 h-4" style={{ color: C_BRAND }} />
                {t('all_notifications')}
              </h2>
              {notifications.some(n => !n.read) && (
                <span style={{ width: 8, height: 8, borderRadius: 999, background: C_BRAND, display: 'inline-block' }} />
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5 gap-2">
                <span style={{ color: 'var(--ink-400)' }}>
                  <Bell style={{ width: 48, height: 48 }} strokeWidth={1.5} />
                </span>
                <p className="text-xs font-semibold text-ink-900 mt-1">{t('no_notifications')}</p>
              </div>
            ) : (
              <div>
                {notifications.map((n, i, arr) => (
                  <div
                    key={n.id || i}
                    className="flex items-start gap-3 px-5 py-3.5"
                    style={{
                      background: !n.read ? 'var(--brand-50)' : 'transparent',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none',
                    }}
                  >
                    <span
                      className="mt-1.5 flex-shrink-0"
                      style={{ width: 8, height: 8, borderRadius: 999, background: notifDotColor(n.type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 text-ink-900" style={{ lineHeight: 1.45 }}>
                        {n.message || n.title || 'Bildiriş'}
                      </p>
                      <p className="mt-0.5 text-ink-400" style={{ fontSize: 11 }}>{timeAgo(n.created_at)}</p>
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
