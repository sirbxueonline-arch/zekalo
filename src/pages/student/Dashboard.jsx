import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  Flame, BookOpen, Calendar, ClipboardList, Upload, FolderOpen,
  ArrowRight, Clock, CheckSquare, Square, AlertCircle, BookMarked,
} from 'lucide-react'

function todayLabel() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(dueDateIso) {
  if (!dueDateIso) return false
  return new Date(dueDateIso) < new Date()
}

const SUBJECT_COLORS = [
  'bg-purple-light text-purple',
  'bg-teal-light text-teal',
  'bg-amber-50 text-amber-700',
  'bg-blue-50 text-blue-700',
  'bg-pink-50 text-pink-700',
  'bg-orange-50 text-orange-700',
]

function subjectColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

const TABS = [
  { key: 'upcoming', label: 'Yaxın' },
  { key: 'past', label: 'Keçmiş' },
  { key: 'overdue', label: 'Vaxtı keçmiş' },
]

export default function StudentDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [timetable, setTimetable] = useState([])
  const [upcomingAssignments, setUpcomingAssignments] = useState([])
  const [pastAssignments, setPastAssignments] = useState([])
  const [homeworkItems, setHomeworkItems] = useState([])
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (!profile) return
    async function load() {
      // 1. Get class IDs
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id)
      const classIds = (memberData || []).map(c => c.class_id)

      const today = new Date().getDay() // 0=Sun … 6=Sat
      const now = new Date().toISOString()
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const [timetableRes, upcomingRes, pastRes, homeworkRes] = await Promise.all([
        classIds.length
          ? supabase
              .from('timetable_slots')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .eq('day_of_week', today)
              .eq('published', true)
              .order('period')
          : { data: [] },

        classIds.length
          ? supabase
              .from('assignments')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .gte('due_date', now)
              .lte('due_date', in7Days)
              .order('due_date')
              .limit(10)
          : { data: [] },

        classIds.length
          ? supabase
              .from('assignments')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .lt('due_date', now)
              .order('due_date', { ascending: false })
              .limit(5)
          : { data: [] },

        supabase
          .from('homework_items')
          .select('*')
          .eq('student_id', profile.id)
          .eq('done', false)
          .order('due_date')
          .limit(5),
      ])

      setTimetable(timetableRes.data || [])
      setUpcomingAssignments(upcomingRes.data || [])
      setPastAssignments(pastRes.data || [])
      setHomeworkItems(homeworkRes.data || [])
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <PageSpinner />

  const firstName = profile?.full_name?.split(' ')[0] || ''

  // Tab content
  const overdueAssignments = upcomingAssignments.filter(a => isOverdue(a.due_date))

  const tabData = {
    upcoming: upcomingAssignments,
    past: pastAssignments,
    overdue: overdueAssignments,
  }

  return (
    <div className="space-y-8">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight leading-tight">
          Xoş gəldiniz, {firstName}!
        </h1>
      </div>

      {/* ── Streak banner ────────────────────────────────────────────────── */}
      {profile?.streak_count > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {profile.streak_count} günlük dalbadal zolaq!
            </p>
            <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-amber-400 rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min((profile.streak_count / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Quick-action cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/tapshiriqlar')}
          className="flex items-center gap-5 bg-purple rounded-2xl px-7 py-6 text-left hover:opacity-90 transition-opacity shadow-sm"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-white">Tapşırıq Təhvil Ver</p>
            <p className="text-xs text-white/70 mt-0.5">Gözləyən tapşırıqlar</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/60" />
        </button>

        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-5 bg-teal rounded-2xl px-7 py-6 text-left hover:opacity-90 transition-opacity shadow-sm"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-white">Portfelim</p>
            <p className="text-xs text-white/70 mt-0.5">İşlərimi gör</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* ── Three-column widget grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Bu günün tapşırıqları */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple" />
              Bu günün tapşırıqları
            </h2>
          </div>
          {homeworkItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Bu gün tapşırıq yoxdur</p>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {homeworkItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                  <div className="flex-shrink-0">
                    {item.done
                      ? <CheckSquare className="w-4 h-4 text-teal" />
                      : <Square className="w-4 h-4 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    {item.due_date && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.due_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CENTER: Günün Cədvəli */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple" />
              Günün Cədvəli
            </h2>
          </div>
          {timetable.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Bu gün dərs yoxdur</p>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {timetable.map(slot => (
                <div key={slot.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple text-white text-xs font-bold flex items-center justify-center">
                    {slot.period}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{slot.subject?.name}</p>
                    {(slot.room || slot.start_time) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[slot.start_time, slot.room].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Yaxın Son Tarixlər */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple" />
              Yaxın Son Tarixlər
            </h2>
            <button
              onClick={() => navigate('/tapshiriqlar')}
              className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
            >
              Hamısı <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {upcomingAssignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Yaxın tapşırıq yoxdur</p>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {upcomingAssignments.map(a => {
                const overdue = isOverdue(a.due_date)
                const colorClass = subjectColor(a.subject?.name)
                return (
                  <div key={a.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-surface/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 ${colorClass}`}>
                        {a.subject?.name || 'Fənn'}
                      </span>
                      <p className="text-sm font-medium text-gray-900 truncate mt-1">{a.title}</p>
                    </div>
                    <span className={`text-xs whitespace-nowrap flex-shrink-0 font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                      {formatDate(a.due_date)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom tabbed assignments section ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
        <div className="px-8 py-5 border-b border-border-soft">
          <h2 className="font-semibold text-gray-900 mb-4">Tapşırıqlar &amp; Son Tarixlər</h2>
          <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-purple shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key === 'overdue' && overdueAssignments.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {overdueAssignments.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tabData[activeTab].length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-3">
              <BookMarked className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              {activeTab === 'upcoming' && 'Yaxın tapşırıq yoxdur'}
              {activeTab === 'past' && 'Keçmiş tapşırıq yoxdur'}
              {activeTab === 'overdue' && 'Vaxtı keçmiş tapşırıq yoxdur'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-soft">
            {tabData[activeTab].map(a => {
              const overdue = activeTab === 'overdue' || isOverdue(a.due_date)
              const colorClass = subjectColor(a.subject?.name)
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between px-8 py-4 hover:bg-surface/50 transition-colors ${overdue && activeTab === 'overdue' ? 'bg-red-50/40' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 flex-shrink-0 ${colorClass}`}>
                      {a.subject?.name || 'Fənn'}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                      {formatDate(a.due_date)}
                    </span>
                    {activeTab === 'upcoming' && (
                      <span className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-surface text-gray-500 border border-border-soft">
                        Gözlənilir
                      </span>
                    )}
                    {activeTab === 'past' && (
                      <span className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-teal-light text-teal border border-teal/20">
                        Keçmiş
                      </span>
                    )}
                    {activeTab === 'overdue' && (
                      <span className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200">
                        Vaxtı keçib
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
