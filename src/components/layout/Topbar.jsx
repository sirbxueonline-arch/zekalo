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
      className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-surface px-4 lg:px-6"
      style={{ height: 60, borderBottom: '1px solid var(--hairline)' }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-chip transition-colors flex-shrink-0"
          style={{ color: 'var(--ink-600)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,22,40,.04)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display text-[13px] font-bold hidden sm:block" style={{ color: 'var(--ink-400)', letterSpacing: '-0.01em' }}>Zirva</span>
          <span className="hidden sm:block" style={{ color: 'var(--hairline-strong)' }}>/</span>
          <h1 className="text-[15px] font-semibold truncate" style={{ color: 'var(--ink-900)' }}>{title}</h1>
        </div>

        {/* Search bar — hidden on mobile, surface-2 pill */}
        <div className="hidden md:flex ml-4 relative" style={{ minWidth: 220, maxWidth: 320 }}>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 15, height: 15, color: 'var(--ink-400)' }}
          />
          <input
            type="text"
            placeholder="Axtar..."
            aria-label="Axtarış"
            className="topbar-search w-full text-[13px]"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--hairline)',
              borderRadius: '999px',
              padding: '8px 16px 8px 36px',
              color: 'var(--ink-900)',
              outline: 'none',
              transition: 'all 0.15s var(--ease-out-quint)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--brand-500)'
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(87,79,207,0.15)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--hairline)'
              e.currentTarget.style.background = 'var(--surface-2)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <style>{`
            .topbar-search::placeholder { color: var(--ink-400); }
          `}</style>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative rounded-chip w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              color: showDropdown ? 'var(--brand-700)' : 'var(--ink-600)',
              background: showDropdown ? 'var(--brand-50)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (!showDropdown) {
                e.currentTarget.style.background = 'rgba(20,22,40,.04)'
                e.currentTarget.style.color = 'var(--ink-900)'
              }
            }}
            onMouseLeave={e => {
              if (!showDropdown) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--ink-600)'
              }
            }}
            aria-label="Bildirişlər"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] px-1 flex items-center justify-center"
                style={{
                  background: 'var(--brand-500)',
                  border: '2px solid var(--surface)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-80 sm:w-[360px] z-50 overflow-hidden animate-pop bg-surface shadow-pop"
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: '16px',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: 'var(--brand-500)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>Bildirişlər</h3>
                  {unreadCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold"
                      style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-chip transition-colors"
                      style={{ color: 'var(--brand-700)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Hamısını oxu
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1.5 rounded-chip transition-colors"
                    style={{ color: 'var(--ink-400)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--ink-900)'
                      e.currentTarget.style.background = 'var(--surface-2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--ink-400)'
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
                      style={{ borderColor: 'var(--brand-100)', borderTopColor: 'var(--brand-500)' }}
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="w-12 h-12 rounded-tile flex items-center justify-center mb-3"
                      style={{ background: 'var(--brand-50)' }}
                    >
                      <Bell className="w-5 h-5" style={{ color: 'var(--brand-400)' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink-400)' }}>Bildiriş yoxdur</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((n, idx) => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors"
                        style={{
                          background: !n.read ? 'var(--brand-50)' : 'transparent',
                          borderTop: idx === 0 ? 'none' : '1px solid var(--hairline)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(20,22,40,.04)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = !n.read ? 'var(--brand-50)' : 'transparent'
                        }}
                      >
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: !n.read ? 'var(--brand-500)' : 'transparent' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs leading-snug"
                            style={{
                              fontWeight: !n.read ? 600 : 500,
                              color: !n.read ? 'var(--ink-900)' : 'var(--ink-600)',
                            }}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p
                              className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                              style={{ color: 'var(--ink-400)' }}
                            >
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] mt-1" style={{ color: 'var(--ink-400)' }}>{timeAgo(n.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className="px-4 py-2.5"
                style={{ borderTop: '1px solid var(--hairline)' }}
              >
                <button
                  onClick={() => { setShowDropdown(false); navigate(allNotifsPath) }}
                  className="w-full text-center text-xs font-medium py-1.5 rounded-chip transition-colors"
                  style={{ color: 'var(--brand-700)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Bütün bildirişlərə bax →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + name (profile menu) */}
        <button
          onClick={() => navigate(profilePath)}
          className="group flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-pill transition-colors"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,22,40,.04)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          aria-label="Profil"
        >
          <Avatar
            name={profile?.full_name}
            color={profile?.avatar_color}
            size={32}
            ring={false}
          />
          <div className="hidden sm:block text-left min-w-0">
            <p
              className="text-[13px] font-semibold leading-tight truncate max-w-[120px]"
              style={{ color: 'var(--ink-900)' }}
            >
              {profile?.full_name}
            </p>
            <p className="text-[10.5px] leading-tight" style={{ color: 'var(--ink-400)' }}>{roleLabel}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 hidden sm:block flex-shrink-0" style={{ color: 'var(--ink-400)' }} />
        </button>
      </div>
    </header>
  )
}
