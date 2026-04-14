import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  School, Users, GraduationCap, Heart, Clock, Activity,
  BarChart2, TrendingUp, RefreshCw
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

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

export default function SuperAdminDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [stats, setStats] = useState({ schools: 0, students: 0, teachers: 0, parents: 0 })
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
      ] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
        supabase.from('schools').select('id, name, district, edition, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id, school_id, role'),
        supabase.from('profiles').select('id, full_name, role, created_at, school_id').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('full_name, school_id').eq('role', 'admin'),
      ])

      setStats({
        schools: schoolsCountRes.count || 0,
        students: studentsCountRes.count || 0,
        teachers: teachersCountRes.count || 0,
        parents: parentsCountRes.count || 0,
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
      <div className="text-center py-16">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchData}>
          <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Yenidən cəhd et</span>
        </Button>
      </div>
    )
  }

  const maxStudents = topSchoolsByStudents[0]?.studentCount || 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/10 via-purple/5 to-transparent pointer-events-none rounded-xl" />
        <div className="relative px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-purple" />
            <span className="text-xs tracking-widest text-purple uppercase font-medium">Super Admin</span>
          </div>
          <h1 className="font-serif text-4xl text-gray-900">Sistem İdarəetməsi</h1>
          <p className="text-sm text-gray-500 mt-1">Bütün məktəblər və istifadəçilər üzrə ümumi baxış</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Ümumi məktəblər" value={stats.schools} icon={School} />
        <StatCard label="Ümumi şagirdlər" value={stats.students} icon={Users} />
        <StatCard label="Ümumi müəllimlər" value={stats.teachers} icon={GraduationCap} />
        <StatCard label="Ümumi valideynlər" value={stats.parents} icon={Heart} />
      </div>

      {/* Recent schools */}
      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <School className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">Son qeydiyyat olunan məktəblər</h2>
        </div>
        {recentSchools.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Heç bir məktəb tapılmadı</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Məktəb adı</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Rayon</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Növ</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Admin</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Şagirdlər</th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left">Qeydiyyat tarixi</th>
                </tr>
              </thead>
              <tbody>
                {recentSchools.map((school, i) => (
                  <tr
                    key={school.id || i}
                    className="border-b border-border-soft hover:bg-surface transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{school.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{school.district || '—'}</td>
                    <td className="px-4 py-4">
                      <EditionBadge edition={school.edition} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{school.adminName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">{school.studentCount}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(school.created_at)}</td>
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
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-purple-mid" />
            <h2 className="font-serif text-xl text-gray-900">Fəaliyyət</h2>
            <span className="text-xs text-gray-400 ml-auto">Son 20 qeydiyyat</span>
          </div>
          {recentProfiles.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Heç bir qeydiyyat tapılmadı</p>
          ) : (
            <div className="space-y-0">
              {recentProfiles.map((p, i) => (
                <div
                  key={p.id || i}
                  className="flex items-center justify-between py-3 border-b border-border-soft last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={p.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.schoolName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <Badge variant={ROLE_VARIANTS[p.role] || 'default'}>
                      {ROLE_LABELS[p.role] || p.role}
                    </Badge>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top schools by student count — div-based bar chart */}
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-5 h-5 text-purple-mid" />
            <h2 className="font-serif text-xl text-gray-900">Məktəb statistikası</h2>
            <span className="text-xs text-gray-400 ml-auto">Şagird sayına görə top 5</span>
          </div>
          {topSchoolsByStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Heç bir məlumat tapılmadı</p>
          ) : (
            <div className="space-y-5">
              {topSchoolsByStudents.map((item, i) => {
                const pct = maxStudents > 0 ? Math.round((item.studentCount / maxStudents) * 100) : 0
                return (
                  <div key={item.schoolId || i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700 truncate max-w-[70%]">{item.schoolName}</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-purple-mid" />
                        <span className="text-sm font-semibold text-gray-900">{item.studentCount}</span>
                      </div>
                    </div>
                    <div className="w-full bg-purple-light rounded-full h-4 overflow-hidden">
                      <div
                        style={{ width: pct + '%' }}
                        className="bg-purple h-4 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
