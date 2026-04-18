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
import Input from '../../components/ui/Input'

const DEMO_BOOKS = [
  { id: 'b1', title: 'Riyaziyyat 10', author: 'Ə. Quliyev', isbn: '978-9952-0-0001-1', copies_total: 30, copies_available: 12 },
  { id: 'b2', title: 'Fizika 11', author: 'R. Hüseynov', isbn: '978-9952-0-0002-8', copies_total: 25, copies_available: 25 },
  { id: 'b3', title: 'Dünya Tarixi', author: 'M. Nəcəfov', isbn: '978-9952-0-0003-5', copies_total: 20, copies_available: 3 },
  { id: 'b4', title: 'İngilis dili B1', author: 'Cambridge', isbn: '978-0-521-17866-6', copies_total: 40, copies_available: 18 },
]

const DEMO_CHECKOUTS = [
  { id: 'c1', student_name: 'Aynur Quliyeva', book_title: 'Riyaziyyat 10', checked_out_at: '2026-04-01', due_date: '2026-04-15', returned: false },
  { id: 'c2', student_name: 'Tural Həsənov', book_title: 'Dünya Tarixi', checked_out_at: '2026-04-05', due_date: '2026-04-19', returned: false },
  { id: 'c3', student_name: 'Nigar Məmmədova', book_title: 'İngilis dili B1', checked_out_at: '2026-03-20', due_date: '2026-04-03', returned: false },
]

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
      setBooks(booksRes.data && booksRes.data.length > 0 ? booksRes.data : DEMO_BOOKS)

      const co = (checkoutsRes.data || []).map(c => ({ ...c, book_title: c.book?.title || c.book_title }))
      setCheckouts(co.length > 0 ? co : DEMO_CHECKOUTS)
    } catch {
      setBooks(DEMO_BOOKS)
      setCheckouts(DEMO_CHECKOUTS)
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
          <p className="font-medium text-gray-900">{val}</p>
          <p className="text-xs text-gray-400">{row.author}</p>
        </div>
      ),
    },
    { key: 'isbn', label: 'ISBN', render: (val) => <span className="text-sm text-gray-500 font-mono">{val || '—'}</span> },
    {
      key: 'copies_total',
      label: 'Nüsxə',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-100 rounded-full h-1.5">
            <div className="bg-teal h-1.5 rounded-full" style={{ width: val > 0 ? `${(row.copies_available / val) * 100}%` : '0%' }} />
          </div>
          <span className="text-sm text-gray-700">{row.copies_available}/{val}</span>
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
          {isOverdue(row.due_date) && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
          <span className={`font-medium ${isOverdue(row.due_date) ? 'text-red-700' : 'text-gray-900'}`}>{val}</span>
        </div>
      ),
    },
    { key: 'book_title', label: 'Kitab', render: (val) => <span className="text-gray-700">{val}</span> },
    { key: 'checked_out_at', label: 'Verildi', render: (val) => val ? new Date(val).toLocaleDateString('az-AZ') : '—' },
    {
      key: 'due_date',
      label: 'Son tarix',
      render: (val, row) => (
        <span className={isOverdue(val) ? 'text-red-600 font-medium' : 'text-gray-700'}>
          {val ? new Date(val).toLocaleDateString('az-AZ') : '—'}
          {isOverdue(val) && ' (gecikmiş)'}
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Kitabxana</h1>
          <p className="text-sm text-gray-500 mt-1">
            {books.length} kitab · {checkouts.length} aktiv verilmiş
            {overdueCount > 0 && <span className="ml-2 text-red-600 font-medium">· {overdueCount} gecikmiş</span>}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Kitab əlavə et</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-soft">
        {[['catalog', 'Kataloq'], ['checkouts', 'Verilmiş kitablar']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === val ? 'border-purple text-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {label}
            {val === 'checkouts' && overdueCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Başlıq, müəllif və ya ISBN axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
            />
          </div>
          <Card hover={false} className="p-0 overflow-hidden">
            {filteredBooks.length === 0 ? (
              <EmptyState icon={BookOpen} title="Kitab tapılmadı" description="Kitabxana kataloqunda kitab yoxdur." actionLabel="Kitab əlavə et" onAction={() => { resetForm(); setAddModal(true) }} />
            ) : (
              <Table columns={bookColumns} data={filteredBooks} />
            )}
          </Card>
        </>
      )}

      {tab === 'checkouts' && (
        <Card hover={false} className="p-0 overflow-hidden">
          {checkouts.length === 0 ? (
            <EmptyState icon={BookOpen} title="Aktiv verilmiş kitab yoxdur" description="Bütün kitablar qaytarılıb." />
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
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
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
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setCheckoutModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={() => handleCheckout(checkoutModal)} loading={saving} disabled={!checkoutForm.student_name || !checkoutForm.due_date}>Ver</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
