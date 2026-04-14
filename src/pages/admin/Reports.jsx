import { useState, useEffect } from 'react'
import { FileText, Download, Send, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

export default function Reports() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('class')
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState(null)

  const isGov = profile?.school?.edition === 'government'

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [classesRes, submissionsRes] = await Promise.all([
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('ministry_reports').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
      ])
      setClasses(classesRes.data || [])
      setSubmissions(submissionsRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function generatePreview() {
    try {
      setPreviewing(true)
      setError(null)
      setPreviewData(null)

      let rows = []

      if (reportType === 'student') {
        // ── Grades-based report ──────────────────────────────────────────
        let gradeQuery = supabase
          .from('grades')
          .select('student_id, student:profiles(full_name), subject:subjects(name), score, max_score, criterion, created_at')
          .order('created_at', { ascending: false })
          .limit(300)

        if (selectedClass) {
          const { data: members } = await supabase
            .from('class_members').select('student_id').eq('class_id', selectedClass)
          const ids = (members || []).map(m => m.student_id)
          if (ids.length === 0) { setPreviewData([]); return }
          gradeQuery = gradeQuery.in('student_id', ids)
        } else {
          // Limit to school's students
          const { data: schoolStudents } = await supabase
            .from('profiles').select('id').eq('school_id', profile.school_id).eq('role', 'student')
          const ids = (schoolStudents || []).map(s => s.id)
          if (ids.length === 0) { setPreviewData([]); return }
          gradeQuery = gradeQuery.in('student_id', ids)
        }

        if (dateFrom) gradeQuery = gradeQuery.gte('created_at', dateFrom)
        if (dateTo) gradeQuery = gradeQuery.lte('created_at', dateTo + 'T23:59:59')

        const { data, error: err } = await gradeQuery
        if (err) throw err

        rows = (data || []).map(g => ({
          ad_soyad: g.student?.full_name || '—',
          fənn: g.subject?.name || '—',
          qiymət: g.score ?? '—',
          maks: g.max_score ?? '—',
          tarix: g.created_at ? formatDate(g.created_at) : '—',
        }))

      } else {
        // ── Student-based report (class / attendance / ministry) ─────────
        // Step 1: resolve school class IDs
        const { data: schoolClasses } = await supabase
          .from('classes').select('id').eq('school_id', profile.school_id)
        const schoolClassIds = (schoolClasses || []).map(c => c.id)
        if (schoolClassIds.length === 0) { setPreviewData([]); return }

        // Step 2: get class memberships
        let memberQuery = supabase
          .from('class_members')
          .select('student_id, class_id, class:classes(id, name)')
          .in('class_id', schoolClassIds)
        if (selectedClass) memberQuery = memberQuery.eq('class_id', selectedClass)

        const { data: members, error: memErr } = await memberQuery
        if (memErr) throw memErr

        // Build class name map and unique student ID list
        const classMap = {}
        const studentIdSet = new Set()
        ;(members || []).forEach(m => {
          if (m.student_id) {
            studentIdSet.add(m.student_id)
            if (m.class) classMap[m.student_id] = m.class.name
          }
        })
        const studentIds = [...studentIdSet]
        if (studentIds.length === 0) { setPreviewData([]); return }

        // Step 3: fetch student profiles
        const { data: students, error: stuErr } = await supabase
          .from('profiles').select('id, full_name, email')
          .in('id', studentIds).order('full_name')
        if (stuErr) throw stuErr

        if (reportType === 'attendance') {
          // Step 4a: attendance stats
          let attQuery = supabase
            .from('attendance').select('student_id, status')
            .in('student_id', studentIds)
          if (dateFrom) attQuery = attQuery.gte('date', dateFrom)
          if (dateTo) attQuery = attQuery.lte('date', dateTo)
          const { data: att } = await attQuery

          const attMap = {}
          ;(att || []).forEach(a => {
            if (!attMap[a.student_id]) attMap[a.student_id] = { total: 0, present: 0 }
            attMap[a.student_id].total++
            if (a.status === 'present') attMap[a.student_id].present++
          })

          rows = (students || []).map(s => ({
            ad_soyad: s.full_name,
            email: s.email,
            sinif: classMap[s.id] || '—',
            iştirak: attMap[s.id]?.total > 0
              ? `${Math.round((attMap[s.id].present / attMap[s.id].total) * 100)}%`
              : '—',
            ümumi_gün: attMap[s.id]?.total ?? 0,
          }))
        } else {
          // Step 4b: grade averages (class / ministry)
          const { data: grades } = await supabase
            .from('grades').select('student_id, score, max_score')
            .in('student_id', studentIds)

          const gradeMap = {}
          ;(grades || []).forEach(g => {
            if (!gradeMap[g.student_id]) gradeMap[g.student_id] = { sum: 0, count: 0 }
            if (g.score != null && g.max_score > 0) {
              gradeMap[g.student_id].sum += (g.score / g.max_score) * 100
              gradeMap[g.student_id].count++
            }
          })

          rows = (students || []).map(s => ({
            ad_soyad: s.full_name,
            email: s.email,
            sinif: classMap[s.id] || '—',
            orta_qiymət: gradeMap[s.id]?.count > 0
              ? `${(gradeMap[s.id].sum / gradeMap[s.id].count).toFixed(1)}%`
              : '—',
          }))
        }
      }

      setPreviewData(rows)
    } catch (err) {
      console.error('generatePreview error:', err)
      setError(t('error'))
    } finally {
      setPreviewing(false)
    }
  }

  function handleDownloadPdf() {
    window.print()
  }

  async function handleEgovSubmit() {
    try {
      setSubmitting(true)
      setError(null)
      const { error: err } = await supabase.from('ministry_reports').insert({
        school_id: profile.school_id,
        report_type: reportType,
        status: 'submitted',
        data: previewData,
        submitted_by: profile.id,
        submitted_at: new Date().toISOString(),
      })
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

  const reportTypes = [
    { value: 'class', label: t('class_report') },
    { value: 'student', label: t('student_report') },
    { value: 'attendance', label: t('attendance_report') },
    { value: 'ministry', label: t('ministry_report') },
  ]

  const statusLabels = {
    draft: 'Qaralama',
    submitted: 'Göndərildi',
    accepted: 'Qəbul edildi',
    rejected: 'Rədd edildi',
  }

  const statusVariants = {
    draft: 'late',
    submitted: 'default',
    accepted: 'present',
    rejected: 'absent',
  }

  const submissionColumns = [
    { key: 'report_type', label: t('reports'), render: (val) => reportTypes.find(r => r.value === val)?.label || val },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge> },
    { key: 'submitted_at', label: t('date'), render: (val) => formatDate(val) },
    { key: 'egov_reference', label: 'E-Gov istinad', render: (val) => val || '—' },
    { key: 'error_log', label: t('error'), render: (val) => val ? <span className="text-red-600 text-xs">{val}</span> : '—' },
  ]

  // Build preview table columns dynamically from first row keys
  const previewColumns = previewData && previewData.length > 0
    ? Object.keys(previewData[0]).map(key => ({
        key,
        label: key.replace(/_/g, ' '),
        render: (val) => val ?? '—',
      }))
    : []

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-gray-900">{t('reports')}</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false}>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('reports')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label={t('reports')} value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {reportTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Select label={t('class_name')} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">{t('all')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label={`${t('date')} (başlanğıc)`} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label={`${t('date')} (son)`} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={generatePreview} loading={previewing}>
            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {t('reports')}</span>
          </Button>
        </div>
      </Card>

      {previewData && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs tracking-widest text-gray-400 uppercase">
              {t('reports')} ({previewData.length} {t('students')})
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleDownloadPdf}>
                <span className="flex items-center gap-2"><Download className="w-4 h-4" /> {t('download_pdf')}</span>
              </Button>
              {isGov && (
                <Button variant="teal" onClick={handleEgovSubmit} loading={submitting}>
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> {t('submit_egov')}</span>
                </Button>
              )}
            </div>
          </div>
          {previewData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('no_data')}</p>
          ) : (
            <div id="report-preview" className="overflow-x-auto">
              <Table columns={previewColumns} data={previewData} />
            </div>
          )}
        </Card>
      )}

      {submissions.length > 0 && (
        <Card hover={false}>
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('reports')}</p>
          <Table columns={submissionColumns} data={submissions} />
        </Card>
      )}
    </div>
  )
}
