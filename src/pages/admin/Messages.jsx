import { useState, useEffect } from 'react'
import { Send, Bell, Users, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Textarea, Select } from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const AUDIENCE_OPTIONS = [
  { value: 'all_parents', label: 'Bütün valideynlər' },
  { value: 'all_teachers', label: 'Bütün müəllimlər' },
  { value: 'all_students', label: 'Bütün şagirdlər' },
  { value: 'class', label: 'Müəyyən sinif' },
]

/* Audience tag — one calm neutral chip (color restraint: chrome stays grey + brand). */
function AudiencePill({ label }) {
  return <span className="pill-muted">{label}</span>
}

export default function Messages() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', audience: 'all_parents', class_id: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [announcementsRes, classesRes] = await Promise.all([
        supabase.from('announcements').select('*, sender:profiles(full_name)').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
      ])
      setAnnouncements(announcementsRes.data || [])
      setClasses(classesRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!form.title.trim() || !form.body.trim()) return
    if (form.audience === 'class' && !form.class_id) {
      setError('Sinif seçilməlidir')
      return
    }
    try {
      setSending(true)
      setError(null)
      setSuccess(false)

      // Insert announcement
      const { data: announcement, error: annErr } = await supabase.from('announcements').insert({
        school_id: profile.school_id,
        title: form.title,
        body: form.body,
        audience: form.audience === 'class' ? `class:${form.class_id}` : form.audience,
        sender_id: profile.id,
      }).select().single()
      if (annErr) throw annErr

      // Find matching profiles for notifications
      let recipients = []
      if (form.audience === 'class' && form.class_id) {
        // profiles has no class_id — join through class_members
        const { data } = await supabase
          .from('class_members')
          .select('student:profiles!class_members_student_id_fkey(id)')
          .eq('class_id', form.class_id)
        recipients = (data || []).map(r => r.student).filter(Boolean)
      } else {
        let query = supabase.from('profiles').select('id').eq('school_id', profile.school_id)
        if (form.audience === 'all_parents') query = query.eq('role', 'parent')
        else if (form.audience === 'all_teachers') query = query.eq('role', 'teacher')
        else if (form.audience === 'all_students') query = query.eq('role', 'student')
        const { data } = await query
        recipients = data || []
      }
      if (recipients && recipients.length > 0) {
        const notifications = recipients.map(r => ({
          user_id: r.id,
          profile_id: r.id,
          school_id: profile.school_id,
          title: form.title,
          body: form.body,
          type: 'announcement',
        }))
        await supabase.from('notifications').insert(notifications)
      }

      setForm({ title: '', body: '', audience: 'all_parents', class_id: '' })
      setSuccess(true)
      await fetchData()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError(t('error'))
    } finally {
      setSending(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  }

  function audienceLabel(audience) {
    if (audience?.startsWith('class:')) {
      const classId = audience.replace('class:', '')
      const cls = classes.find(c => c.id === classId)
      return cls?.name || t('class_name')
    }
    return AUDIENCE_OPTIONS.find(a => a.value === audience)?.label || audience
  }

  const columns = [
    {
      key: 'title',
      label: t('announcements'),
      render: (val) => <span className="font-semibold text-ink-900">{val}</span>,
    },
    {
      key: 'audience',
      label: t('all'),
      render: (val) => <AudiencePill label={audienceLabel(val)} />,
    },
    {
      key: 'created_at',
      label: t('date'),
      render: (val) => <span className="tabular-nums text-ink-600 text-sm">{formatDate(val)}</span>,
    },
    {
      key: 'sender',
      label: t('full_name'),
      render: (val) => <span className="text-ink-600 text-sm">{val?.full_name || '—'}</span>,
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('announcements')}</h1>
        <p className="text-sm mt-1 text-ink-400">
          Valideynlərə, müəllimlərə və ya şagirdlərə bildiriş göndərin.
        </p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-tile px-4 py-3 text-sm font-medium"
          style={{ background: '#FEE2E2', color: 'var(--danger)', border: '1px solid #FECACA' }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-3 rounded-tile px-4 py-3 text-sm font-medium"
          style={{ background: '#DCFCE7', color: 'var(--success)', border: '1px solid #BBF7D0' }}
        >
          {t('send_announcement')}
        </div>
      )}

      {/* Compose card */}
      <Card hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <span className="icon-chip icon-chip-periwinkle">
            <Bell className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink-900">{t('send_announcement')}</h2>
            <p className="text-xs text-ink-400 mt-0.5">Bildiriş dərhal alıcılara çatdırılacaq.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={t('announcements')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('announcements')}
          />
          <Textarea
            label={t('note')}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder={t('note')}
            rows={5}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={t('all')} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
            {form.audience === 'class' && (
              <Select label={t('class_name')} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                <option value="">{t('class_name')}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSend} loading={sending} disabled={!form.title.trim() || !form.body.trim()}>
              <span className="flex items-center gap-2"><Send className="w-4 h-4" /> {t('send_announcement')}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* History card */}
      <Card hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <span className="icon-chip icon-chip-periwinkle">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink-900">{t('announcements')}</h2>
            <p className="text-xs text-ink-400 mt-0.5">
              <span className="tabular-nums font-semibold text-ink-700">{announcements.length}</span> bildiriş göndərilib
            </p>
          </div>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            tier={1}
            icon={MessageSquare}
            title="Hələ bildiriş göndərilməyib"
            description="Yuxarıdakı forma vasitəsilə ilk bildirişinizi göndərin."
          />
        ) : (
          <div className="p-0 -mx-5 -mb-5 overflow-hidden" style={{ borderRadius: '0 0 14px 14px' }}>
            <Table columns={columns} data={announcements} emptyMessage={t('no_data')} />
          </div>
        )}
      </Card>
    </div>
  )
}
