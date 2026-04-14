import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Users, BookOpen, Calendar, Bell, ArrowRight, MessageSquare, ClipboardList } from 'lucide-react'

export default function ParentDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [childData, setChildData] = useState({})
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadChildData(selectedChild)
  }, [selectedChild])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(*, school:schools(*))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)
    setChildren(kids)
    if (kids.length > 0) setSelectedChild(kids[0])

    const { data: notifData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications(notifData || [])
    if (!kids.length) setLoading(false)
  }

  async function loadChildData(child) {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class:classes(id, name)')
      .eq('student_id', child.id)
      .limit(1)

    const className = memberData?.[0]?.class?.name || null

    const [gradesRes, attRes] = await Promise.all([
      supabase.from('grades').select('*, subject:subjects(name)').eq('student_id', child.id).order('date', { ascending: false }).limit(5),
      supabase.from('attendance').select('status').eq('student_id', child.id),
    ])

    const grades = gradesRes.data || []
    const att = attRes.data || []
    const present = att.filter(a => a.status === 'present').length
    const pct = att.length ? Math.round((present / att.length) * 100) : 0
    const lastGrade = grades[0] || null

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const { data: weekAtt } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', child.id)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])

    const daysPresent = (weekAtt || []).filter(a => a.status === 'present').length

    setChildData({
      className,
      grades,
      attendancePct: pct,
      lastGrade,
      daysPresent,
    })
    setLoading(false)
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('error')}
        description={t('error')}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">
          {t('greeting')}, {profile?.full_name?.split(' ')[0]}!
        </h1>
      </div>

      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface'
              }`}
            >
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <Card hover={false}>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-purple-light rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-purple" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{selectedChild?.full_name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  {childData.className && (
                    <span className="text-sm text-gray-500">{childData.className}</span>
                  )}
                  {selectedChild?.school?.name && (
                    <span className="text-sm text-gray-500">{selectedChild.school.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {childData.lastGrade && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">{t('recent_grades')}:</span>
                      <GradeBadge score={childData.lastGrade.max_score > 0 ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10) : childData.lastGrade.score} />
                    </div>
                  )}
                  <span className="text-xs text-gray-400">{t('attendance')}: <span className="text-gray-700 font-medium">{childData.attendancePct}%</span></span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label={t('this_week')} value={childData.daysPresent} icon={Calendar} />
            <StatCard
              label={t('recent_grades')}
              value={childData.lastGrade ? (childData.lastGrade.max_score > 0 ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10).toString().replace('.', ',') : childData.lastGrade.score) : '—'}
              icon={BookOpen}
            />
            <StatCard label={t('attendance')} value={`${childData.attendancePct}%`} icon={Calendar} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="ghost" onClick={() => navigate('/valideyn/mesajlar')} className="justify-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('messages')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/valideyn/qiymetler')} className="justify-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('grades')}
            </Button>
          </div>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('recent_grades')}</h2>
              <button onClick={() => navigate('/valideyn/qiymetler')} className="text-xs text-purple hover:text-purple-dark">
                {t('view_all')} <ArrowRight className="w-3 h-3 inline" />
              </button>
            </div>
            {childData.grades?.length === 0 ? (
              <p className="text-sm text-gray-400">{t('no_grades')}</p>
            ) : (
              <div className="space-y-3">
                {(childData.grades || []).map(g => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                    <div>
                      <p className="text-sm text-gray-900">{g.subject?.name}</p>
                      <p className="text-xs text-gray-500">{g.assessment_title}</p>
                    </div>
                    <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('notifications')}</h2>
              <button onClick={() => navigate('/valideyn/bildirisler')} className="text-xs text-purple hover:text-purple-dark">
                {t('view_all')} <ArrowRight className="w-3 h-3 inline" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">{t('no_messages')}</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 py-2 border-b border-border-soft last:border-0">
                    <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.read ? 'text-gray-300' : 'text-purple'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400">{n.body}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.created_at).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
