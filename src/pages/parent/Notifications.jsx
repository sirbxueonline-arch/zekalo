import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Bell, BookOpen, Calendar, MessageSquare, ClipboardList } from 'lucide-react'

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

  const notifIcons = {
    grade: BookOpen,
    attendance: Calendar,
    message: MessageSquare,
    assignment: ClipboardList,
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('notification_settings')}</h3>
        <div className="space-y-3">
          {[
            { label: t('new_grade_notif'), key: 'notify_new_grade', value: notifyGrade, set: setNotifyGrade },
            { label: t('absence_notif'), key: 'notify_absence', value: notifyAbsence, set: setNotifyAbsence },
            { label: t('teacher_message_notif'), key: 'notify_message', value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), key: 'notify_assignment', value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{n.label}</span>
              <button
                onClick={() => togglePref(n.key, !n.value, n.set)}
                className={`w-10 h-6 rounded-full transition-colors relative ${n.value ? 'bg-purple' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${n.value ? 'left-5' : 'left-1'}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('notifications')}</h2>
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title={t('no_messages')} description={t('notifications')} />
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = notifIcons[n.type] || Bell
              return (
                <Card key={n.id} hover={false} className="cursor-pointer" onClick={() => markAsRead(n)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.read ? 'bg-surface' : 'bg-purple-light'
                    }`}>
                      <Icon className={`w-4 h-4 ${n.read ? 'text-gray-400' : 'text-purple'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-purple flex-shrink-0" />}
                      </div>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.created_at).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {' '}
                        {new Date(n.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
