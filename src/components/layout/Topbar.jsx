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
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 gap-4"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.6)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 12px rgba(140,120,200,0.05)',
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors flex-shrink-0"
          style={{ color: '#64748b', background: 'rgba(255,255,255,0.5)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium hidden sm:block" style={{ color: '#94a3b8' }}>Zirva</span>
          <span className="hidden sm:block" style={{ color: '#cbd5e1' }}>/</span>
          <h1 className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>{title}</h1>
        </div>

        {/* Search bar — hidden on mobile, glass pill */}
        <div className="hidden md:flex ml-4 relative" style={{ minWidth: 220, maxWidth: 320 }}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 14, height: 14, color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Axtar..."
            aria-label="Axtarış"
            className="topbar-search w-full text-[13px]"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(124,110,224,0.2)',
              borderRadius: '999px',
              padding: '8px 16px 8px 38px',
              color: '#1a1a2e',
              outline: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(124,110,224,0.4)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,110,224,0.08)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(124,110,224,0.2)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <style>{`
            .topbar-search::placeholder { color: #94a3b8; }
          `}</style>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative rounded-xl w-10 h-10 flex items-center justify-center"
            style={{
              color: showDropdown ? '#7c6ee0' : '#64748b',
              background: showDropdown
                ? 'linear-gradient(135deg, rgba(124,110,224,0.15), rgba(93,184,163,0.10))'
                : 'rgba(255,255,255,0.5)',
              border: showDropdown ? '1px solid rgba(124,110,224,0.25)' : '1px solid rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => {
              if (!showDropdown) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                e.currentTarget.style.color = '#1a1a2e'
              }
            }}
            onMouseLeave={e => {
              if (!showDropdown) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                e.currentTarget.style.color = '#64748b'
              }
            }}
            aria-label="Bildirişlər"
          >
            <Bell className="w-[17px] h-[17px]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7c6ee0 0%, #6b9dde 100%)',
                  boxShadow: '0 2px 6px rgba(124,110,224,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                  border: '2px solid rgba(255,255,255,0.85)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-80 sm:w-[360px] z-50 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)',
                backdropFilter: 'blur(24px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '20px',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.95), 0 16px 40px rgba(140,120,200,0.18), 0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                  <h3 className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Bildirişlər</h3>
                  {unreadCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(124,110,224,0.18), rgba(93,184,163,0.12))',
                        color: '#7c6ee0',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{ color: '#7c6ee0' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.10)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Hamısını oxu
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#1a1a2e'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.7)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#94a3b8'
                      e.currentTarget.style.background = 'transparent'
                    }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[360px]">
                {notifsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(124,110,224,0.18)', borderTopColor: '#7c6ee0' }}
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(124,110,224,0.10), rgba(93,184,163,0.08))',
                      }}
                    >
                      <Bell className="w-5 h-5" style={{ color: '#7c6ee0', opacity: 0.6 }} />
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Bildiriş yoxdur</p>
                  </div>
                ) : (
                  <ul style={{ borderColor: 'rgba(124,110,224,0.06)' }}>
                    {notifications.map((n, idx) => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors"
                        style={{
                          background: !n.read ? 'rgba(124,110,224,0.05)' : 'transparent',
                          borderTop: idx === 0 ? 'none' : '1px solid rgba(124,110,224,0.06)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = !n.read ? 'rgba(124,110,224,0.05)' : 'transparent'
                        }}
                      >
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            background: !n.read ? '#7c6ee0' : 'transparent',
                            boxShadow: !n.read ? '0 0 6px rgba(124,110,224,0.4)' : 'none',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs leading-snug"
                            style={{
                              fontWeight: !n.read ? 600 : 500,
                              color: !n.read ? '#1a1a2e' : '#475569',
                            }}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p
                              className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                              style={{ color: '#94a3b8' }}
                            >
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] mt-1" style={{ color: '#cbd5e1' }}>{timeAgo(n.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className="px-4 py-2.5"
                style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}
              >
                <button
                  onClick={() => { setShowDropdown(false); navigate(allNotifsPath) }}
                  className="w-full text-center text-xs font-medium py-1.5 rounded-lg transition-colors"
                  style={{ color: '#7c6ee0' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Bütün bildirişlərə bax →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + name (profile pill) */}
        <button
          onClick={() => navigate(profilePath)}
          className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
            e.currentTarget.style.borderColor = 'rgba(124,110,224,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
          }}
          aria-label="Profil"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{
              background: profile?.avatar_color
                ? profile.avatar_color
                : 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(124,110,224,0.18)',
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p
              className="text-xs font-semibold leading-tight truncate max-w-[120px]"
              style={{ color: '#1a1a2e' }}
            >
              {profile?.full_name}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: '#94a3b8' }}>{roleLabel}</p>
          </div>
          <ChevronDown className="w-3 h-3 hidden sm:block flex-shrink-0" style={{ color: '#94a3b8' }} />
        </button>
      </div>
    </header>
  )
}
