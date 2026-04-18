import { useState, useEffect } from 'react'
import { Plus, Briefcase, Calendar, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import { Textarea, Select } from '../../components/ui/Input'
import { fmtLong } from '../../lib/dateUtils'

const SUBJECTS = [
  'Riyaziyyat', 'Fizika', 'Kimya', 'Biologiya', 'Tarix',
  'Ədəbiyyat', 'İngilis dili', 'İnformatika', 'İncəsənət', 'Digər',
]

const subjectColors = {
  'Riyaziyyat': 'bg-blue-50 text-blue-700',
  'Fizika': 'bg-orange-50 text-orange-700',
  'Kimya': 'bg-green-50 text-green-700',
  'Biologiya': 'bg-teal-light text-[#085041]',
  'Tarix': 'bg-amber-50 text-amber-700',
  'Ədəbiyyat': 'bg-purple-light text-purple-dark',
  'İngilis dili': 'bg-indigo-50 text-indigo-700',
  'İnformatika': 'bg-cyan-50 text-cyan-700',
  'İncəsənət': 'bg-pink-50 text-pink-700',
  'Digər': 'bg-surface text-gray-600',
}

function getSubjectColor(subject) {
  return subjectColors[subject] || subjectColors['Digər']
}

export default function Portfolio() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [viewModal, setViewModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', subject: SUBJECTS[0], reflection: '', date: '' })

  useEffect(() => {
    if (profile?.id) fetchItems()
  }, [profile?.id])

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setItems(data || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', subject: SUBJECTS[0], reflection: '', date: new Date().toISOString().split('T')[0] })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('portfolio_items').insert({
        title: form.title,
        description: form.description,
        subject: form.subject,
        reflection: form.reflection,
        date: form.date || null,
        student_id: profile.id,
        school_id: profile.school_id,
      })
      if (err) throw err
      setAddModal(false)
      resetForm()
      await fetchItems()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('portfolio_items').update({
        title: form.title,
        description: form.description,
        subject: form.subject,
        reflection: form.reflection,
        date: form.date || null,
      }).eq('id', editModal.id)
      if (err) throw err
      setEditModal(null)
      resetForm()
      await fetchItems()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      await supabase.from('portfolio_items').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await fetchItems()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(item) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      subject: item.subject || SUBJECTS[0],
      reflection: item.reflection || '',
      date: item.date || '',
    })
    setEditModal(item)
  }

  const subjects = ['all', ...new Set(items.map(i => i.subject).filter(Boolean))]
  const filtered = items.filter(i => filterSubject === 'all' || i.subject === filterSubject)

  const FormFields = () => (
    <div className="space-y-4">
      <Input label="Başlıq" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Məs: Ekologiya Layihəsi" />
      <Textarea label="Açıqlama" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Bu iş haqqında qısa açıqlama..." />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Fənn" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input label="Tarix" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      </div>
      <Textarea label="Refleksiya" value={form.reflection} onChange={e => setForm({ ...form, reflection: e.target.value })} rows={4} placeholder="Bu işdən nə öyrəndim? Nəyi fərqli edərdim?" />
    </div>
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Portfölyo</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} iş · {new Set(items.map(i => i.subject)).size} fənn</p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> İş əlavə et</span>
        </Button>
      </div>

      {subjects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterSubject === s ? 'bg-purple text-white' : 'bg-surface text-gray-600 hover:text-purple'}`}
            >
              {s === 'all' ? 'Hamısı' : s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="Portfölyo boşdur" description="İlk işinizi əlavə edərək portfölyo qurun." actionLabel="İş əlavə et" onAction={() => { resetForm(); setAddModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="p-6 flex flex-col gap-3 cursor-pointer" onClick={() => setViewModal(item)}>
              <div className="flex items-start justify-between gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSubjectColor(item.subject)}`}>
                  {item.subject}
                </span>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteModal(item)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-serif text-xl text-gray-900 leading-tight">{item.title}</h3>

              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              )}

              {item.reflection && (
                <div className="bg-surface rounded-lg p-3 mt-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Refleksiya</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.reflection}</p>
                </div>
              )}

              {item.date && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto pt-2 border-t border-border-soft">
                  <Calendar className="w-3 h-3" />
                  {fmtLong(item.date)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={viewModal?.title || ''} size="lg">
        {viewModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getSubjectColor(viewModal.subject)}`}>{viewModal.subject}</span>
              {viewModal.date && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {fmtLong(viewModal.date)}
                </span>
              )}
            </div>
            {viewModal.description && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Açıqlama</p>
                <p className="text-gray-700">{viewModal.description}</p>
              </div>
            )}
            {viewModal.reflection && (
              <div className="bg-surface rounded-xl p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Refleksiya</p>
                <p className="text-gray-700 leading-relaxed">{viewModal.reflection}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setViewModal(null); openEdit(viewModal) }}><span className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Düzənlə</span></Button>
              <Button variant="ghost" onClick={() => setViewModal(null)}>{t('close') || 'Bağla'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="İş Əlavə Et" size="lg">
        <div className="space-y-4">
          <FormFields />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.title}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); setError(null) }} title="İşi Düzənlə" size="lg">
        <div className="space-y-4">
          <FormFields />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.title}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.title}</strong> işini silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
