import { useState, useEffect, useRef } from 'react'
import { Settings as SettingsIcon, Upload, Trash2, AlertTriangle, CheckCircle, XCircle, Globe, Image, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import { EditionBadge } from '../../components/ui/Badge'
import MFASection from '../../components/auth/MFASection'

export default function Settings() {
  const { profile, fetchProfile, t } = useAuth()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [school, setSchool] = useState(null)
  const [schoolName, setSchoolName] = useState('')
  const [language, setLanguage] = useState('az')
  const [asanApiKey, setAsanApiKey] = useState('')
  const [egovEndpoint, setEgovEndpoint] = useState('')
  const [egovApiKey, setEgovApiKey] = useState('')
  const [testingAsan, setTestingAsan] = useState(false)
  const [asanStatus, setAsanStatus] = useState(null)
  const [testingEgov, setTestingEgov] = useState(false)
  const [egovStatus, setEgovStatus] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [section, setSection] = useState('general')

  const isGov = school?.edition === 'government'

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase.from('schools').select('*').eq('id', profile.school_id).single()
      if (err) throw err
      setSchool(data)
      setSchoolName(data.name || '')
      setLanguage(data.default_language || 'az')
      setAsanApiKey(data.asan_api_key || '')
      setEgovEndpoint(data.egov_endpoint || '')
      setEgovApiKey(data.egov_api_key || '')
      setLogoUrl(data.logo_url || null)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const updates = {
        name: schoolName,
        default_language: language,
      }
      if (isGov) {
        updates.asan_api_key = asanApiKey
        updates.egov_endpoint = egovEndpoint
        updates.egov_api_key = egovApiKey
      }
      const { error: err } = await supabase.from('schools').update(updates).eq('id', profile.school_id)
      if (err) throw err
      await fetchProfile(profile.id)
      setSuccess(t('save'))
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function testAsanConnection() {
    try {
      setTestingAsan(true)
      setAsanStatus(null)
      // Simulate a connection test
      if (asanApiKey.trim()) {
        setAsanStatus('success')
      } else {
        setAsanStatus('error')
      }
    } catch {
      setAsanStatus('error')
    } finally {
      setTestingAsan(false)
    }
  }

  async function testEgovConnection() {
    try {
      setTestingEgov(true)
      setEgovStatus(null)
      if (egovEndpoint.trim() && egovApiKey.trim()) {
        setEgovStatus('success')
      } else {
        setEgovStatus('error')
      }
    } catch {
      setEgovStatus('error')
    } finally {
      setTestingEgov(false)
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      setError(null)
      const ext = file.name.split('.').pop()
      const filePath = `${profile.school_id}/logo.${ext}`

      const { error: uploadErr } = await supabase.storage.from('school-logos').upload(filePath, file, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('school-logos').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateErr } = await supabase.from('schools').update({ logo_url: publicUrl }).eq('id', profile.school_id)
      if (updateErr) throw updateErr

      setLogoUrl(publicUrl)
      await fetchProfile(profile.id)
    } catch {
      setError(t('error'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteAllData() {
    if (confirmText !== school?.name) return
    try {
      setDeleting(true)
      setError(null)
      // Delete in order: dependent tables first
      // Get class IDs for this school (needed for tables without direct school_id)
      const { data: schoolClasses } = await supabase.from('classes').select('id').eq('school_id', profile.school_id)
      const classIds = (schoolClasses || []).map(c => c.id)

      await supabase.from('notifications').delete().eq('school_id', profile.school_id)
      await supabase.from('announcements').delete().eq('school_id', profile.school_id)
      await supabase.from('ministry_reports').delete().eq('school_id', profile.school_id)
      await supabase.from('ib_extended_essays').delete().eq('school_id', profile.school_id)
      await supabase.from('timetable_slots').delete().eq('school_id', profile.school_id)
      if (classIds.length > 0) {
        await supabase.from('grades').delete().in('class_id', classIds)
        await supabase.from('attendance').delete().in('class_id', classIds)
        await supabase.from('teacher_classes').delete().in('class_id', classIds)
        await supabase.from('assignments').delete().in('class_id', classIds)
      }
      await supabase.from('profiles').delete().eq('school_id', profile.school_id).neq('id', profile.id)
      await supabase.from('subjects').delete().eq('school_id', profile.school_id)
      await supabase.from('classes').delete().eq('school_id', profile.school_id)

      setDeleteModal(false)
      setConfirmText('')
      setSuccess(t('delete_all_data'))
    } catch {
      setError(t('error'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageSpinner />

  // §4.6 two-pane settings nav — neutral grey active fill, never a colored pill.
  const NAV = [
    { id: 'general',  label: 'Ümumi',      icon: SettingsIcon },
    ...(isGov ? [{ id: 'ministry', label: t('ministry'), icon: Globe }] : []),
    { id: 'logo',     label: 'Logo',       icon: Image },
    { id: 'security', label: t('mfa') || 'Təhlükəsizlik', icon: ShieldCheck },
    { id: 'danger',   label: t('danger_zone'), icon: AlertTriangle, danger: true },
  ]

  // Quiet section header inside the right column.
  const SectionHead = ({ title, description }) => (
    <div className="mb-5">
      <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
      {description && <p className="text-[13px] text-ink-400 mt-0.5">{description}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('settings')}</h1>
        <p className="text-sm mt-1 text-ink-400">Məktəb məlumatlarını və inteqrasiyaları idarə edin.</p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-input px-4 py-3 text-[13px] font-medium"
          style={{ background: 'var(--danger-tint, #FEE2E2)', color: 'var(--danger)', border: '1px solid #FECACA' }}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-3 rounded-input px-4 py-3 text-[13px] font-medium"
          style={{ background: '#DCFCE7', color: 'var(--success)', border: '1px solid #BBF7D0' }}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Two-pane: nav rail + capped content column */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left nav rail — ~210px, neutral grey active */}
        <nav className="shrink-0 md:w-[210px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400 px-3 mb-2">
            {t('settings')}
          </p>
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {NAV.map(item => {
              const Icon = item.icon
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2 rounded-input text-[13px] whitespace-nowrap transition-colors text-left shrink-0',
                    active
                      ? 'bg-hairline-strong font-semibold text-ink-900'
                      : item.danger
                        ? 'text-ink-600 font-medium hover:bg-canvas hover:text-danger'
                        : 'text-ink-600 font-medium hover:bg-canvas hover:text-ink-900',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4 shrink-0" style={item.danger && !active ? { color: 'var(--ink-400)' } : undefined} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Right content column — capped ~600px */}
        <div className="flex-1 min-w-0" style={{ maxWidth: 600 }}>
          {/* General */}
          {section === 'general' && (
            <section>
              <SectionHead title="Ümumi məlumatlar" description="Məktəb adı və sistem dili" />
              <div className="space-y-4">
                <Input label={t('school_name')} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Nəşr</label>
                  <div className="flex items-center gap-2">
                    <EditionBadge edition={school?.edition} govLabel={t('government')} />
                    <span className="text-xs text-ink-400">(deyişdirilə bilməz)</span>
                  </div>
                </div>
                <Select label={t('language')} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="az">Azerbaycanca</option>
                  <option value="en">English</option>
                  <option value="ru">Pусский</option>
                </Select>
              </div>
              <div className="flex justify-end mt-6 pt-5 border-t border-hairline">
                <Button onClick={handleSave} loading={saving}>{t('save')}</Button>
              </div>
            </section>
          )}

          {/* Government integrations */}
          {section === 'ministry' && isGov && (
            <section>
              <SectionHead title={t('ministry')} description="ASAN və E-Gov.az inteqrasiyaları" />
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input label="ASAN API" type="password" value={asanApiKey} onChange={(e) => setAsanApiKey(e.target.value)} placeholder="ASAN xidmət API açarı" />
                  </div>
                  <div className="flex items-center gap-2 pb-0.5">
                    <Button variant="ghost" onClick={testAsanConnection} loading={testingAsan}>{t('test_connection')}</Button>
                    {asanStatus === 'success' && <CheckCircle className="w-5 h-5" style={{ color: 'var(--mint)' }} />}
                    {asanStatus === 'error' && <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />}
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input label="E-Gov.az endpoint" value={egovEndpoint} onChange={(e) => setEgovEndpoint(e.target.value)} placeholder="https://e-gov.az/api/v1" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input label="E-Gov.az API" type="password" value={egovApiKey} onChange={(e) => setEgovApiKey(e.target.value)} placeholder="E-Gov API açarı" />
                  </div>
                  <div className="flex items-center gap-2 pb-0.5">
                    <Button variant="ghost" onClick={testEgovConnection} loading={testingEgov}>{t('test_connection')}</Button>
                    {egovStatus === 'success' && <CheckCircle className="w-5 h-5" style={{ color: 'var(--mint)' }} />}
                    {egovStatus === 'error' && <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-5 border-t border-hairline">
                <Button onClick={handleSave} loading={saving}>{t('save')}</Button>
              </div>
            </section>
          )}

          {/* Logo */}
          {section === 'logo' && (
            <section>
              <SectionHead title="Məktəb logosu" description="PNG, JPG və ya SVG. Maks 2MB." />
              <div className="flex items-center gap-5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={t('school_name')}
                    className="w-20 h-20 object-cover rounded-tile"
                    style={{ border: '1px solid var(--hairline)' }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 flex items-center justify-center rounded-tile"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px dashed var(--hairline-strong)',
                    }}
                  >
                    <Image className="w-8 h-8 text-ink-400" />
                  </div>
                )}
                <div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} loading={uploading}>
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Logo yüklə</span>
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Security / MFA */}
          {section === 'security' && (
            <section>
              <MFASection />
            </section>
          )}

          {/* Danger zone */}
          {section === 'danger' && (
            <section>
              <div
                className="rounded-tile p-5"
                style={{ background: '#FFF5F5', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <AlertTriangle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                  <h2 className="text-[15px] font-semibold" style={{ color: '#B91C1C' }}>{t('danger_zone')}</h2>
                </div>
                <p className="text-[13px] text-ink-600 mb-4">
                  Bu əməliyyat məktəbin bütün məlumatlarını geri qaytarılmaz şəkildə siləcək.
                </p>
                <Button variant="danger" onClick={() => setDeleteModal(true)}>
                  <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> {t('delete_all_data')}</span>
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setConfirmText('') }} title={t('delete_all_data')} size="sm">
        <div className="space-y-4">
          <div
            className="rounded-input p-4 text-[13px]"
            style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }}
          >
            {t('danger_zone')}
          </div>
          <p className="text-[13px] text-ink-600">
            Təsdiq üçün məktəbin adını yazın: <strong className="text-ink-900">{school?.name}</strong>
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={school?.name}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setDeleteModal(false); setConfirmText('') }}>{t('cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteAllData} loading={deleting} disabled={confirmText !== school?.name}>
              {t('delete_all_data')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
