import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School, Users, GraduationCap, Heart, Clock, Activity,
  BarChart2, TrendingUp, RefreshCw, Plus, UserPlus, ListChecks,
  ShieldCheck, ShieldOff, Shield, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { EditionBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import CountUp from '../../components/ui/CountUp'
import MFASection from '../../components/auth/MFASection'
import { fmtNumeric } from '../../lib/dateUtils'

function formatDate(dateStr) {
  return fmtNumeric(dateStr)
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return `${fmtNumeric(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const ROLE_LABELS = {
  student: 'Şagird',
  teacher: 'Müəllim',
  parent: 'Valideyn',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

const ROLE_VARIANTS = {
  student: 'national',
  teacher: 'ib',
  parent: 'ap',
  admin: 'default',
  super_admin: 'default',
}

// Small reusable card-section header: tinted icon-chip + display title + muted
// subtitle. Calm/authoritative chrome for the admin (LOW) dial — one accent hue.
function SectionHead({ icon: Icon, tone = 'periwinkle', title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`icon-chip icon-chip-${tone}`} style={{ width: 38, height: 38, borderRadius: 12 }}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="min-w-0">
        <h2 className="font-semibold text-[15px] text-ink-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const L = profile?.language || 'az'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [stats, setStats] = useState({
    schools: 0, students: 0, teachers: 0, parents: 0,
    totalUsers: 0, activeSchools: 0, blockedSchools: 0, totalAdmins: 0,
  })
  const [recentSchools, setRecentSchools] = useState([])
  const [recentProfiles, setRecentProfiles] = useState([])
  const [topSchoolsByStudents, setTopSchoolsByStudents] = useState([])

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

      const [
        schoolsCountRes,
        studentsCountRes,
        teachersCountRes,
        parentsCountRes,
        recentSchoolsRes,
        allProfilesRes,
        recentProfilesRes,
        adminProfilesRes,
        usersCountRes,
        adminsCountRes,
        allSchoolsRes,
      ] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
        supabase.from('schools').select('id, name, district, edition, created_at, blocked').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id, school_id, role').limit(500),
        supabase.from('profiles').select('id, full_name, role, created_at, school_id').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('full_name, school_id').eq('role', 'admin').limit(500),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']),
        supabase.from('schools').select('id, blocked').limit(500),
      ])

      if (schoolsCountRes.error) throw schoolsCountRes.error
      if (studentsCountRes.error) throw studentsCountRes.error
      if (teachersCountRes.error) throw teachersCountRes.error
      if (parentsCountRes.error) throw parentsCountRes.error
      if (recentSchoolsRes.error) throw recentSchoolsRes.error
      if (allProfilesRes.error) throw allProfilesRes.error
      if (recentProfilesRes.error) throw recentProfilesRes.error
      if (adminProfilesRes.error) throw adminProfilesRes.error

      const allSchools = allSchoolsRes.data || []
      const blockedCount = allSchools.filter(s => !!s.blocked).length
      const activeCount = allSchools.length - blockedCount

      setStats({
        schools: schoolsCountRes.count || 0,
        students: studentsCountRes.count || 0,
        teachers: teachersCountRes.count || 0,
        parents: parentsCountRes.count || 0,
        totalUsers: usersCountRes.count || 0,
        activeSchools: activeCount,
        blockedSchools: blockedCount,
        totalAdmins: adminsCountRes.count || 0,
      })

      // Build counts per school
      const allProfiles = allProfilesRes.data || []
      const countsBySchool = {}
      allProfiles.forEach(p => {
        if (!p.school_id) return
        if (!countsBySchool[p.school_id]) countsBySchool[p.school_id] = { student: 0, teacher: 0, parent: 0 }
        if (p.role in countsBySchool[p.school_id]) countsBySchool[p.school_id][p.role]++
      })

      // Admin lookup by school_id
      const adminBySchool = {}
      ;(adminProfilesRes.data || []).forEach(a => {
        if (a.school_id) adminBySchool[a.school_id] = a.full_name
      })

      const schools = (recentSchoolsRes.data || []).map(s => ({
        ...s,
        adminName: adminBySchool[s.id] || '—',
        studentCount: countsBySchool[s.id]?.student || 0,
      }))
      setRecentSchools(schools)

      // Top 5 schools by student count
      const schoolMap = {}
      ;(recentSchoolsRes.data || []).forEach(s => { schoolMap[s.id] = s.name })
      // Build all schools student count
      const allSchoolStudents = Object.entries(countsBySchool)
        .map(([schoolId, counts]) => ({
          schoolId,
          schoolName: schoolMap[schoolId] || schoolId,
          studentCount: counts.student || 0,
        }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5)
      setTopSchoolsByStudents(allSchoolStudents)

      // Recent profiles with school name lookup
      const schoolIds = [...new Set((recentProfilesRes.data || []).map(p => p.school_id).filter(Boolean))]
      let schoolNamesMap = { ...schoolMap }
      if (schoolIds.some(id => !schoolNamesMap[id])) {
        const { data: extraSchools } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds.filter(id => !schoolNamesMap[id]))
        ;(extraSchools || []).forEach(s => { schoolNamesMap[s.id] = s.name })
      }

      const profiles = (recentProfilesRes.data || []).map(p => ({
        ...p,
        schoolName: schoolNamesMap[p.school_id] || '—',
      }))
      setRecentProfiles(profiles)
    } catch (err) {
      console.error('SuperAdmin Dashboard fetchData error:', err)
      setError('Məlumatlar yüklənərkən xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <EmptyState
          icon={AlertTriangle}
          title={error}
          actionLabel={
            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Yenidən cəhd et</span>
          }
          onAction={fetchData}
        />
      </div>
    )
  }

  const maxStudents = topSchoolsByStudents[0]?.studentCount || 1

  return (
    <div className="space-y-8">
      {/* Header — calm authoritative chrome (admin LOW dial: one brand accent) */}
      <div className="liquid-card p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-[12px] tracking-[0.08em] uppercase font-semibold text-brand-500">Super Admin</span>
            </div>
            <h1 className="font-display font-extrabold text-[28px] text-ink-900 leading-tight tracking-[-0.01em]">
              {(L === 'en' ? 'Platform Management'
                : L === 'ru' ? 'Управление платформой'
                : L === 'tr' ? 'Platform Yönetimi'
                : 'Sistem İdarəetməsi')}
            </h1>
            <p className="text-sm text-ink-600 mt-1.5">
              {(L === 'en' ? 'Overview of all schools and users on the platform'
                : L === 'ru' ? 'Обзор всех школ и пользователей платформы'
                : L === 'tr' ? 'Platformdaki tüm okul ve kullanıcılara genel bakış'
                : 'Bütün məktəblər və istifadəçilər üzrə ümumi baxış')}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => navigate('/superadmin/mektebler')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {(L === 'en' ? 'Create school'
                : L === 'ru' ? 'Создать школу'
                : L === 'tr' ? 'Okul oluştur'
                : 'Məktəb yarat')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/superadmin/adminler')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {(L === 'en' ? 'Manage admins'
                : L === 'ru' ? 'Управление админами'
                : L === 'tr' ? 'Yöneticiler'
                : 'Adminləri idarə et')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/superadmin/mektebler')}
              className="flex items-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              {(L === 'en' ? 'All schools'
                : L === 'ru' ? 'Все школы'
                : L === 'tr' ? 'Tüm okullar'
                : 'Bütün məktəblər')}
            </Button>
          </div>
        </div>
      </div>

      {/* Primary stat cards — KPIs with calm count-up on the big numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={(L === 'en' ? 'Total schools' : L === 'ru' ? 'Всего школ' : L === 'tr' ? 'Toplam okul' : 'Ümumi məktəblər')}   value={<CountUp to={stats.schools} />}  icon={School}        tone="periwinkle" />
        <StatCard label={(L === 'en' ? 'Total students' : L === 'ru' ? 'Всего учеников' : L === 'tr' ? 'Toplam öğrenci' : 'Ümumi şagirdlər')}   value={<CountUp to={stats.students} separator=" " />} icon={Users}         tone="periwinkle" />
        <StatCard label={(L === 'en' ? 'Total teachers' : L === 'ru' ? 'Всего учителей' : L === 'tr' ? 'Toplam öğretmen' : 'Ümumi müəllimlər')} value={<CountUp to={stats.teachers} separator=" " />} icon={GraduationCap} tone="periwinkle" />
        <StatCard label={(L === 'en' ? 'Total parents' : L === 'ru' ? 'Всего родителей' : L === 'tr' ? 'Toplam veli' : 'Ümumi valideynlər')}   value={<CountUp to={stats.parents} separator=" " />}  icon={Heart}         tone="periwinkle" />
      </div>

      {/* Platform metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={(L === 'en' ? 'Total users' : L === 'ru' ? 'Всего пользователей' : L === 'tr' ? 'Toplam kullanıcı' : 'Ümumi istifadəçilər')}
          value={<CountUp to={stats.totalUsers} separator=" " />}
          icon={Users}
          tone="periwinkle"
        />
        <StatCard
          label={(L === 'en' ? 'Active schools' : L === 'ru' ? 'Активные школы' : L === 'tr' ? 'Aktif okul' : 'Aktiv məktəblər')}
          value={<CountUp to={stats.activeSchools} />}
          icon={ShieldCheck}
          tone="mint"
        />
        <StatCard
          label={(L === 'en' ? 'Blocked schools' : L === 'ru' ? 'Заблок. школы' : L === 'tr' ? 'Engellenmiş okul' : 'Bloklanmış məktəblər')}
          value={<CountUp to={stats.blockedSchools} />}
          icon={ShieldOff}
          tone="peach"
        />
        <StatCard
          label={(L === 'en' ? 'Total admins' : L === 'ru' ? 'Всего админов' : L === 'tr' ? 'Toplam yönetici' : 'Ümumi adminlər')}
          value={<CountUp to={stats.totalAdmins} />}
          icon={Shield}
          tone="periwinkle"
        />
      </div>

      {/* Recent schools — calm data table */}
      <Card hover={false}>
        <SectionHead
          icon={School}
          tone="periwinkle"
          title="Son qeydiyyat olunan məktəblər"
          subtitle="Son 10 əlavə edilmiş məktəb"
        />
        {recentSchools.length === 0 ? (
          <EmptyState
            icon={School}
            title="Heç bir məktəb tapılmadı"
            className="border-0 shadow-none"
          />
        ) : (
          <div className="rounded-tile border border-hairline overflow-hidden overflow-x-auto">
            <table className="pastel-table">
              <thead>
                <tr>
                  <th>Məktəb adı</th>
                  <th>Rayon</th>
                  <th>Növ</th>
                  <th>Admin</th>
                  <th className="num">Şagirdlər</th>
                  <th>Qeydiyyat tarixi</th>
                </tr>
              </thead>
              <tbody>
                {recentSchools.map((school, i) => (
                  <tr key={school.id || i}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-ink-900">{school.name}</span>
                      </div>
                    </td>
                    <td className="text-ink-600">{school.district || '—'}</td>
                    <td>
                      <EditionBadge edition={school.edition} />
                    </td>
                    <td className="text-ink-600">{school.adminName}</td>
                    <td className="num font-semibold text-ink-900">{school.studentCount}</td>
                    <td className="text-ink-400">{formatDate(school.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity — new signups */}
        <Card hover={false}>
          <SectionHead
            icon={Activity}
            tone="periwinkle"
            title="Fəaliyyət"
            subtitle="Son 20 qeydiyyat"
          />
          {recentProfiles.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Heç bir qeydiyyat tapılmadı"
              className="border-0 shadow-none"
            />
          ) : (
            <div className="-mx-6">
              {recentProfiles.map((p, i) => (
                <div
                  key={p.id || i}
                  className="flex items-center justify-between py-3 px-6 border-b border-hairline last:border-0 hover:bg-brand-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={p.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{p.full_name}</p>
                      <p className="text-xs text-ink-400 truncate mt-0.5">{p.schoolName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <Badge variant={ROLE_VARIANTS[p.role] || 'default'}>
                      {ROLE_LABELS[p.role] || p.role}
                    </Badge>
                    <span className="text-xs text-ink-400 whitespace-nowrap tabular-nums">{formatDateTime(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top schools by student count — calm horizontal bar list */}
        <Card hover={false}>
          <SectionHead
            icon={BarChart2}
            tone="periwinkle"
            title="Məktəb statistikası"
            subtitle="Şagird sayına görə top 5"
          />
          {topSchoolsByStudents.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="Heç bir məlumat tapılmadı"
              className="border-0 shadow-none"
            />
          ) : (
            <div className="space-y-5">
              {topSchoolsByStudents.map((item, i) => {
                const pct = maxStudents > 0 ? Math.round((item.studentCount / maxStudents) * 100) : 0
                return (
                  <div key={item.schoolId || i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-ink-700 truncate max-w-[70%]">{item.schoolName}</span>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-sm font-semibold text-ink-900 tabular-nums">{item.studentCount}</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--hairline)' }}>
                      <div
                        style={{ width: pct + '%', background: 'var(--brand-500)' }}
                        className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Account security */}
      <div className="mt-6">
        <MFASection />
      </div>
    </div>
  )
}
