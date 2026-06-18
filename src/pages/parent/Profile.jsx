import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { Lock, LogOut, Users, User, Bell, Globe, GraduationCap, BookOpen, Calendar, MessageSquare, ClipboardList } from 'lucide-react'

// Palette derived from design-system accent tokens
const PASTEL_COLORS = [
  'var(--brand-500)',
  'var(--coral)',
  'var(--sky)',
  'var(--grape)',
  'var(--mint)',
  'var(--sun)',
  '#60a5fa',
  '#fb923c',
]

// Raw hex fallbacks for inline gradient usage (CSS variables can't be in linear-gradient
// directly inside all older engines, so we keep resolved values here for avatar bg only).
// Avatars are the one place saturated color is allowed to live (Design System V3 §5).
const PASTEL_HEX = [
  '#574FCF', '#F4677E', '#3BA8E6', '#7C5CE0',
  '#1FA855', '#EAB308', '#60a5fa', '#fb923c',
]

export default function ParentProfile() {
  const { profile, updateProfile, signOut, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#574FCF')
  const [notifyGrade, setNotifyGrade] = useState(profile?.notify_new_grade ?? true)
  const [notifyAbsence, setNotifyAbsence] = useState(profile?.notify_absence ?? true)
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [children, setChildren] = useState([])

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(id, full_name, school:schools(name))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)

    for (const kid of kids) {
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class:classes(name)')
        .eq('student_id', kid.id)
        .limit(1)
      kid.className = memberData?.[0]?.class?.name || null
    }

    setChildren(kids)
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      full_name: fullName,
      language,
      avatar_color: avatarColor,
      notify_new_grade: notifyGrade,
      notify_absence: notifyAbsence,
      notify_message: notifyMessage,
      notify_assignment: notifyAssignment,
    })
    setSaving(false)
  }

  async function handlePasswordChange() {
    setPasswordError('')
    setPasswordSuccess('')
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Şifrə minimum 6 simvol olmalıdır')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Şifrələr uyğun gəlmir')
      return
    }
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message || 'Şifrə dəyişdirilmədi')
      setPasswordSaving(false)
      return
    }
    setPasswordSuccess('Şifrə uğurla dəyişdirildi')
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setPasswordSaving(false)
  }

  const initials = (fullName || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Hero profile card ── */}
      <div
        className="liquid-card overflow-hidden"
        style={{ padding: 0 }}
      >
        {/* Colorful header band */}
        <div
          className="px-6 pt-8 pb-6"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}22 0%, var(--brand-50) 60%, var(--surface) 100%)`,
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div className="flex items-center gap-5">
            {/* Big avatar */}
            <div
              className="w-24 h-24 rounded-pill flex items-center justify-center text-white text-2xl font-700 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}cc 100%)`,
                boxShadow: `0 6px 16px -6px ${avatarColor}55`,
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="font-display text-[26px] font-800 text-ink-900 leading-tight">
                {fullName || '—'}
              </h1>
              <p className="text-sm text-ink-400 mt-0.5">{profile?.email}</p>
              <span
                className="inline-flex items-center gap-1 mt-2 text-xs font-600 px-2.5 py-1 rounded-chip"
                style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}
              >
                Valideyn
              </span>
            </div>
          </div>
        </div>

        {/* Fields section */}
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32 }}>
              <User className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-700 text-ink-900">Şəxsi məlumat</h3>
          </div>

          {/* Colour picker */}
          <p className="text-[12px] font-600 uppercase tracking-wide text-ink-400 mb-2.5" style={{ letterSpacing: '0.04em' }}>
            Avatar rəngi
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {PASTEL_HEX.map(hex => (
              <button
                key={hex}
                onClick={() => setAvatarColor(hex)}
                className="w-9 h-9 rounded-pill transition-all focus-visible:ring-2 ring-offset-2 ring-brand-400"
                style={{
                  background: hex,
                  boxShadow: avatarColor === hex
                    ? `0 0 0 2px #fff, 0 0 0 4px ${hex}`
                    : 'none',
                  transform: avatarColor === hex ? 'scale(1.1)' : 'scale(1)',
                }}
                aria-label={`Avatar rəngi: ${hex}`}
              />
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">
                {t('full_name')}
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="pastel-input w-full"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-700 mb-2">
                <Globe className="w-3.5 h-3.5 text-brand-500" />
                {t('language')}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: 'az', l: 'Azərbaycanca' },
                  { v: 'en', l: 'English' },
                  { v: 'ru', l: 'Русский' },
                ].map(lng => {
                  const active = language === lng.v
                  return (
                    <button
                      key={lng.v}
                      onClick={() => setLanguage(lng.v)}
                      className="px-4 py-2 rounded-pill text-xs font-semibold transition-all active:translate-y-px"
                      style={
                        active
                          ? {
                              background: 'var(--brand-500)',
                              color: '#fff',
                              boxShadow: '0 1px 2px rgba(20,22,40,.08)',
                            }
                          : {
                              background: 'var(--surface)',
                              color: 'var(--ink-600)',
                              border: '1px solid var(--hairline)',
                            }
                      }
                    >
                      {lng.l}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} className="mt-6">
            {saving ? 'Saxlanılır...' : t('save')}
          </Button>
        </div>
      </div>

      {/* ── Children card ── */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-chip icon-chip-mint" style={{ width: 36, height: 36 }}>
            <GraduationCap className="w-4 h-4" />
          </div>
          <h3 className="text-base font-700 text-ink-900">Uşaqlar</h3>
        </div>

        {children.length === 0 ? (
          <div className="py-8 text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 52, height: 52 }}>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-ink-900">Bağlı uşaq yoxdur</p>
            <p className="text-xs text-ink-400 mt-1">Məktəbə müraciət edin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {children.map((child, idx) => {
              const hex = PASTEL_HEX[idx % PASTEL_HEX.length]
              const childInitials = (child.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div
                  key={child.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-tile transition-colors hover:bg-brand-50"
                  style={{ border: '1px solid var(--hairline)' }}
                >
                  <div
                    className="w-11 h-11 rounded-pill flex items-center justify-center text-white text-sm font-700 flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${hex} 0%, ${hex}cc 100%)`,
                    }}
                  >
                    {childInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-600 text-ink-900">{child.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {child.school?.name && (
                        <span
                          className="text-[11px] font-600 px-2 py-0.5 rounded-chip"
                          style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                        >
                          {child.school.name}
                        </span>
                      )}
                      {child.className && (
                        <span
                          className="text-[11px] font-600 px-2 py-0.5 rounded-chip"
                          style={{ background: 'var(--surface-2)', color: 'var(--ink-600)', border: '1px solid var(--hairline)' }}
                        >
                          {child.className}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Notification preferences card ── */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-chip icon-chip-peach" style={{ width: 36, height: 36 }}>
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-base font-700 text-ink-900">{t('notification_settings')}</h3>
        </div>

        <div className="space-y-1">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade, icon: BookOpen, chipClass: 'icon-chip-periwinkle' },
            { label: t('absence_notif'), value: notifyAbsence, set: setNotifyAbsence, icon: Calendar, chipClass: 'icon-chip-peach' },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage, icon: MessageSquare, chipClass: 'icon-chip-blue' },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment, icon: ClipboardList, chipClass: 'icon-chip-mint' },
          ].map(n => {
            const Icon = n.icon
            return (
              <label
                key={n.label}
                className="flex items-center justify-between px-3 py-2.5 rounded-tile transition-colors hover:bg-brand-50 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`icon-chip ${n.chipClass}`} style={{ width: 30, height: 30, flexShrink: 0 }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-ink-900">{n.label}</span>
                </div>
                <button
                  onClick={() => n.set(!n.value)}
                  className="w-11 h-6 rounded-pill transition-all relative flex-shrink-0"
                  style={{ background: n.value ? 'var(--brand-500)' : 'var(--hairline-strong)' }}
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

      {/* ── Password card ── */}
      <div className="liquid-card p-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-700 transition-all hover:opacity-75 hover:gap-3"
          style={{ color: 'var(--brand-500)' }}
        >
          <div className="icon-chip icon-chip-periwinkle" style={{ width: 30, height: 30 }}>
            <Lock className="w-3.5 h-3.5" />
          </div>
          {t('change_password')}
        </button>

        {showPassword && (
          <div className="mt-5 space-y-3">
            <Input
              label={t('new_password')}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 simvol"
            />
            <Input
              label={t('confirm_password') || 'Şifrəni təsdiqlə'}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Şifrəni təkrar daxil edin"
            />

            {passwordError && (
              <p
                className="text-xs px-3 py-2 rounded-tile"
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p
                className="text-xs px-3 py-2 rounded-tile"
                style={{
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  border: '1px solid rgba(22,163,74,0.2)',
                }}
              >
                {passwordSuccess}
              </p>
            )}

            <Button
              onClick={handlePasswordChange}
              loading={passwordSaving}
              disabled={passwordSaving || newPassword.length < 6}
            >
              {passwordSaving ? '...' : t('update_password')}
            </Button>
          </div>
        )}
      </div>

      {/* ── Sign out card ── */}
      <div className="liquid-card p-5">
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 text-sm font-700 transition-opacity hover:opacity-75 w-full"
          style={{ color: 'var(--danger)' }}
        >
          <div
            className="w-8 h-8 rounded-pill flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--danger-bg)' }}
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
          </div>
          {t('sign_out')}
        </button>
      </div>
    </div>
  )
}
