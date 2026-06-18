import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtNumeric } from '../../lib/dateUtils'
import Input from '../../components/ui/Input'


function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}

export default function Library() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('catalog')
  const [books, setBooks] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', copies_total: '', description: '' })
  const [checkoutForm, setCheckoutForm] = useState({ student_name: '', due_date: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [booksRes, checkoutsRes] = await Promise.all([
        supabase.from('library_books').select('*').eq('school_id', profile.school_id).order('title'),
        supabase.from('library_checkouts').select('*, book:library_books(title)').eq('school_id', profile.school_id).eq('returned', false).order('due_date'),
      ])

      if (booksRes.error) throw booksRes.error
      if (checkoutsRes.error) throw checkoutsRes.error
      setBooks(booksRes.data || [])

      const co = (checkoutsRes.data || []).map(c => ({ ...c, book_title: c.book?.title || c.book_title }))
      setCheckouts(co)
    } catch {
      setBooks([])
      setCheckouts([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', author: '', isbn: '', copies_total: '', description: '' })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('library_books').insert({
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        copies_total: parseInt(form.copies_total) || 1,
        copies_available: parseInt(form.copies_total) || 1,
        description: form.description,
        school_id: profile.school_id,
      })
      if (err) throw err
      setAddModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleCheckout(book) {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('library_checkouts').insert({
        book_id: book.id,
        book_title: book.title,
        student_name: checkoutForm.student_name,
        due_date: checkoutForm.due_date,
        checked_out_at: new Date().toISOString().split('T')[0],
        returned: false,
        school_id: profile.school_id,
      })
      if (err) throw err
      setCheckoutModal(null)
      setCheckoutForm({ student_name: '', due_date: '' })
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function markReturned(checkoutId, bookId) {
    try {
      // Mark the checkout as returned
      await supabase.from('library_checkouts')
        .update({ returned: true, returned_at: new Date().toISOString() })
        .eq('id', checkoutId)

      // Increment copies_available by reading current value first
      // (supabase.rpc() returns a query builder, not a scalar — can't use it as update value)
      const { data: book } = await supabase.from('library_books')
        .select('copies_available').eq('id', bookId).single()
      if (book != null) {
        await supabase.from('library_books')
          .update({ copies_available: (book.copies_available || 0) + 1 })
          .eq('id', bookId)
      }

      await fetchData()
    } catch {
      // silently handle for demo
      setCheckouts(prev => prev.filter(c => c.id !== checkoutId))
    }
  }

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.includes(search)
  )

  const overdueCount = checkouts.filter(c => isOverdue(c.due_date)).length

  const bookColumns = [
    {
      key: 'title',
      label: 'Kitab',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-ink-900">{val}</p>
          <p className="text-xs text-ink-400 mt-0.5">{row.author}</p>
        </div>
      ),
    },
    {
      key: 'isbn',
      label: 'ISBN',
      render: (val) => (
        <span className="text-sm text-ink-400 font-mono tabular-nums">{val || '—'}</span>
      ),
    },
    {
      key: 'copies_total',
      label: 'Nüsxə',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-16 rounded-full overflow-hidden" style={{ height: 6, background: 'var(--hairline)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: val > 0 ? `${(row.copies_available / val) * 100}%` : '0%',
                background: 'var(--mint)',
                transition: 'width .4s var(--ease-out-quint)',
              }}
            />
          </div>
          <span className="text-sm text-ink-700 tabular-nums font-medium">
            {row.copies_available}/{val}
          </span>
        </div>
      ),
    },
    {
      key: 'checkout_action',
      label: '',
      render: (_, row) => (
        <Button
          variant="secondary"
          className="py-1.5 px-4 text-xs"
          onClick={e => { e.stopPropagation(); setCheckoutModal(row) }}
          disabled={row.copies_available === 0}
        >
          Veril
        </Button>
      ),
    },
  ]

  const checkoutColumns = [
    {
      key: 'student_name',
      label: 'Şagird',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {isOverdue(row.due_date) && (
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--danger)' }} />
          )}
          <span
            className="font-semibold"
            style={{ color: isOverdue(row.due_date) ? 'var(--danger)' : 'var(--ink-900)' }}
          >
            {val}
          </span>
        </div>
      ),
    },
    {
      key: 'book_title',
      label: 'Kitab',
      render: (val) => <span className="text-ink-700">{val}</span>,
    },
    {
      key: 'checked_out_at',
      label: 'Verildi',
      render: (val) => (
        <span className="tabular-nums text-ink-600">{val ? fmtNumeric(val) : '—'}</span>
      ),
    },
    {
      key: 'due_date',
      label: 'Son tarix',
      render: (val, row) => (
        <span
          className="tabular-nums font-medium"
          style={{ color: isOverdue(val) ? 'var(--danger)' : 'var(--ink-700)' }}
        >
          {val ? fmtNumeric(val) : '—'}
          {isOverdue(val) && (
            <span className="ml-1.5 pill-rose" style={{ fontSize: 11 }}>gecikmiş</span>
          )}
        </span>
      ),
    },
    {
      key: 'return_action',
      label: '',
      render: (_, row) => (
        <Button variant="teal" className="py-1.5 px-4 text-xs" onClick={() => markReturned(row.id, row.book_id)}>
          Geri alındı
        </Button>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Kitabxana</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-400)' }}>
            <span className="tabular-nums font-semibold text-ink-700">{books.length}</span> kitab
            {' · '}
            <span className="tabular-nums font-semibold text-ink-700">{checkouts.length}</span> aktiv verilmiş
            {overdueCount > 0 && (
              <span
                className="ml-2 pill-rose"
                style={{ fontSize: 12 }}
              >
                {overdueCount} gecikmiş
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Kitab əlavə et</span>
        </Button>
      </div>

      {/* Underline tabs */}
      <div className="uline-tabs">
        {[['catalog', 'Kataloq'], ['checkouts', 'Verilmiş kitablar']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`uline-tab${tab === val ? ' active' : ''}`}
          >
            {label}
            {val === 'checkouts' && overdueCount > 0 && (
              <span
                className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
                style={{ background: 'var(--danger)', fontSize: 10 }}
              >
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <>
          {/* Search bar */}
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--ink-400)' }}
            />
            <input
              type="text"
              placeholder="Başlıq, müəllif və ya ISBN axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pastel-input w-full pl-10"
            />
          </div>

          <Card hover={false} className="p-0 overflow-hidden">
            {filteredBooks.length === 0 ? (
              search ? (
                <EmptyState
                  icon={Search}
                  title="Nəticə tapılmadı"
                  description={`"${search}" üçün heç bir kitab tapılmadı.`}
                  actionLabel="Axtarışı sıfırla"
                  onAction={() => setSearch('')}
                />
              ) : (
                <EmptyState
                  tier={1}
                  icon={BookOpen}
                  title="Kataloq hələ boşdur"
                  description="İlk kitabı əlavə edərək kitabxananı qurmağa başlayın."
                  actionLabel="Kitab əlavə et"
                  onAction={() => { resetForm(); setAddModal(true) }}
                />
              )
            ) : (
              <Table columns={bookColumns} data={filteredBooks} />
            )}
          </Card>
        </>
      )}

      {tab === 'checkouts' && (
        <Card hover={false} className="p-0 overflow-hidden">
          {checkouts.length === 0 ? (
            <EmptyState
              tier={1}
              icon={BookOpen}
              title="Bütün kitablar qaytarılıb"
              description="Hazırda heç bir aktiv verilmiş kitab yoxdur."
            />
          ) : (
            <Table columns={checkoutColumns} data={checkouts} />
          )}
        </Card>
      )}

      {/* Add Book Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Kitab Əlavə Et">
        <div className="space-y-4">
          <Input label="Kitab adı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Kitabın adı" />
          <Input label="Müəllif" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Müəllifin adı" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="978-..." />
            <Input label="Nüsxə sayı" type="number" min="1" value={form.copies_total} onChange={e => setForm({ ...form, copies_total: e.target.value })} placeholder="1" />
          </div>
          {error && (
            <p className="text-[13px] rounded-input px-3 py-2" style={{ color: 'var(--danger)', background: '#FEE2E2' }}>
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.title}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal open={!!checkoutModal} onClose={() => { setCheckoutModal(null); setError(null) }} title={`Kitabı ver: ${checkoutModal?.title}`}>
        <div className="space-y-4">
          <Input label="Şagirdin adı" value={checkoutForm.student_name} onChange={e => setCheckoutForm({ ...checkoutForm, student_name: e.target.value })} placeholder="Ad Soyad" />
          <Input label="Qaytarılma tarixi" type="date" value={checkoutForm.due_date} onChange={e => setCheckoutForm({ ...checkoutForm, due_date: e.target.value })} />
          {error && (
            <p className="text-[13px] rounded-input px-3 py-2" style={{ color: 'var(--danger)', background: '#FEE2E2' }}>
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setCheckoutModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={() => handleCheckout(checkoutModal)} loading={saving} disabled={!checkoutForm.student_name || !checkoutForm.due_date}>Ver</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
