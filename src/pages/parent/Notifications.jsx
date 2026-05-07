import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Bell, BookOpen, Calendar, MessageSquare, ClipboardList } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const TYPE_META = {
  grade:      { icon: BookOpen,      bg: 'rgba(124,110,224,0.12)', color: '#7c6ee0' },
  attendance: { icon: Calendar,      bg: 'rgba(232,168,124,0.18)', color: '#e8a87c' },
  message:    { icon: MessageSquare, bg: 'rgba(107,157,222,0.15)', color: '#6b9dde' },
  assignment: { icon: ClipboardList, bg: 'rgba(93,184,163,0.15)',  color: '#5db8a3' },
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

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
          <span className="pastel-text">Bildirişlər</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Bütün xəbərlər və ayarlar</p>
      </div>

      {/* Settings card */}
      <div className="liquid-card p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#7c6ee0' }}>
          {t('notification_settings')}
        </h3>
        <div className="space-y-3">
          {[
            { label: t('new_grade_notif'), key: 'notify_new_grade', value: notifyGrade, set: setNotifyGrade },
            { label: t('absence_notif'), key: 'notify_absence', value: notifyAbsence, set: setNotifyAbsence },
            { label: t('teacher_message_notif'), key: 'notify_message', value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), key: 'notify_assignment', value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label
              key={n.key}
              className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/40"
            >
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{n.label}</span>
              <button
                onClick={() => togglePref(n.key, !n.value, n.set)}
                className="w-11 h-6 rounded-full transition-all relative"
                style={{
                  background: n.value
                    ? 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)'
                    : 'rgba(124,110,224,0.15)',
                }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{
                    left: n.value ? '22px' : '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications timeline */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
          {t('notifications')}
        </h2>
        {notifications.length === 0 ? (
          <div className="liquid-card p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,110,224,0.12)' }}
              >
                <Bell className="w-8 h-8" style={{ color: '#7c6ee0' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Hələ bildiriş yoxdur</h3>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>Yeni xəbər gələndə burada görünəcək</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline accent line */}
            <div
              aria-hidden
              className="absolute left-[27px] top-2 bottom-2 w-px"
              style={{ background: 'linear-gradient(180deg, rgba(124,110,224,0.4) 0%, rgba(93,184,163,0.2) 100%)' }}
            />

            <div className="space-y-3">
              {notifications.map(n => {
                const meta = TYPE_META[n.type] || { icon: Bell, bg: 'rgba(124,110,224,0.10)', color: '#7c6ee0' }
                const Icon = meta.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n)}
                    className="w-full text-left flex items-start gap-4 relative"
                  >
                    {/* Timeline dot/icon — wraps the line */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
                      style={{
                        background: meta.bg,
                        color: meta.color,
                        border: `2px solid ${n.read ? 'rgba(255,255,255,0.6)' : meta.color + '40'}`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 rounded-2xl p-4 transition-all"
                      style={{
                        background: !n.read
                          ? 'rgba(124,110,224,0.08)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.6)',
                        border: !n.read
                          ? '1px solid rgba(124,110,224,0.25)'
                          : '1px solid rgba(255,255,255,0.65)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 24px rgba(140,120,200,0.08)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm leading-snug"
                          style={{
                            fontWeight: n.read ? 500 : 700,
                            color: '#1a1a2e',
                          }}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span
                            className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                            style={{ background: '#7c6ee0' }}
                          />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#64748b' }}>{n.body}</p>
                      )}
                      <p className="text-[11px] mt-2 font-medium" style={{ color: '#64748b' }}>
                        {fmtNumeric(n.created_at)} {formatTime(n.created_at)}
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
