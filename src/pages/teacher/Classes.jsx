import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, ClipboardList, Clock, Users,
  AlertTriangle, ArrowLeft, ChevronRight, TrendingUp,
  TrendingDown, GraduationCap, BarChart2, PenLine,
  CalendarCheck, School, MessagesSquare,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { GradeBadge } from '../../components/ui/Badge'

// ── Quick-action button ────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, sublabel, color, onClick }) {
  const colorMap = {
    purple:  { bg: 'bg-purple-light',   icon: 'text-purple',       hover: 'hover:bg-purple hover:text-white', text: 'text-purple'  },
    teal:    { bg: 'bg-teal-light',     icon: 'text-teal',         hover: 'hover:bg-teal hover:text-white',   text: 'text-teal'    },
    amber:   { bg: 'bg-amber-50',       icon: 'text-amber-600',    hover: 'hover:bg-amber-500 hover:text-white', text: 'text-amber-700' },
    blue:    { bg: 'bg-blue-50',        icon: 'text-blue-600',     hover: 'hover:bg-blue-600 hover:text-white',  text: 'text-blue-700'  },
    red:     { bg: 'bg-red-50',         icon: 'text-red-500',      hover: 'hover:bg-red-500 hover:text-white',   text: 'text-red-600'   },
    indigo:  { bg: 'bg-indigo-50',      icon: 'text-indigo-600',   hover: 'hover:bg-indigo-600 hover:text-white', text: 'text-indigo-700' },
  }
  const c = colorMap[color] || colorMap.purple

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 p-5 rounded-2xl border border-border-soft bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${c.hover}`}
    >
      <span className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors`}>
        <Icon className={`w-5 h-5 ${c.icon} group-hover:text-white transition-colors`} />
      </span>
      <div className="text-left">
        <p className={`text-sm font-semibold ${c.text} group-hover:text-white transition-colors`}>{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-400 mt-0.5 group-hover:text-white/70 transition-colors">{sublabel}</p>
        )}
      </div>
    </button>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-5 py-4 flex items-center gap-4">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TeacherClasses() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [selected, setSelected] = useState(null)  // { class, subject }
  const [classStats, setClassStats] = useState(null)
  const [students, setStudents] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (profile?.id) loadClasses()
  }, [profile?.id])

  async function loadClasses() {
    const { data } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name, grade_level), subject:subjects(id, name)')
      .eq('teacher_id', profile.id)

    // Group by class: one entry per unique class, with subjects array
    const classMap = {}
    ;(data || []).forEach(tc => {
      if (!tc.class) return
      const cid = tc.class.id
      if (!classMap[cid]) {
        classMap[cid] = { ...tc.class, subjects: [] }
      }
      if (tc.subject) classMap[cid].subjects.push(tc.subject)
    })

    setClasses(Object.values(classMap))
    setLoading(false)
  }

  async function openClass(cls) {
    setDetailLoading(true)
    setSelected({ class: cls, subject: cls.subjects[0] || null })

    const todayStr = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const [membersRes, attRes, gradesRes, assignRes] = await Promise.all([
      supabase.from('class_members')
        .select('student:profiles(id, full_name, avatar_color)')
        .eq('class_id', cls.id),

      supabase.from('attendance')
        .select('status')
        .eq('class_id', cls.id)
        .gte('date', weekStartStr)
        .lte('date', todayStr),

      supabase.from('grades')
        .select('score, max_score, student_id')
        .eq('class_id', cls.id),

      supabase.from('assignments')
        .select('id, title, due_date')
        .eq('class_id', cls.id)
        .eq('teacher_id', profile.id)
        .gte('due_date', new Date().toISOString())
        .order('due_date')
        .limit(3),
    ])

    const memberList = (membersRes.data || []).map(m => m.student).filter(Boolean)
    const attData = attRes.data || []
    const presentCount = attData.filter(a => a.status === 'present').length
    const attPct = attData.length ? Math.round((presentCount / attData.length) * 100) : null

    // Per-student average
    const gradesByStudent = {}
    ;(gradesRes.data || []).forEach(g => {
      if (!gradesByStudent[g.student_id]) gradesByStudent[g.student_id] = []
      const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
      gradesByStudent[g.student_id].push(normalized)
    })

    const studentsWithStats = memberList.map(s => {
      const scores = gradesByStudent[s.id] || []
      const avg = scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null
      return { ...s, avg }
    })

    const allAvgs = studentsWithStats.filter(s => s.avg !== null).map(s => s.avg)
    const classAvg = allAvgs.length
      ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10
      : null
    const atRisk = studentsWithStats.filter(s => s.avg !== null && s.avg < 5).length

    setStudents(studentsWithStats)
    setClassStats({
      studentCount: memberList.length,
      attPct,
      classAvg,
      atRisk,
      upcomingAssignments: assignRes.data || [],
    })
    setDetailLoading(false)
  }

  if (loading) return <PageSpinner />

  // ── Class detail view ────────────────────────────────────────────────────
  if (selected) {
    const cls = selected.class
    const stats = classStats || {}

    const actions = [
      {
        icon: BookOpen,
        label: 'Jurnal',
        sublabel: 'Qiymətləri daxil et',
        color: 'purple',
        path: '/muellim/jurnal',
      },
      {
        icon: CalendarCheck,
        label: 'Davamiyyət',
        sublabel: 'Günlük qeydiyyat',
        color: 'teal',
        path: '/muellim/davamiyyet',
      },
      {
        icon: ClipboardList,
        label: 'Tapşırıqlar',
        sublabel: 'Tapşırıq ver',
        color: 'blue',
        path: '/muellim/tapshiriqlar',
      },
      {
        icon: Clock,
        label: 'Cədvəl',
        sublabel: 'Dərs cədvəli',
        color: 'amber',
        path: '/muellim/cedvel',
      },
      {
        icon: GraduationCap,
        label: 'İmtahanlar',
        sublabel: 'Test & qiymətləndirmə',
        color: 'indigo',
        path: '/muellim/imtahanlar',
      },
      {
        icon: AlertTriangle,
        label: 'İntizam',
        sublabel: 'Davranış qeydləri',
        color: 'red',
        path: '/muellim/intizam',
      },
      {
        icon: BarChart2,
        label: 'Analitika',
        sublabel: 'Sinif statistikası',
        color: 'purple',
        path: '/muellim/analitika',
      },
      {
        icon: MessagesSquare,
        label: 'Yazışmalar',
        sublabel: 'Valideynlərə mesaj',
        color: 'teal',
        path: '/muellim/yazismalar',
      },
    ]

    return (
      <div className="space-y-8">

        {/* ── Back + Header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => { setSelected(null); setClassStats(null) }}
            className="mt-1 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-4xl text-gray-900 leading-tight">{cls.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {cls.grade_level && (
                <span className="text-sm text-gray-400">Səviyyə {cls.grade_level}</span>
              )}
              {cls.subjects.length > 0 && (
                <>
                  <span className="text-gray-200">·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects.map(s => (
                      <span key={s.id} className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-purple-light text-purple">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {detailLoading ? (
          <PageSpinner />
        ) : (
          <>
            {/* ── Stats row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                iconBg="bg-purple-light"
                iconColor="text-purple"
                label="Şagird sayı"
                value={stats.studentCount ?? '—'}
              />
              <StatCard
                icon={CalendarCheck}
                iconBg="bg-teal-light"
                iconColor="text-teal"
                label="Bu həftə davamiyyət"
                value={stats.attPct != null ? `${stats.attPct}%` : '—'}
                sub={stats.attPct != null ? (stats.attPct >= 85 ? '✓ Yaxşı' : '⚠ Aşağı') : null}
              />
              <StatCard
                icon={GraduationCap}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                label="Sinif ortalama"
                value={stats.classAvg != null ? stats.classAvg : '—'}
              />
              <StatCard
                icon={AlertTriangle}
                iconBg="bg-red-50"
                iconColor="text-red-500"
                label="Risk altında"
                value={stats.atRisk ?? 0}
                sub="Orta < 5"
              />
            </div>

            {/* ── Quick actions ────────────────────────────────────────────── */}
            <div>
              <p className="text-xs tracking-widest text-gray-400 uppercase font-semibold mb-4">
                Tez Keçid
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {actions.map(a => (
                  <ActionBtn
                    key={a.path}
                    icon={a.icon}
                    label={a.label}
                    sublabel={a.sublabel}
                    color={a.color}
                    onClick={() => navigate(a.path)}
                  />
                ))}
              </div>
            </div>

            {/* ── Two-column bottom ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Students roster */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple" />
                    Şagirdlər
                  </h2>
                  <span className="text-xs text-gray-400 bg-surface px-2 py-1 rounded-full">
                    {students.length} nəfər
                  </span>
                </div>
                {students.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10 px-6">Şagird yoxdur</p>
                ) : (
                  <div className="overflow-y-auto max-h-[380px] divide-y divide-border-soft">
                    {students
                      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                      .map((s, i) => {
                        const isLow = s.avg !== null && s.avg < 5
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center gap-3 px-6 py-3 hover:bg-surface/50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}
                          >
                            <span className="text-xs text-gray-300 w-5 flex-shrink-0 font-medium">
                              {i + 1}
                            </span>
                            <Avatar name={s.full_name} size="sm" color={s.avatar_color} />
                            <p className="flex-1 text-sm font-medium text-gray-900 truncate">
                              {s.full_name}
                            </p>
                            {s.avg !== null ? (
                              <GradeBadge score={s.avg} />
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Upcoming assignments */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-teal" />
                    Yaxın Tapşırıqlar
                  </h2>
                  <button
                    onClick={() => navigate('/muellim/tapshiriqlar')}
                    className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                  >
                    Hamısı <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(stats.upcomingAssignments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-gray-200" />
                    </div>
                    <p className="text-sm text-gray-400">Yaxın tapşırıq yoxdur</p>
                    <button
                      onClick={() => navigate('/muellim/tapshiriqlar')}
                      className="text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                    >
                      Tapşırıq əlavə et →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {stats.upcomingAssignments.map(a => {
                      const due = new Date(a.due_date)
                      const daysLeft = Math.ceil((due - new Date()) / 86400000)
                      const urgent = daysLeft <= 2
                      return (
                        <div key={a.id} className="flex items-center gap-3 px-6 py-4 hover:bg-surface/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                            <p className={`text-xs mt-0.5 font-medium ${urgent ? 'text-red-500' : 'text-gray-400'}`}>
                              {urgent ? '⚡ ' : ''}
                              {due.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${urgent ? 'bg-red-50 text-red-600' : 'bg-surface text-gray-500'}`}>
                            {daysLeft}g
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    )
  }

  // ── Class list view ──────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      <div>
        <h1 className="font-serif text-4xl text-gray-900 leading-tight">Siniflərim</h1>
        <p className="text-gray-400 mt-1 text-sm">Sinfə klikləyin — jurnal, davamiyyət, tapşırıqlar və daha çoxuna keçin</p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={School}
          title="Sinif tapılmadı"
          description="Sizə hələ heç bir sinif təyin edilməyib. Admin ilə əlaqə saxlayın."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => openClass(cls)}
              className="group text-left bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
            >
              {/* Color accent top bar */}
              <div className="h-1.5 bg-gradient-to-r from-purple to-teal" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl text-gray-900 group-hover:text-purple transition-colors">
                      {cls.name}
                    </h3>
                    {cls.grade_level && (
                      <p className="text-xs text-gray-400 mt-0.5">Səviyyə {cls.grade_level}</p>
                    )}
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0 group-hover:bg-purple transition-colors">
                    <ChevronRight className="w-4 h-4 text-purple group-hover:text-white transition-colors" />
                  </span>
                </div>

                {/* Subjects */}
                {cls.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cls.subjects.map(s => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-purple-light text-purple"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick action icons */}
                <div className="flex items-center gap-2 pt-3 border-t border-border-soft">
                  {[
                    { Icon: BookOpen,      label: 'Jurnal' },
                    { Icon: CalendarCheck, label: 'Davamiyyət' },
                    { Icon: ClipboardList, label: 'Tapşırıqlar' },
                    { Icon: Clock,         label: 'Cədvəl' },
                  ].map(({ Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-gray-400 group-hover:bg-purple-light group-hover:text-purple transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    Daxil ol →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
