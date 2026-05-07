import { useState, useEffect, useMemo } from 'react'
import {
  Search, Shield, ShieldCheck, ShieldOff, RefreshCw, AlertTriangle,
  ArrowDownCircle, ArrowLeftRight, Building2, UserCheck, UserX, Mail, School as SchoolIcon
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
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { useNavigate } from 'react-router-dom'
import { fmtNumeric } from '../../lib/dateUtils'

function formatDate(dateStr) {
  return fmtNumeric(dateStr)
}

function tx(L, az, en, ru, tr) {
  if (L === 'en') return en || az
  if (L === 'ru') return ru || az
  if (L === 'tr') return tr || az
  return az
}

const ROLE_LABELS_AZ = { admin: 'Admin', super_admin: 'Super Admin' }
const ROLE_LABELS_EN = { admin: 'Admin', super_admin: 'Super Admin' }
const ROLE_LABELS_RU = { admin: 'Админ', super_admin: 'Супер админ' }
const ROLE_LABELS_TR = { admin: 'Yönetici', super_admin: 'Süper yönetici' }

function roleLabel(L, role) {
  const m = L === 'en' ? ROLE_LABELS_EN : L === 'ru' ? ROLE_LABELS_RU : L === 'tr' ? ROLE_LABELS_TR : ROLE_LABELS_AZ
  return m[role] || role
}

export default function SuperAdminAdmins() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const L = profile?.language || 'az'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [admins, setAdmins] = useState([])
  const [schools, setSchools] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [schoolFilter, setSchoolFilter] = useState('all')

  // Action modal state
  const [demoteTarget, setDemoteTarget] = useState(null)
  const [demoteLoading, setDemoteLoading] = useState(false)
  const [reassignTarget, setReassignTarget] = useState(null)
  const [reassignSchoolId, setReassignSchoolId] = useState('')
  const [reassignLoading, setReassignLoading] = useState(false)
  const [blockTarget, setBlockTarget] = useState(null)
  const [blockLoading, setBlockLoading] = useState(false)
  const [profilesHasBlocked, setProfilesHasBlocked] = useState(true)

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

      const [adminsRes, schoolsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name, role, school_id, avatar_color, language, created_at, blocked')
          .in('role', ['admin', 'super_admin'])
          .order('created_at', { ascending: false }),
        supabase
          .from('schools')
          .select('id, name, district, edition')
          .order('name', { ascending: true }),
      ])

      // If `blocked` column doesn't exist on profiles, retry without it
      let adminData = adminsRes.data
      if (adminsRes.error) {
        // Detect missing-column error for graceful fallback
        if (/blocked/i.test(adminsRes.error.message || '')) {
          setProfilesHasBlocked(false)
          const retry = await supabase
            .from('profiles')
            .select('id, email, full_name, role, school_id, avatar_color, language, created_at')
            .in('role', ['admin', 'super_admin'])
            .order('created_at', { ascending: false })
          if (retry.error) throw retry.error
          adminData = retry.data
        } else {
          throw adminsRes.error
        }
      }
      if (schoolsRes.error) throw schoolsRes.error

      setAdmins(adminData || [])
      setSchools(schoolsRes.data || [])
    } catch (err) {
      console.error('SuperAdmin Admins fetchData error:', err)
      setError(tx(L, 'Məlumatlar yüklənərkən xəta baş verdi.', 'Failed to load data.', 'Ошибка загрузки.', 'Veri yüklenemedi.'))
    } finally {
      setLoading(false)
    }
  }

  const schoolMap = useMemo(() => {
    const m = {}
    schools.forEach(s => { m[s.id] = s })
    return m
  }, [schools])

  // Stats
  const totalAdmins = admins.length
  const activeAdmins = profilesHasBlocked ? admins.filter(a => !a.blocked).length : admins.length
  const blockedAdmins = profilesHasBlocked ? admins.filter(a => !!a.blocked).length : 0
  const distinctSchools = new Set(admins.map(a => a.school_id).filter(Boolean)).size

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...admins]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(a =>
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (schoolMap[a.school_id]?.name || '').toLowerCase().includes(q)
      )
    }
    if (roleFilter !== 'all') list = list.filter(a => a.role === roleFilter)
    if (schoolFilter !== 'all') {
      if (schoolFilter === 'none') list = list.filter(a => !a.school_id)
      else list = list.filter(a => a.school_id === schoolFilter)
    }
    return list
  }, [admins, search, roleFilter, schoolFilter, schoolMap])

  // Actions
  async function confirmDemote() {
    if (!demoteTarget) return
    setDemoteLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'teacher' })
        .eq('id', demoteTarget.id)
      if (error) throw error
      toast.success(tx(L, 'Admin müəllimə aşağı salındı', 'Admin demoted to teacher', 'Понижен до учителя', 'Öğretmene düşürüldü'))
      setDemoteTarget(null)
      await fetchData()
    } catch (err) {
      console.error('demote error:', err)
      toast.error(tx(L, 'Aşağı salma xətası', 'Demote failed', 'Ошибка понижения', 'Düşürme başarısız'))
    } finally {
      setDemoteLoading(false)
    }
  }

  async function confirmReassign() {
    if (!reassignTarget || !reassignSchoolId) return
    setReassignLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: reassignSchoolId })
        .eq('id', reassignTarget.id)
      if (error) throw error
      toast.success(tx(L, 'Məktəb dəyişdirildi', 'School reassigned', 'Школа изменена', 'Okul değiştirildi'))
      setReassignTarget(null)
      setReassignSchoolId('')
      await fetchData()
    } catch (err) {
      console.error('reassign error:', err)
      toast.error(tx(L, 'Dəyişdirmə xətası', 'Reassignment failed', 'Ошибка', 'Atama başarısız'))
    } finally {
      setReassignLoading(false)
    }
  }

  async function confirmBlock() {
    if (!blockTarget || !profilesHasBlocked) return
    setBlockLoading(true)
    try {
      const newVal = !blockTarget.blocked
      const { error } = await supabase
        .from('profiles')
        .update({ blocked: newVal })
        .eq('id', blockTarget.id)
      if (error) throw error
      toast.success(newVal
        ? tx(L, 'Admin bloklandı', 'Admin blocked', 'Админ заблокирован', 'Yönetici engellendi')
        : tx(L, 'Admin aktivləşdirildi', 'Admin unblocked', 'Админ разблокирован', 'Yönetici aktif'))
      setBlockTarget(null)
      await fetchData()
    } catch (err) {
      console.error('block error:', err)
      toast.error(tx(L, 'Status dəyişmədi', 'Status not changed', 'Статус не изменён', 'Durum değişmedi'))
    } finally {
      setBlockLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchData}>
          <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" />{tx(L, 'Yenidən cəhd et', 'Retry', 'Повторить', 'Tekrar dene')}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-gray-900">{tx(L, 'Adminlər', 'Admins', 'Администраторы', 'Yöneticiler')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tx(L, 'Bütün məktəb adminlərini idarə edin',
                  'Manage all school admins',
                  'Управляйте всеми администраторами школ',
                  'Tüm okul yöneticilerini yönetin')}
          </p>
        </div>
        <Button onClick={fetchData} variant="ghost" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {tx(L, 'Yenilə', 'Refresh', 'Обновить', 'Yenile')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={tx(L, 'Ümumi adminlər', 'Total admins', 'Всего админов', 'Toplam yönetici')} value={totalAdmins} icon={Shield} tone="periwinkle" />
        <StatCard label={tx(L, 'Aktiv', 'Active', 'Активные', 'Aktif')} value={activeAdmins} icon={UserCheck} tone="mint" />
        <StatCard label={tx(L, 'Bloklanmış', 'Blocked', 'Заблокированные', 'Engellenmiş')} value={blockedAdmins} icon={UserX} tone="peach" />
        <StatCard label={tx(L, 'Məktəb sayı', 'Schools covered', 'Школ', 'Okul sayısı')} value={distinctSchools} icon={Building2} tone="blue" />
      </div>

      {/* Filters */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={tx(L, 'Ad, e-poçt və ya məktəb axtar...', 'Search by name, email or school...', 'Поиск...', 'Ad, email veya okul ara...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-44">
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">{tx(L, 'Bütün rollar', 'All roles', 'Все роли', 'Tüm roller')}</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </div>
          <div className="w-full sm:w-56">
            <Select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)}>
              <option value="all">{tx(L, 'Bütün məktəblər', 'All schools', 'Все школы', 'Tüm okullar')}</option>
              <option value="none">{tx(L, 'Məktəbsiz', 'No school', 'Без школы', 'Okulsuz')}</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Admins table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="px-8 py-5 border-b border-border-soft flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">{tx(L, 'Adminlər siyahısı', 'Admins list', 'Список админов', 'Yöneticiler listesi')}</h2>
          <span className="ml-auto text-xs text-gray-400">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Shield}
            title={tx(L, 'Admin tapılmadı', 'No admins found', 'Админы не найдены', 'Yönetici bulunamadı')}
            description={tx(L, 'Axtarış meyarlarınıza uyğun admin yoxdur.', 'No admins match your filters.', 'Нет админов по фильтру.', 'Filtreye uygun yönetici yok.')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Ad', 'Name', 'Имя', 'İsim')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'E-poçt', 'Email', 'Email', 'Email')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Rol', 'Role', 'Роль', 'Rol')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Məktəb', 'School', 'Школа', 'Okul')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{tx(L, 'Qeydiyyat', 'Created', 'Создан', 'Oluşturuldu')}</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-right">{tx(L, 'Əməliyyat', 'Actions', 'Действия', 'İşlemler')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const school = schoolMap[a.school_id]
                  const isSuper = a.role === 'super_admin'
                  return (
                    <tr key={a.id || i} className="border-b border-border-soft hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={a.full_name || a.email} size="sm" color={a.avatar_color} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{a.full_name || '—'}</p>
                            {profilesHasBlocked && a.blocked && (
                              <Badge variant="absent" className="mt-0.5">{tx(L, 'Blok', 'Blocked', 'Заблок.', 'Engelli')}</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{a.email || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={isSuper ? 'info' : 'good'}>
                          {roleLabel(L, a.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {school ? school.name : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(a.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={isSuper}
                            onClick={() => { setReassignTarget(a); setReassignSchoolId(a.school_id || '') }}
                            title={tx(L, 'Məktəbi dəyişdir', 'Reassign school', 'Сменить школу', 'Okul değiştir')}
                          >
                            <span className="flex items-center gap-1">
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              {tx(L, 'Köçür', 'Reassign', 'Сменить', 'Atama')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={isSuper}
                            onClick={() => setDemoteTarget(a)}
                            title={tx(L, 'Aşağı sal', 'Demote', 'Понизить', 'Düşür')}
                          >
                            <span className="flex items-center gap-1">
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                              {tx(L, 'Aşağı sal', 'Demote', 'Понизить', 'Düşür')}
                            </span>
                          </Button>
                          {profilesHasBlocked ? (
                            <Button
                              variant={a.blocked ? 'teal' : 'secondary'}
                              className="!px-3 !py-1.5 text-xs"
                              disabled={isSuper}
                              onClick={() => setBlockTarget(a)}
                              title={a.blocked
                                ? tx(L, 'Aktivləşdir', 'Activate', 'Активировать', 'Aktifleştir')
                                : tx(L, 'Blok et', 'Block', 'Блокировать', 'Engelle')}
                            >
                              <span className="flex items-center gap-1">
                                {a.blocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                {a.blocked
                                  ? tx(L, 'Aktiv', 'Activate', 'Актив.', 'Aktif')
                                  : tx(L, 'Blok', 'Block', 'Блок', 'Engel')}
                              </span>
                            </Button>
                          ) : (
                            <span
                              className="text-[11px] text-gray-400 px-2 py-1 rounded-md"
                              style={{ background: 'rgba(100,116,139,0.06)' }}
                              title={tx(L, 'profiles.blocked sütunu mövcud deyil', 'profiles.blocked column missing', 'столбец profiles.blocked отсутствует', 'profiles.blocked sütunu yok')}
                            >
                              {tx(L, 'Blok yoxdur', 'No block col', 'Нет блок.', 'Engel yok')}
                            </span>
                          )}
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

      {/* Demote modal */}
      <Modal
        open={!!demoteTarget}
        onClose={() => setDemoteTarget(null)}
        title={tx(L, 'Adminı müəllimə dəyişdir', 'Demote admin to teacher', 'Понизить до учителя', 'Öğretmene düşür')}
        size="sm"
      >
        {demoteTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {tx(L,
                  `${demoteTarget.full_name || demoteTarget.email} admin rolundan müəllim rolüna keçəcək. Davam edək?`,
                  `${demoteTarget.full_name || demoteTarget.email} will be changed from admin to teacher. Continue?`,
                  `${demoteTarget.full_name || demoteTarget.email} будет понижен до учителя. Продолжить?`,
                  `${demoteTarget.full_name || demoteTarget.email} öğretmene düşürülecek. Devam?`)}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDemoteTarget(null)}>{tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}</Button>
              <Button variant="danger" loading={demoteLoading} onClick={confirmDemote}>
                {tx(L, 'Aşağı sal', 'Demote', 'Понизить', 'Düşür')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reassign modal */}
      <Modal
        open={!!reassignTarget}
        onClose={() => { setReassignTarget(null); setReassignSchoolId('') }}
        title={tx(L, 'Məktəbə yenidən təyin et', 'Reassign to school', 'Сменить школу', 'Okula yeniden ata')}
        size="md"
      >
        {reassignTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(124,110,224,0.06)' }}>
              <Avatar name={reassignTarget.full_name || reassignTarget.email} size="sm" color={reassignTarget.avatar_color} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{reassignTarget.full_name || '—'}</p>
                <p className="text-xs text-gray-500 truncate">{reassignTarget.email}</p>
              </div>
            </div>
            <Select
              label={tx(L, 'Yeni məktəb', 'New school', 'Новая школа', 'Yeni okul')}
              value={reassignSchoolId}
              onChange={e => setReassignSchoolId(e.target.value)}
            >
              <option value="">{tx(L, '— seçin —', '— choose —', '— выберите —', '— seçin —')}</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setReassignTarget(null); setReassignSchoolId('') }}>
                {tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}
              </Button>
              <Button
                disabled={!reassignSchoolId || reassignSchoolId === reassignTarget.school_id}
                loading={reassignLoading}
                onClick={confirmReassign}
              >
                {tx(L, 'Köçür', 'Reassign', 'Сменить', 'Ata')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Block modal */}
      <Modal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title={blockTarget?.blocked
          ? tx(L, 'Adminı aktivləşdir', 'Activate admin', 'Активировать админа', 'Yöneticiyi aktifleştir')
          : tx(L, 'Adminı blok et', 'Block admin', 'Заблокировать админа', 'Yöneticiyi engelle')}
        size="sm"
      >
        {blockTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {blockTarget.blocked
                  ? tx(L,
                      `${blockTarget.full_name || blockTarget.email} aktivləşdiriləcək.`,
                      `${blockTarget.full_name || blockTarget.email} will be activated.`,
                      `${blockTarget.full_name || blockTarget.email} будет активирован.`,
                      `${blockTarget.full_name || blockTarget.email} aktifleştirilecek.`)
                  : tx(L,
                      `${blockTarget.full_name || blockTarget.email} bloklanacaq və daxil ola bilməyəcək.`,
                      `${blockTarget.full_name || blockTarget.email} will be blocked and unable to log in.`,
                      `${blockTarget.full_name || blockTarget.email} будет заблокирован.`,
                      `${blockTarget.full_name || blockTarget.email} engellenecek.`)}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setBlockTarget(null)}>{tx(L, 'Ləğv et', 'Cancel', 'Отмена', 'İptal')}</Button>
              <Button variant={blockTarget.blocked ? 'teal' : 'danger'} loading={blockLoading} onClick={confirmBlock}>
                {blockTarget.blocked
                  ? tx(L, 'Aktivləşdir', 'Activate', 'Активировать', 'Aktifleştir')
                  : tx(L, 'Blok et', 'Block', 'Блокировать', 'Engelle')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
