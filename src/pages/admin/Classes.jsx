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
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

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
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedClass(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-3xl text-gray-900">{selectedClass.name}</h1>
          <Badge variant="default">{classStudents.length} {t('students')}</Badge>
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
                    <button onClick={() => setAddStudentIds(prev => prev.filter(i => i !== id))} className="hover:text-purple">
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
                render: (val) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={val} size="sm" />
                    <span className="font-medium text-gray-900">{val}</span>
                  </div>
                ),
              },
              { key: 'email', label: t('email') },
              {
                key: 'actions',
                label: '',
                render: (_, row) => (
                  <button
                    onClick={() => removeStudentFromClass(row.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Sinfden çıxar"
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
          {classes.map(cls => (
            <Card key={cls.id} className="cursor-pointer" onClick={() => openClassDetail(cls)}>
              <h3 className="font-serif text-xl text-gray-900 mb-4">{cls.name}</h3>
              <div className="space-y-2">
                {cls.grade_level && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span>Səviyyə: {cls.grade_level}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{cls.student_count} {t('students')}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('add')}>
        <div className="space-y-4">
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
            <Button variant="ghost" onClick={() => setAddModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddClass} loading={saving} disabled={!form.name.trim()}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
