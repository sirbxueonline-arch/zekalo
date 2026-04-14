import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { BookOpen, Plus, Trash2, CheckSquare, Square, AlertCircle, Clock } from 'lucide-react'

const COMMON_SUBJECTS = [
  'Riyaziyyat', 'Azərbaycan dili', 'İngilis dili', 'Rus dili', 'Fizika',
  'Kimya', 'Biologiya', 'Tarix', 'Coğrafiya', 'Ədəbiyyat',
  'İnformatika', 'Musiqi', 'Təsviri incəsənət', 'Bədən tərbiyəsi',
]

const SUBJECT_COLORS = [
  'bg-purple-light text-purple-dark border border-[#AFA9EC]',
  'bg-teal-light text-[#085041] border border-teal-mid',
  'bg-[#faeeda] text-[#633806] border border-[#EF9F27]',
  'bg-blue-50 text-blue-700 border border-blue-200',
  'bg-green-50 text-green-700 border border-green-200',
  'bg-rose-50 text-rose-700 border border-rose-200',
  'bg-amber-50 text-amber-700 border border-amber-200',
  'bg-indigo-50 text-indigo-700 border border-indigo-200',
]

function subjectColor(subject) {
  if (!subject) return SUBJECT_COLORS[0]
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = ((hash << 5) - hash) + subject.charCodeAt(i)
    hash |= 0
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

function isOverdue(item) {
  if (!item.due_date || item.completed) return false
  return new Date(item.due_date) < new Date(new Date().toDateString())
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

export default function StudentHomework() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
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
    const { data } = await supabase
      .from('homework_items')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
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
      subject: form.subject.trim() || null,
      title: form.title.trim(),
      due_date: form.due_date || null,
      completed: false,
    }).select().single()

    if (!error && data) {
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

  const today = new Date().toDateString()
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
    pending: { title: 'Gözləyən tapşırıq yoxdur', desc: 'Bütün tapşırıqlar tamamlanıb.' },
    completed: { title: 'Tamamlanan tapşırıq yoxdur', desc: 'Hələ heç bir tapşırıq tamamlanmayıb.' },
    overdue: { title: 'Gecikmiş tapşırıq yoxdur', desc: 'Əla! Bütün tapşırıqlar vaxtında yerinə yetirilib.' },
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-gray-900 tracking-tight">Ev Tapşırıqları</h1>
          <div className="flex items-center gap-3 mt-2">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {pendingCount} gözləyən
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
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
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-purple bg-purple-light text-purple'
                : 'border-border-soft text-gray-500 hover:bg-surface'
            }`}
          >
            {tab.label}
            {tab.key === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                {overdueCount}
              </span>
            )}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-purple-light text-purple rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
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
            return (
              <Card
                key={item.id}
                hover={false}
                className={`transition-opacity ${item.completed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleCompleted(item)}
                    className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-purple transition-colors"
                    aria-label={item.completed ? 'Tamamlanmamış kimi işarələ' : 'Tamamlanmış kimi işarələ'}
                  >
                    {item.completed
                      ? <CheckSquare className="w-5 h-5 text-purple" />
                      : <Square className="w-5 h-5" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.subject && (
                        <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${subjectColor(item.subject)}`}>
                          {item.subject}
                        </span>
                      )}
                      {overdue && (
                        <span className="rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center bg-red-50 text-red-700 border border-red-200">
                          Gecikmiş
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium text-gray-900 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.title}
                    </p>
                    {item.due_date && (
                      <p className={`text-xs mt-1 ${
                        item.completed
                          ? 'text-gray-400'
                          : overdue
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500'
                      }`}>
                        Son tarix: {formatDate(item.due_date)}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors p-1"
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fənn</label>
            <input
              list="subjects-datalist"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Fənni seçin və ya yazın"
              className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
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
