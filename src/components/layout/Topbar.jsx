import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
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

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border-soft flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-2xl text-gray-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(notifPath)}
          className="relative text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-purple text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
      </div>
    </header>
  )
}
