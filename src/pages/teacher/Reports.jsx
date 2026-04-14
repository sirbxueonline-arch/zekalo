import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { FileText, Download, Send, Printer } from 'lucide-react'

const reportTypeKeys = [
  { value: 'class', labelKey: 'class_report' },
  { value: 'student', labelKey: 'student_report' },
  { value: 'attendance', labelKey: 'attendance_report' },
  { value: 'ministry', labelKey: 'ministry_report' },
]

export default function TeacherReports() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('class')
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportData, setReportData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ministryReports, setMinistryReports] = useState([])
  const previewRef = useRef(null)

  const isGovernment = profile?.school?.edition === 'government'

  useEffect(() => {
    if (!profile) return
    loadInitial()
  }, [profile])

  async function loadInitial() {
    const [tcRes, mrRes] = await Promise.all([
      supabase.from('teacher_classes').select('*, class:classes(id, name)').eq('teacher_id', profile.id),
      supabase.from('ministry_reports').select('*').eq('submitted_by', profile.id).order('created_at', { ascending: false }),
    ])

    const unique = [...new Map((tcRes.data || []).map(tc => [tc.class_id, tc.class])).values()]
    setTeacherClasses(unique)
    if (unique.length) setSelectedClass(unique[0].id)
    setMinistryReports(mrRes.data || [])

    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setMonth(today.getMonth() - 1)
    setDateFrom(monthAgo.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])

    setLoading(false)
  }

  async function generateReport() {
    if (!selectedClass) return
    setGenerating(true)
    setReportData(null)

    try {
      if (reportType === 'class' || reportType === 'student') {
        const [studentsRes, gradesRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('grades').select('*, subject:subjects(name)').eq('class_id', selectedClass)
            .gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const grades = gradesRes.data || []

        const studentData = students.map(s => {
          const sGrades = grades.filter(g => g.student_id === s.id)
          const avg = sGrades.length
            ? Math.round((sGrades.reduce((sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0) / sGrades.length) * 10) / 10
            : null
          return { ...s, grades: sGrades, avg }
        })

        setReportData({ type: reportType, students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      } else if (reportType === 'attendance') {
        const [studentsRes, attRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('attendance').select('*').eq('class_id', selectedClass)
            .gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const attendance = attRes.data || []

        const studentData = students.map(s => {
          const sAtt = attendance.filter(a => a.student_id === s.id)
          const present = sAtt.filter(a => a.status === 'present').length
          const late = sAtt.filter(a => a.status === 'late').length
          const absent = sAtt.filter(a => a.status === 'absent').length
          const pct = sAtt.length ? Math.round((present / sAtt.length) * 100) : 0
          return { ...s, present, late, absent, total: sAtt.length, pct }
        })

        setReportData({ type: 'attendance', students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      } else if (reportType === 'ministry') {
        const [studentsRes, gradesRes, attRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('grades').select('*').eq('class_id', selectedClass).gte('date', dateFrom).lte('date', dateTo),
          supabase.from('attendance').select('*').eq('class_id', selectedClass).gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const grades = gradesRes.data || []
        const attendance = attRes.data || []

        const studentData = students.map(s => {
          const sGrades = grades.filter(g => g.student_id === s.id)
          const avg = sGrades.length
            ? Math.round((sGrades.reduce((sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0) / sGrades.length) * 10) / 10
            : null
          const sAtt = attendance.filter(a => a.student_id === s.id)
          const present = sAtt.filter(a => a.status === 'present').length
          const pct = sAtt.length ? Math.round((present / sAtt.length) * 100) : 0
          return { ...s, avg, attendancePct: pct }
        })

        setReportData({ type: 'ministry', students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      }
    } catch {
      setReportData(null)
    }
    setGenerating(false)
  }

  function handlePrint() {
    if (!previewRef.current) return
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>${t('reports')}</title>
      <style>body{font-family:serif;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5}</style>
      </head><body>${previewRef.current.innerHTML}</body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  async function handleMinistrySubmit() {
    if (!reportData || reportType !== 'ministry') return
    setSubmitting(true)
    const { data, error } = await supabase.from('ministry_reports').insert({
      school_id: profile.school_id,
      submitted_by: profile.id,
      class_id: selectedClass,
      report_type: 'class_summary',
      data: reportData,
      date_from: dateFrom,
      date_to: dateTo,
      status: 'submitted',
    }).select().single()

    if (!error && data) {
      setMinistryReports(prev => [data, ...prev])
    }
    setSubmitting(false)
  }

  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  const ministryColumns = [
    { key: 'created_at', label: t('date'), render: (v) => formatDate(v) },
    { key: 'report_type', label: t('reports') },
    { key: 'date_from', label: t('date'), render: (_, row) => `${formatDate(row.date_from)} - ${formatDate(row.date_to)}` },
    { key: 'status', label: t('actions'), render: (v) => <Badge variant={v === 'submitted' ? 'good' : v === 'approved' ? 'excellent' : 'default'}>{v}</Badge> },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('reports')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select label={t('reports')} value={reportType} onChange={e => setReportType(e.target.value)}>
          {reportTypeKeys.map(rt => (
            <option key={rt.value} value={rt.value}>{t(rt.labelKey)}</option>
          ))}
        </Select>
        <Select label={t('class_name')} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {teacherClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('date')}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('date')}</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={generateReport} loading={generating}>{t('reports')}</Button>
        {reportData && (
          <>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              {t('print')}
            </Button>
            {reportType === 'ministry' && isGovernment && (
              <Button variant="teal" onClick={handleMinistrySubmit} loading={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {t('submit_egov')}
              </Button>
            )}
          </>
        )}
      </div>

      {reportData && (
        <Card hover={false}>
          <div ref={previewRef}>
            <h2 className="font-serif text-2xl text-gray-900 mb-1">{reportData.className}</h2>
            <p className="text-sm text-gray-500 mb-6">{formatDate(dateFrom)} - {formatDate(dateTo)}</p>

            {(reportData.type === 'class' || reportData.type === 'student') && (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('full_name')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('grades')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('avg_grade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id} className="border-b border-border-soft">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.full_name}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{s.grades.length}</td>
                      <td className="px-6 py-4 text-sm text-center">{s.avg != null ? String(s.avg).replace('.', ',') : '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportData.type === 'attendance' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('full_name')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('present')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('late')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('absent')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id} className="border-b border-border-soft">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.full_name}</td>
                      <td className="px-6 py-4 text-sm text-center text-teal">{s.present}</td>
                      <td className="px-6 py-4 text-sm text-center text-amber-600">{s.late}</td>
                      <td className="px-6 py-4 text-sm text-center text-red-600">{s.absent}</td>
                      <td className="px-6 py-4 text-sm text-center font-medium">{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportData.type === 'ministry' && (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('full_name')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('avg_grade')}</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('attendance_pct')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id} className="border-b border-border-soft">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.full_name}</td>
                      <td className="px-6 py-4 text-sm text-center">{s.avg != null ? String(s.avg).replace('.', ',') : '\u2014'}</td>
                      <td className="px-6 py-4 text-sm text-center">{s.attendancePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {!reportData && !generating && (
        <EmptyState icon={FileText} title={t('reports')} description={t('no_data')} />
      )}

      {ministryReports.length > 0 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('ministry_report')}</h2>
          <Table columns={ministryColumns} data={ministryReports} />
        </Card>
      )}
    </div>
  )
}
