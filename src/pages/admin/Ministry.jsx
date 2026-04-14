import { useState, useEffect } from 'react'
import { Building2, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function Ministry() {
  const { profile, t } = useAuth()

  if (profile?.school?.edition !== 'government') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Building2 className="w-12 h-12 text-purple-mid mb-4" />
        <h2 className="font-serif text-2xl text-gray-900 mb-2">{t('ministry')}</h2>
        <p className="text-sm text-gray-500">Bu bolma yalniz dovlet maktablari ucundur</p>
      </div>
    )
  }

  return <MinistryContent />
}

function MinistryContent() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [pendingReports, setPendingReports] = useState([])
  const [historyReports, setHistoryReports] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const [schoolRes, pendingRes, historyRes] = await Promise.all([
        supabase.from('schools').select('egov_api_key, egov_endpoint').eq('id', profile.school_id).single(),
        supabase.from('ministry_reports').select('*').eq('school_id', profile.school_id).in('status', ['draft', 'submitted']).order('created_at', { ascending: false }),
        supabase.from('ministry_reports').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
      ])

      setConnected(!!(schoolRes.data?.egov_api_key && schoolRes.data?.egov_endpoint))
      setPendingReports(pendingRes.data || [])
      setHistoryReports(historyRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkSubmit() {
    try {
      setSubmitting(true)
      setError(null)
      const draftIds = pendingReports.filter(r => r.status === 'draft').map(r => r.id)
      if (draftIds.length === 0) return

      const { error: err } = await supabase.from('ministry_reports').update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submitted_by: profile.id,
      }).in('id', draftIds)
      if (err) throw err

      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  }

  const statusLabels = {
    draft: 'Qaralama',
    submitted: 'Gonderildi',
    accepted: 'Qebul edildi',
    rejected: 'Redd edildi',
    error: t('error'),
  }
  const statusVariants = {
    draft: 'late',
    submitted: 'default',
    accepted: 'present',
    rejected: 'absent',
    error: 'absent',
  }

  const pendingColumns = [
    { key: 'report_type', label: t('reports'), render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge> },
    { key: 'created_at', label: t('date'), render: (val) => formatDate(val) },
  ]

  const historyColumns = [
    { key: 'created_at', label: t('date'), render: (val) => formatDate(val) },
    { key: 'report_type', label: t('reports'), render: (val) => val || '—' },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge> },
    { key: 'egov_reference', label: 'E-Gov istinad', render: (val) => val || '—' },
    {
      key: 'error_log',
      label: t('error'),
      render: (val) => val ? <span className="text-red-600 text-xs max-w-[200px] truncate block">{val}</span> : '—',
    },
  ]

  if (loading) return <PageSpinner />

  const draftCount = pendingReports.filter(r => r.status === 'draft').length

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-gray-900">{t('ministry')}</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">E-Gov.az {t('test_connection')}</span>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal" />
              <span className="text-sm font-medium text-teal">Qosulub</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Qosulmayib</span>
            </div>
          )}
        </div>
      </Card>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-mid" />
            <h2 className="font-serif text-xl text-gray-900">{t('reports')}</h2>
            {draftCount > 0 && <Badge variant="late">{draftCount} qaralama</Badge>}
          </div>
          {draftCount > 0 && (
            <Button variant="teal" onClick={handleBulkSubmit} loading={submitting}>
              <span className="flex items-center gap-2"><Send className="w-4 h-4" /> {t('submit_egov')}</span>
            </Button>
          )}
        </div>
        <Table columns={pendingColumns} data={pendingReports} emptyMessage={t('no_data')} />
      </Card>

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">{t('reports')}</h2>
        </div>
        <Table columns={historyColumns} data={historyReports} emptyMessage={t('no_data')} />
      </Card>
    </div>
  )
}
