import { useState, useEffect } from 'react'
import { Building2, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

export default function Ministry() {
  const { profile, t } = useAuth()

  if (profile?.school?.edition !== 'government') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          tier={1}
          icon={Building2}
          title={t('ministry')}
          description="Bu bölmə yalnız dövlət məktəbləri üçündür."
        />
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
        supabase.from('ministry_reports').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(500),
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
    submitted: 'Göndərildi',
    accepted: 'Qəbul edildi',
    rejected: 'Rədd edildi',
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
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge>,
    },
    { key: 'created_at', label: t('date'), render: (val) => formatDate(val) },
  ]

  const historyColumns = [
    { key: 'created_at', label: t('date'), render: (val) => formatDate(val) },
    { key: 'report_type', label: t('reports'), render: (val) => val || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge>,
    },
    { key: 'egov_reference', label: 'E-Gov istinad', render: (val) => val || '—' },
    {
      key: 'error_log',
      label: t('error'),
      render: (val) => val
        ? <span className="text-danger text-[12px] font-medium max-w-[200px] truncate block">{val}</span>
        : '—',
    },
  ]

  if (loading) return <PageSpinner />

  const draftCount = pendingReports.filter(r => r.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[22px] text-ink-900 leading-snug">
            {t('ministry')}
          </h1>
          <p className="text-[13px] text-ink-400 mt-0.5">
            E-Gov.az inteqrasiyası
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-tile border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger font-medium">
          {error}
        </div>
      )}

      {/* ── Connection status banner ── */}
      <div className="liquid-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`icon-chip ${connected ? 'icon-chip-mint' : 'icon-chip-coral'}`}
              style={{ width: 36, height: 36 }}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink-900">
                E-Gov.az {t('test_connection')}
              </p>
              <p className="text-[12px] text-ink-400 mt-0.5">
                {connected ? 'API açarı konfiqurasiya edilib' : 'API açarı tapılmadı'}
              </p>
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-success/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-[13px] font-semibold text-success">Qoşulub</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-danger/10">
              <XCircle className="w-4 h-4 text-danger" />
              <span className="text-[13px] font-semibold text-danger">Qoşulmayıb</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Pending / draft reports ── */}
      <div className="liquid-card overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36 }}>
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-[15px] text-ink-900">{t('reports')}</h2>
            {draftCount > 0 && (
              <Badge variant="late">{draftCount} qaralama</Badge>
            )}
          </div>
          {draftCount > 0 && (
            <Button variant="primary" size="sm" onClick={handleBulkSubmit} loading={submitting}>
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {t('submit_egov')}
              </span>
            </Button>
          )}
        </div>
        {pendingReports.length === 0 ? (
          <EmptyState
            tier={1}
            icon={Clock}
            title={t('no_data')}
            description="Gözləyən hesabat yoxdur."
            className="border-none shadow-none"
          />
        ) : (
          <Table columns={pendingColumns} data={pendingReports} emptyMessage={t('no_data')} />
        )}
      </div>

      {/* ── Full history ── */}
      <div className="liquid-card overflow-hidden p-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-hairline">
          <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36 }}>
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-[15px] text-ink-900">{t('reports')}</h2>
          <span className="text-[12px] text-ink-400 ml-auto tabular-nums">
            {historyReports.length} qeyd
          </span>
        </div>
        {historyReports.length === 0 ? (
          <EmptyState
            tier={1}
            icon={Building2}
            title={t('no_data')}
            description="Hesabat tarixi hələ boşdur."
            className="border-none shadow-none"
          />
        ) : (
          <Table columns={historyColumns} data={historyReports} emptyMessage={t('no_data')} />
        )}
      </div>
    </div>
  )
}
