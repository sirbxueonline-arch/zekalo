import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { EditionBadge } from '../../components/ui/Badge'
import StreakBadge from '../../components/ui/StreakBadge'
import XPBar from '../../components/ui/XPBar'
import CountUp from '../../components/ui/CountUp'
import { Sparkles, Lock, User, Bell, BarChart2 } from 'lucide-react'

const colors = [
  '#574FCF', '#22C55E', '#FB7185', '#38BDF8',
  '#FACC15', '#8B5CF6', '#F59E0B', '#06B6D4',
]

function SectionHeader({ icon: Icon, label, chipClass = 'icon-chip-periwinkle' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`icon-chip ${chipClass}`} style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0 }}>
        <Icon className="w-4 h-4" />
      </span>
      <h3
        className="text-ink-900"
        style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
      >
        {label}
      </h3>
    </div>
  )
}

export default function StudentProfile() {
  const { profile, updateProfile, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [notifyGrade, setNotifyGrade] = useState(profile?.notify_new_grade ?? true)
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#574FCF')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      full_name: fullName,
      language,
      notify_new_grade: notifyGrade,
      notify_message: notifyMessage,
      notify_assignment: notifyAssignment,
      avatar_color: avatarColor,
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
    <div className="max-w-2xl space-y-6">
      {/* Page title */}
      <h1
        className="font-display text-ink-900"
        style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12 }}
      >
        Profil
      </h1>

      {/* Identity card */}
      <Card hover={false}>
        <SectionHeader icon={User} label={t('full_name')} />

        {/* Avatar + name hero */}
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={fullName} color={avatarColor} size="xl" variant="gem" />
          <div>
            <h2 className="text-ink-900" style={{ fontSize: 20, fontWeight: 700 }}>{fullName}</h2>
            <p className="text-sm mt-0.5 text-ink-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <EditionBadge edition={profile?.edition} govLabel={t('government')} />
              {profile?.ib_programme && (
                <span className="text-xs uppercase text-ink-400 font-semibold">{profile.ib_programme}</span>
              )}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex gap-2 flex-wrap mb-6">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              className="transition-all"
              style={{
                width: 32, height: 32, borderRadius: 999,
                backgroundColor: c,
                boxShadow: avatarColor === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'none',
                cursor: 'pointer',
                transform: avatarColor === c ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label="Avatar rəngi"
            />
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Input label={t('full_name')} value={fullName} onChange={e => setFullName(e.target.value)} />

          <div>
            <p className="text-ink-900 mb-2" style={{ fontSize: 13, fontWeight: 600 }}>{t('language')}</p>
            <div className="flex gap-2 flex-wrap">
              {[{ v: 'az', l: 'Azərbaycanca' }, { v: 'en', l: 'English' }, { v: 'ru', l: 'Русский' }].map(lng => (
                <button
                  key={lng.v}
                  onClick={() => setLanguage(lng.v)}
                  className="transition-all"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    background: language === lng.v ? 'var(--brand-100)' : 'var(--surface-2)',
                    border: language === lng.v ? '1.5px solid var(--brand-400)' : '1.5px solid var(--hairline)',
                    color: language === lng.v ? 'var(--brand-600)' : 'var(--ink-600)',
                    cursor: 'pointer',
                  }}
                >
                  {lng.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} loading={saving}>
            {t('save')}
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card hover={false}>
        <SectionHeader icon={Bell} label={t('notification_settings')} />
        <div className="space-y-1">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label
              key={n.label}
              className="flex items-center justify-between"
              style={{ padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}
            >
              <span className="text-sm text-ink-900">{n.label}</span>
              <button
                onClick={() => { n.set(!n.value) }}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  position: 'relative',
                  background: n.value ? 'var(--brand-500)' : 'var(--hairline-strong)',
                  transition: 'background .2s var(--ease-out-quint)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3, left: n.value ? 23 : 3,
                    width: 18, height: 18, borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'left .25s var(--ease-out-quint)',
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </Card>

      {/* Gamification stats */}
      <Card hover={false}>
        <SectionHeader icon={BarChart2} label={t('zeka_stats')} />

        {/* Streak badge + XP bar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <StreakBadge
            days={profile?.streak_count || 0}
            showWeek={false}
            size={80}
          />
          <div className="flex-1 w-full space-y-4">
            <XPBar
              value={profile?.xp_points || 0}
              target={profile?.xp_next_level || 200}
            />
            <div className="grid grid-cols-2 gap-3">
              {/* Longest streak */}
              <div
                className="flex flex-col items-center justify-center p-4 text-center"
                style={{
                  background: 'var(--brand-50)',
                  borderRadius: 12,
                  border: '1px solid var(--brand-100)',
                }}
              >
                <span
                  className="font-display tabular-nums text-ink-900"
                  style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}
                >
                  <CountUp to={profile?.streak_longest || 0} />
                </span>
                <p className="text-xs text-ink-400 mt-1 font-semibold">{t('longest_streak')}</p>
              </div>
              {/* Zeka sessions */}
              <div
                className="flex flex-col items-center justify-center p-4 text-center"
                style={{
                  background: 'rgba(234,179,8,0.10)',
                  borderRadius: 12,
                  border: '1px solid rgba(234,179,8,0.22)',
                }}
              >
                <Sparkles className="w-6 h-6 mb-1" style={{ color: 'var(--sun)' }} />
                <p className="text-xs text-ink-400 font-semibold">Zəka sessiyaları</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card hover={false}>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 transition-colors"
          style={{ color: 'var(--brand-500)', fontSize: 14, fontWeight: 600 }}
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
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm" style={{ color: 'var(--success)' }}>{passwordSuccess}</p>
            )}
            <Button onClick={handlePasswordChange} loading={passwordSaving} disabled={newPassword.length < 6}>
              {t('update_password')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
