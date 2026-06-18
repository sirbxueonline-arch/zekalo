import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import XPBar from '../../components/ui/XPBar'
import CountUp from '../../components/ui/CountUp'
import Confetti from '../../components/ui/Confetti'
import { BookOpen, Plus, Trash2, CheckSquare, Square, AlertCircle, Clock, Trophy, Sparkles } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const COMMON_SUBJECTS = [
  'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Rus dili', 'Fizika',
  'Kimya', 'Biologiya', 'Tarix', 'Coğrafiya', 'Ədəbiyyat',
  'İnformatika', 'Musiqi', 'Təsviri incəsənət', 'Bədən tərbiyəsi',
]

// Subject tag — single neutral brand tint (color reserved for status)
const SUBJECT_TAG = { bg: 'var(--brand-50)', color: 'var(--brand-600)', border: 'var(--brand-200)' }

function subjectStyle() {
  return SUBJECT_TAG
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
  { key: 'all',       label: 'Hamısı' },
  { key: 'pending',   label: 'Gözləyən' },
  { key: 'completed', label: 'Tamamlanan' },
  { key: 'overdue',   label: 'Gecikmiş' },
]

function FilterPill({ active, onClick, children, count, countTone = 'periwinkle' }) {
  const countTones = {
    periwinkle: { bg: 'var(--brand-100)', color: 'var(--brand-600)' },
    rose:       { bg: 'rgba(244,103,126,0.16)', color: '#B91C1C' },
  }
  const ct = countTones[countTone] || countTones.periwinkle
  return (
    <button
      onClick={onClick}
      className="transition-all whitespace-nowrap"
      style={{
        padding: '8px 16px',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        background: active ? 'var(--brand-100)' : 'var(--surface)',
        border: active ? '1.5px solid var(--brand-400)' : '1px solid var(--hairline-strong)',
        color: active ? 'var(--brand-600)' : 'var(--ink-600)',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {children}
      {count > 0 && (
        <span
          style={{
            background: ct.bg, color: ct.color,
            borderRadius: 9999, padding: '2px 8px',
            fontSize: 10, fontWeight: 700,
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

  const [loading, setLoading]       = useState(true)
  const [items, setItems]           = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [activeTab, setActiveTab]   = useState('all')
  const [showAdd, setShowAdd]       = useState(false)
  const [adding, setAdding]         = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const [form, setForm]           = useState({ subject: '', title: '', due_date: '' })
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

    // Trigger confetti if this check-off completes ALL remaining tasks
    if (updated) {
      const remaining = items.filter(i => i.id !== item.id && !i.completed)
      if (remaining.length === 0) {
        setJustCompleted(true)
        setTimeout(() => setJustCompleted(false), 3000)
      }
    }
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
      subject:    form.subject.trim() || '—',
      title:      form.title.trim(),
      due_date:   form.due_date || null,
      completed:  false,
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

  const totalCount      = items.length
  const completedCount  = items.filter(i => i.completed).length
  const pendingCount    = items.filter(i => !i.completed).length
  const overdueCount    = items.filter(i => isOverdue(i)).length
  const completionPct   = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone         = totalCount > 0 && completionPct === 100

  const filtered = sortItems(
    activeTab === 'all'       ? items
    : activeTab === 'pending'   ? items.filter(i => !i.completed && !isOverdue(i))
    : activeTab === 'completed' ? items.filter(i => i.completed)
    : items.filter(i => isOverdue(i))
  )

  const emptyMessages = {
    all:       { title: 'Ev tapşırığı yoxdur', desc: 'Yeni tapşırıq əlavə etmək üçün "Əlavə et" düyməsinə basın.' },
    pending:   { title: 'Gözləyən tapşırıq yoxdur', desc: 'Bütün tapşırıqlar tamamlanıb. Əla iş!' },
    completed: { title: 'Tamamlanan tapşırıq yoxdur', desc: 'Hələ heç bir tapşırıq tamamlanmayıb.' },
    overdue:   { title: 'Gecikmiş tapşırıq yoxdur', desc: 'Əla! Bütün tapşırıqlar vaxtında yerinə yetirilib.' },
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

      {/* ── Confetti burst when everything is done ── */}
      <Confetti active={justCompleted} intensity="burst" />

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="icon-chip icon-chip-sun" style={{ width: 44, height: 44 }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h1
              className="font-display"
              style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
            >
              Ev Tapşırıqları
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2 ml-14 flex-wrap">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--ink-600)' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--brand-500)' }} />
                {pendingCount} gözləyən
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#B91C1C' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {overdueCount} gecikmiş
              </span>
            )}
          </div>
        </div>

        <Button onClick={() => setShowAdd(true)} className="btn-3d">
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Əlavə et
          </span>
        </Button>
      </div>

      {/* ── Progress / gamification panel ── */}
      {totalCount > 0 && (
        <div
          className="liquid-card p-6 relative overflow-hidden"
          style={{
            background: allDone ? 'rgba(234,179,8,0.07)' : undefined,
            border: allDone ? '1px solid rgba(234,179,8,0.30)' : undefined,
          }}
        >
          {/* All-done celebration banner */}
          {allDone && (
            <div
              className="flex items-center gap-3 mb-5 px-4 py-3"
              style={{
                background: 'rgba(234,179,8,0.12)',
                border: '1px solid rgba(234,179,8,0.34)',
                borderRadius: 12,
              }}
            >
              <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--sun)' }} />
              <div>
                <p className="font-semibold" style={{ fontSize: 15, color: '#B45309' }}>
                  Hamısı tamamlandı!
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>
                  Bütün ev tapşırıqlarını yerinə yetirdiniz. Əla!
                </p>
              </div>
              <Sparkles className="w-4 h-4 ml-auto" style={{ color: 'var(--sun)' }} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* XP / completion bar */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-semibold uppercase tracking-wider"
                  style={{ fontSize: 12, color: 'var(--ink-400)' }}
                >
                  Tamamlanma
                </span>
                <span
                  className="font-display font-extrabold tabular-nums"
                  style={{ fontSize: 24, color: allDone ? 'var(--mint)' : 'var(--brand-500)' }}
                >
                  <CountUp to={completionPct} suffix="%" />
                </span>
              </div>
              <XPBar
                value={completedCount}
                target={Math.max(totalCount, 1)}
                label={false}
                showCap
                labelText={`${completedCount} / ${totalCount} tapşırıq`}
              />
            </div>
          </div>

          {/* Mini stat row */}
          <div
            className="grid grid-cols-3 gap-3 mt-5 pt-4"
            style={{ borderTop: '1px solid var(--hairline)' }}
          >
            <div className="text-center">
              <p
                className="font-display font-extrabold tabular-nums"
                style={{ fontSize: 24, color: 'var(--brand-500)' }}
              >
                <CountUp to={pendingCount} />
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--ink-400)' }}>Gözləyən</p>
            </div>
            <div className="text-center">
              <p
                className="font-display font-extrabold tabular-nums"
                style={{ fontSize: 24, color: 'var(--mint)' }}
              >
                <CountUp to={completedCount} />
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--ink-400)' }}>Tamamlanan</p>
            </div>
            <div className="text-center">
              <p
                className="font-display font-extrabold tabular-nums"
                style={{ fontSize: 24, color: overdueCount > 0 ? 'var(--coral)' : 'var(--ink-400)' }}
              >
                <CountUp to={overdueCount} />
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--ink-400)' }}>Gecikmiş</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter pills ── */}
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

      {/* ── Items list ── */}
      {filtered.length === 0 ? (
        <EmptyState
          pose={activeTab === 'completed' ? 'cheering' : activeTab === 'overdue' ? 'cheering' : 'thinking'}
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
                className={`transition-all ${item.completed ? 'opacity-55' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Animated checkbox */}
                  <button
                    onClick={() => toggleCompleted(item)}
                    className="flex-shrink-0 mt-0.5 transition-all"
                    style={{
                      color: item.completed ? 'var(--brand-500)' : 'var(--ink-400)',
                      transform: item.completed ? 'scale(1.15)' : 'scale(1)',
                    }}
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
                            background: sStyle.bg, color: sStyle.color,
                            border: `1px solid ${sStyle.border}`,
                            borderRadius: 8, padding: '3px 10px',
                            fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {item.subject}
                        </span>
                      )}
                      {overdue && (
                        <span
                          className="pill-rose"
                          style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}
                        >
                          Gecikmiş
                        </span>
                      )}
                    </div>

                    <p
                      className="font-semibold"
                      style={{
                        fontSize: 15,
                        color: 'var(--ink-900)',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        opacity: item.completed ? 0.6 : 1,
                      }}
                    >
                      {item.title}
                    </p>

                    {item.due_date && (
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: overdue && !item.completed ? '#B91C1C' : 'var(--ink-400)',
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
                    style={{ width: 32, height: 32, borderRadius: 8, color: 'var(--ink-400)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(244,103,126,0.10)'
                      e.currentTarget.style.color = '#B91C1C'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--ink-400)'
                    }}
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

      {/* ── Add modal ── */}
      <Modal open={showAdd} onClose={closeAdd} title="Yeni Tapşırıq">
        <div className="space-y-4">
          <div>
            <label
              className="block"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}
            >
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
