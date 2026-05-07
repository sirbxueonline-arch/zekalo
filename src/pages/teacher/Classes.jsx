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

// ── Quick-action button ────────────────────────────────────────────────────

const ACTION_CHIPS = ['icon-chip-periwinkle', 'icon-chip-mint', 'icon-chip-blue', 'icon-chip-peach', 'icon-chip-periwinkle', 'icon-chip-peach', 'icon-chip-mint', 'icon-chip-blue']

function ActionBtn({ icon: Icon, label, sublabel, chipClass, onClick }) {
  return (
    <button onClick={onClick} className="liquid-card text-left p-5 group cursor-pointer flex flex-col items-start gap-3">
      <span className={`icon-chip ${chipClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{sublabel}</p>}
      </div>
    </button>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, chipClass, label, value, sub, alert }) {
  return (
    <div className="liquid-card p-4 flex items-center gap-4">
      <span className={`icon-chip ${chipClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{label}</p>
        <p className="text-2xl font-bold leading-tight" style={{ color: alert ? '#b83b54' : '#1a1a2e' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{sub}</p>}
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
      { icon: BookOpen,      label: 'Jurnal',      sublabel: 'Qiymətləri daxil et', chip: 'icon-chip-periwinkle', path: '/muellim/jurnal' },
      { icon: CalendarCheck, label: 'Davamiyyət',  sublabel: 'Günlük qeydiyyat',    chip: 'icon-chip-mint',        path: '/muellim/davamiyyet' },
      { icon: ClipboardList, label: 'Tapşırıqlar', sublabel: 'Tapşırıq ver',         chip: 'icon-chip-blue',        path: '/muellim/tapshiriqlar' },
      { icon: Clock,         label: 'Cədvəl',      sublabel: 'Dərs cədvəli',         chip: 'icon-chip-peach',       path: '/muellim/cedvel' },
      { icon: GraduationCap, label: 'İmtahanlar',  sublabel: 'Test',                 chip: 'icon-chip-periwinkle', path: '/muellim/imtahanlar' },
      { icon: AlertTriangle, label: 'İntizam',     sublabel: 'Davranış qeydləri',    chip: 'icon-chip-peach',       path: '/muellim/intizam' },
      { icon: BarChart2,     label: 'Analitika',   sublabel: 'Sinif statistikası',   chip: 'icon-chip-mint',        path: '/muellim/analitika' },
      { icon: MessagesSquare,label: 'Yazışmalar',  sublabel: 'Valideynlərə mesaj',   chip: 'icon-chip-blue',        path: '/muellim/yazismalar' },
    ]

    return (
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => { setSelected(null); setClassStats(null) }}
            className="mt-1 p-2 rounded-xl smooth-trans"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7c6ee0'; e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1a1a2e' }}>
              <span className="pastel-text">{cls.name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {cls.grade_level && (
                <span className="text-sm" style={{ color: '#94a3b8' }}>Səviyyə {cls.grade_level}</span>
              )}
              {cls.subjects.length > 0 && (
                <>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects.map(s => (
                      <span key={s.id} className="pastel-badge pastel-badge-periwinkle">{s.name}</span>
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
              {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24" />)}
            </div>
            <div className="pastel-skeleton h-64" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} chipClass="icon-chip-periwinkle" label="Şagird sayı" value={stats.studentCount ?? '—'} />
              <StatCard
                icon={CalendarCheck}
                chipClass={stats.attPct >= 85 ? 'icon-chip-mint' : 'icon-chip-peach'}
                label="Bu həftə davamiyyət"
                value={stats.attPct != null ? `${stats.attPct}%` : '—'}
                sub={stats.attPct != null ? (stats.attPct >= 85 ? '✓ Yaxşı' : '⚠ Aşağı') : null}
              />
              <StatCard icon={GraduationCap} chipClass="icon-chip-blue" label="Sinif ortalama" value={stats.classAvg != null ? stats.classAvg : '—'} />
              <StatCard icon={AlertTriangle} chipClass="icon-chip-peach" label="Risk altında" value={stats.atRisk ?? 0} sub="Orta < 5" alert={stats.atRisk > 0} />
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#64748b' }}>Tez Keçid</p>
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
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <Users className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    Şagirdlər
                  </h2>
                  <span className="pastel-badge pastel-badge-periwinkle">{students.length} nəfər</span>
                </div>
                {students.length === 0 ? (
                  <div className="text-center py-10 px-6">
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Şagird yoxdur</p>
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
                            className="flex items-center gap-3 px-5 py-3 smooth-trans"
                            style={{
                              background: isLow ? 'rgba(229,107,127,0.05)' : 'transparent',
                              borderTop: i === 0 ? 'none' : '1px solid rgba(124,110,224,0.06)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,224,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = isLow ? 'rgba(229,107,127,0.05)' : 'transparent'}
                          >
                            <span className="text-xs w-5 flex-shrink-0 font-medium" style={{ color: '#cbd5e1' }}>{i + 1}</span>
                            <Avatar name={s.full_name} size="sm" color={s.avatar_color} />
                            <p className="flex-1 text-sm font-medium truncate" style={{ color: '#1a1a2e' }}>{s.full_name}</p>
                            {s.avg !== null ? <GradeBadge score={s.avg} /> : <span className="text-xs" style={{ color: '#cbd5e1' }}>—</span>}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Upcoming assignments */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <ClipboardList className="w-4 h-4" style={{ color: '#5db8a3' }} />
                    Yaxın Tapşırıqlar
                  </h2>
                  <button
                    onClick={() => navigate('/muellim/tapshiriqlar')}
                    className="flex items-center gap-1 text-xs font-semibold smooth-trans hover:opacity-70"
                    style={{ color: '#7c6ee0' }}
                  >
                    Hamısı <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(stats.upcomingAssignments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                    <div className="icon-chip icon-chip-blue" style={{ width: 48, height: 48 }}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Yaxın tapşırıq yoxdur</p>
                    <button
                      onClick={() => navigate('/muellim/tapshiriqlar')}
                      className="text-xs font-semibold smooth-trans hover:opacity-70"
                      style={{ color: '#7c6ee0' }}
                    >
                      Tapşırıq əlavə et →
                    </button>
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
                          className="flex items-center gap-3 px-5 py-4 smooth-trans"
                          style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(124,110,224,0.06)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1a1a2e' }}>{a.title}</p>
                            <p className="text-xs mt-0.5 font-medium" style={{ color: urgent ? '#b83b54' : '#94a3b8' }}>
                              {urgent ? '⚡ ' : ''}{fmtNumeric(due)}
                            </p>
                          </div>
                          <span className={urgent ? 'pastel-badge pastel-badge-rose' : 'pastel-badge pastel-badge-slate'}>
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
        <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">Siniflərim</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Sinfə klikləyin — jurnal, davamiyyət, tapşırıqlar və daha çoxuna keçin</p>
      </div>

      {classes.length === 0 ? (
        <div className="liquid-card p-12">
          <div className="text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <School className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Sinif tapılmadı</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Sizə hələ heç bir sinif təyin edilməyib. Admin ilə əlaqə saxlayın.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => openClass(cls)}
              className="liquid-card text-left overflow-hidden p-0 group cursor-pointer"
            >
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #7c6ee0, #5db8a3)' }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>{cls.name}</h3>
                    {cls.grade_level && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Səviyyə {cls.grade_level}</p>}
                  </div>
                  <span className="icon-chip icon-chip-periwinkle">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                {cls.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cls.subjects.map(s => (
                      <span key={s.id} className="pastel-badge pastel-badge-periwinkle">{s.name}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}>
                  {[
                    { Icon: BookOpen,      label: 'Jurnal' },
                    { Icon: CalendarCheck, label: 'Davamiyyət' },
                    { Icon: ClipboardList, label: 'Tapşırıqlar' },
                    { Icon: Clock,         label: 'Cədvəl' },
                  ].map(({ Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className="w-7 h-7 rounded-lg flex items-center justify-center smooth-trans"
                      style={{ background: 'rgba(124,110,224,0.08)', color: '#7c6ee0' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  ))}
                  <span className="ml-auto text-xs font-semibold" style={{ color: '#7c6ee0' }}>Daxil ol →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
