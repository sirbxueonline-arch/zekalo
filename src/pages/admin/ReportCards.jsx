// NOTE: For PDF generation, install: npm install jspdf jspdf-autotable
// If the library is not installed, a print-window fallback is used automatically.
import { useState, useEffect, useRef } from 'react'
import { Download, FileText, Eye, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import { fmtLong } from '../../lib/dateUtils'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'


function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Grade label based on 0-100 score
function gradeLabel(score) {
  if (score == null) return '—'
  if (score >= 90) return 'Əla'
  if (score >= 70) return 'Yaxşı'
  if (score >= 50) return 'Kafi'
  return 'Zəif'
}

function gradeBadgeVariant(score) {
  if (score == null) return 'default'
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'late'
  return 'absent'
}

// Period date ranges
const PERIODS = [
  { value: 'sem1', label: 'I Yarımil', from: '-09-01', to: '-01-31' },
  { value: 'sem2', label: 'II Yarımil', from: '-02-01', to: '-06-30' },
  { value: 'year', label: 'Tam İl', from: '-09-01', to: '-06-30' },
]

function getPeriodRange(periodValue) {
  const year = new Date().getFullYear()
  if (periodValue === 'sem1') {
    return { from: `${year - 1}-09-01`, to: `${year}-01-31`, label: `${year - 1}–${year} I Yarımil` }
  }
  if (periodValue === 'sem2') {
    return { from: `${year}-02-01`, to: `${year}-06-30`, label: `${year - 1}–${year} II Yarımil` }
  }
  // full year
  return { from: `${year - 1}-09-01`, to: `${year}-06-30`, label: `${year - 1}–${year} Tam İl` }
}

// Try to load jsPDF — fallback gracefully if not installed
async function tryLoadJsPDF() {
  try {
    const [{ default: jsPDF }, _autotable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    return jsPDF
  } catch {
    return null
  }
}

// HTML fallback for environments without jsPDF
function printFallback({ schoolName, student, cls, period, gradeRows, attendancePct, generatedDate }) {
  const rows = gradeRows
    .map(
      r => `<tr>
        <td style="padding:8px 12px;border:1px solid #ddd;">${escapeHtml(r.subject)}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${r.score != null ? r.score.toFixed(1) : '—'}</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${escapeHtml(gradeLabel(r.score))}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="az">
<head>
  <meta charset="UTF-8"/>
  <title>Şagird Şəhadətnaməsi</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #222; }
    .header { background: #534AB7; color: white; padding: 24px 32px; border-radius: 8px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 4px; font-size: 22px; }
    .header p { margin: 0; font-size: 13px; opacity: 0.85; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-box { background: #f5f4fe; border-radius: 8px; padding: 14px 18px; }
    .info-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
    .info-box .value { font-size: 15px; font-weight: 600; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #534AB7; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    tr:nth-child(even) td { background: #f9f8ff; }
    .attendance-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px 20px; display: inline-block; margin-bottom: 24px; }
    .footer { font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
<div class="header">
  <h1>${escapeHtml(schoolName)}</h1>
  <p>Şagird Şəhadətnaməsi</p>
</div>

<div class="info-grid">
  <div class="info-box"><div class="label">Şagird</div><div class="value">${escapeHtml(student.full_name)}</div></div>
  <div class="info-box"><div class="label">Sinif</div><div class="value">${escapeHtml(cls || '—')}</div></div>
  <div class="info-box"><div class="label">Dövr</div><div class="value">${escapeHtml(period)}</div></div>
</div>

<table>
  <thead>
    <tr>
      <th>Fənn</th>
      <th style="text-align:center;">Bal</th>
      <th style="text-align:center;">Qiymət</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="attendance-box">
  <strong>Davamiyyət:</strong> ${escapeHtml(String(attendancePct))}%
</div>

<div class="footer">Yaradılma tarixi: ${escapeHtml(generatedDate)}</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Pop-up bloklandı. Brauzerin pop-up icazəsini yoxlayın.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

export default function ReportCards() {
  const { profile } = useAuth()
  const previewRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [studentClassMap, setStudentClassMap] = useState({}) // student_id -> class name

  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('year')

  const [previewData, setPreviewData] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [schoolName, setSchoolName] = useState('')

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [studentsRes, classesRes, schoolRes, membersRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('school_id', profile.school_id)
          .eq('role', 'student')
          .order('full_name')
          .limit(500),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('schools').select('name').eq('id', profile.school_id).single(),
        supabase
          .from('class_members')
          .select('student_id, class:classes(id, name)')
          .in(
            'class_id',
            (
              await supabase
                .from('classes')
                .select('id')
                .eq('school_id', profile.school_id)
                .limit(50)
            ).data?.map(c => c.id) || []
          )
          .limit(500),
      ])

      setStudents(studentsRes.data || [])
      setClasses(classesRes.data || [])
      setSchoolName(schoolRes.data?.name || 'Məktəb')

      const sMap = {}
      ;(membersRes.data || []).forEach(m => {
        if (m.student_id && m.class?.name) {
          sMap[m.student_id] = m.class.name
        }
      })
      setStudentClassMap(sMap)

      if (studentsRes.data?.length) setSelectedStudent(studentsRes.data[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function generatePreview() {
    if (!selectedStudent) return
    try {
      setPreviewing(true)
      setPreviewData(null)

      const { from, to, label } = getPeriodRange(selectedPeriod)

      const [gradesRes, attendanceRes] = await Promise.all([
        supabase
          .from('grades')
          .select('score, max_score, subject:subjects(id, name), date')
          .eq('student_id', selectedStudent)
          .gte('date', from)
          .lte('date', to)
          .limit(1000),
        supabase
          .from('attendance')
          .select('status')
          .eq('student_id', selectedStudent)
          .gte('date', from)
          .lte('date', to)
          .limit(1000),
      ])

      const gradesRaw = gradesRes.data || []
      const attendanceRaw = attendanceRes.data || []

      // Aggregate scores per subject (normalize to 0-100 scale)
      const subjectMap = {}
      gradesRaw.forEach(g => {
        if (!g.subject) return
        const sid = g.subject.id
        const normalizedScore = g.max_score > 0 ? (g.score / g.max_score) * 100 : g.score
        if (!subjectMap[sid]) {
          subjectMap[sid] = { name: g.subject.name, scores: [] }
        }
        subjectMap[sid].scores.push(normalizedScore)
      })

      const gradeRows = Object.values(subjectMap).map(s => ({
        subject: s.name,
        score: s.scores.length
          ? Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 10) / 10
          : null,
      }))
      gradeRows.sort((a, b) => a.subject.localeCompare(b.subject))

      const total = attendanceRaw.length
      const present = attendanceRaw.filter(a => a.status === 'present').length
      const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0

      const student = students.find(s => s.id === selectedStudent)
      const cls = studentClassMap[selectedStudent] || '—'

      setPreviewData({
        student,
        cls,
        period: label,
        gradeRows,
        attendancePct,
        total,
        present,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setPreviewing(false)
    }
  }

  async function downloadPDF() {
    if (!previewData) return
    try {
      setGenerating(true)
      const generatedDate = fmtLong(new Date())

      const JsPDF = await tryLoadJsPDF()

      if (!JsPDF) {
        // Fallback: print window
        printFallback({
          schoolName,
          student: previewData.student,
          cls: previewData.cls,
          period: previewData.period,
          gradeRows: previewData.gradeRows,
          attendancePct: previewData.attendancePct,
          generatedDate,
        })
        return
      }

      const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const PURPLE = [83, 74, 183]
      const PURPLE_LIGHT = [245, 244, 254]
      const WHITE = [255, 255, 255]
      const pageW = doc.internal.pageSize.getWidth()
      const margin = 18

      // --- Header bar ---
      doc.setFillColor(...PURPLE)
      doc.rect(0, 0, pageW, 38, 'F')

      doc.setTextColor(...WHITE)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(schoolName, margin, 16)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Şagird Şəhadətnaməsi', margin, 27)

      // --- Info boxes ---
      const boxY = 46
      const boxH = 22
      const boxW = (pageW - margin * 2 - 8) / 3

      const infoBoxes = [
        { label: 'Şagird', value: previewData.student?.full_name || '—' },
        { label: 'Sinif', value: previewData.cls },
        { label: 'Dövr', value: previewData.period },
      ]

      infoBoxes.forEach((box, i) => {
        const x = margin + i * (boxW + 4)
        doc.setFillColor(...PURPLE_LIGHT)
        doc.roundedRect(x, boxY, boxW, boxH, 3, 3, 'F')
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.text(box.label.toUpperCase(), x + 6, boxY + 7)
        doc.setTextColor(31, 41, 55)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(String(box.value), x + 6, boxY + 16)
      })

      // --- Grades table ---
      const tableStartY = boxY + boxH + 10

      doc.setTextColor(31, 41, 55)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Fənn nəticələri', margin, tableStartY - 3)

      const tableBody = previewData.gradeRows.map(r => [
        r.subject,
        r.score != null ? r.score.toFixed(1) : '—',
        gradeLabel(r.score),
      ])

      if (tableBody.length === 0) {
        tableBody.push(['Bu dövr üçün qiymət məlumatı yoxdur', '', ''])
      }

      doc.autoTable({
        startY: tableStartY,
        head: [['Fənn', 'Orta bal', 'Qiymət']],
        body: tableBody,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9.5,
          cellPadding: 5,
          lineColor: [229, 231, 235],
          lineWidth: 0.3,
          textColor: [31, 41, 55],
        },
        headStyles: {
          fillColor: PURPLE,
          textColor: WHITE,
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: PURPLE_LIGHT,
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
      })

      const finalY = doc.lastAutoTable?.finalY ?? tableStartY + 60

      // --- Attendance box ---
      const attY = finalY + 10
      doc.setFillColor(240, 253, 244)
      doc.roundedRect(margin, attY, 80, 18, 3, 3, 'F')
      doc.setDrawColor(134, 239, 172)
      doc.roundedRect(margin, attY, 80, 18, 3, 3, 'S')
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Davamiyyət', margin + 5, attY + 7)
      doc.setTextColor(5, 150, 105)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `${previewData.attendancePct}%  (${previewData.present} / ${previewData.total} gün)`,
        margin + 5,
        attY + 14
      )

      // --- Footer ---
      const footerY = doc.internal.pageSize.getHeight() - 12
      doc.setDrawColor(229, 231, 235)
      doc.line(margin, footerY - 4, pageW - margin, footerY - 4)
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Yaradılma tarixi: ${escapeHtml(generatedDate)}`, margin, footerY)
      doc.text(profile?.school?.name || 'Zirva Məktəb İdarəetmə Sistemi', pageW - margin, footerY, { align: 'right' })

      const safeName = (previewData.student?.full_name || 'sagird').replace(/\s+/g, '_')
      doc.save(`${safeName}_sehadetname.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      setPdfError('PDF yaradılarkən xəta baş verdi.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Şəhadətnamələr</h1>
          <p className="text-sm text-gray-500 mt-1">Şagird şəhadətnamələrini hazırlayın və PDF kimi yükləyin</p>
        </div>
        {previewData && (
          <div className="flex items-center gap-3">
            {pdfError && (
              <span className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                {pdfError}
              </span>
            )}
            <Button onClick={() => { setPdfError(null); downloadPDF() }} loading={generating}>
              <Download className="w-4 h-4 mr-2 inline" />
              PDF yüklə
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card hover={false}>
        <h2 className="font-serif text-xl text-gray-900 mb-5">Şagird seçin</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Şagird"
            value={selectedStudent}
            onChange={e => { setSelectedStudent(e.target.value); setPreviewData(null) }}
          >
            <option value="">Şagird seçin</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name}{studentClassMap[s.id] ? ` (${studentClassMap[s.id]})` : ''}
              </option>
            ))}
          </Select>

          <Select
            label="Dövr"
            value={selectedPeriod}
            onChange={e => { setSelectedPeriod(e.target.value); setPreviewData(null) }}
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>

          <div className="flex items-end">
            <Button
              variant="ghost"
              className="w-full"
              onClick={generatePreview}
              loading={previewing}
              disabled={!selectedStudent}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Önizləmə
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      {previewing && (
        <div className="flex justify-center py-10">
          <PageSpinner />
        </div>
      )}

      {!previewing && previewData && (
        <div ref={previewRef}>
          <Card hover={false} className="overflow-hidden !p-0">
            {/* Preview header bar */}
            <div className="bg-[#534AB7] px-8 py-6">
              <h2 className="text-white font-serif text-2xl">{schoolName}</h2>
              <p className="text-white/80 text-sm mt-1">Şagird Şəhadətnaməsi</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Şagird', value: previewData.student?.full_name },
                  { label: 'Sinif', value: previewData.cls },
                  { label: 'Dövr', value: previewData.period },
                ].map(box => (
                  <div key={box.label} className="bg-purple-light rounded-xl px-5 py-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{box.label}</p>
                    <p className="text-base font-semibold text-gray-900">{box.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Grades table */}
              <div>
                <h3 className="font-serif text-lg text-gray-900 mb-3">Fənn nəticələri</h3>
                {previewData.gradeRows.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Bu dövr üçün qiymət məlumatı yoxdur.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border-soft">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#534AB7] text-white">
                          <th className="text-xs font-medium uppercase tracking-wider px-6 py-3 text-left">Fənn</th>
                          <th className="text-xs font-medium uppercase tracking-wider px-6 py-3 text-center">Orta bal</th>
                          <th className="text-xs font-medium uppercase tracking-wider px-6 py-3 text-center">Qiymət</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-soft">
                        {previewData.gradeRows.map((r, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-light/40'}>
                            <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{r.subject}</td>
                            <td className="px-6 py-3.5 text-center text-sm font-semibold text-gray-800">
                              {r.score != null ? r.score.toFixed(1) : '—'}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              <Badge variant={gradeBadgeVariant(r.score)}>
                                {gradeLabel(r.score)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Attendance */}
              <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Davamiyyət</p>
                  <p className="text-xl font-bold text-green-700">{previewData.attendancePct}%</p>
                  <p className="text-xs text-gray-500">
                    {previewData.present} iştirak / {previewData.total} gün
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border-soft pt-4 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Yaradılma tarixi: {fmtLong(new Date())}
                </p>
                <p className="text-xs text-gray-400">Zirva Məktəb İdarəetmə Sistemi</p>
              </div>
            </div>
          </Card>

          {/* Download button below preview on mobile */}
          <div className="flex flex-col items-end gap-2 mt-4">
            {pdfError && (
              <span className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                {pdfError}
              </span>
            )}
            <Button onClick={() => { setPdfError(null); downloadPDF() }} loading={generating}>
              <Download className="w-4 h-4 mr-2 inline" />
              PDF yüklə
            </Button>
          </div>
        </div>
      )}

      {!previewing && !previewData && (
        <EmptyState
          icon={FileText}
          title="Şagird seçin"
          description="Şəhadətnaməni önizləmək üçün yuxarıdan şagird və dövr seçib 'Önizləmə' düyməsinə basın."
        />
      )}
    </div>
  )
}
