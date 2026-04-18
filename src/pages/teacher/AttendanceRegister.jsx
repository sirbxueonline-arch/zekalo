import { useState, useEffect } from 'react'
import { CalendarCheck, AlertTriangle, Check, Users, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { fmtNumeric } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'

// Day labels Mon–Fri only (indexes 0–4 = Mon–Fri)
const DAY_LABELS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C']

// Row background + left-border color when a status is set
const ROW_STYLE = {
  present: 'bg-teal-50/50 border-l-4 border-l-teal-500',
  late:    'bg-amber-50/50 border-l-4 border-l-amber-400',
  absent:  'bg-red-50/50  border-l-4 border-l-red-400',
  unset:   'border-l-4 border-l-transparent',
}

// Active (selected) pill style
const PILL_ACTIVE = {
  present: 'bg-teal-600  text-white border-teal-600  shadow-sm',
  late:    'bg-amber-500 text-white border-amber-500 shadow-sm',
  absent:  'bg-red-600   text-white border-red-600   shadow-sm',
}

// Idle pill style
const PILL_IDLE = {
  present: 'border-teal-300   text-teal-700   hover:bg-teal-50',
  late:    'border-amber-300  text-amber-700  hover:bg-amber-50',
  absent:  'border-red-300    text-red-700    hover:bg-red-50',
}

const STATUS_LABELS = {
  present: '✓ İştirak',
  late:    '⏱ Gecikmə',
  absent:  '✗ Qayıb',
}

// Returns the Monday of the week containing `dateStr`
function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr)
  // getDay(): 0=Sun,1=Mon,...,6=Sat. We want Mon=0 offset.
  const dayOfWeek = (d.getDay() + 6) % 7 // Mon=0 ... Sun=6
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayOfWeek)
  return monday
}

// Build an array of 5 date strings for Mon–Fri of the week containing `dateStr`
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
  const [attendance, setAttendance]         = useState({})   // { [studentId]: 'present'|'late'|'absent' }
  const [saving, setSaving]                 = useState(false)
  const [saveError, setSaveError]           = useState(null)
  const [existingRecords, setExistingRecords] = useState(false)
  const [weekDays, setWeekDays]             = useState([])   // [{ date, recorded }]

  // ── Load teacher's classes once ────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    loadClasses()
  }, [profile])

  // ── Reload students + attendance whenever class or date changes ────────────
  useEffect(() => {
    if (selectedClass && selectedDate) loadStudentsAndAttendance()
  }, [selectedClass, selectedDate])

  // ── Reload week strip whenever class or date changes ───────────────────────
  useEffect(() => {
    if (selectedClass && selectedDate) loadWeekDays()
  }, [selectedClass, selectedDate])

  // ── Data fetchers ──────────────────────────────────────────────────────────

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
      supabase
        .from('class_members')
        .select('*, student:profiles(id, full_name, avatar_color)')
        .eq('class_id', selectedClass),
      supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate),
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

  // ── Actions ────────────────────────────────────────────────────────────────

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
        student_id:   s.id,
        class_id:     selectedClass,
        date:         selectedDate,
        status:       attendance[s.id],
        recorded_by:  profile.id,
        school_id:    profile.school_id,
      }))

    if (!records.length) {
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,class_id,date' })

    if (error) {
      setSaveError(error.message || 'Saxlama zamanı xəta baş verdi.')
    } else {
      setExistingRecords(true)
      await loadWeekDays()

      // Fire-and-forget: notify absent students
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

  // ── Derived values ─────────────────────────────────────────────────────────

  const presentCount  = Object.values(attendance).filter(s => s === 'present').length
  const lateCount     = Object.values(attendance).filter(s => s === 'late').length
  const absentCount   = Object.values(attendance).filter(s => s === 'absent').length
  const markedCount   = presentCount + lateCount + absentCount
  const totalStudents = students.length
  const pctMarked     = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0
  const notMarked     = totalStudents - markedCount

  const selectedClassName = teacherClasses.find(c => c.id === selectedClass)?.name ?? ''

  // ── Early returns ──────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />
  if (!teacherClasses.length) return (
    <EmptyState
      icon={CalendarCheck}
      title="Sinif tapılmadı"
      description="Sizə hənuz sinif təyin edilməyib."
    />
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-12">

      {/* ── Page title ───────────────────────────────────────────────────── */}
      <h1 className="font-serif text-4xl text-gray-900">Davamiyyət Qeydiyyatı</h1>

      {/* ══ WEEK MINI-CALENDAR STRIP ═════════════════════════════════════════ */}
      <div className="bg-white border border-border-soft rounded-2xl px-5 py-4 flex items-center gap-3">
        {/* Prev week */}
        <button
          onClick={() => shiftWeek(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0"
          aria-label="Əvvəlki həftə"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Day buttons */}
        <div className="flex flex-1 justify-around gap-1">
          {weekDays.map((day, i) => {
            const isSelected = day.date === selectedDate
            const dayNum     = new Date(day.date).getDate()
            const isToday    = day.date === new Date().toISOString().split('T')[0]

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all flex-1 max-w-[64px] ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className={`text-xs font-medium tracking-wide uppercase ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}>
                  {DAY_LABELS[i]}
                </span>
                <span className={`text-base font-bold leading-none ${isSelected ? 'text-white' : isToday ? 'text-purple-600' : 'text-gray-800'}`}>
                  {dayNum}
                </span>
                {/* Record dot */}
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  day.recorded
                    ? (isSelected ? 'bg-white' : 'bg-teal-500')
                    : (isSelected ? 'bg-purple-400' : 'bg-gray-200')
                }`} />
              </button>
            )
          })}
        </div>

        {/* Next week */}
        <button
          onClick={() => shiftWeek(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0"
          aria-label="Növbəti həftə"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ══ TOOLBAR ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Class selector */}
        <div className="flex-1 min-w-[180px] max-w-xs">
          <Select
            label="Sinif"
            value={selectedClass}
            onChange={e => {
              setSelectedClass(e.target.value)
              setAttendance({})
            }}
          >
            {teacherClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        {/* Date picker */}
        <div className="flex-1 min-w-[160px] max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarix</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent bg-white"
          />
        </div>

        {/* Mark all present */}
        <button
          onClick={markAllPresent}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-teal-500 text-teal-700 font-medium text-sm hover:bg-teal-50 transition-colors"
        >
          <Users className="w-4 h-4" />
          Hamısını İştirak Et
        </button>

        {/* Save button */}
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={markedCount === 0 || saving}
          className="whitespace-nowrap"
        >
          <Check className="w-4 h-4 mr-2" />
          Saxla ({markedCount} şagird)
        </Button>
      </div>

      {/* ══ EXISTING RECORDS WARNING ═════════════════════════════════════════ */}
      {existingRecords && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong className="font-semibold">{selectedClassName}</strong> sinfi üçün bu tarixdə davamiyyət artıq qeyd olunub.
            Saxladıqda mövcud qeydlər yenilənəcək.
          </p>
        </div>
      )}

      {/* ══ SAVE ERROR ═══════════════════════════════════════════════════════ */}
      {saveError && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">{saveError}</p>
        </div>
      )}

      {/* ══ LIVE SUMMARY BAR ═════════════════════════════════════════════════ */}
      <div className="bg-white border border-border-soft rounded-2xl px-6 py-4 space-y-3">
        {/* Stat pills */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Total */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Cəmi:</span>
            <span className="text-sm font-bold text-gray-900">{totalStudents}</span>
          </div>

          <div className="w-px h-4 bg-border-soft" />

          {/* Present */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-sm text-gray-500">İştirak:</span>
            <span className="text-sm font-bold text-teal-700">{presentCount}</span>
          </div>

          {/* Late */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-sm text-gray-500">Gecikmə:</span>
            <span className="text-sm font-bold text-amber-700">{lateCount}</span>
          </div>

          {/* Absent */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm text-gray-500">Qayıb:</span>
            <span className="text-sm font-bold text-red-700">{absentCount}</span>
          </div>

          {/* Not marked */}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="text-sm text-gray-500">Qeyd edilməyib:</span>
            <span className="text-sm font-bold text-gray-500">{notMarked}</span>
          </div>

          {/* Pct label pushed to the right */}
          <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{pctMarked}% qeyd edilib</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${pctMarked}%` }}
          />
        </div>
      </div>

      {/* ══ STUDENT LIST ═════════════════════════════════════════════════════ */}
      <div className="bg-white border border-border-soft rounded-2xl overflow-hidden">
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Bu sinifdə şagird yoxdur.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((s, idx) => {
              const status = attendance[s.id]
              const rowBg  = ROW_STYLE[status ?? 'unset']

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${rowBg}`}
                >
                  {/* Index */}
                  <span className="text-xs text-gray-300 w-5 text-right flex-shrink-0 select-none">
                    {idx + 1}
                  </span>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={s.full_name} color={s.avatar_color} size="md" />
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {s.full_name}
                    </span>
                  </div>

                  {/* Status pills */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(['present', 'late', 'absent']).map(key => {
                      const isActive = status === key
                      return (
                        <button
                          key={key}
                          onClick={() => setStatus(s.id, key)}
                          className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap ${
                            isActive ? PILL_ACTIVE[key] : `border-2 bg-white ${PILL_IDLE[key]}`
                          }`}
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

      {/* ══ BOTTOM SAVE BUTTON (secondary, for convenience) ══════════════════ */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={markedCount === 0 || saving}
          >
            <Check className="w-4 h-4 mr-2" />
            Saxla ({markedCount} şagird)
          </Button>
        </div>
      )}
    </div>
  )
}
