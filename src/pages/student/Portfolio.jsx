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

// Pastel subject palette
const subjectColors = {
  'Riyaziyyat':   { bg: 'rgba(107,157,222,0.16)', color: '#2f5a8c', border: 'rgba(107,157,222,0.30)' },
  'Fizika':       { bg: 'rgba(232,168,124,0.20)', color: '#a25e2c', border: 'rgba(232,168,124,0.35)' },
  'Kimya':        { bg: 'rgba(93,184,163,0.16)',  color: '#2f7a64', border: 'rgba(93,184,163,0.30)' },
  'Biologiya':    { bg: 'rgba(93,184,163,0.16)',  color: '#2f7a64', border: 'rgba(93,184,163,0.30)' },
  'Tarix':        { bg: 'rgba(232,168,124,0.20)', color: '#a25e2c', border: 'rgba(232,168,124,0.35)' },
  'Ədəbiyyat':    { bg: 'rgba(124,110,224,0.16)', color: '#5448a8', border: 'rgba(124,110,224,0.30)' },
  'İngilis dili': { bg: 'rgba(124,110,224,0.16)', color: '#5448a8', border: 'rgba(124,110,224,0.30)' },
  'İnformatika':  { bg: 'rgba(107,157,222,0.16)', color: '#2f5a8c', border: 'rgba(107,157,222,0.30)' },
  'İncəsənət':    { bg: 'rgba(232,168,124,0.20)', color: '#a25e2c', border: 'rgba(232,168,124,0.35)' },
  'Digər':        { bg: 'rgba(100,116,139,0.10)', color: '#475569', border: 'rgba(100,116,139,0.18)' },
}

function getSubjectStyle(subject) {
  return subjectColors[subject] || subjectColors['Digər']
}

function SubjectPill({ subject, size = 'md' }) {
  const s = getSubjectStyle(subject)
  const padding = size === 'lg' ? '5px 14px' : '3px 10px'
  const fontSize = size === 'lg' ? 13 : 12
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 600,
      }}
    >
      {subject}
    </span>
  )
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
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            <span className="pastel-text">Portfölyo</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
            {items.length} iş · {new Set(items.map(i => i.subject)).size} fənn
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> İş əlavə et</span>
        </Button>
      </div>

      {subjects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => {
            const active = filterSubject === s
            return (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className="transition-all"
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background: active
                    ? 'linear-gradient(135deg, rgba(124,110,224,0.18) 0%, rgba(93,184,163,0.18) 100%)'
                    : 'rgba(255,255,255,0.55)',
                  border: active ? '1px solid rgba(124,110,224,0.5)' : '1px solid rgba(124,110,224,0.18)',
                  color: active ? '#5448a8' : '#475569',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                }}
              >
                {s === 'all' ? 'Hamısı' : s}
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm" style={{ color: '#b13838' }}>{error}</p>}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={filterSubject === 'all' ? 'Portfölyo boşdur' : 'Bu fəndə iş yoxdur'}
          description={filterSubject === 'all' ? 'İlk işinizi əlavə edərək portfölyo qurun.' : 'Bu fəndə hələ heç bir iş əlavə etməmisiniz.'}
          actionLabel={filterSubject === 'all' ? 'İş əlavə et' : undefined}
          onAction={filterSubject === 'all' ? () => { resetForm(); setAddModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="flex flex-col gap-3 cursor-pointer" onClick={() => setViewModal(item)}>
              <div className="flex items-start justify-between gap-2">
                <SubjectPill subject={item.subject} />
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(item)}
                    className="transition-colors flex items-center justify-center"
                    style={{ width: 28, height: 28, borderRadius: 8, color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.10)'; e.currentTarget.style.color = '#7c6ee0' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(item)}
                    className="transition-colors flex items-center justify-center"
                    style={{ width: 28, height: 28, borderRadius: 8, color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,108,108,0.10)'; e.currentTarget.style.color = '#b13838' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.25 }}>
                {item.title}
              </h3>

              {item.description && (
                <p className="text-sm line-clamp-2" style={{ color: '#475569', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              )}

              {item.reflection && (
                <div
                  style={{
                    background: 'rgba(124,110,224,0.06)',
                    borderRadius: 14,
                    padding: 12,
                    border: '1px solid rgba(124,110,224,0.10)',
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#7c6ee0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Refleksiya
                  </p>
                  <p className="text-sm line-clamp-3" style={{ color: '#475569', lineHeight: 1.5 }}>
                    {item.reflection}
                  </p>
                </div>
              )}

              {item.date && (
                <div
                  className="flex items-center gap-1 text-xs mt-auto pt-2"
                  style={{ color: '#64748b', borderTop: '1px solid rgba(124,110,224,0.10)' }}
                >
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
            <div className="flex items-center gap-3 flex-wrap">
              <SubjectPill subject={viewModal.subject} size="lg" />
              {viewModal.date && (
                <span className="text-sm flex items-center gap-1" style={{ color: '#64748b' }}>
                  <Calendar className="w-4 h-4" />
                  {fmtLong(viewModal.date)}
                </span>
              )}
            </div>
            {viewModal.description && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7c6ee0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Açıqlama
                </p>
                <p style={{ color: '#1a1a2e' }}>{viewModal.description}</p>
              </div>
            )}
            {viewModal.reflection && (
              <div
                style={{
                  background: 'rgba(124,110,224,0.06)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid rgba(124,110,224,0.10)',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7c6ee0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Refleksiya
                </p>
                <p style={{ color: '#1a1a2e', lineHeight: 1.6 }}>{viewModal.reflection}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => { setViewModal(null); openEdit(viewModal) }}>
                <span className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Düzənlə</span>
              </Button>
              <Button variant="ghost" onClick={() => setViewModal(null)}>{t('close') || 'Bağla'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="İş Əlavə Et" size="lg">
        <div className="space-y-4">
          <FormFields />
          {error && (
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(239,108,108,0.10)', color: '#b13838', border: '1px solid rgba(239,108,108,0.25)' }}
            >
              {error}
            </div>
          )}
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
          {error && (
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(239,108,108,0.10)', color: '#b13838', border: '1px solid rgba(239,108,108,0.25)' }}
            >
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.title}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm mb-6" style={{ color: '#475569' }}>
          <strong style={{ color: '#1a1a2e' }}>{deleteModal?.title}</strong> işini silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
