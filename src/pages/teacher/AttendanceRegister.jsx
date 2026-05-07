import { useState, useEffect } from 'react'
import { CalendarCheck, AlertTriangle, Check, Users, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import { fmtNumeric } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'

const DAY_LABELS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C']

const STATUS_BG = {
  present: 'rgba(93,184,163,0.06)',
  late:    'rgba(232,168,124,0.08)',
  absent:  'rgba(229,107,127,0.06)',
  unset:   'transparent',
}
const STATUS_BORDER = {
  present: '#5db8a3',
  late:    '#e8a87c',
  absent:  '#e56b7f',
  unset:   'transparent',
}
const PILL_ACTIVE_BG = {
  present: 'linear-gradient(135deg, #5db8a3, #3d8a73)',
  late:    'linear-gradient(135deg, #e8a87c, #d68a5a)',
  absent:  'linear-gradient(135deg, #e56b7f, #c84d62)',
}
const PILL_IDLE_COLOR = {
  present: '#3d8a73',
  late:    '#b46a3e',
  absent:  '#b83b54',
}
const PILL_IDLE_BG = {
  present: 'rgba(93,184,163,0.10)',
  late:    'rgba(232,168,124,0.12)',
  absent:  'rgba(229,107,127,0.10)',
}

const STATUS_LABELS = {
  present: '✓ İştirak',
  late:    '⏱ Gecikmə',
  absent:  '✗ Qayıb',
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
        <div className="pastel-skeleton h-12 w-72" />
        <div className="pastel-skeleton h-24" />
        <div className="pastel-skeleton h-64" />
      </div>
    )
  }
  if (!teacherClasses.length) {
    return (
      <div className="liquid-card p-12 text-center">
        <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
          <CalendarCheck className="w-8 h-8" />
        </div>
        <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Sinif tapılmadı</p>
        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Sizə hənuz sinif təyin edilməyib.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12 relative">
      {savedToast && (
        <div className="fixed top-6 right-6 toast-success px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 z-50">
          <Check className="w-4 h-4" /> Davamiyyət saxlandı
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
        <span className="pastel-text">Davamiyyət Qeydiyyatı</span>
      </h1>

      {/* Week mini-calendar */}
      <div className="liquid-card px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => shiftWeek(-1)}
          className="p-1.5 rounded-lg smooth-trans"
          style={{ color: '#64748b' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#7c6ee0'; e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
          aria-label="Əvvəlki həftə"
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
                className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl smooth-trans flex-1 max-w-[64px]"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #7c6ee0, #5db8a3)' : 'transparent',
                  color: isSelected ? '#fff' : '#475569',
                  boxShadow: isSelected ? '0 4px 12px rgba(124,110,224,0.25)' : 'none',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(124,110,224,0.06)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : '#94a3b8' }}>
                  {DAY_LABELS[i]}
                </span>
                <span className="text-base font-bold leading-none" style={{ color: isSelected ? '#fff' : (isToday ? '#7c6ee0' : '#1a1a2e') }}>
                  {dayNum}
                </span>
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  background: day.recorded
                    ? (isSelected ? '#fff' : '#5db8a3')
                    : (isSelected ? 'rgba(255,255,255,0.4)' : '#e2e8f0'),
                }} />
              </button>
            )
          })}
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="p-1.5 rounded-lg smooth-trans"
          style={{ color: '#64748b' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#7c6ee0'; e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
          aria-label="Növbəti həftə"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="liquid-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px] max-w-xs">
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Sinif</label>
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
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Tarix</label>
            <input type="date" className="pastel-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <button
            onClick={markAllPresent}
            className="btn-ghost-pastel"
            style={{ padding: '10px 18px', fontSize: 13, borderColor: 'rgba(93,184,163,0.4)', color: '#3d8a73' }}
          >
            <Users className="w-4 h-4" /> Hamısını İştirak Et
          </button>
          <button
            onClick={handleSave}
            disabled={markedCount === 0 || saving}
            className="btn-pastel"
            style={{ padding: '10px 22px', fontSize: 13, opacity: (markedCount === 0 || saving) ? 0.5 : 1 }}
          >
            <Check className="w-4 h-4" /> {saving ? '...' : `Saxla (${markedCount})`}
          </button>
        </div>
      </div>

      {existingRecords && (
        <div className="liquid-card flex items-center gap-2.5 px-4 py-3" style={{ background: 'rgba(232,168,124,0.10)', borderColor: 'rgba(232,168,124,0.3)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#d68a5a' }} />
          <p className="text-sm" style={{ color: '#b46a3e' }}>
            <strong className="font-semibold">{selectedClassName}</strong> sinfi üçün bu tarixdə davamiyyət artıq qeyd olunub. Saxladıqda mövcud qeydlər yenilənəcək.
          </p>
        </div>
      )}

      {saveError && (
        <div className="liquid-card flex items-center gap-2.5 px-4 py-3" style={{ background: 'rgba(229,107,127,0.10)', borderColor: 'rgba(229,107,127,0.3)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#e56b7f' }} />
          <p className="text-sm" style={{ color: '#b83b54' }}>{saveError}</p>
        </div>
      )}

      {/* Summary bar */}
      <div className="liquid-card px-6 py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <span className="text-sm" style={{ color: '#64748b' }}>Cəmi:</span>
            <span className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{totalStudents}</span>
          </div>
          <div className="w-px h-4" style={{ background: 'rgba(124,110,224,0.18)' }} />
          {[
            { color: '#5db8a3', label: 'İştirak', value: presentCount, textColor: '#3d8a73' },
            { color: '#e8a87c', label: 'Gecikmə', value: lateCount, textColor: '#b46a3e' },
            { color: '#e56b7f', label: 'Qayıb', value: absentCount, textColor: '#b83b54' },
            { color: '#cbd5e1', label: 'Qeyd edilməyib', value: notMarked, textColor: '#64748b' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-sm" style={{ color: '#64748b' }}>{s.label}:</span>
              <span className="text-sm font-bold" style={{ color: s.textColor }}>{s.value}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-sm" style={{ color: '#64748b' }}>
            <TrendingUp className="w-4 h-4" />
            <span>{pctMarked}% qeyd edilib</span>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(124,110,224,0.10)' }}>
          <div
            className="h-full rounded-full smooth-trans"
            style={{ width: `${pctMarked}%`, background: 'linear-gradient(90deg, #5db8a3, #6b9dde)' }}
          />
        </div>
      </div>

      {/* Student list */}
      <div className="liquid-card overflow-hidden">
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>Bu sinifdə şagird yoxdur.</p>
          </div>
        ) : (
          <div>
            {students.map((s, idx) => {
              const status = attendance[s.id]
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-6 py-3 smooth-trans"
                  style={{
                    background: STATUS_BG[status ?? 'unset'],
                    borderTop: idx === 0 ? 'none' : '1px solid rgba(124,110,224,0.06)',
                    borderLeft: `3px solid ${STATUS_BORDER[status ?? 'unset']}`,
                  }}
                >
                  <span className="text-xs w-5 text-right flex-shrink-0 select-none" style={{ color: '#cbd5e1' }}>{idx + 1}</span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={s.full_name} color={s.avatar_color} size="md" />
                    <span className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>{s.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {(['present', 'late', 'absent']).map(key => {
                      const isActive = status === key
                      return (
                        <button
                          key={key}
                          onClick={() => setStatus(s.id, key)}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold smooth-trans whitespace-nowrap"
                          style={{
                            background: isActive ? PILL_ACTIVE_BG[key] : PILL_IDLE_BG[key],
                            color: isActive ? '#fff' : PILL_IDLE_COLOR[key],
                            border: isActive ? 'none' : `1px solid ${PILL_IDLE_COLOR[key]}33`,
                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
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

      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={markedCount === 0 || saving}
            className="btn-pastel"
            style={{ padding: '12px 22px', fontSize: 13, opacity: (markedCount === 0 || saving) ? 0.5 : 1 }}
          >
            <Check className="w-4 h-4" /> {saving ? '...' : `Saxla (${markedCount} şagird)`}
          </button>
        </div>
      )}
    </div>
  )
}
