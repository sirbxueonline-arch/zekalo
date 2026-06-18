import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import { EditionBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Lock, Check, AlertCircle, BookOpen, Users, User } from 'lucide-react'

// Avatar palette — per V3 §5, full-saturation colour is allowed here (avatars are
// the one place warmth lives at scale). Mid-saturation, calm-on-white hues.
const AVATAR_COLORS = [
  '#574FCF', // brand-500
  '#1FA855', // mint
  '#EAB308', // sun/amber
  '#3BA8E6', // sky
  '#7C5CE0', // grape
  '#F4677E', // coral
  '#39C5BB', // teal
  '#FFC24B', // gold
]

export default function TeacherProfile() {
  const { profile, updateProfile, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#574FCF')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [teacherClasses, setTeacherClasses] = useState([])

  useEffect(() => {
    if (!profile) return
    loadTeacherData()
  }, [profile])

  async function loadTeacherData() {
    const { data } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(name), subject:subjects(name)')
      .eq('teacher_id', profile.id)

    setTeacherClasses(data || [])
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      full_name: fullName,
      language,
      notify_message: notifyMessage,
      notify_assignment: notifyAssignment,
      avatar_color: avatarColor,
    })
    setSaving(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2400)
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

  const uniqueSubjects = [...new Set(teacherClasses.map(tc => tc.subject?.name).filter(Boolean))]
  const uniqueClasses = [...new Set(teacherClasses.map(tc => tc.class?.name).filter(Boolean))]

  return (
    <div className="max-w-3xl space-y-5 relative">
      {/* Save toast */}
      {savedToast && (
        <div className="fixed top-6 right-6 toast-success px-4 py-3 rounded-tile text-sm font-semibold flex items-center gap-2 z-50 shadow-modal">
          <Check className="w-4 h-4" /> Profil yadda saxlandı
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="icon-chip icon-chip-periwinkle">
          <User className="w-5 h-5" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-[-0.01em]">
          {t('profile')}
        </h1>
      </div>

      {/* Identity card */}
      <div className="liquid-card p-6">
        {/* Avatar + name row */}
        <div className="flex items-center gap-5 mb-6 flex-wrap">
          <Avatar name={fullName} color={avatarColor} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-ink-900 leading-tight">{fullName}</h2>
            <p className="text-sm text-ink-400 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <EditionBadge edition={profile?.edition} govLabel={t('government')} />
              <span className="pill-peri">Müəllim</span>
            </div>
          </div>
        </div>

        {/* Avatar colour picker */}
        <p className="text-[13px] font-semibold mb-2.5 uppercase tracking-[0.04em] text-ink-400">
          Avatar rəngi
        </p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {AVATAR_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              aria-label={c}
              className="w-8 h-8 rounded-full transition-[box-shadow,transform] duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{
                backgroundColor: c,
                outline: avatarColor === c ? `3px solid rgba(255,255,255,0.95)` : 'none',
                boxShadow: avatarColor === c
                  ? `0 0 0 2px ${c}`
                  : '0 1px 2px rgba(20,22,40,0.08)',
              }}
            />
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
              {t('full_name')}
            </label>
            <input
              className="pastel-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-2 uppercase tracking-[0.04em] text-ink-400">
              {t('language')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: 'az', l: 'Azərbaycanca' },
                { v: 'en', l: 'English' },
                { v: 'ru', l: 'Russkiy' },
              ].map(lng => (
                <button
                  key={lng.v}
                  onClick={() => setLanguage(lng.v)}
                  className={language === lng.v ? 'pastel-tab active' : 'pastel-tab'}
                  style={{ borderRadius: 10 }}
                >
                  {lng.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          variant="primary"
          size="md"
          className="mt-6"
        >
          {saving ? 'Yadda saxlanır...' : t('save')}
        </Button>
      </div>

      {/* Subjects */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32, borderRadius: 10 }}>
            <BookOpen className="w-4 h-4" />
          </span>
          <h3 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400">
            {t('subject')}
          </h3>
        </div>
        {uniqueSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map(s => (
              <span key={s} className="pill-muted" style={{ padding: '6px 14px', fontSize: 13 }}>
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">Hələ fənn təyin olunmayıb</p>
        )}
      </div>

      {/* Classes */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32, borderRadius: 10 }}>
            <Users className="w-4 h-4" />
          </span>
          <h3 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400">
            {t('class_name')}
          </h3>
        </div>
        {uniqueClasses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uniqueClasses.map(c => (
              <span key={c} className="pill-muted" style={{ padding: '6px 14px', fontSize: 13 }}>
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">Hələ sinif təyin olunmayıb</p>
        )}
      </div>

      {/* Notifications */}
      <div className="liquid-card p-6">
        <h3 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400 mb-4">
          {t('notification_settings')}
        </h3>
        <div className="space-y-3">
          {[
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label
              key={n.label}
              className="flex items-center justify-between cursor-pointer transition-colors rounded-tile"
              style={{
                padding: '12px 16px',
                background: 'var(--surface-2)',
              }}
            >
              <span className="text-sm font-medium text-ink-900">{n.label}</span>
              <button
                onClick={() => n.set(!n.value)}
                aria-label={n.label}
                className="relative flex-shrink-0 transition-[background,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  background: n.value
                    ? 'var(--brand-500)'
                    : 'var(--hairline-strong)',
                  boxShadow: 'none',
                }}
              >
                <span
                  className="absolute top-1 transition-[left] duration-200"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    left: n.value ? 24 : 4,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="liquid-card p-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
        >
          <Lock className="w-4 h-4" />
          {t('change_password')}
        </button>

        {showPassword && (
          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
                {t('new_password')}
              </label>
              <input
                type="password"
                className="pastel-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 simvol"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
                {t('confirm_password') || 'Şifrəni təsdiqlə'}
              </label>
              <input
                type="password"
                className="pastel-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Şifrəni təkrar daxil edin"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#B91C1C' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#15803D' }}>
                <Check className="w-4 h-4 flex-shrink-0" /> {passwordSuccess}
              </div>
            )}

            <Button
              onClick={handlePasswordChange}
              disabled={passwordSaving || newPassword.length < 6}
              loading={passwordSaving}
              variant="primary"
              size="md"
            >
              {passwordSaving ? '...' : t('update_password')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
