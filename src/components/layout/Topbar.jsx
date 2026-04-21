import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, ChevronDown, CheckCheck, X, Search } from 'lucide-react'
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

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-6 gap-4"
      style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-gray-400 hidden sm:block">Zirva</span>
          <span className="text-gray-300 hidden sm:block">/</span>
          <h1 className="text-sm font-semibold text-gray-800 truncate">{title}</h1>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative rounded-lg w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              color: showDropdown ? '#7c3aed' : '#6b7280',
              background: showDropdown ? '#f3f0ff' : 'transparent',
            }}
            onMouseEnter={e => { if (!showDropdown) { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.color='#374151' } }}
            onMouseLeave={e => { if (!showDropdown) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280' } }}
            aria-label="Bildirişlər"
          >
            <Bell className="w-[17px] h-[17px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-[360px] bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" />
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
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Hamısını oxu
                    </button>
                  )}
                  <button onClick={() => setShowDropdown(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[360px]">
                {notifsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Bildiriş yoxdur</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {notifications.map(n => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-purple-50/50' : ''}`}
                      >
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-purple-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => { setShowDropdown(false); navigate(allNotifsPath) }}
                  className="w-full text-center text-xs text-purple-600 hover:text-purple-800 font-medium py-1 rounded-md hover:bg-purple-50 transition-colors"
                >
                  Bütün bildirişlərə bax →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: '#e5e7eb' }} />

        {/* Avatar + name */}
        <button
          onClick={() => navigate(profilePath)}
          className="group flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg transition-colors"
          style={{ color: '#374151' }}
          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ring-2 ring-transparent group-hover:ring-purple-200 transition-all"
            style={{ background: profile?.avatar_color || '#6d28d9' }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[120px]">{profile?.full_name}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{roleLabel}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block flex-shrink-0" />
        </button>
      </div>
    </header>
  )
}
