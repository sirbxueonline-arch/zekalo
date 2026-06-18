import { useState, useEffect } from 'react'
import { CalendarCheck, AlertTriangle, Check, Users, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import { fmtNumeric } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

const DAY_LABELS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C']

// Status row accent — token-aligned colors
const STATUS_ROW_BG = {
  present: 'rgba(34,197,94,0.06)',
  late:    'rgba(245,158,11,0.08)',
  absent:  'rgba(239,68,68,0.06)',
  unset:   'transparent',
}
const STATUS_ROW_BORDER = {
  present: 'var(--mint)',
  late:    '#F59E0B',
  absent:  '#EF4444',
  unset:   'transparent',
}

// Active pill: solid fill matching token palette
const PILL_ACTIVE = {
  present: { bg: 'var(--mint)',  text: '#fff' },
  late:    { bg: '#F59E0B',       text: '#fff' },
  absent:  { bg: '#EF4444',       text: '#fff' },
}
// Idle pill: tint bg
const PILL_IDLE = {
  present: { bg: '#DCFCE7', text: '#15803D' },
  late:    { bg: '#FEF3C7', text: '#B45309' },
  absent:  { bg: '#FEE2E2', text: '#B91C1C' },
}

const STATUS_LABELS = {
  present: 'İştirak',
  late:    'Gecikmə',
  absent:  'Qayıb',
}

function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr)
  const dayOfWeek = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayOfWeek)
  return monday
}

function getWeekDates(dateStr) {
  const monday = getMondayOfWeek(dateStr)
  const days = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function TeacherAttendanceRegister() {
  const { profile } = useAuth()

  const [loading, setLoading]               = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass]   = useState('')
  const [selectedDate, setSelectedDate]     = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents]             = useState([])
  const [attendance, setAttendance]         = useState({})
  const [saving, setSaving]                 = useState(false)
  const [saveError, setSaveError]           = useState(null)
  const [savedToast, setSavedToast]         = useState(false)
  const [existingRecords, setExistingRecords] = useState(false)
  const [weekDays, setWeekDays]             = useState([])

  useEffect(() => {
    if (!profile) return
    loadClasses()
  }, [profile])

  useEffect(() => {
    if (selectedClass && selectedDate) loadStudentsAndAttendance()
  }, [selectedClass, selectedDate])

  useEffect(() => {
    if (selectedClass && selectedDate) loadWeekDays()
  }, [selectedClass, selectedDate])

  async function loadClasses() {
    const { data } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name)')
      .eq('teacher_id', profile.id)

    const unique = [...new Map((data || []).map(tc => [tc.class_id, tc.class])).values()]
    setTeacherClasses(unique)
    if (unique.length) setSelectedClass(unique[0].id)
    setLoading(false)
  }

  async function loadStudentsAndAttendance() {
    const [studentsRes, attRes] = await Promise.all([
      supabase.from('class_members').select('*, student:profiles(id, full_name, avatar_color)').eq('class_id', selectedClass),
      supabase.from('attendance').select('*').eq('class_id', selectedClass).eq('date', selectedDate),
    ])

    const studentList = (studentsRes.data || []).map(m => m.student).filter(Boolean)
    setStudents(studentList)

    const attMap = {}
    const records = attRes.data || []
    records.forEach(r => { attMap[r.student_id] = r.status })
    setAttendance(attMap)
    setExistingRecords(records.length > 0)
  }

  async function loadWeekDays() {
    const dates = getWeekDates(selectedDate)
    const { data } = await supabase
      .from('attendance')
      .select('date')
      .eq('class_id', selectedClass)
      .gte('date', dates[0])
      .lte('date', dates[4])

    const recorded = new Set((data || []).map(r => r.date))
    setWeekDays(dates.map(d => ({ date: d, recorded: recorded.has(d) })))
  }

  function setStatus(studentId, status) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status,
    }))
  }

  function markAllPresent() {
    const map = {}
    students.forEach(s => { map[s.id] = 'present' })
    setAttendance(map)
  }

  function shiftWeek(direction) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + direction * 7)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const records = students
      .filter(s => attendance[s.id])
      .map(s => ({
        student_id: s.id,
        class_id:   selectedClass,
        date:       selectedDate,
        status:     attendance[s.id],
        recorded_by: profile.id,
        school_id:   profile.school_id,
      }))

    if (!records.length) {
      setSaving(false)
      return
    }

    const { error } = await supabase.from('attendance').upsert(records, { onConflict: 'student_id,class_id,date' })

    if (error) {
      setSaveError(error.message || 'Saxlama zamanı xəta baş verdi.')
    } else {
      setExistingRecords(true)
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 2400)
      await loadWeekDays()

      const absentIds = records.filter(r => r.status === 'absent').map(r => r.student_id)
      if (absentIds.length > 0) {
        notifyUsers(absentIds.map(id => ({
          profile_id: id,
          school_id: profile.school_id,
          title: 'Davamiyyət qeydi',
          body: `${fmtNumeric(selectedDate)} tarixli dərsdə iştirak etmədiniz.`,
          type: 'attendance',
        }))).catch(console.error)
      }
    }
    setSaving(false)
  }

  const presentCount  = Object.values(attendance).filter(s => s === 'present').length
  const lateCount     = Object.values(attendance).filter(s => s === 'late').length
  const absentCount   = Object.values(attendance).filter(s => s === 'absent').length
  const markedCount   = presentCount + lateCount + absentCount
  const totalStudents = students.length
  const pctMarked     = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0
  const notMarked     = totalStudents - markedCount

  const selectedClassName = teacherClasses.find(c => c.id === selectedClass)?.name ?? ''

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-10 w-64 rounded-tile" />
        <div className="pastel-skeleton h-16 rounded-card" />
        <div className="pastel-skeleton h-64 rounded-tile" />
      </div>
    )
  }

  if (!teacherClasses.length) {
    return (
      <EmptyState
        tier={1}
        icon={CalendarCheck}
        title="Sinif tapılmadı"
        description="Sizə hənuz sinif təyin edilməyib."
      />
    )
  }

  return (
    <div className="space-y-5 pb-12 relative">
      {/* ── Quiet success toast (bottom-center) ── */}
      {savedToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-tile text-sm font-semibold text-white shadow-soft-lg"
          style={{
            background: 'var(--mint)',
            animation: 'slideUp .25s var(--ease-out-quint)',
          }}
          role="status"
          aria-live="polite"
        >
          <Check className="w-4 h-4" /> Davamiyyət saxlandı
        </div>
      )}

      {/* ── Page title ── */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
          Davamiyyət Qeydiyyatı
        </h1>
        <p className="text-sm mt-1 text-ink-400">Günlük davamiyyəti qeyd edin</p>
      </div>

      {/* ── Week mini-calendar strip ── */}
      <div className="liquid-card px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => shiftWeek(-1)}
          aria-label="Əvvəlki həftə"
          className="p-2 rounded-tile smooth-trans text-ink-400 hover:text-brand-500 hover:bg-brand-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-1 justify-around gap-1">
          {weekDays.map((day, i) => {
            const isSelected = day.date === selectedDate
            const dayNum     = new Date(day.date).getDate()
            const isToday    = day.date === new Date().toISOString().split('T')[0]

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-tile smooth-trans flex-1 max-w-[64px]"
                style={{
                  background: isSelected ? 'var(--brand-500)' : 'transparent',
                }}
              >
                <span
                  className="text-[11px] font-semibold tracking-wide uppercase"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--ink-400)' }}
                >
                  {DAY_LABELS[i]}
                </span>
                <span
                  className="text-base font-bold leading-none tabular-nums"
                  style={{
                    color: isSelected ? '#fff' : isToday ? 'var(--brand-500)' : 'var(--ink-900)',
                  }}
                >
                  {dayNum}
                </span>
                {/* Recorded indicator dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: day.recorded
                      ? (isSelected ? '#fff' : 'var(--mint)')
                      : isSelected ? 'rgba(255,255,255,0.35)' : 'var(--hairline-strong)',
                  }}
                />
              </button>
            )
          })}
        </div>

        <button
          onClick={() => shiftWeek(1)}
          aria-label="Növbəti həftə"
          className="p-2 rounded-tile smooth-trans text-ink-400 hover:text-brand-500 hover:bg-brand-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="liquid-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px] max-w-xs">
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Sinif</label>
            <select
              className="pastel-input"
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setAttendance({}) }}
            >
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Tarix</label>
            <input
              type="date"
              className="pastel-input"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllPresent}
          >
            <Users className="w-4 h-4" /> Hamısını İştirak Et
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            disabled={markedCount === 0 || saving}
            onClick={handleSave}
          >
            <Check className="w-4 h-4" /> {saving ? '...' : `Saxla (${markedCount})`}
          </Button>
        </div>
      </div>

      {/* ── Existing records warning ── */}
      {existingRecords && (
        <div
          className="liquid-card flex items-center gap-2.5 px-4 py-3 rounded-tile"
          style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#B45309' }} />
          <p className="text-sm" style={{ color: '#B45309' }}>
            <strong className="font-semibold">{selectedClassName}</strong> sinfi üçün bu tarixdə davamiyyət artıq qeyd olunub. Saxladıqda mövcud qeydlər yenilənəcək.
          </p>
        </div>
      )}

      {/* ── Save error ── */}
      {saveError && (
        <div
          className="liquid-card flex items-center gap-2.5 px-4 py-3 rounded-tile"
          style={{ background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#B91C1C' }} />
          <p className="text-sm" style={{ color: '#B91C1C' }}>{saveError}</p>
        </div>
      )}

      {/* ── Summary bar ── */}
      <div className="liquid-card px-6 py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-ink-400" />
            <span className="text-sm text-ink-600">Cəmi:</span>
            <span className="text-sm font-bold text-ink-900 tabular-nums">{totalStudents}</span>
          </div>
          <div className="w-px h-4 bg-hairline" />
          {[
            { color: 'var(--mint)',              label: 'İştirak',        value: presentCount, textColor: '#15803D' },
            { color: '#F59E0B',                   label: 'Gecikmə',        value: lateCount,    textColor: '#B45309' },
            { color: '#EF4444',                   label: 'Qayıb',          value: absentCount,  textColor: '#B91C1C' },
            { color: 'var(--hairline-strong)',     label: 'Qeyd edilməyib', value: notMarked,    textColor: 'var(--ink-600)' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-sm text-ink-400">{s.label}:</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: s.textColor }}>{s.value}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-sm text-ink-400">
            <TrendingUp className="w-4 h-4" />
            <span className="tabular-nums">{pctMarked}% qeyd edilib</span>
          </div>
        </div>
        {/* Completion progress track */}
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-hairline">
          <div
            className="h-full rounded-full smooth-trans"
            style={{
              width: `${pctMarked}%`,
              background: 'var(--brand-500)',
            }}
          />
        </div>
      </div>

      {/* ── Student list ── */}
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            tier={1}
            icon={Users}
            title="Bu sinifdə şagird yoxdur"
            description="Sinfə şagird əlavə edildikdən sonra burada görünəcək."
            className="border-0 shadow-none"
          />
        ) : (
          <div>
            {students.map((s, idx) => {
              const status = attendance[s.id]
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-3 smooth-trans"
                  style={{
                    background: STATUS_ROW_BG[status ?? 'unset'],
                    borderTop: idx === 0 ? 'none' : '1px solid var(--hairline)',
                    borderLeft: `3px solid ${STATUS_ROW_BORDER[status ?? 'unset']}`,
                  }}
                >
                  <span className="text-xs w-5 text-right flex-shrink-0 select-none text-ink-400 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={s.full_name} color={s.avatar_color} size="md" />
                    <span className="text-sm font-semibold truncate text-ink-900">{s.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {(['present', 'late', 'absent']).map(key => {
                      const isActive = status === key
                      const pill = isActive ? PILL_ACTIVE[key] : PILL_IDLE[key]
                      return (
                        <button
                          key={key}
                          onClick={() => setStatus(s.id, key)}
                          className="px-3.5 py-1.5 rounded-pill text-sm font-semibold smooth-trans whitespace-nowrap"
                          style={{
                            background: pill.bg,
                            color: pill.text,
                            border: isActive ? 'none' : '1px solid transparent',
                          }}
                        >
                          {STATUS_LABELS[key]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom save button ── */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            loading={saving}
            disabled={markedCount === 0 || saving}
            onClick={handleSave}
          >
            <Check className="w-4 h-4" /> {saving ? '...' : `Saxla (${markedCount} şagird)`}
          </Button>
        </div>
      )}
    </div>
  )
}
