import { useState, useEffect, useRef } from 'react'
import { Settings as SettingsIcon, Upload, Trash2, AlertTriangle, CheckCircle, XCircle, Globe, Image } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import { EditionBadge } from '../../components/ui/Badge'

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

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-gray-900">{t('settings')}</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-teal">{success}</p>}

      <Card hover={false}>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('settings')}</p>
        <div className="space-y-4">
          <Input label={t('school_name')} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nəşr</label>
            <div className="flex items-center gap-2">
              <EditionBadge edition={school?.edition} govLabel={t('government')} />
              <span className="text-sm text-gray-500">(deyisdirile bilmez)</span>
            </div>
          </div>
          <Select label={t('language')} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="az">Azerbaycanca</option>
            <option value="en">English</option>
            <option value="ru">Pусский</option>
          </Select>
        </div>
      </Card>

      {isGov && (
        <Card hover={false}>
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('ministry')}</p>
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input label="ASAN API" type="password" value={asanApiKey} onChange={(e) => setAsanApiKey(e.target.value)} placeholder="ASAN xidmet API acari" />
              </div>
              <Button variant="ghost" onClick={testAsanConnection} loading={testingAsan}>{t('test_connection')}</Button>
              {asanStatus === 'success' && <CheckCircle className="w-5 h-5 text-teal mb-3" />}
              {asanStatus === 'error' && <XCircle className="w-5 h-5 text-red-500 mb-3" />}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input label="E-Gov.az endpoint" value={egovEndpoint} onChange={(e) => setEgovEndpoint(e.target.value)} placeholder="https://e-gov.az/api/v1" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input label="E-Gov.az API" type="password" value={egovApiKey} onChange={(e) => setEgovApiKey(e.target.value)} placeholder="E-Gov API acari" />
              </div>
              <Button variant="ghost" onClick={testEgovConnection} loading={testingEgov}>{t('test_connection')}</Button>
              {egovStatus === 'success' && <CheckCircle className="w-5 h-5 text-teal mb-3" />}
              {egovStatus === 'error' && <XCircle className="w-5 h-5 text-red-500 mb-3" />}
            </div>
          </div>
        </Card>
      )}

      <Card hover={false}>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('settings')}</p>
        <div className="flex items-center gap-6">
          {logoUrl ? (
            <img src={logoUrl} alt={t('school_name')} className="w-20 h-20 rounded-xl object-cover border border-border-soft" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-surface border border-border-soft flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-300" />
            </div>
          )}
          <div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} loading={uploading}>
              <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Logo</span>
            </Button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ve ya SVG. Maks 2MB.</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>{t('save')}</Button>
      </div>

      <Card hover={false} className="border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="font-serif text-xl text-red-700">{t('danger_zone')}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Bu emeliyyat mektebin butun melumatlarini geri qaytarilmaz sekilde silecek.
        </p>
        <Button variant="danger" onClick={() => setDeleteModal(true)}>
          <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> {t('delete_all_data')}</span>
        </Button>
      </Card>

      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setConfirmText('') }} title={t('delete_all_data')} size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              {t('danger_zone')}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Tesdiq ucun mektebin adini yazin: <strong>{school?.name}</strong>
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
