import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Bell, BookOpen, Calendar, MessageSquare, ClipboardList, CheckCheck } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const TYPE_META = {
  grade:      { icon: BookOpen,      chipClass: 'icon-chip-periwinkle',  dotColor: 'var(--brand-500)' },
  attendance: { icon: Calendar,      chipClass: 'icon-chip-peach',       dotColor: 'var(--warning)' },
  message:    { icon: MessageSquare, chipClass: 'icon-chip-blue',        dotColor: 'var(--sky)' },
  assignment: { icon: ClipboardList, chipClass: 'icon-chip-mint',        dotColor: 'var(--mint)' },
}

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date)) return ''
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
}

export default function ParentNotifications() {
  const { profile, updateProfile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [notifyGrade, setNotifyGrade] = useState(profile?.notify_new_grade ?? true)
  const [notifyAbsence, setNotifyAbsence] = useState(profile?.notify_absence ?? true)
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)

  useEffect(() => {
    if (!profile) return
    loadNotifications()
  }, [profile])

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    setNotifications(data || [])
    setLoading(false)
  }

  async function markAsRead(notif) {
    if (notif.read) return
    await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
  }

  async function togglePref(key, value, setter) {
    setter(value)
    await updateProfile({ [key]: value })
  }

  if (loading) return <PageSpinner />

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Page header ── */}
      <div
        className="liquid-card p-6"
        style={{
          background: 'var(--brand-50)',
          border: '1px solid var(--hairline)',
          boxShadow: 'none',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48 }}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-[26px] font-800 text-ink-900 flex items-center gap-2.5 leading-tight">
                {t('notifications')}
                {unreadCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center rounded-pill text-white font-sans text-xs font-700 px-2.5 py-0.5"
                    style={{ background: 'var(--brand-500)', fontSize: 12 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-sm text-ink-400 mt-0.5">Bütün xəbərlər və ayarlar</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => {
                notifications.filter(n => !n.read).forEach(n => markAsRead(n))
              }}
              className="flex items-center gap-1.5 text-xs font-600 text-brand-500 hover:opacity-75 transition-opacity"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Hamısını oxu
            </button>
          )}
        </div>
      </div>

      {/* ── Settings card ── */}
      <div className="liquid-card p-6">
        <h3
          className="text-[12px] font-600 uppercase tracking-widest mb-4"
          style={{ color: 'var(--ink-400)', letterSpacing: '0.04em' }}
        >
          {t('notification_settings')}
        </h3>

        <div className="space-y-1">
          {[
            {
              label: t('new_grade_notif'),
              key: 'notify_new_grade',
              value: notifyGrade,
              set: setNotifyGrade,
              icon: BookOpen,
              chipClass: 'icon-chip-periwinkle',
            },
            {
              label: t('absence_notif'),
              key: 'notify_absence',
              value: notifyAbsence,
              set: setNotifyAbsence,
              icon: Calendar,
              chipClass: 'icon-chip-peach',
            },
            {
              label: t('teacher_message_notif'),
              key: 'notify_message',
              value: notifyMessage,
              set: setNotifyMessage,
              icon: MessageSquare,
              chipClass: 'icon-chip-blue',
            },
            {
              label: t('assignment_notif'),
              key: 'notify_assignment',
              value: notifyAssignment,
              set: setNotifyAssignment,
              icon: ClipboardList,
              chipClass: 'icon-chip-mint',
            },
          ].map(n => {
            const Icon = n.icon
            return (
              <label
                key={n.key}
                className="flex items-center justify-between px-3 py-2.5 rounded-tile transition-colors hover:bg-brand-50 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`icon-chip ${n.chipClass}`}
                    style={{ width: 32, height: 32, flexShrink: 0 }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-ink-900">{n.label}</span>
                </div>
                <button
                  onClick={() => togglePref(n.key, !n.value, n.set)}
                  className="w-11 h-6 rounded-pill transition-all relative flex-shrink-0 focus-visible:ring-2 ring-brand-300"
                  style={{
                    background: n.value ? 'var(--brand-500)' : 'var(--hairline-strong)',
                  }}
                  role="switch"
                  aria-checked={n.value}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-pill bg-white transition-all"
                    style={{
                      left: n.value ? '22px' : '4px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    }}
                  />
                </button>
              </label>
            )
          })}
        </div>
      </div>

      {/* ── Notifications timeline ── */}
      <div>
        <h2
          className="text-[12px] font-600 uppercase tracking-widest mb-3"
          style={{ color: 'var(--ink-400)', letterSpacing: '0.04em' }}
        >
          {t('notifications')}
        </h2>

        {notifications.length === 0 ? (
          <EmptyState
            pose="sleeping"
            mascotSize={96}
            title="Hələ bildiriş yoxdur"
            description="Yeni xəbər gələndə burada görünəcək"
          />
        ) : (
          <div className="relative">
            {/* Subtle timeline accent line */}
            <div
              aria-hidden
              className="absolute left-[27px] top-3 bottom-3 w-px pointer-events-none"
              style={{ background: 'linear-gradient(180deg, var(--brand-200) 0%, var(--hairline) 100%)' }}
            />

            <div className="space-y-2.5">
              {notifications.map(n => {
                const meta = TYPE_META[n.type] || { icon: Bell, chipClass: 'icon-chip-periwinkle', dotColor: 'var(--brand-500)' }
                const Icon = meta.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n)}
                    className="w-full text-left flex items-start gap-4 relative group"
                  >
                    {/* Timeline icon */}
                    <div
                      className={`icon-chip ${meta.chipClass} flex-shrink-0 relative z-10 transition-transform group-hover:scale-105`}
                      style={{ width: 44, height: 44 }}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Notification card */}
                    <div
                      className="flex-1 liquid-card px-4 py-3 transition-all group-hover:-translate-y-0.5"
                      style={
                        !n.read
                          ? {
                              borderColor: 'var(--brand-200)',
                              background: 'var(--brand-50)',
                              borderLeft: '3px solid var(--brand-400)',
                            }
                          : {}
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm leading-snug text-ink-900"
                          style={{ fontWeight: n.read ? 500 : 700 }}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span
                            className="flex-shrink-0 w-2.5 h-2.5 rounded-pill mt-1"
                            style={{ background: meta.dotColor, boxShadow: `0 0 0 3px ${meta.dotColor}33` }}
                          />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs mt-1 leading-relaxed text-ink-600">{n.body}</p>
                      )}
                      <p className="text-[11px] mt-1.5 font-medium text-ink-400">
                        {fmtNumeric(n.created_at)} · {formatTime(n.created_at)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
