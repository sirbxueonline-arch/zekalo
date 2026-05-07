import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { EditionBadge } from '../../components/ui/Badge'
import { Flame, Sparkles, Lock, User, Bell, BarChart2 } from 'lucide-react'

const colors = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde', '#a48bd8', '#7fc7b6', '#f0bf99', '#8aaee5']

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-4">
    <span
      className="flex items-center justify-center"
      style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'rgba(124,110,224,0.14)',
      }}
    >
      <Icon className="w-4 h-4" style={{ color: '#7c6ee0' }} />
    </span>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {label}
    </h3>
  </div>
)

export default function StudentProfile() {
  const { profile, updateProfile, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [notifyGrade, setNotifyGrade] = useState(profile?.notify_new_grade ?? true)
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#7c6ee0')
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
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        <span className="pastel-text">Profil</span>
      </h1>

      <Card hover={false}>
        <SectionHeader icon={User} label={t('full_name')} />

        <div className="flex items-center gap-6 mb-6">
          <Avatar name={fullName} color={avatarColor} size="xl" />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{fullName}</h2>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <EditionBadge edition={profile?.edition} govLabel={t('government')} />
              {profile?.ib_programme && (
                <span className="text-xs uppercase" style={{ color: '#64748b' }}>{profile.ib_programme}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
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
              }}
              aria-label="Avatar rəngi"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Input label={t('full_name')} value={fullName} onChange={e => setFullName(e.target.value)} />

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>{t('language')}</p>
            <div className="flex gap-2 flex-wrap">
              {[{ v: 'az', l: 'Azərbaycanca' }, { v: 'en', l: 'English' }, { v: 'ru', l: 'Русский' }].map(lng => (
                <button
                  key={lng.v}
                  onClick={() => setLanguage(lng.v)}
                  className="transition-all"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    background: language === lng.v ? 'linear-gradient(135deg, rgba(124,110,224,0.18) 0%, rgba(93,184,163,0.18) 100%)' : 'rgba(255,255,255,0.6)',
                    border: language === lng.v ? '1px solid rgba(124,110,224,0.5)' : '1px solid rgba(124,110,224,0.2)',
                    color: language === lng.v ? '#5448a8' : '#475569',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
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

      <Card hover={false}>
        <SectionHeader icon={Bell} label={t('notification_settings')} />
        <div className="space-y-3">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label key={n.label} className="flex items-center justify-between" style={{ padding: '8px 0' }}>
              <span className="text-sm" style={{ color: '#1a1a2e' }}>{n.label}</span>
              <button
                onClick={() => { n.set(!n.value); }}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  position: 'relative',
                  background: n.value
                    ? 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)'
                    : 'rgba(124,110,224,0.18)',
                  transition: 'all .25s cubic-bezier(.22,1,.36,1)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: n.value ? '0 4px 10px rgba(124,110,224,0.25)' : 'none',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: n.value ? 23 : 3,
                    width: 18, height: 18, borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'left .25s cubic-bezier(.22,1,.36,1)',
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </Card>

      <Card hover={false}>
        <SectionHeader icon={BarChart2} label={t('zeka_stats')} />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4" style={{ background: 'rgba(232,168,124,0.10)', borderRadius: 16, border: '1px solid rgba(232,168,124,0.18)' }}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4" style={{ color: '#e8a87c' }} />
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>
                {profile?.streak_count || 0}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#64748b' }}>{t('current_streak')}</p>
          </div>
          <div className="text-center p-4" style={{ background: 'rgba(93,184,163,0.10)', borderRadius: 16, border: '1px solid rgba(93,184,163,0.18)' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>
              {profile?.streak_longest || 0}
            </span>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{t('longest_streak')}</p>
          </div>
          <div className="text-center p-4" style={{ background: 'rgba(124,110,224,0.10)', borderRadius: 16, border: '1px solid rgba(124,110,224,0.18)' }}>
            <Sparkles className="w-4 h-4 mx-auto mb-1" style={{ color: '#7c6ee0' }} />
            <p className="text-xs" style={{ color: '#64748b' }}>Zəka sessiyaları</p>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 transition-colors"
          style={{ color: '#7c6ee0', fontSize: 14, fontWeight: 600 }}
        >
          <Lock className="w-4 h-4" />
          {t('change_password')}
        </button>
        {showPassword && (
          <div className="mt-4 space-y-3">
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
              <p className="text-sm" style={{ color: '#b13838' }}>{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm" style={{ color: '#2f7a64' }}>{passwordSuccess}</p>
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
