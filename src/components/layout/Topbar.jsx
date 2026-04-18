import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, ChevronDown, CheckCheck, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff} san. əvvəl`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

export default function Topbar({ title, onMenuClick }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount]     = useState(0)
  const [showDropdown, setShowDropdown]   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifsLoading, setNotifsLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    loadUnreadCount()
  }, [profile])

  async function loadUnreadCount() {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showDropdown])

  async function toggleDropdown() {
    const next = !showDropdown
    setShowDropdown(next)
    if (next) {
      setNotifsLoading(true)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(15)
      setNotifications(data || [])
      setNotifsLoading(false)
    }
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
      .eq('read', false)
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const allNotifsPath =
    profile?.role === 'parent'     ? '/valideyn/bildirisler'
    : profile?.role === 'student'  ? '/profil'
    : profile?.role === 'teacher'  ? '/muellim/profil'
    : profile?.role === 'admin'    ? '/admin/mesajlar'
    : '/superadmin/dashboard'

  const profilePath =
    profile?.role === 'parent'     ? '/valideyn/profil'
    : profile?.role === 'student'  ? '/profil'
    : profile?.role === 'teacher'  ? '/muellim/profil'
    : profile?.role === 'admin'    ? '/admin/parametrler'
    : '/superadmin/dashboard'

  const roleLabel = {
    student:     'Şagird',
    teacher:     'Müəllim',
    parent:      'Valideyn',
    admin:       'Administrator',
    super_admin: 'Süper Admin',
  }[profile?.role] || ''

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-border-soft flex items-center justify-between px-4 lg:px-6 gap-4">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-surface transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-base text-gray-900 truncate">{title}</h1>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Notification bell + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`relative text-gray-500 hover:text-gray-900 rounded-lg w-9 h-9 flex items-center justify-center transition-colors ${
              showDropdown ? 'bg-purple-light text-purple' : 'hover:bg-surface'
            }`}
            aria-label="Bildirişlər"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {showDropdown && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-80 sm:w-[360px] bg-white rounded-xl border border-border-soft shadow-xl z-50 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple" />
                  <h3 className="text-sm font-semibold text-gray-900">Bildirişlər</h3>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-purple hover:text-purple-dark font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-light transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Hamısını oxu
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-surface transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto max-h-[360px]">
                {notifsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-purple/20 border-t-purple rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Bildiriş yoxdur</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border-soft">
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface/70 ${
                          !n.read ? 'bg-purple-light/20' : ''
                        }`}
                      >
                        {/* Unread dot */}
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            !n.read ? 'bg-purple' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs leading-snug ${
                              !n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                            }`}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border-soft px-4 py-2.5">
                <button
                  onClick={() => { setShowDropdown(false); navigate(allNotifsPath) }}
                  className="w-full text-center text-xs text-purple hover:text-purple-dark font-medium py-1 rounded-md hover:bg-purple-light transition-colors"
                >
                  Bütün bildirişlərə bax →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border-soft mx-1" />

        {/* Avatar + name */}
        <button
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-surface transition-colors"
        >
          <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[120px]">
              {profile?.full_name}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">{roleLabel}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block flex-shrink-0" />
        </button>
      </div>
    </header>
  )
}
