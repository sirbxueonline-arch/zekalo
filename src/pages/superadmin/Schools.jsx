import { useState, useEffect, useMemo } from 'react'
import {
  Search, School, Users, GraduationCap, Heart,
  Eye, ShieldOff, ShieldCheck, Calendar, ChevronDown,
  RefreshCw, BookOpen, Bell, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
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

const EDITION_LABELS = { ib: 'IB', government: 'Dövlət' }

const LANG_LABELS = {
  az: 'Azərbaycan',
  en: 'İngilis',
  ru: 'Rus',
}

export default function SuperAdminSchools() {
  const { profile } = useAuth()
  const navigate = useNavigate()

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
      setError('Məlumatlar yüklənərkən xəta baş verdi.')
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
      setBlockError('Blok statusu dəyişdirilə bilmədi.')
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
          <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Yenidən cəhd et</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-gray-900">Məktəblər</h1>
          <p className="text-sm text-gray-500 mt-1">Platformada qeydiyyatlı bütün məktəbləri idarə edin</p>
        </div>
        <Button onClick={fetchData} variant="ghost" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Yenilə
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Ümumi məktəblər" value={totalSchools} icon={School} />
        <StatCard label="Dövlət məktəbləri" value={govCount} icon={BookOpen} />
        <StatCard label="IB məktəbləri" value={ibCount} icon={GraduationCap} />
        <StatCard label="Bu ay qeydiyyat" value={thisMonthCount} icon={Calendar} />
      </div>

      {/* Filters */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Məktəb adı, rayon və ya admin axtar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={editionFilter} onChange={e => setEditionFilter(e.target.value)}>
              <option value="all">Bütün növlər</option>
              <option value="government">Dövlət</option>
              <option value="ib">IB</option>
            </Select>
          </div>
          <div className="w-full sm:w-52">
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created_at">Tarixə görə sırala</option>
              <option value="name">Ada görə sırala</option>
              <option value="students">Şagird sayına görə</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Schools table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="px-8 py-5 border-b border-border-soft flex items-center gap-3">
          <School className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">Məktəblər siyahısı</h2>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} məktəb</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={School}
            title="Məktəb tapılmadı"
            description="Axtarış meyarlarınıza uyğun məktəb yoxdur."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Məktəb adı</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Rayon</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Növ</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Admin</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Şagirdlər</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Müəllimlər</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Valideynlər</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Qeydiyyat</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-right">Əməliyyat</th>
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
                            <Badge variant="absent">Blok</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{school.district || '—'}</td>
                      <td className="px-6 py-4">
                        <EditionBadge edition={school.edition} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{adminBySchool[school.id] || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">{counts.student}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">{counts.teacher}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">{counts.parent}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(school.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          className="!px-4 !py-2 text-xs"
                          onClick={() => openDetail(school)}
                        >
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Bax
                          </span>
                        </Button>
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
        title={blockConfirmSchool?.blocked ? 'Məktəbi aktivləşdir' : 'Məktəbi blok et'}
        size="sm"
      >
        {blockConfirmSchool && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {blockConfirmSchool.blocked
                  ? `"${blockConfirmSchool.name}" məktəbini aktivləşdirmək istədiyinizə əminsiniz?`
                  : `"${blockConfirmSchool.name}" məktəbini blok etmək istədiyinizə əminsiniz?`}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setBlockConfirmSchool(null)}>Ləğv et</Button>
              <Button
                variant={blockConfirmSchool.blocked ? 'teal' : 'danger'}
                loading={blockLoading}
                onClick={() => toggleBlock(blockConfirmSchool)}
              >
                {blockConfirmSchool.blocked ? 'Aktivləşdir' : 'Blok et'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* School detail modal */}
      <Modal
        open={!!detailSchool}
        onClose={closeDetail}
        title={detailSchool?.name || 'Məktəb detalları'}
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
                <EditionBadge edition={detailSchool.edition} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Dil</span>
                  <p className="text-gray-900 font-medium mt-0.5">{LANG_LABELS[detailSchool.default_language] || detailSchool.default_language || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Qeydiyyat tarixi</span>
                  <p className="text-gray-900 font-medium mt-0.5">{formatDate(detailSchool.created_at)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
                  <p className="text-gray-900 font-medium mt-0.5">{adminBySchool[detailSchool.id] || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Admin e-poçt</span>
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
                  <p className="text-xs text-gray-400 mt-0.5">Şagirdlər</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <GraduationCap className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.teachers}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Müəllimlər</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.parents}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Valideynlər</p>
                </div>
                <div className="bg-white border border-border-soft rounded-xl p-4 text-center">
                  <BookOpen className="w-5 h-5 text-purple-mid mx-auto mb-1" />
                  <p className="text-2xl font-semibold text-gray-900">{detailStats.classes}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Siniflər</p>
                </div>
              </div>
            )}

            {/* Recent notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-purple-mid" />
                <h4 className="font-medium text-gray-900 text-sm">Son bildirişlər</h4>
              </div>
              {detailLoading ? (
                <p className="text-sm text-gray-400 py-3">Yüklənir...</p>
              ) : detailNotifications.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">Heç bir bildiriş tapılmadı</p>
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

            {/* Block / Unblock action */}
            <div className="pt-2 border-t border-border-soft space-y-3">
              {blockError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{blockError}</p>
              )}
              <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Məktəb statusu</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {detailSchool.blocked
                    ? 'Bu məktəb hal-hazırda bloklanmışdır.'
                    : 'Bu məktəb aktivdir.'}
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
                    ? <><ShieldCheck className="w-4 h-4" /> Aktivləşdir</>
                    : <><ShieldOff className="w-4 h-4" /> Blok et</>
                  }
                </span>
              </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
