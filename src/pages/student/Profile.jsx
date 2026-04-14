import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { EditionBadge } from '../../components/ui/Badge'
import { Flame, Sparkles, Lock } from 'lucide-react'

const colors = ['#534AB7', '#1D9E75', '#EF9F27', '#E74C3C', '#3498DB', '#8E44AD', '#E67E22', '#2ECC71']

export default function StudentProfile() {
  const { profile, updateProfile, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [notifyGrade, setNotifyGrade] = useState(profile?.notify_new_grade ?? true)
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#534AB7')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

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
    if (!newPassword || newPassword.length < 6) return
    setPasswordSaving(true)
    await supabase.auth.updateUser({ password: newPassword })
    setNewPassword('')
    setShowPassword(false)
    setPasswordSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card hover={false}>
        <div className="flex items-center gap-6 mb-6">
          <Avatar name={fullName} color={avatarColor} size="xl" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <EditionBadge edition={profile?.edition} govLabel={t('government')} />
              {profile?.ib_programme && (
                <span className="text-xs text-gray-500 uppercase">{profile.ib_programme}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${avatarColor === c ? 'ring-2 ring-offset-2 ring-purple' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <Input label={t('full_name')} value={fullName} onChange={e => setFullName(e.target.value)} />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t('language')}</p>
            <div className="flex gap-3">
              {[{ v: 'az', l: 'Azərbaycanca' }, { v: 'en', l: 'English' }, { v: 'ru', l: 'Русский' }].map(lng => (
                <button
                  key={lng.v}
                  onClick={() => setLanguage(lng.v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    language === lng.v ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-600 hover:bg-surface'
                  }`}
                >
                  {lng.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} className="mt-6">
          {t('save')}
        </Button>
      </Card>

      <Card hover={false}>
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('notification_settings')}</h3>
        <div className="space-y-3">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label key={n.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{n.label}</span>
              <button
                onClick={() => { n.set(!n.value); }}
                className={`w-10 h-6 rounded-full transition-colors relative ${n.value ? 'bg-purple' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${n.value ? 'left-5' : 'left-1'}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('zeka_stats')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-semibold text-gray-900">{profile?.streak_count || 0}</span>
            </div>
            <p className="text-xs text-gray-500">{t('current_streak')}</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-semibold text-gray-900">{profile?.streak_longest || 0}</span>
            <p className="text-xs text-gray-500">{t('longest_streak')}</p>
          </div>
          <div className="text-center">
            <Sparkles className="w-4 h-4 text-purple mx-auto mb-1" />
            <p className="text-xs text-gray-500">Zəka sessiyaları</p>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm text-purple hover:text-purple-dark transition-colors"
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
            <Button onClick={handlePasswordChange} loading={passwordSaving} disabled={newPassword.length < 6}>
              {t('update_password')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
