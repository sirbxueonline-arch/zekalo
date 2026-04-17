import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../ui/Avatar'

export default function Topbar({ title, onMenuClick }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count || 0))
  }, [profile])

  const notifPath = profile?.role === 'parent' ? '/valideyn/bildirisler'
    : profile?.role === 'student' ? '/profil'
    : profile?.role === 'teacher' ? '/muellim/profil'
    : '/admin/dashboard'

  const profilePath = profile?.role === 'parent'  ? '/valideyn/profil'
    : profile?.role === 'student'  ? '/profil'
    : profile?.role === 'teacher'  ? '/muellim/profil'
    : '/admin/parametrler'

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

        {/* Notification bell */}
        <button
          onClick={() => navigate(notifPath)}
          className="relative text-gray-500 hover:text-gray-900 hover:bg-surface rounded-lg w-9 h-9 flex items-center justify-center transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

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
