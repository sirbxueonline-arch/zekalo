import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { Lock, LogOut, Users } from 'lucide-react'

const colors = ['#534AB7', '#1D9E75', '#EF9F27', '#E74C3C', '#3498DB', '#8E44AD', '#E67E22', '#2ECC71']

export default function ParentProfile() {
  const { profile, updateProfile, signOut, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#534AB7')
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
    <div className="max-w-2xl space-y-6">
      <Card hover={false}>
        <div className="flex items-center gap-6 mb-6">
          <Avatar name={fullName} color={avatarColor} size="xl" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
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
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('student')}</h3>
        {children.length === 0 ? (
          <p className="text-sm text-gray-400">Bağlı uşaq yoxdur</p>
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-3 py-2 border-b border-border-soft last:border-0">
                <Users className="w-5 h-5 text-purple flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{child.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {child.school?.name && <span className="text-xs text-gray-500">{child.school.name}</span>}
                    {child.className && (
                      <>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-500">{child.className}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hover={false}>
        <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('notification_settings')}</h3>
        <div className="space-y-3">
          {[
            { label: t('new_grade_notif'), value: notifyGrade, set: setNotifyGrade },
            { label: t('absence_notif'), value: notifyAbsence, set: setNotifyAbsence },
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label key={n.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{n.label}</span>
              <button
                onClick={() => n.set(!n.value)}
                className={`w-10 h-6 rounded-full transition-colors relative ${n.value ? 'bg-purple' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${n.value ? 'left-5' : 'left-1'}`} />
              </button>
            </label>
          ))}
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
            <Input
              label={t('confirm_password') || 'Şifrəni təsdiqlə'}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Şifrəni təkrar daxil edin"
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">{passwordSuccess}</p>
            )}
            <Button onClick={handlePasswordChange} loading={passwordSaving} disabled={newPassword.length < 6}>
              {t('update_password')}
            </Button>
          </div>
        )}
      </Card>

      <Card hover={false}>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('sign_out')}
        </button>
      </Card>
    </div>
  )
}
