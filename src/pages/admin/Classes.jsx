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
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'

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

  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pastel-skeleton h-8 w-40 rounded-input" />
        <div className="pastel-skeleton h-9 w-28 rounded-input" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pastel-skeleton h-36 rounded-tile" />
        ))}
      </div>
    </div>
  )

  // ── Class detail view ──────────────────────────────────────────────────────
  if (selectedClass) {
    return (
      <div className="space-y-5">
        {/* Detail header */}
        <div className="bg-surface rounded-tile border border-hairline px-6 py-5 shadow-soft">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSelectedClass(null)}
              className="p-2 rounded-input text-ink-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">{selectedClass.name}</h1>
              {selectedClass.grade_level && (
                <p className="text-xs text-ink-400 mt-0.5">{selectedClass.grade_level}-ci sinif</p>
              )}
            </div>
            <span className="pill-mint ml-auto">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {classStudents.length} {t('students')}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-input px-4 py-2.5 text-sm font-medium" style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {/* Add student panel */}
        <Card hover={false} className="rounded-tile">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">{t('add_student')}</p>
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
            <Button size="sm" onClick={addStudentsToClass} loading={saving} disabled={addStudentIds.length === 0}>
              <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> {t('add')}</span>
            </Button>
          </div>

          {allStudents.length === 0 && !saving && (
            <p className="text-xs text-ink-400 mt-2">Bütün şagirdlər artıq bu sinfə əlavə edilib və ya heç bir şagird yoxdur.</p>
          )}

          {addStudentIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {addStudentIds.map(id => {
                const student = allStudents.find(s => s.id === id)
                return (
                  <span key={id} className="pill-peri flex items-center gap-1.5">
                    {student?.full_name}
                    <button
                      onClick={() => setAddStudentIds(prev => prev.filter(i => i !== id))}
                      className="hover:text-brand-700 transition-colors"
                      aria-label="Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </Card>

        {/* Students in class table */}
        <Card hover={false} className="p-0 overflow-hidden rounded-tile">
          {classStudents.length === 0 ? (
            <EmptyState
              title="Sinifə şagird yoxdur"
              description="Yuxarıdakı sahədən şagird əlavə edin."
            />
          ) : (
            <Table
              columns={[
                {
                  key: 'full_name',
                  label: t('full_name'),
                  render: (val, row) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={val} size="sm" ring={false} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900 truncate leading-tight">{val}</p>
                        <p className="text-xs text-ink-400 truncate mt-0.5">{row.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'email',
                  label: t('email'),
                  render: () => null, // shown in name cell
                },
                {
                  key: 'actions',
                  label: '',
                  render: (_, row) => (
                    <button
                      onClick={() => removeStudentFromClass(row.id)}
                      className="p-1.5 rounded-input text-ink-400 hover:text-danger hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
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
          )}
        </Card>
      </div>
    )
  }

  // ── Classes grid view ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bg-surface rounded-tile border border-hairline px-6 py-5 shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">{t('classes')}</h1>
              <span className="pill-muted mt-1 inline-block">{classes.length} sinif</span>
            </div>
          </div>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> {t('add')}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-input px-4 py-2.5 text-sm font-medium" style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      {classes.length === 0 ? (
        <EmptyState
          title={t('no_data')}
          description="Məktəbiniz üçün sinif əlavə edin."
          actionLabel={t('add')}
          onAction={() => setAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => {
            const teacher = teachers.find(tc => tc.id === cls.teacher_id)
            return (
              <Card
                key={cls.id}
                hover
                className="cursor-pointer group rounded-tile"
                onClick={() => openClassDetail(cls)}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {/* Student count pill */}
                  <span className={cls.student_count > 0 ? 'pill-mint' : 'pill-muted'}>
                    <Users className="w-3 h-3 inline mr-1" />
                    {cls.student_count}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-ink-900 mb-3 leading-tight">{cls.name}</h3>

                <div className="flex flex-wrap gap-1.5">
                  {cls.grade_level && (
                    <span className="pill-muted">{cls.grade_level}-ci sinif</span>
                  )}
                  {teacher ? (
                    <span className="pill-peri">{teacher.full_name}</span>
                  ) : (
                    <span className="text-xs text-ink-400 italic">Müəllim yoxdur</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Class Modal */}
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
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setForm({ name: '', grade_level: '', teacher_id: '' }) }}>{t('cancel')}</Button>
            <Button onClick={handleAddClass} loading={saving} disabled={!form.name.trim()}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
