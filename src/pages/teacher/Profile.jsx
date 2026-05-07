import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'
import { EditionBadge } from '../../components/ui/Badge'
import { Lock, Check, AlertCircle, BookOpen, Users } from 'lucide-react'

const colors = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde', '#c89ed4', '#d68a5a', '#f0b870', '#5db8a3']

export default function TeacherProfile() {
  const { profile, updateProfile, t } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [language, setLanguage] = useState(profile?.language || 'az')
  const [notifyMessage, setNotifyMessage] = useState(profile?.notify_message ?? true)
  const [notifyAssignment, setNotifyAssignment] = useState(profile?.notify_assignment ?? true)
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#7c6ee0')
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
      {savedToast && (
        <div className="fixed top-6 right-6 toast-success px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 z-50">
          <Check className="w-4 h-4" /> Profil yadda saxlandı
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
        <span className="pastel-text">{t('profile')}</span>
      </h1>

      {/* Profile card */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-6 mb-6 flex-wrap">
          <Avatar name={fullName} color={avatarColor} size="xl" />
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{fullName}</h2>
            <p className="text-sm" style={{ color: '#64748b' }}>{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <EditionBadge edition={profile?.edition} govLabel={t('government')} />
              <span className="pastel-badge pastel-badge-periwinkle">Müəllim</span>
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>Avatar rəngi</p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              className="w-8 h-8 rounded-full smooth-trans"
              style={{
                backgroundColor: c,
                outline: avatarColor === c ? '3px solid rgba(255,255,255,0.9)' : 'none',
                boxShadow: avatarColor === c
                  ? '0 0 0 2px ' + c + ', 0 4px 12px ' + c + '40'
                  : '0 2px 6px rgba(0,0,0,0.06)',
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('full_name')}</label>
            <input className="pastel-input" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('language')}</label>
            <div className="flex gap-2 flex-wrap">
              {[{ v: 'az', l: 'Azərbaycanca' }, { v: 'en', l: 'English' }, { v: 'ru', l: 'Russkiy' }].map(lng => (
                <button
                  key={lng.v}
                  onClick={() => setLanguage(lng.v)}
                  className={language === lng.v ? 'pastel-tab active' : 'pastel-tab'}
                  style={{ borderRadius: 12 }}
                >
                  {lng.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-pastel mt-6"
          style={{ padding: '12px 24px', fontSize: 14, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Yadda saxlanır...' : t('save')}
        </button>
      </div>

      {/* Subjects */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-chip icon-chip-mint" style={{ width: 32, height: 32, borderRadius: 10 }}>
            <BookOpen className="w-4 h-4" />
          </span>
          <h3 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>{t('subject')}</h3>
        </div>
        {uniqueSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map(s => (
              <span key={s} className="pastel-badge pastel-badge-mint" style={{ padding: '6px 14px', fontSize: 13 }}>{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#94a3b8' }}>Hələ fənn təyin olunmayıb</p>
        )}
      </div>

      {/* Classes */}
      <div className="liquid-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-chip icon-chip-blue" style={{ width: 32, height: 32, borderRadius: 10 }}>
            <Users className="w-4 h-4" />
          </span>
          <h3 className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#64748b' }}>{t('class_name')}</h3>
        </div>
        {uniqueClasses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uniqueClasses.map(c => (
              <span key={c} className="pastel-badge pastel-badge-blue" style={{ padding: '6px 14px', fontSize: 13 }}>{c}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#94a3b8' }}>Hələ sinif təyin olunmayıb</p>
        )}
      </div>

      {/* Notifications */}
      <div className="liquid-card p-6">
        <h3 className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: '#64748b' }}>{t('notification_settings')}</h3>
        <div className="space-y-3">
          {[
            { label: t('teacher_message_notif'), value: notifyMessage, set: setNotifyMessage },
            { label: t('assignment_notif'), value: notifyAssignment, set: setNotifyAssignment },
          ].map(n => (
            <label key={n.label} className="flex items-center justify-between cursor-pointer smooth-trans"
              style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.4)' }}
            >
              <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{n.label}</span>
              <button
                onClick={() => n.set(!n.value)}
                className="relative smooth-trans"
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  background: n.value ? 'linear-gradient(135deg, #7c6ee0, #5db8a3)' : 'rgba(124,110,224,0.18)',
                  boxShadow: n.value ? '0 4px 12px rgba(124,110,224,0.25)' : 'none',
                }}
              >
                <span
                  className="absolute top-1 smooth-trans"
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

      {/* Password change */}
      <div className="liquid-card p-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-semibold smooth-trans hover:opacity-70"
          style={{ color: '#7c6ee0' }}
        >
          <Lock className="w-4 h-4" />
          {t('change_password')}
        </button>
        {showPassword && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('new_password')}</label>
              <input
                type="password"
                className="pastel-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 simvol"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('confirm_password') || 'Şifrəni təsdiqlə'}</label>
              <input
                type="password"
                className="pastel-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Şifrəni təkrar daxil edin"
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#b83b54' }}>
                <AlertCircle className="w-4 h-4" /> {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#3d8a73' }}>
                <Check className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving || newPassword.length < 6}
              className="btn-pastel"
              style={{ padding: '10px 22px', fontSize: 13, opacity: (passwordSaving || newPassword.length < 6) ? 0.5 : 1 }}
            >
              {passwordSaving ? '...' : t('update_password')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
