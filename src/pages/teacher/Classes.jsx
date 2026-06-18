import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ClipboardList, Clock, Users,
  AlertTriangle, ArrowLeft, ChevronRight,
  GraduationCap, BarChart2, CalendarCheck,
  School, MessagesSquare,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { fmtNumeric } from '../../lib/dateUtils'
import Avatar from '../../components/ui/Avatar'
import { GradeBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

// ── Quick-action button ────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, sublabel, chipClass, onClick }) {
  return (
    <button
      onClick={onClick}
      className="liquid-card text-left p-4 group cursor-pointer flex flex-col items-start gap-3 hover:-translate-y-0.5 transition-transform duration-150"
    >
      <span className={`icon-chip ${chipClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {sublabel && <p className="text-xs mt-0.5 text-ink-400">{sublabel}</p>}
      </div>
    </button>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

function ClassStatCard({ icon: Icon, chipClass, label, value, sub, alert }) {
  return (
    <div className="liquid-card p-4 flex items-center gap-4">
      <span className={`icon-chip ${chipClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
        <p
          className="font-display text-2xl font-bold leading-tight tabular-nums"
          style={{ color: alert ? 'var(--danger)' : 'var(--ink-900)' }}
        >
          {value}
        </p>
        {sub && <p className="text-xs mt-0.5 text-ink-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function TeacherClasses() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [selected, setSelected] = useState(null)
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
      supabase.from('class_members').select('student:profiles(id, full_name, avatar_color)').eq('class_id', cls.id),
      supabase.from('attendance').select('status').eq('class_id', cls.id).gte('date', weekStartStr).lte('date', todayStr),
      supabase.from('grades').select('score, max_score, student_id').eq('class_id', cls.id),
      supabase.from('assignments').select('id, title, due_date').eq('class_id', cls.id).eq('teacher_id', profile.id).gte('due_date', new Date().toISOString()).order('due_date').limit(3),
    ])

    const memberList = (membersRes.data || []).map(m => m.student).filter(Boolean)
    const attData = attRes.data || []
    const presentCount = attData.filter(a => a.status === 'present').length
    const attPct = attData.length ? Math.round((presentCount / attData.length) * 100) : null

    const gradesByStudent = {}
    ;(gradesRes.data || []).forEach(g => {
      if (!gradesByStudent[g.student_id]) gradesByStudent[g.student_id] = []
      const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
      gradesByStudent[g.student_id].push(normalized)
    })

    const studentsWithStats = memberList.map(s => {
      const scores = gradesByStudent[s.id] || []
      const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null
      return { ...s, avg }
    })

    const allAvgs = studentsWithStats.filter(s => s.avg !== null).map(s => s.avg)
    const classAvg = allAvgs.length ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10 : null
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

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="pastel-skeleton h-40" />
          <div className="pastel-skeleton h-40" />
          <div className="pastel-skeleton h-40" />
        </div>
      </div>
    )
  }

  if (selected) {
    const cls = selected.class
    const stats = classStats || {}

    const actions = [
      { icon: BookOpen,       label: 'Jurnal',      sublabel: 'Qiymətləri daxil et', chip: 'icon-chip-periwinkle', path: '/muellim/jurnal' },
      { icon: CalendarCheck,  label: 'Davamiyyət',  sublabel: 'Günlük qeydiyyat',    chip: 'icon-chip-periwinkle', path: '/muellim/davamiyyet' },
      { icon: ClipboardList,  label: 'Tapşırıqlar', sublabel: 'Tapşırıq ver',         chip: 'icon-chip-periwinkle', path: '/muellim/tapshiriqlar' },
      { icon: Clock,          label: 'Cədvəl',      sublabel: 'Dərs cədvəli',         chip: 'icon-chip-periwinkle', path: '/muellim/cedvel' },
      { icon: GraduationCap,  label: 'İmtahanlar',  sublabel: 'Test',                 chip: 'icon-chip-periwinkle', path: '/muellim/imtahanlar' },
      { icon: AlertTriangle,  label: 'İntizam',     sublabel: 'Davranış qeydləri',    chip: 'icon-chip-periwinkle', path: '/muellim/intizam' },
      { icon: BarChart2,      label: 'Analitika',   sublabel: 'Sinif statistikası',   chip: 'icon-chip-periwinkle', path: '/muellim/analitika' },
      { icon: MessagesSquare, label: 'Yazışmalar',  sublabel: 'Valideynlərə mesaj',   chip: 'icon-chip-periwinkle', path: '/muellim/yazismalar' },
    ]

    return (
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => { setSelected(null); setClassStats(null) }}
            className="mt-1 p-2 rounded-tile text-ink-400 hover:text-brand-500 hover:bg-brand-50 border border-hairline transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-ink-900">
              {cls.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {cls.grade_level && (
                <span className="text-sm text-ink-400">Səviyyə {cls.grade_level}</span>
              )}
              {cls.subjects.length > 0 && (
                <>
                  <span className="text-hairline-strong">·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects.map(s => (
                      <span key={s.id} className="pill-brand">{s.name}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {detailLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24 rounded-card" />)}
            </div>
            <div className="pastel-skeleton h-64 rounded-card" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ClassStatCard icon={Users} chipClass="icon-chip-periwinkle" label="Şagird sayı" value={stats.studentCount ?? '—'} />
              <ClassStatCard
                icon={CalendarCheck}
                chipClass={stats.attPct >= 85 ? 'icon-chip-mint' : 'icon-chip-peach'}
                label="Bu həftə davamiyyət"
                value={stats.attPct != null ? `${stats.attPct}%` : '—'}
                sub={stats.attPct != null ? (stats.attPct >= 85 ? 'Yaxşı' : 'Aşağı') : null}
              />
              <ClassStatCard icon={GraduationCap} chipClass="icon-chip-periwinkle" label="Sinif ortalama" value={stats.classAvg != null ? stats.classAvg : '—'} />
              <ClassStatCard icon={AlertTriangle} chipClass="icon-chip-peach" label="Risk altında" value={stats.atRisk ?? 0} sub="Orta < 5" alert={stats.atRisk > 0} />
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-[11px] tracking-widest uppercase font-semibold mb-3 text-ink-400">Tez Keçid</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {actions.map(a => (
                  <ActionBtn key={a.path} icon={a.icon} label={a.label} sublabel={a.sublabel} chipClass={a.chip} onClick={() => navigate(a.path)} />
                ))}
              </div>
            </div>

            {/* Two-column bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Students roster */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
                  <h2 className="text-sm font-bold flex items-center gap-2 text-ink-900">
                    <Users className="w-4 h-4 text-brand-500" />
                    Şagirdlər
                  </h2>
                  <span className="pill-brand">{students.length} nəfər</span>
                </div>
                {students.length === 0 ? (
                  <div className="py-10 px-6">
                    <EmptyState
                      tier={1}
                      icon={Users}
                      title="Şagird yoxdur"
                      description="Bu sinfə hələ şagird əlavə edilməyib"
                    />
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[380px] scrollbar-thin">
                    {students
                      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                      .map((s, i) => {
                        const isLow = s.avg !== null && s.avg < 5
                        return (
                          <div
                            key={s.id}
                            className="flex items-center gap-3 px-5 py-3 transition-colors duration-100 hover:bg-brand-50"
                            style={{
                              background: isLow ? 'rgba(239,68,68,0.05)' : 'transparent',
                              borderTop: i === 0 ? 'none' : '1px solid var(--hairline)',
                            }}
                          >
                            <span className="text-xs w-5 flex-shrink-0 font-medium text-ink-400 tabular-nums">{i + 1}</span>
                            <Avatar name={s.full_name} size="sm" color={s.avatar_color} />
                            <p className="flex-1 text-sm font-medium truncate text-ink-900">{s.full_name}</p>
                            {s.avg !== null ? <GradeBadge score={s.avg} /> : <span className="text-xs text-ink-400">—</span>}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Upcoming assignments */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
                  <h2 className="text-sm font-bold flex items-center gap-2 text-ink-900">
                    <ClipboardList className="w-4 h-4 text-brand-500" />
                    Yaxın Tapşırıqlar
                  </h2>
                  <button
                    onClick={() => navigate('/muellim/tapshiriqlar')}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    Hamısı <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(stats.upcomingAssignments || []).length === 0 ? (
                  <div className="py-10 px-6">
                    <EmptyState
                      tier={1}
                      icon={ClipboardList}
                      title="Yaxın tapşırıq yoxdur"
                      description="Tapşırıq əlavə etmək üçün Tapşırıqlar bölməsinə keçin"
                      actionLabel="Tapşırıq əlavə et"
                      onAction={() => navigate('/muellim/tapshiriqlar')}
                    />
                  </div>
                ) : (
                  <div>
                    {stats.upcomingAssignments.map((a, i) => {
                      const due = new Date(a.due_date)
                      const daysLeft = Math.ceil((due - new Date()) / 86400000)
                      const urgent = daysLeft <= 2
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 px-5 py-4 transition-colors duration-100 hover:bg-canvas"
                          style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hairline)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-ink-900">{a.title}</p>
                            <p
                              className="text-xs mt-0.5 font-medium"
                              style={{ color: urgent ? 'var(--danger)' : 'var(--ink-400)' }}
                            >
                              {fmtNumeric(due)}
                            </p>
                          </div>
                          <span className={urgent ? 'pill-danger' : 'pill-neutral'}>
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

  // Class list
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-ink-900">
          Siniflərim
        </h1>
        <p className="text-sm mt-1 text-ink-600">
          Sinfə klikləyin — jurnal, davamiyyət, tapşırıqlar və daha çoxuna keçin
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          tier={1}
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
              className="liquid-card text-left overflow-hidden p-0 group cursor-pointer hover:-translate-y-0.5 transition-transform duration-150"
            >
              {/* Accent top bar */}
              <div
                className="h-1.5"
                style={{ background: 'var(--brand-500)' }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink-900">{cls.name}</h3>
                    {cls.grade_level && (
                      <p className="text-xs mt-0.5 text-ink-400">Səviyyə {cls.grade_level}</p>
                    )}
                  </div>
                  <span className="icon-chip icon-chip-periwinkle flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                {cls.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cls.subjects.map(s => (
                      <span key={s.id} className="pill-brand">{s.name}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-hairline">
                  {[
                    { Icon: BookOpen,      label: 'Jurnal' },
                    { Icon: CalendarCheck, label: 'Davamiyyət' },
                    { Icon: ClipboardList, label: 'Tapşırıqlar' },
                    { Icon: Clock,         label: 'Cədvəl' },
                  ].map(({ Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className="w-7 h-7 rounded-tile flex items-center justify-center bg-brand-50 text-brand-500 transition-colors duration-100 group-hover:bg-brand-100"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-brand-500">Daxil ol <ChevronRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
