import { useState, useEffect } from 'react'
import { Plus, Users, BookOpen, ArrowLeft, UserPlus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function Classes() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [classStudents, setClassStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [addStudentIds, setAddStudentIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', grade_level: '', teacher_id: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [classesRes, teachersRes] = await Promise.all([
        // Use class_members for accurate student count
        supabase.from('classes').select('*, class_members(id)').eq('school_id', profile.school_id).order('name'),
        supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'teacher').order('full_name'),
      ])
      if (classesRes.error) throw classesRes.error
      const classesWithCounts = (classesRes.data || []).map(c => ({
        ...c,
        student_count: c.class_members?.length || 0,
      }))
      setClasses(classesWithCounts)
      setTeachers(teachersRes.data || [])
    } catch (err) {
      console.error('fetchData error:', err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleAddClass() {
    if (!form.name.trim()) return
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('classes').insert({
        name: form.name.trim(),
        grade_level: form.grade_level || null,
        teacher_id: form.teacher_id || null,
        school_id: profile.school_id,
      })
      if (err) throw err
      setAddModal(false)
      setForm({ name: '', grade_level: '', teacher_id: '' })
      await fetchData()
    } catch (err) {
      console.error('handleAddClass error:', err)
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function openClassDetail(cls) {
    setSelectedClass(cls)
    setAddStudentIds([])
    setError(null)
    try {
      // Get students already in this class via class_members
      const { data: membersData, error: membersErr } = await supabase
        .from('class_members')
        .select('student:profiles(id, full_name, email)')
        .eq('class_id', cls.id)

      if (membersErr) throw membersErr

      const inClassStudents = (membersData || []).map(m => m.student).filter(Boolean)
      const inClassIds = new Set(inClassStudents.map(s => s.id))

      // Get ALL students in this school
      const { data: allData, error: allErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('school_id', profile.school_id)
        .eq('role', 'student')
        .order('full_name')

      if (allErr) throw allErr

      // Available = school students NOT already in this class
      const available = (allData || []).filter(s => !inClassIds.has(s.id))

      setClassStudents(inClassStudents)
      setAllStudents(available)
    } catch (err) {
      console.error('openClassDetail error:', err)
      setError(t('error'))
    }
  }

  async function addStudentsToClass() {
    if (addStudentIds.length === 0) return
    try {
      setSaving(true)
      setError(null)
      // Insert into class_members (junction table — no class_id column needed on profiles)
      const inserts = addStudentIds.map(sid => ({
        class_id: selectedClass.id,
        student_id: sid,
      }))
      const { error: err } = await supabase.from('class_members').insert(inserts)
      if (err) throw err
      setAddStudentIds([])
      await openClassDetail(selectedClass)
      await fetchData()
    } catch (err) {
      console.error('addStudentsToClass error:', err)
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function removeStudentFromClass(studentId) {
    try {
      setError(null)
      const { error: err } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', selectedClass.id)
        .eq('student_id', studentId)
      if (err) throw err
      await openClassDetail(selectedClass)
      await fetchData()
    } catch (err) {
      console.error('removeStudentFromClass error:', err)
      setError(t('error'))
    }
  }

  if (loading) return <PageSpinner />

  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setSelectedClass(null)}
            className="p-2 text-gray-400 hover:text-purple transition-colors rounded-lg hover:bg-purple-light"
            aria-label="Geri"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-3xl text-gray-900">{selectedClass.name}</h1>
            {selectedClass.grade_level && (
              <p className="text-sm text-gray-400 mt-0.5">{selectedClass.grade_level}-ci sinif</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-teal-light text-[#085041]">
            <Users className="w-4 h-4" />
            {classStudents.length} {t('students')}
          </span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Card hover={false}>
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('add_student')}</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select value="" onChange={(e) => {
                const id = e.target.value
                if (id && !addStudentIds.includes(id)) setAddStudentIds(prev => [...prev, id])
                e.target.value = ''
              }}>
                <option value="">{t('students')}...</option>
                {allStudents
                  .filter(s => !addStudentIds.includes(s.id))
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                  ))}
              </Select>
            </div>
            <Button onClick={addStudentsToClass} loading={saving} disabled={addStudentIds.length === 0}>
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> {t('add')}</span>
            </Button>
          </div>

          {allStudents.length === 0 && !saving && (
            <p className="text-xs text-gray-400 mt-2">Bütün şagirdlər artıq bu sinfə əlavə edilib və ya heç bir şagird yoxdur.</p>
          )}

          {addStudentIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {addStudentIds.map(id => {
                const student = allStudents.find(s => s.id === id)
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 bg-purple-light text-purple-dark rounded-full text-xs font-medium px-3 py-1">
                    {student?.full_name}
                    <button onClick={() => setAddStudentIds(prev => prev.filter(i => i !== id))} className="hover:text-purple" aria-label="Sil">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </Card>

        <Card hover={false} className="p-0 overflow-hidden">
          <Table
            columns={[
              {
                key: 'full_name',
                label: t('full_name'),
                render: (val, row) => {
                  // Generate initials and a stable color from the name
                  const parts = (val || '').split(' ').filter(Boolean)
                  const initials = parts.length >= 2
                    ? parts[0][0] + parts[parts.length - 1][0]
                    : (parts[0]?.[0] || '?')
                  const colors = [
                    'bg-[#EDE9FF] text-[#534AB7]',
                    'bg-[#D1FAF0] text-[#0D6B52]',
                    'bg-[#DBEAFE] text-[#1E40AF]',
                    'bg-[#FEF3C7] text-[#92400E]',
                    'bg-[#FCE7F3] text-[#9D174D]',
                    'bg-[#FEE2E2] text-[#991B1B]',
                  ]
                  let hash = 0
                  for (const c of (val || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash)
                  const colorClass = colors[Math.abs(hash) % colors.length]
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase ${colorClass}`}>
                        {initials.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{val}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                      </div>
                    </div>
                  )
                },
              },
              {
                key: 'email',
                label: t('email'),
                render: () => null, // email shown in name cell — hide duplicate
              },
              {
                key: 'actions',
                label: '',
                render: (_, row) => (
                  <button
                    onClick={() => removeStudentFromClass(row.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    aria-label="Sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
            data={classStudents}
            emptyMessage={t('no_data')}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">{t('classes')}</h1>
        <Button onClick={() => setAddModal(true)}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t('add')}</span>
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {classes.length === 0 ? (
        <EmptyState icon={BookOpen} title={t('no_data')} description={t('add')} actionLabel={t('add')} onAction={() => setAddModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => {
            const teacher = teachers.find(tc => tc.id === cls.teacher_id)
            return (
              <Card key={cls.id} className="cursor-pointer group" onClick={() => openClassDetail(cls)}>
                {/* Card header accent */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0 group-hover:bg-purple/20 transition-colors">
                    <BookOpen className="w-5 h-5 text-purple" />
                  </div>
                  {/* Student count pill */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${cls.student_count > 0 ? 'bg-teal-light text-[#085041]' : 'bg-surface text-gray-500'}`}>
                    <Users className="w-3 h-3" />
                    {cls.student_count}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-gray-900 mb-3">{cls.name}</h3>

                <div className="flex flex-wrap gap-2">
                  {cls.grade_level && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-gray-600 border border-border-soft">
                      {cls.grade_level}-ci sinif
                    </span>
                  )}
                  {teacher && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-light text-purple-dark border border-[#AFA9EC]">
                      {teacher.full_name}
                    </span>
                  )}
                  {!teacher && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-gray-400 border border-border-soft italic">
                      Müəllim yoxdur
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={addModal} onClose={() => { setAddModal(false); setForm({ name: '', grade_level: '', teacher_id: '' }) }} title={t('add')}>
        <div className="space-y-4" onKeyDown={e => { if (e.key === 'Enter' && !saving) handleAddClass() }}>
          <Input
            label={t('class_name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Məs: 10-A"
          />
          <Input
            label="Səviyyə"
            type="text"
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
            placeholder="Məs: 10"
          />
          <Select
            label={t('teachers')}
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
          >
            <option value="">{t('teachers')}</option>
            {teachers.map(tc => (
              <option key={tc.id} value={tc.id}>{tc.full_name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setForm({ name: '', grade_level: '', teacher_id: '' }) }}>{t('cancel')}</Button>
            <Button onClick={handleAddClass} loading={saving} disabled={!form.name.trim()}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
