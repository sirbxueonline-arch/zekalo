import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { Lock, LogOut, Users, User, Bell, Globe, GraduationCap } from 'lucide-react'

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde', '#a78bfa', '#34d399', '#fb923c', '#60a5fa']

export default function ParentProfile() {
  const { profile, updateProfile, signOut, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#7c6ee0')
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

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
          <span className="pastel-text">Profil</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Şəxsi məlumatlar və ayarlar</p>
      </div>

      {/* Personal info */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,110,224,0.12)' }}
          >
            <User className="w-4.5 h-4.5" style={{ color: '#7c6ee0' }} />
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Şəxsi məlumat</h3>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}cc 100%)`,
              boxShadow: `0 8px 20px ${avatarColor}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}
          >
            {(fullName || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{fullName || '—'}</p>
            <p className="text-sm" style={{ color: '#64748b' }}>{profile?.email}</p>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
          Avatar rəngi
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {PASTEL_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              className="w-9 h-9 rounded-full transition-all"
              style={{
                background: c,
                boxShadow: avatarColor === c
                  ? `0 0 0 2px #fff, 0 0 0 4px ${c}, 0 4px 12px ${c}40`
                  : `0 2px 6px ${c}40`,
                transform: avatarColor === c ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1a1a2e' }}>
              {t('full_name')}
            </label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(124,110,224,0.25)',
                backdropFilter: 'blur(12px)',
                color: '#1a1a2e',
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: '#1a1a2e' }}>
              <Globe className="w-3.5 h-3.5" style={{ color: '#7c6ee0' }} />
              {t('language')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[{ v: 'az', l: 'Azərbaycanca' }, { v: 'en', l: 'English' }, { v: 'ru', l: 'Русский' }].map(lng => {
                const active = language === lng.v
                return (
                  <button
                    key={lng.v}
                    onClick={() => setLanguage(lng.v)}
                    className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                            color: '#fff',
                            border: '1px solid rgba(124,110,224,0.3)',
                            boxShadow: '0 4px 12px rgba(124,110,224,0.2)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.6)',
                            color: '#64748b',
                            border: '1px solid rgba(124,110,224,0.2)',
                            backdropFilter: 'blur(12px)',
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-pastel mt-6 disabled:opacity-60"
        >
          {saving ? 'Saxlanılır...' : t('save')}
        </button>
      </div>

      {/* Children */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(93,184,163,0.12)' }}
          >
            <GraduationCap className="w-4.5 h-4.5" style={{ color: '#5db8a3' }} />
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Uşaqlar</h3>
        </div>
        {children.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(124,110,224,0.10)' }}
            >
              <Users className="w-6 h-6" style={{ color: '#7c6ee0' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Bağlı uşaq yoxdur</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Məktəbə müraciət edin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {children.map((child, idx) => {
              const color = PASTEL_COLORS[idx % PASTEL_COLORS.length]
              const initials = (child.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/40"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                      boxShadow: `0 4px 12px ${color}30`,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{child.full_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {child.school?.name && (
                        <span className="text-xs" style={{ color: '#64748b' }}>{child.school.name}</span>
                      )}
                      {child.className && (
                        <>
                          <span className="text-xs" style={{ color: '#cbd5e1' }}>·</span>
                          <span className="text-xs" style={{ color: '#64748b' }}>{child.className}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Communication preferences */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(232,168,124,0.15)' }}
          >
            <Bell className="w-4.5 h-4.5" style={{ color: '#e8a87c' }} />
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>{t('notification_settings')}</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade },
            { label: t('absence_notif'), value: notifyAbsence, set: setNotifyAbsence },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label
              key={n.label}
              className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/40"
            >
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{n.label}</span>
              <button
                onClick={() => n.set(!n.value)}
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

      {/* Password */}
      <div className="liquid-card p-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-bold transition-colors"
          style={{ color: '#7c6ee0' }}
        >
          <Lock className="w-4 h-4" />
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
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(93,184,163,0.10)',
                  color: '#5db8a3',
                  border: '1px solid rgba(93,184,163,0.25)',
                }}
              >
                {passwordSuccess}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving || newPassword.length < 6}
              className="btn-pastel disabled:opacity-60"
            >
              {passwordSaving ? '...' : t('update_password')}
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="liquid-card p-6">
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-75"
          style={{ color: '#ef4444' }}
        >
          <LogOut className="w-4 h-4" />
          {t('sign_out')}
        </button>
      </div>
    </div>
  )
}
