import { useState, useEffect, useMemo } from 'react'
import {
  Search, School, Users, GraduationCap, Heart,
  Eye, ShieldOff, ShieldCheck, Calendar, ChevronDown,
  RefreshCw, BookOpen, Bell, AlertTriangle, Plus, Pencil, UserPlus,
  Mail, Loader2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { EditionBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { useNavigate } from 'react-router-dom'
import { fmtNumeric } from '../../lib/dateUtils'

// NOTE: The `blocked` field assumed to exist on schools as: blocked boolean DEFAULT false
// Run: ALTER TABLE schools ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;

function formatDate(dateStr) {
  return fmtNumeric(dateStr)
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return `${fmtNumeric(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const EDITION_LABELS = { ib: 'IB', government: 'Dövlət', hybrid: 'Hibrid' }

const LANG_LABELS = {
  az: 'Azərbaycan',
  en: 'İngilis',
  ru: 'Rus',
  tr: 'Türk',
}

// i18n helper
function tx(L, az, en, ru, tr) {
  if (L === 'en') return en || az
  if (L === 'ru') return ru || az
  if (L === 'tr') return tr || az
  return az
}

const EMPTY_SCHOOL_FORM = {
  name: '',
  district: '',
  edition: 'government',
  default_language: 'az',
}

// ── CreateSchoolModal ──────────────────────────────────────────────────────
function CreateSchoolModal({ open, onClose, onCreated, L }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_SCHOOL_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(EMPTY_SCHOOL_FORM)
      setErrors({})
    }
  }, [open])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = tx(L, 'Məktəb adı tələb olunur', 'School name required', 'Имя школы обязательно', 'Okul adı gerekli')
    if (!form.edition) e.edition = tx(L, 'Növ tələb olunur', 'Edition required', 'Тип обязателен', 'Tür gerekli')
    if (!form.default_language) e.default_language = tx(L, 'Dil tələb olunur', 'Language required', 'Язык обязателен', 'Dil gerekli')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: form.name.trim(),
          district: form.district.trim() || null,
          edition: form.edition,
          default_language: form.default_language,
        })
        .select()
        .single()
      if (error) throw error
      toast.success(tx(L, 'Məktəb uğurla yaradıldı', 'School created successfully', 'Школа успешно создана', 'Okul başarıyla oluşturuldu'))
      onCreated && onCreated(data)
      onClose()
    } catch (err) {
      console.error('CreateSchool error:', err)
      toast.error(tx(L, 'Məktəb yaradılarkən xəta baş verdi', 'Failed to create school', 'Ошибка при создании школы', 'Okul oluşturulamadı'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={tx(L, 'Yeni məktəb əlavə et', 'Add new school', 'Добавить новую школу', 'Yeni okul ekle')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={tx(L, 'Məktəb adı', 'School name', 'Название школы', 'Okul adı')}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
          placeholder={tx(L, 'məs. Bakı 6 saylı məktəb', 'e.g. Baku School #6', 'напр. Школа №6 Баку', 'örn. Bakü 6 nolu okul')}
        />
        <Input
          label={tx(L, 'Rayon', 'District', 'Район', 'İlçe')}
          value={form.district}
          onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
          placeholder={tx(L, 'məs. Səbail', 'e.g. Sabail', 'напр. Сабаил', 'örn. Sebail')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={tx(L, 'Növ', 'Edition', 'Тип', 'Tür')}
            value={form.edition}
            onChange={e => setForm(f => ({ ...f, edition: e.target.value }))}
            error={errors.edition}
          >
            <option value="government">{tx(L, 'Dövlət', 'Government', 'Государственная', 'Devlet')}</option>
            <option value="ib">IB</option>
            <option value="hybrid">{tx(L, 'Hibrid', 'Hybrid', 'Гибрид', 'Hibrit')}</option>
          </Select>
          <Select
            label={tx(L, 'Standart dil', 'Default language', 'Язык по умолчанию', 'Varsayılan dil')}
            value={form.default_language}
            onChange={e => setForm(f => ({ ...f, default_language: e.target.value }))}
            error={errors.default_language}
          >
            <option value="az">{LANG_LABELS.az}</option>
            <option value="en">{LANG_LABELS.en}</option>
            <option value="ru">{LANG_LABELS.ru}</option>
            <option value="tr">{LANG_LABELS.tr}</option>
          </Select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}
          </Button>
          <Button type="submit" loading={saving}>
            {tx(L, 'Yarat', 'Create', 'Создать', 'Oluştur')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ── EditSchoolModal ───────────────────────────────────────────────────────
function EditSchoolModal({ open, onClose, onUpdated, school, L }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_SCHOOL_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (school && open) {
      setForm({
        name: school.name || '',
        district: school.district || '',
        edition: school.edition || 'government',
        default_language: school.default_language || 'az',
      })
      setErrors({})
    }
  }, [school, open])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = tx(L, 'Məktəb adı tələb olunur', 'School name required', 'Имя школы обязательно', 'Okul adı gerekli')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || !school) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({
          name: form.name.trim(),
          district: form.district.trim() || null,
          edition: form.edition,
          default_language: form.default_language,
        })
        .eq('id', school.id)
        .select()
        .single()
      if (error) throw error
      toast.success(tx(L, 'Məktəb yeniləndi', 'School updated', 'Школа обновлена', 'Okul güncellendi'))
      onUpdated && onUpdated(data)
      onClose()
    } catch (err) {
      console.error('EditSchool error:', err)
      toast.error(tx(L, 'Yeniləmə xətası', 'Update failed', 'Ошибка обновления', 'Güncelleme başarısız'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={tx(L, 'Məktəbi redaktə et', 'Edit school', 'Редактировать школу', 'Okulu düzenle')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={tx(L, 'Məktəb adı', 'School name', 'Название школы', 'Okul adı')}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />
        <Input
          label={tx(L, 'Rayon', 'District', 'Район', 'İlçe')}
          value={form.district}
          onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={tx(L, 'Növ', 'Edition', 'Тип', 'Tür')}
            value={form.edition}
            onChange={e => setForm(f => ({ ...f, edition: e.target.value }))}
          >
            <option value="government">{tx(L, 'Dövlət', 'Government', 'Государственная', 'Devlet')}</option>
            <option value="ib">IB</option>
            <option value="hybrid">{tx(L, 'Hibrid', 'Hybrid', 'Гибрид', 'Hibrit')}</option>
          </Select>
          <Select
            label={tx(L, 'Standart dil', 'Default language', 'Язык по умолчанию', 'Varsayılan dil')}
            value={form.default_language}
            onChange={e => setForm(f => ({ ...f, default_language: e.target.value }))}
          >
            <option value="az">{LANG_LABELS.az}</option>
            <option value="en">{LANG_LABELS.en}</option>
            <option value="ru">{LANG_LABELS.ru}</option>
            <option value="tr">{LANG_LABELS.tr}</option>
          </Select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}
          </Button>
          <Button type="submit" loading={saving}>
            {tx(L, 'Yadda saxla', 'Save', 'Сохранить', 'Kaydet')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ── AssignAdminModal ─────────────────────────────────────────────────────
function AssignAdminModal({ open, onClose, onAssigned, school, L }) {
  const toast = useToast()
  const [mode, setMode] = useState('existing') // 'existing' | 'new'

  // Existing user search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [assigningId, setAssigningId] = useState(null)

  // New user form
  const [newForm, setNewForm] = useState({ email: '', full_name: '', password: '' })
  const [newErrors, setNewErrors] = useState({})
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open) {
      setMode('existing')
      setSearchQuery('')
      setSearchResults([])
      setNewForm({ email: '', full_name: '', password: '' })
      setNewErrors({})
    }
  }, [open])

  async function handleSearch(e) {
    e?.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const q = searchQuery.trim()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, school_id, avatar_color')
        .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(20)
      if (error) throw error
      setSearchResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
      toast.error(tx(L, 'Axtarış xətası', 'Search failed', 'Ошибка поиска', 'Arama başarısız'))
    } finally {
      setSearching(false)
    }
  }

  async function makeAdmin(profile) {
    if (!school) return
    setAssigningId(profile.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', school_id: school.id })
        .eq('id', profile.id)
      if (error) throw error
      toast.success(tx(L, 'Admin təyin edildi', 'Admin assigned', 'Администратор назначен', 'Yönetici atandı'))
      onAssigned && onAssigned()
      onClose()
    } catch (err) {
      console.error('makeAdmin error:', err)
      toast.error(tx(L, 'Təyin etmə xətası', 'Assignment failed', 'Ошибка назначения', 'Atama başarısız'))
    } finally {
      setAssigningId(null)
    }
  }

  function validateNew() {
    const e = {}
    if (!newForm.email.trim()) e.email = tx(L, 'E-poçt tələb olunur', 'Email required', 'Email обязателен', 'Email gerekli')
    else if (!/^\S+@\S+\.\S+$/.test(newForm.email.trim())) e.email = tx(L, 'Düzgün e-poçt deyil', 'Invalid email', 'Неверный email', 'Geçersiz email')
    if (!newForm.full_name.trim()) e.full_name = tx(L, 'Ad tələb olunur', 'Name required', 'Имя обязательно', 'İsim gerekli')
    if (!newForm.password || newForm.password.length < 6) e.password = tx(L, 'Ən az 6 simvol', 'Min 6 chars', 'Мин. 6 символов', 'Min. 6 karakter')
    setNewErrors(e)
    return Object.keys(e).length === 0
  }

  async function createNewAdmin(e) {
    e.preventDefault()
    if (!validateNew() || !school) return
    setCreating(true)
    try {
      // Save super_admin's session so we can restore it after signUp
      const { data: { session: savedSession } } = await supabase.auth.getSession()

      // Create new auth user with metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newForm.email.trim(),
        password: newForm.password,
        options: {
          data: {
            full_name: newForm.full_name.trim(),
            role: 'admin',
            school_id: school.id,
          },
          emailRedirectTo: `${window.location.origin}/daxil-ol`,
        },
      })
      if (signUpError) throw signUpError

      // Try to create / update profile in case the trigger didn't pick metadata up
      if (signUpData?.user?.id) {
        const profilePayload = {
          id: signUpData.user.id,
          email: newForm.email.trim(),
          full_name: newForm.full_name.trim(),
          role: 'admin',
          school_id: school.id,
        }
        // Upsert handles both new-trigger and no-trigger cases
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
        if (upsertErr) {
          console.warn('profile upsert warning:', upsertErr)
          // Fall back to update
          await supabase
            .from('profiles')
            .update({ role: 'admin', school_id: school.id, full_name: newForm.full_name.trim() })
            .eq('id', signUpData.user.id)
        }
      }

      // Restore super_admin session — signUp logs us in as the new user
      if (savedSession) {
        await supabase.auth.setSession({
          access_token: savedSession.access_token,
          refresh_token: savedSession.refresh_token,
        })
      }

      toast.success(tx(L, 'Yeni admin yaradıldı', 'New admin created', 'Новый админ создан', 'Yeni yönetici oluşturuldu'))
      onAssigned && onAssigned()
      onClose()
    } catch (err) {
      console.error('createNewAdmin error:', err)
      toast.error(err.message || tx(L, 'Admin yaradılarkən xəta', 'Failed to create admin', 'Ошибка создания админа', 'Yönetici oluşturulamadı'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${tx(L, 'Admin təyin et', 'Assign admin', 'Назначить админа', 'Yönetici ata')} — ${school?.name || ''}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(124,110,224,0.08)' }}>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              mode === 'existing' ? 'bg-white text-[#1a1a2e] shadow-sm' : 'text-[#64748b] hover:text-[#1a1a2e]'
            }`}
          >
            {tx(L, 'Mövcud istifadəçi', 'Existing user', 'Существующий пользователь', 'Mevcut kullanıcı')}
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              mode === 'new' ? 'bg-white text-[#1a1a2e] shadow-sm' : 'text-[#64748b] hover:text-[#1a1a2e]'
            }`}
          >
            {tx(L, 'Yeni istifadəçi yarat', 'Create new user', 'Создать пользователя', 'Yeni kullanıcı oluştur')}
          </button>
        </div>

        {mode === 'existing' ? (
          <>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={tx(L, 'E-poçt və ya ad ilə axtar...', 'Search by email or name...', 'Поиск по email или имени...', 'Email veya isim ile ara...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button type="submit" loading={searching}>
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {tx(L, 'Axtar', 'Search', 'Поиск', 'Ara')}
                </span>
              </Button>
            </form>

            <div className="max-h-80 overflow-y-auto -mx-2">
              {searching ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-[#7c6ee0]" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-[#64748b] text-center py-8">
                  {searchQuery
                    ? tx(L, 'Heç bir istifadəçi tapılmadı', 'No users found', 'Пользователи не найдены', 'Kullanıcı bulunamadı')
                    : tx(L, 'Axtarmaq üçün e-poçt yazın', 'Type email to search', 'Введите email для поиска', 'Aramak için email yazın')}
                </p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      <Avatar name={p.full_name || p.email} size="sm" color={p.avatar_color} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{p.full_name || '—'}</p>
                        <p className="text-xs text-[#64748b] truncate">{p.email}</p>
                      </div>
                      <Badge variant={p.role === 'admin' ? 'info' : p.role === 'super_admin' ? 'info' : 'neutral'}>
                        {p.role}
                      </Badge>
                      <Button
                        variant="primary"
                        className="!px-4 !py-1.5 text-xs"
                        loading={assigningId === p.id}
                        onClick={() => makeAdmin(p)}
                      >
                        {tx(L, 'Admin et', 'Make admin', 'Сделать админом', 'Yönetici yap')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={createNewAdmin} className="space-y-4">
            <Input
              label={tx(L, 'Tam ad', 'Full name', 'Полное имя', 'Tam isim')}
              value={newForm.full_name}
              onChange={e => setNewForm(f => ({ ...f, full_name: e.target.value }))}
              error={newErrors.full_name}
              placeholder={tx(L, 'məs. Aysel Məmmədova', 'e.g. John Smith', 'напр. Иван Иванов', 'örn. Ali Yılmaz')}
            />
            <Input
              label={tx(L, 'E-poçt', 'Email', 'Email', 'Email')}
              type="email"
              value={newForm.email}
              onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
              error={newErrors.email}
              placeholder="admin@school.az"
            />
            <Input
              label={tx(L, 'Müvəqqəti şifrə', 'Temporary password', 'Временный пароль', 'Geçici şifre')}
              type="text"
              value={newForm.password}
              onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))}
              error={newErrors.password}
              helperText={tx(L, 'Admin daxil olduqdan sonra şifrəni dəyişməlidir', 'Admin should change password after first login', 'Админ должен сменить пароль после входа', 'Yönetici giriş sonrası şifresini değiştirmeli')}
              placeholder="••••••••"
            />
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(107,157,222,0.10)', border: '1px solid rgba(107,157,222,0.25)' }}>
              <Mail className="w-4 h-4 text-[#6b9dde] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#2f5a8c]">
                {tx(L, 'Bu istifadəçi e-poçt vasitəsilə təsdiq linki alacaq və ilk girişdən sonra admin paneline yönəldiləcək.',
                      'This user will receive a confirmation email and be redirected to the admin panel after first login.',
                      'Пользователь получит письмо подтверждения и будет перенаправлен в админ-панель.',
                      'Bu kullanıcı doğrulama emaili alacak ve ilk giriş sonrası yönetici paneline yönlendirilecek.')}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                {tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}
              </Button>
              <Button type="submit" loading={creating}>
                {tx(L, 'Admin yarat', 'Create admin', 'Создать админа', 'Yönetici oluştur')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

// ── Main page ────────────────────────────────────────────────────────────
export default function SuperAdminSchools() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const L = profile?.language || 'az'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [schools, setSchools] = useState([])
  const [countsBySchool, setCountsBySchool] = useState({})
  const [classCounts, setClassCounts] = useState({})
  const [adminBySchool, setAdminBySchool] = useState({})
  const [adminEmailBySchool, setAdminEmailBySchool] = useState({})

  const [search, setSearch] = useState('')
  const [editionFilter, setEditionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  const [detailSchool, setDetailSchool] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailStats, setDetailStats] = useState(null)
  const [detailNotifications, setDetailNotifications] = useState([])
  const [blockLoading, setBlockLoading] = useState(false)
  const [blockError, setBlockError] = useState(null)
  const [blockConfirmSchool, setBlockConfirmSchool] = useState(null)

  // CRUD modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editSchool, setEditSchool] = useState(null)
  const [assignAdminSchool, setAssignAdminSchool] = useState(null)

  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      navigate('/daxil-ol', { replace: true })
      return
    }
    if (profile) fetchData()
  }, [profile])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const [schoolsRes, allProfilesRes, classesRes, adminProfilesRes] = await Promise.all([
        supabase.from('schools').select('id, name, district, edition, default_language, created_at, blocked').order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('id, school_id, role').limit(200),
        supabase.from('classes').select('id, school_id').limit(200),
        supabase.from('profiles').select('id, full_name, email, school_id').eq('role', 'admin').limit(200),
      ])

      if (schoolsRes.error) throw schoolsRes.error
      if (allProfilesRes.error) throw allProfilesRes.error
      if (classesRes.error) throw classesRes.error
      if (adminProfilesRes.error) throw adminProfilesRes.error

      // Build counts by school
      const counts = {}
      ;(allProfilesRes.data || []).forEach(p => {
        if (!p.school_id) return
        if (!counts[p.school_id]) counts[p.school_id] = { student: 0, teacher: 0, parent: 0 }
        if (p.role in counts[p.school_id]) counts[p.school_id][p.role]++
      })
      setCountsBySchool(counts)

      // Build class counts by school
      const classCnt = {}
      ;(classesRes.data || []).forEach(c => {
        if (!c.school_id) return
        classCnt[c.school_id] = (classCnt[c.school_id] || 0) + 1
      })
      setClassCounts(classCnt)

      // Build admin lookup
      const adminName = {}
      const adminEmail = {}
      ;(adminProfilesRes.data || []).forEach(a => {
        if (a.school_id) {
          adminName[a.school_id] = a.full_name
          adminEmail[a.school_id] = a.email
        }
      })
      setAdminBySchool(adminName)
      setAdminEmailBySchool(adminEmail)

      setSchools(schoolsRes.data || [])
    } catch (err) {
      console.error('SuperAdmin Schools fetchData error:', err)
      setError(tx(L, 'Məlumatlar yüklənərkən xəta baş verdi.', 'Failed to load data.', 'Ошибка загрузки данных.', 'Veri yüklenirken hata oluştu.'))
    } finally {
      setLoading(false)
    }
  }

  async function openDetail(school) {
    setDetailSchool(school)
    setDetailLoading(true)
    setDetailStats(null)
    setDetailNotifications([])
    try {
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id, title, body, created_at')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setDetailNotifications(notifs || [])
      setDetailStats({
        students: countsBySchool[school.id]?.student || 0,
        teachers: countsBySchool[school.id]?.teacher || 0,
        parents: countsBySchool[school.id]?.parent || 0,
        classes: classCounts[school.id] || 0,
      })
    } catch (err) {
      console.error('openDetail error:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  function closeDetail() {
    setDetailSchool(null)
    setDetailStats(null)
    setDetailNotifications([])
    setBlockError(null)
    setBlockConfirmSchool(null)
  }

  async function toggleBlock(school) {
    setBlockLoading(true)
    setBlockConfirmSchool(null)
    try {
      const newVal = !school.blocked
      const { error } = await supabase
        .from('schools')
        .update({ blocked: newVal })
        .eq('id', school.id)
      if (error) throw error
      setSchools(prev => prev.map(s => s.id === school.id ? { ...s, blocked: newVal } : s))
      setDetailSchool(prev => prev ? { ...prev, blocked: newVal } : prev)
    } catch (err) {
      console.error('toggleBlock error:', err)
      setBlockError(tx(L, 'Blok statusu dəyişdirilə bilmədi.', 'Failed to update block status.', 'Не удалось обновить статус блокировки.', 'Engelleme durumu güncellenemedi.'))
    } finally {
      setBlockLoading(false)
    }
  }

  // Derived stats for summary cards
  const totalSchools = schools.length
  const govCount = schools.filter(s => s.edition === 'government').length
  const ibCount = schools.filter(s => s.edition === 'ib').length
  const thisMonthCount = useMemo(() => {
    const now = new Date()
    return schools.filter(s => {
      const d = new Date(s.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [schools])

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...schools]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        adminBySchool[s.id]?.toLowerCase().includes(q)
      )
    }
    if (editionFilter !== 'all') {
      list = list.filter(s => s.edition === editionFilter)
    }
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'created_at') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'students') {
      list.sort((a, b) => (countsBySchool[b.id]?.student || 0) - (countsBySchool[a.id]?.student || 0))
    }
    return list
  }, [schools, search, editionFilter, sortBy, adminBySchool, countsBySchool])

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchData}>
          <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {tx(L, 'Yenidən cəhd et', 'Retry', 'Повторить', 'Tekrar dene')}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-gray-900">{tx(L, 'Məktəblər', 'Schools', 'Школы', 'Okullar')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tx(L, 'Platformada qeydiyyatlı bütün məktəbləri idarə edin',
                  'Manage all schools registered on the platform',
                  'Управляйте всеми школами на платформе',
                  'Platformdaki tüm okulları yönetin')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="ghost" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {tx(L, 'Yenilə', 'Refresh', 'Обновить', 'Yenile')}
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {tx(L, 'Məktəb əlavə et', 'Add school', 'Добавить школу', 'Okul ekle')}
          </Button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={tx(L, 'Ümumi məktəblər', 'Total schools', 'Всего школ', 'Toplam okullar')} value={totalSchools} icon={School} />
        <StatCard label={tx(L, 'Dövlət məktəbləri', 'Government schools', 'Государственные', 'Devlet okulları')} value={govCount} icon={BookOpen} />
        <StatCard label={tx(L, 'IB məktəbləri', 'IB schools', 'IB школы', 'IB okulları')} value={ibCount} icon={GraduationCap} />
        <StatCard label={tx(L, 'Bu ay qeydiyyat', 'This month', 'В этом месяце', 'Bu ay')} value={thisMonthCount} icon={Calendar} />
      </div>

      {/* Filters */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={tx(L, 'Məktəb adı, rayon və ya admin axtar...', 'Search school, district or admin...', 'Поиск по имени, району или админу...', 'Okul, ilçe veya yönetici ara...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={editionFilter} onChange={e => setEditionFilter(e.target.value)}>
              <option value="all">{tx(L, 'Bütün növlər', 'All editions', 'Все типы', 'Tüm türler')}</option>
              <option value="government">{tx(L, 'Dövlət', 'Government', 'Государственная', 'Devlet')}</option>
              <option value="ib">IB</option>
              <option value="hybrid">{tx(L, 'Hibrid', 'Hybrid', 'Гибрид', 'Hibrit')}</option>
            </Select>
          </div>
          <div className="w-full sm:w-52">
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created_at">{tx(L, 'Tarixə görə sırala', 'Sort by date', 'По дате', 'Tarihe göre')}</option>
              <option value="name">{tx(L, 'Ada görə sırala', 'Sort by name', 'По имени', 'İsme göre')}</option>
              <option value="students">{tx(L, 'Şagird sayına görə', 'Sort by students', 'По кол-ву учеников', 'Öğrenci sayısına göre')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Schools table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="px-8 py-5 border-b border-border-soft flex items-center gap-3">
          <School className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">{tx(L, 'Məktəblər siyahısı', 'Schools list', 'Список школ', 'Okullar listesi')}</h2>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} {tx(L, 'məktəb', 'schools', 'школ', 'okul')}</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={School}
            title={tx(L, 'Məktəb tapılmadı', 'No schools found', 'Школы не найдены', 'Okul bulunamadı')}
            description={tx(L, 'Axtarış meyarlarınıza uyğun məktəb yoxdur.', 'No schools match your search criteria.', 'Нет школ, соответствующих поиску.', 'Arama kriterlerinize uygun okul yok.')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Məktəb adı', 'School name', 'Название', 'Okul adı')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Rayon', 'District', 'Район', 'İlçe')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Növ', 'Edition', 'Тип', 'Tür')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Admin</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{tx(L, 'Şagirdlər', 'Students', 'Ученики', 'Öğrenciler')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{tx(L, 'Müəllimlər', 'Teachers', 'Учителя', 'Öğretmenler')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Qeydiyyat', 'Created', 'Создано', 'Oluşturuldu')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-right">{tx(L, 'Əməliyyat', 'Actions', 'Действия', 'İşlemler')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school, i) => {
                  const counts = countsBySchool[school.id] || { student: 0, teacher: 0, parent: 0 }
                  return (
                    <tr
                      key={school.id || i}
                      className="border-b border-border-soft hover:bg-surface transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{school.name}</span>
                          {school.blocked && (
                            <Badge variant="absent">{tx(L, 'Blok', 'Blocked', 'Заблок.', 'Engellenmiş')}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{school.district || '—'}</td>
                      <td className="px-6 py-4">
                        <EditionBadge edition={school.edition} govLabel={tx(L, 'Dövlət', 'Government', 'Гос.', 'Devlet')} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{adminBySchool[school.id] || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">{counts.student}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">{counts.teacher}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(school.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => openDetail(school)}
                            title={tx(L, 'Bax', 'View', 'Просмотр', 'Görüntüle')}
                          >
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {tx(L, 'Bax', 'View', 'Просмотр', 'Görüntüle')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => setEditSchool(school)}
                            title={tx(L, 'Redaktə et', 'Edit', 'Изменить', 'Düzenle')}
                          >
                            <span className="flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5" />
                              {tx(L, 'Redaktə', 'Edit', 'Изменить', 'Düzenle')}
                            </span>
                          </Button>
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => setAssignAdminSchool(school)}
                            title={tx(L, 'Admin təyin et', 'Assign admin', 'Назначить админа', 'Yönetici ata')}
                          >
                            <span className="flex items-center gap-1">
                              <UserPlus className="w-3.5 h-3.5" />
                              {tx(L, 'Admin', 'Admin', 'Админ', 'Yönetici')}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Block / Unblock confirmation modal */}
      <Modal
        open={!!blockConfirmSchool}
        onClose={() => setBlockConfirmSchool(null)}
        title={blockConfirmSchool?.blocked
          ? tx(L, 'Məktəbi aktivləşdir', 'Activate school', 'Активировать школу', 'Okulu aktifleştir')
          : tx(L, 'Məktəbi blok et', 'Block school', 'Заблокировать школу', 'Okulu engelle')}
        size="sm"
      >
        {blockConfirmSchool && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {blockConfirmSchool.blocked
                  ? `"${blockConfirmSchool.name}" ${tx(L, 'məktəbini aktivləşdirmək istədiyinizə əminsiniz?', 'school will be activated. Are you sure?', 'школа будет активирована. Вы уверены?', 'okulu aktifleştirilecek. Emin misiniz?')}`
                  : `"${blockConfirmSchool.name}" ${tx(L, 'məktəbini blok etmək istədiyinizə əminsiniz?', 'school will be blocked. Are you sure?', 'школа будет заблокирована. Вы уверены?', 'okulu engellenecek. Emin misiniz?')}`}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setBlockConfirmSchool(null)}>{tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}</Button>
              <Button
                variant={blockConfirmSchool.blocked ? 'teal' : 'danger'}
                loading={blockLoading}
                onClick={() => toggleBlock(blockConfirmSchool)}
              >
                {blockConfirmSchool.blocked
                  ? tx(L, 'Aktivləşdir', 'Activate', 'Активировать', 'Aktifleştir')
                  : tx(L, 'Blok et', 'Block', 'Заблокировать', 'Engelle')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* School detail modal */}
      <Modal
        open={!!detailSchool}
        onClose={closeDetail}
        title={detailSchool?.name || tx(L, 'Məktəb detalları', 'School details', 'Детали школы', 'Okul detayları')}
        size="xl"
      >
        {detailSchool && (
          <div className="space-y-6">
            {/* School info */}
            <div className="bg-surface rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-gray-900">{detailSchool.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{detailSchool.district || '—'}</p>
                </div>
                <EditionBadge edition={detailSchool.edition} govLabel={tx(L, 'Dövlət', 'Government', 'Гос.', 'Devlet')} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{tx(L, 'Dil', 'Language', 'Язык', 'Dil')}</span>
                  <p className="text-gray-900 font-medium mt-0.5">{LANG_LABELS[detailSchool.default_language] || detailSchool.default_language || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{tx(L, 'Qeydiyyat tarixi', 'Created', 'Создано', 'Oluşturuldu')}</span>
                  <p className="text-gray-900 font-medium mt-0.5">{formatDate(detailSchool.created_at)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
                  <p className="text-gray-900 font-medium mt-0.5">{adminBySchool[detailSchool.id] || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{tx(L, 'Admin e-poçt', 'Admin email', 'Email админа', 'Yönetici email')}</span>
                  <p className="text-gray-900 font-medium mt-0.5 break-all">{adminEmailBySchool[detailSchool.id] || '—'}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {detailLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-mid" />
              </div>
            ) : detailStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.students}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx(L, 'Şagirdlər', 'Students', 'Ученики', 'Öğrenciler')}</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <GraduationCap className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.teachers}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx(L, 'Müəllimlər', 'Teachers', 'Учителя', 'Öğretmenler')}</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.parents}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx(L, 'Valideynlər', 'Parents', 'Родители', 'Veliler')}</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <BookOpen className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.classes}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx(L, 'Siniflər', 'Classes', 'Классы', 'Sınıflar')}</p>
                </div>
              </div>
            )}

            {/* Recent notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-purple-mid" />
                <h4 className="font-medium text-gray-900 text-sm">{tx(L, 'Son bildirişlər', 'Recent notifications', 'Последние уведомления', 'Son bildirimler')}</h4>
              </div>
              {detailLoading ? (
                <p className="text-sm text-gray-400 py-3">{tx(L, 'Yüklənir...', 'Loading...', 'Загрузка...', 'Yükleniyor...')}</p>
              ) : detailNotifications.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">{tx(L, 'Heç bir bildiriş tapılmadı', 'No notifications found', 'Уведомлений нет', 'Bildirim yok')}</p>
              ) : (
                <div className="space-y-0 border border-border-soft rounded-xl overflow-hidden">
                  {detailNotifications.map((n, i) => (
                    <div
                      key={n.id || i}
                      className="flex items-start justify-between px-4 py-3 border-b border-border-soft last:border-0 hover:bg-surface transition-colors"
                    >
                      <div className="min-w-0 mr-4">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 truncate mt-0.5">{n.body}</p>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formatDateTime(n.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions: edit, assign admin */}
            <div className="pt-2 border-t border-border-soft flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => { closeDetail(); setEditSchool(detailSchool) }} className="!px-4 !py-2 text-sm">
                <span className="flex items-center gap-2"><Pencil className="w-4 h-4" />{tx(L, 'Redaktə et', 'Edit', 'Изменить', 'Düzenle')}</span>
              </Button>
              <Button variant="secondary" onClick={() => { closeDetail(); setAssignAdminSchool(detailSchool) }} className="!px-4 !py-2 text-sm">
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />{tx(L, 'Admin təyin et', 'Assign admin', 'Назначить админа', 'Yönetici ata')}</span>
              </Button>
            </div>

            {/* Block / Unblock action */}
            <div className="pt-2 border-t border-border-soft space-y-3">
              {blockError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{blockError}</p>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx(L, 'Məktəb statusu', 'School status', 'Статус школы', 'Okul durumu')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {detailSchool.blocked
                      ? tx(L, 'Bu məktəb hal-hazırda bloklanmışdır.', 'This school is currently blocked.', 'Эта школа заблокирована.', 'Bu okul şu an engellenmiş.')
                      : tx(L, 'Bu məktəb aktivdir.', 'This school is active.', 'Эта школа активна.', 'Bu okul aktif.')}
                  </p>
                </div>
                <Button
                  variant={detailSchool.blocked ? 'teal' : 'danger'}
                  loading={blockLoading}
                  onClick={() => { setBlockError(null); setBlockConfirmSchool(detailSchool) }}
                  className="!px-5 !py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    {detailSchool.blocked
                      ? <><ShieldCheck className="w-4 h-4" /> {tx(L, 'Aktivləşdir', 'Activate', 'Активировать', 'Aktifleştir')}</>
                      : <><ShieldOff className="w-4 h-4" /> {tx(L, 'Blok et', 'Block', 'Заблокировать', 'Engelle')}</>
                    }
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create school modal */}
      <CreateSchoolModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchData()}
        L={L}
      />

      {/* Edit school modal */}
      <EditSchoolModal
        open={!!editSchool}
        onClose={() => setEditSchool(null)}
        onUpdated={() => fetchData()}
        school={editSchool}
        L={L}
      />

      {/* Assign admin modal */}
      <AssignAdminModal
        open={!!assignAdminSchool}
        onClose={() => setAssignAdminSchool(null)}
        onAssigned={() => fetchData()}
        school={assignAdminSchool}
        L={L}
      />
    </div>
  )
}
