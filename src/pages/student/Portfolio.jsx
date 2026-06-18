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

// Subject = categorical tag (not status) → one neutral-grey chip for all
// subjects per V3 §3 (collapse the rainbow rotation; reserve color for status).
function SubjectPill({ subject, size = 'md' }) {
  const padding = size === 'lg' ? '4px 12px' : '3px 10px'
  const fontSize = size === 'lg' ? 13 : 12
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--surface-2)',
        color: 'var(--ink-600)',
        border: '1px solid var(--hairline-strong)',
        borderRadius: 8,
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.01em',
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
    <div className="space-y-7">
      {/* Page hero */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="icon-chip icon-chip-periwinkle"
            style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0 }}
          >
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1
              className="font-display text-ink-900"
              style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12 }}
            >
              Portfölyo
            </h1>
            <p className="text-sm text-ink-400 mt-0.5">
              <span className="font-semibold text-ink-600 tabular-nums">{items.length}</span> iş ·{' '}
              <span className="font-semibold text-ink-600 tabular-nums">{new Set(items.map(i => i.subject)).size}</span> fənn
            </p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> İş əlavə et</span>
        </Button>
      </div>

      {/* Subject filter pills */}
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
                  padding: '7px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background: active ? 'var(--brand-100)' : 'var(--surface)',
                  border: active ? '1.5px solid var(--brand-400)' : '1.5px solid var(--hairline)',
                  color: active ? 'var(--brand-600)' : 'var(--ink-600)',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
              >
                {s === 'all' ? 'Hamısı' : s}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          pose="thinking"
          title={filterSubject === 'all' ? 'Portfölyo boşdur' : 'Bu fəndə iş yoxdur'}
          description={filterSubject === 'all' ? 'İlk işinizi əlavə edərək portfölyo qurun.' : 'Bu fəndə hələ heç bir iş əlavə etməmisiniz.'}
          actionLabel={filterSubject === 'all' ? 'İş əlavə et' : undefined}
          onAction={filterSubject === 'all' ? () => { resetForm(); setAddModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <Card
              key={item.id}
              className="flex flex-col gap-3 cursor-pointer group"
              onClick={() => setViewModal(item)}
            >
              {/* Top row: subject pill + actions */}
              <div className="flex items-start justify-between gap-2">
                <SubjectPill subject={item.subject} />
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center justify-center transition-all"
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      color: 'var(--ink-400)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.color = 'var(--brand-500)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-400)' }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(item)}
                    className="flex items-center justify-center transition-all"
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      color: 'var(--ink-400)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--danger)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-400)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-ink-900"
                style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}
              >
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <p className="text-sm line-clamp-2 text-ink-600" style={{ lineHeight: 1.55 }}>
                  {item.description}
                </p>
              )}

              {/* Reflection block */}
              {item.reflection && (
                <div
                  style={{
                    background: 'var(--brand-50)',
                    borderRadius: 14,
                    padding: 12,
                    border: '1px solid var(--brand-100)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--brand-500)',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Refleksiya
                  </p>
                  <p className="text-sm line-clamp-3 text-ink-600" style={{ lineHeight: 1.55 }}>
                    {item.reflection}
                  </p>
                </div>
              )}

              {/* Date footer */}
              {item.date && (
                <div
                  className="flex items-center gap-1 text-xs mt-auto pt-3 text-ink-400"
                  style={{ borderTop: '1px solid var(--hairline)' }}
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
                <span className="text-sm flex items-center gap-1 text-ink-400">
                  <Calendar className="w-4 h-4" />
                  {fmtLong(viewModal.date)}
                </span>
              )}
            </div>
            {viewModal.description && (
              <div>
                <p
                  style={{
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--brand-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}
                >
                  Açıqlama
                </p>
                <p className="text-ink-900" style={{ lineHeight: 1.6 }}>{viewModal.description}</p>
              </div>
            )}
            {viewModal.reflection && (
              <div
                style={{
                  background: 'var(--brand-50)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid var(--brand-100)',
                }}
              >
                <p
                  style={{
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--brand-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}
                >
                  Refleksiya
                </p>
                <p className="text-ink-900" style={{ lineHeight: 1.65 }}>{viewModal.reflection}</p>
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
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.20)',
              }}
            >
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
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
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.20)',
              }}
            >
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.title}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm mb-6 text-ink-600">
          <strong className="text-ink-900">{deleteModal?.title}</strong> işini silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
