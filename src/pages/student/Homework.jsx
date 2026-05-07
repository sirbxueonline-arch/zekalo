import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { BookOpen, Plus, Trash2, CheckSquare, Square, AlertCircle, Clock } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const COMMON_SUBJECTS = [
  'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Rus dili', 'Fizika',
  'Kimya', 'Biologiya', 'Tarix', 'Coğrafiya', 'Ədəbiyyat',
  'İnformatika', 'Musiqi', 'Təsviri incəsənət', 'Bədən tərbiyəsi',
]

// Pastel subject palette (rotated)
const SUBJECT_PALETTES = [
  { bg: 'rgba(124,110,224,0.16)', color: '#5448a8', border: 'rgba(124,110,224,0.30)' },
  { bg: 'rgba(93,184,163,0.16)',  color: '#2f7a64', border: 'rgba(93,184,163,0.30)' },
  { bg: 'rgba(232,168,124,0.20)', color: '#a25e2c', border: 'rgba(232,168,124,0.35)' },
  { bg: 'rgba(107,157,222,0.16)', color: '#2f5a8c', border: 'rgba(107,157,222,0.30)' },
]

function subjectStyle(subject) {
  if (!subject) return SUBJECT_PALETTES[0]
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = ((hash << 5) - hash) + subject.charCodeAt(i)
    hash |= 0
  }
  return SUBJECT_PALETTES[Math.abs(hash) % SUBJECT_PALETTES.length]
}

function isOverdue(item) {
  if (!item.due_date || item.completed) return false
  return new Date(item.due_date) < new Date(new Date().toDateString())
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return fmtNumeric(dateStr)
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const aOver = isOverdue(a)
    const bOver = isOverdue(b)
    if (aOver !== bOver) return aOver ? -1 : 1
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })
}

const TABS = [
  { key: 'all', label: 'Hamısı' },
  { key: 'pending', label: 'Gözləyən' },
  { key: 'completed', label: 'Tamamlanan' },
  { key: 'overdue', label: 'Gecikmiş' },
]

function FilterPill({ active, onClick, children, count, countTone = 'periwinkle' }) {
  const countTones = {
    periwinkle: { bg: 'rgba(124,110,224,0.20)', color: '#5448a8' },
    rose:       { bg: 'rgba(239,108,108,0.18)', color: '#b13838' },
  }
  const ct = countTones[countTone] || countTones.periwinkle
  return (
    <button
      onClick={onClick}
      className="transition-all whitespace-nowrap"
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
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {children}
      {count > 0 && (
        <span
          style={{
            background: ct.bg,
            color: ct.color,
            borderRadius: 999,
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export default function StudentHomework() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)

  const [form, setForm] = useState({ subject: '', title: '', due_date: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!profile) return
    loadItems()
  }, [profile])

  async function loadItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('homework_items')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) {
      console.error('Homework fetch error:', error)
      setFetchError('Ev tapşırıqları yüklənmədi. Səhifəni yeniləyin.')
    }
    setItems(data || [])
    setLoading(false)
  }

  async function toggleCompleted(item) {
    const updated = !item.completed
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: updated } : i))
    await supabase.from('homework_items').update({ completed: updated }).eq('id', item.id)
  }

  async function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('homework_items').delete().eq('id', id)
  }

  async function handleAdd() {
    if (!form.title.trim()) {
      setFormError('Tapşırıq adı tələb olunur.')
      return
    }
    setAdding(true)
    setFormError('')
    const { data, error } = await supabase.from('homework_items').insert({
      student_id: profile.id,
      subject: form.subject.trim() || '—',
      title: form.title.trim(),
      due_date: form.due_date || null,
      completed: false,
    }).select().single()

    if (error) {
      setFormError('Xəta baş verdi. Yenidən cəhd edin.')
    } else if (data) {
      setItems(prev => [data, ...prev])
      setShowAdd(false)
      setForm({ subject: '', title: '', due_date: '' })
    }
    setAdding(false)
  }

  function closeAdd() {
    setShowAdd(false)
    setForm({ subject: '', title: '', due_date: '' })
    setFormError('')
  }

  const pendingCount = items.filter(i => !i.completed).length
  const overdueCount = items.filter(i => isOverdue(i)).length

  const filtered = sortItems(
    activeTab === 'all' ? items
    : activeTab === 'pending' ? items.filter(i => !i.completed && !isOverdue(i))
    : activeTab === 'completed' ? items.filter(i => i.completed)
    : items.filter(i => isOverdue(i))
  )

  const emptyMessages = {
    all: { title: 'Ev tapşırığı yoxdur', desc: 'Yeni tapşırıq əlavə etmək üçün "Əlavə et" düyməsinə basın.' },
    pending: { title: 'Gözləyən tapşırıq yoxdur', desc: 'Bütün tapşırıqlar tamamlanıb. Əla iş!' },
    completed: { title: 'Tamamlanan tapşırıq yoxdur', desc: 'Hələ heç bir tapşırıq tamamlanmayıb.' },
    overdue: { title: 'Gecikmiş tapşırıq yoxdur', desc: 'Əla! Bütün tapşırıqlar vaxtında yerinə yetirilib.' },
  }

  if (loading) return <PageSpinner />

  if (fetchError) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Xəta baş verdi"
        description={fetchError}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            <span className="pastel-text">Ev Tapşırıqları</span>
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: '#7c6ee0' }} />
                {pendingCount} gözləyən
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#b13838' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {overdueCount} gecikmiş
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Əlavə et
          </span>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <FilterPill
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            count={tab.key === 'overdue' ? overdueCount : tab.key === 'pending' ? pendingCount : 0}
            countTone={tab.key === 'overdue' ? 'rose' : 'periwinkle'}
          >
            {tab.label}
          </FilterPill>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={emptyMessages[activeTab].title}
          description={emptyMessages[activeTab].desc}
          actionLabel={activeTab === 'all' ? 'Tapşırıq əlavə et' : undefined}
          onAction={activeTab === 'all' ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const overdue = isOverdue(item)
            const sStyle = subjectStyle(item.subject)
            return (
              <Card
                key={item.id}
                hover={false}
                className={`transition-opacity ${item.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleCompleted(item)}
                    className="flex-shrink-0 mt-0.5 transition-colors"
                    style={{ color: item.completed ? '#7c6ee0' : '#94a3b8' }}
                    aria-label={item.completed ? 'Tamamlanmamış kimi işarələ' : 'Tamamlanmış kimi işarələ'}
                  >
                    {item.completed
                      ? <CheckSquare className="w-5 h-5" />
                      : <Square className="w-5 h-5" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.subject && item.subject !== '—' && (
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: sStyle.bg,
                            color: sStyle.color,
                            border: `1px solid ${sStyle.border}`,
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {item.subject}
                        </span>
                      )}
                      {overdue && (
                        <span className="pill-rose" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                          Gecikmiş
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#1a1a2e',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}
                    >
                      {item.title}
                    </p>
                    {item.due_date && (
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: overdue && !item.completed ? '#b13838' : '#64748b',
                          fontWeight: overdue && !item.completed ? 600 : 400,
                        }}
                      >
                        Son tarix: {formatDate(item.due_date)}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 transition-all flex items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 8, color: '#94a3b8' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,108,108,0.10)'; e.currentTarget.style.color = '#b13838' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={closeAdd} title="Yeni Tapşırıq">
        <div className="space-y-4">
          <div>
            <label className="block" style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 6 }}>
              Fənn
            </label>
            <input
              list="subjects-datalist"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Fənni seçin və ya yazın"
              className="pastel-input"
            />
            <datalist id="subjects-datalist">
              {COMMON_SUBJECTS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <Input
            label="Tapşırıq adı"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Tapşırığın adını yazın"
            error={formError}
          />

          <Input
            label="Son tarix"
            type="date"
            value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeAdd}>Ləğv et</Button>
            <Button onClick={handleAdd} loading={adding} disabled={!form.title.trim()}>
              Əlavə et
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
