import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { CalendarCheck, AlertTriangle, Check, Users } from 'lucide-react'

const statusConfigBase = {
  present: { color: 'bg-teal text-white', idle: 'border-teal text-teal hover:bg-teal-light' },
  late: { color: 'bg-amber-500 text-white', idle: 'border-amber-500 text-amber-600 hover:bg-amber-50' },
  absent: { color: 'bg-red-600 text-white', idle: 'border-red-600 text-red-600 hover:bg-red-50' },
}

export default function TeacherAttendanceRegister() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [saving, setSaving] = useState(false)
  const [existingRecords, setExistingRecords] = useState(false)
  const [weekDays, setWeekDays] = useState([])

  useEffect(() => {
    if (!profile) return
    loadClasses()
  }, [profile])

  useEffect(() => {
    if (selectedClass && selectedDate) loadStudentsAndAttendance()
  }, [selectedClass, selectedDate])

  useEffect(() => {
    if (selectedClass) loadWeekDays()
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
    const date = new Date(selectedDate)
    const monday = new Date(date)
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d.toISOString().split('T')[0])
    }

    const { data } = await supabase
      .from('attendance')
      .select('date')
      .eq('class_id', selectedClass)
      .gte('date', days[0])
      .lte('date', days[6])

    const recorded = new Set((data || []).map(r => r.date))
    setWeekDays(days.map(d => ({ date: d, recorded: recorded.has(d) })))
  }

  function setStatus(studentId, status) {
    setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === status ? undefined : status }))
  }

  function markAllPresent() {
    const map = {}
    students.forEach(s => { map[s.id] = 'present' })
    setAttendance(map)
  }

  async function handleSave() {
    setSaving(true)
    const records = students
      .filter(s => attendance[s.id])
      .map(s => ({
        student_id: s.id,
        class_id: selectedClass,
        date: selectedDate,
        status: attendance[s.id],
        recorded_by: profile.id,
        school_id: profile.school_id,
      }))

    if (!records.length) {
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,class_id,date' })

    if (!error) {
      setExistingRecords(true)
      loadWeekDays()
    }
    setSaving(false)
  }

  const formatDate = (d) => {
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  const dayLabels = ['B.e', 'C.a', 'C', 'C.a', 'C', 'Sh', 'B']

  if (loading) return <PageSpinner />
  if (!teacherClasses.length) return <EmptyState icon={CalendarCheck} title={t('no_data')} description={t('no_data')} />

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const lateCount = Object.values(attendance).filter(s => s === 'late').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('attendance')}</h1>

      <div className="flex gap-4 items-end">
        <Select label={t('class_name')} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {teacherClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('date')}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>
      </div>

      {existingRecords && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">Bu tarix ucun artiq davamiyyət qeyd olunub. Yadda saxladiqda yenidən yazilacaq.</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="teal" onClick={markAllPresent}>
          <Users className="w-4 h-4 mr-2" />
          {t('mark_all_present')}
        </Button>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{t('present')}: <strong className="text-teal">{presentCount}</strong></span>
          <span>{t('late')}: <strong className="text-amber-600">{lateCount}</strong></span>
          <span>{t('absent')}: <strong className="text-red-600">{absentCount}</strong></span>
        </div>
      </div>

      <Card hover={false}>
        <div className="space-y-2">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between py-3 border-b border-border-soft last:border-0">
              <div className="flex items-center gap-3">
                <Avatar name={s.full_name} color={s.avatar_color} size="sm" />
                <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
              </div>
              <div className="flex gap-2">
                {Object.entries(statusConfigBase).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(s.id, key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      attendance[s.id] === key ? cfg.color : cfg.idle
                    }`}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {students.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-400">Bu sinifde shagird yoxdur</p>
        )}
      </Card>

      <Button onClick={handleSave} loading={saving} disabled={!Object.keys(attendance).length}>
        <Check className="w-4 h-4 mr-2" />
        {t('save')}
      </Button>

      <Card hover={false}>
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('this_week_attendance')}</h3>
        <div className="flex gap-3 justify-center">
          {weekDays.map((d, i) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                d.date === selectedDate ? 'bg-purple-light' : 'hover:bg-surface'
              }`}
            >
              <span className="text-xs text-gray-500">{dayLabels[i]}</span>
              <span className={`text-sm font-medium ${d.date === selectedDate ? 'text-purple' : 'text-gray-700'}`}>
                {new Date(d.date).getDate()}
              </span>
              <div className={`w-2 h-2 rounded-full ${d.recorded ? 'bg-teal' : 'bg-gray-200'}`} />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
