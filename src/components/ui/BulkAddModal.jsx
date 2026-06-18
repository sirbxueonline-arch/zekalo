import { useState, useRef } from 'react'
import { Plus, Trash2, Upload, ClipboardPaste, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * Generic bulk-add modal.
 *
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   title       – string
 *   columns     – [{ key, label, required?, placeholder?, type?, options? }]
 *                 type: 'text' | 'email' | 'select'
 *                 options: [{ value, label }]  (only for 'select')
 *   onImport    – async (rows) => void   called with valid rows; throws on fatal error
 *   onDone      – () => void             called after successful import to refresh parent
 */
export default function BulkAddModal({ open, onClose, title, columns, onImport, onDone }) {
  const fileInputRef = useRef(null)

  const emptyRow = () => Object.fromEntries(columns.map(c => [c.key, '']))

  const [rows, setRows] = useState([emptyRow()])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState(null) // null | { done, failed, errors: [{row, msg}] }
  const [progress, setProgress] = useState(0)

  function reset() {
    setRows([emptyRow()])
    setResults(null)
    setProgress(0)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function addRow() {
    setRows(r => [...r, emptyRow()])
  }

  function removeRow(i) {
    setRows(r => r.length === 1 ? [emptyRow()] : r.filter((_, idx) => idx !== i))
  }

  function updateCell(rowIdx, key, value) {
    setRows(r => r.map((row, i) => i === rowIdx ? { ...row, [key]: value } : row))
  }

  // Detect paste of tabular data (tab or comma-separated) into any cell
  function handlePaste(e, rowIdx, colIdx) {
    const text = e.clipboardData.getData('text')
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    // Single value → normal paste
    if (lines.length <= 1 && !text.includes('\t') && !text.includes(',')) return

    e.preventDefault()
    const parsed = lines.map(line =>
      line.includes('\t') ? line.split('\t') : line.split(',')
    ).map(cells => cells.map(c => c.trim()))

    setRows(prev => {
      const next = [...prev]
      parsed.forEach((cells, pi) => {
        const targetRow = rowIdx + pi
        if (!next[targetRow]) next.push(emptyRow())
        columns.forEach((col, ci) => {
          const val = cells[colIdx + ci]
          if (val !== undefined) next[targetRow] = { ...next[targetRow], [col.key]: val }
        })
      })
      return next
    })
  }

  // CSV file upload
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      // Skip header if it matches column labels
      const start = lines[0]?.toLowerCase().includes(columns[0].key.toLowerCase()) ? 1 : 0
      const parsed = lines.slice(start).map(line => {
        const cells = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
        const row = emptyRow()
        columns.forEach((col, i) => { if (cells[i]) row[col.key] = cells[i] })
        return row
      }).filter(row => Object.values(row).some(v => v))
      if (parsed.length) setRows(parsed)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function downloadTemplate() {
    const header = columns.map(c => c.key).join(',')
    const example = columns.map(c => c.placeholder || c.label).join(',')
    const blob = new Blob([header + '\n' + example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sablon.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validRows = rows.filter(row =>
    columns.filter(c => c.required).every(c => row[c.key]?.trim())
  )

  async function handleImport() {
    if (!validRows.length) return
    if (validRows.length > 200) {
      alert('Maksimum 200 şagird idxal edilə bilər')
      return
    }
    setImporting(true)
    setProgress(0)
    setResults(null)

    let done = 0
    let failed = 0
    const errors = []

    for (let i = 0; i < validRows.length; i++) {
      try {
        await onImport(validRows[i])
        done++
      } catch (err) {
        failed++
        errors.push({
          row: validRows[i],
          msg: err?.message || 'Naməlum xəta',
        })
      }
      setProgress(i + 1)
    }

    setImporting(false)
    setResults({ done, failed, errors })
    if (done > 0) onDone?.()
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} size="xl">
      {/* Results screen */}
      {results && (
        <div className="space-y-5">
          {/* Summary row */}
          <div className="flex items-center justify-center gap-10 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-tile bg-mint-light mx-auto mb-2">
                <CheckCircle className="w-7 h-7 text-mint-dark" />
              </div>
              <p className="font-display text-3xl font-bold text-ink-900 tabular-nums tracking-tight">{results.done}</p>
              <p className="text-xs text-ink-400 mt-0.5">uğurlu</p>
            </div>
            {results.failed > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-tile bg-danger-tint mx-auto mb-2">
                  <XCircle className="w-7 h-7 text-danger" />
                </div>
                <p className="font-display text-3xl font-bold text-ink-900 tabular-nums tracking-tight">{results.failed}</p>
                <p className="text-xs text-ink-400 mt-0.5">xəta</p>
              </div>
            )}
          </div>

          {/* Per-row errors */}
          {results.errors?.length > 0 && (
            <div className="border border-danger-tint rounded-tile overflow-hidden">
              <div className="bg-danger-tint/60 px-4 py-2.5 border-b border-danger-tint">
                <p className="text-xs font-semibold text-danger-text">Xətalı sətirlərin təfərrüatı</p>
              </div>
              <ul className="divide-y divide-hairline max-h-48 overflow-y-auto">
                {results.errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink-900 truncate">
                        {e.row.full_name || e.row.email || `Sətir ${i + 1}`}
                      </p>
                      <p className="text-xs text-danger-text mt-0.5">{e.msg}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={() => { reset(); }}>Yenidən əlavə et</Button>
            <Button onClick={handleClose}>Bağla</Button>
          </div>
        </div>
      )}

      {/* Import progress */}
      {importing && (
        <div className="py-10 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span className="text-sm font-medium text-ink-700 tabular-nums">İdxal edilir... {progress} / {validRows.length}</span>
          </div>
          <div className="w-full bg-hairline rounded-pill h-2 overflow-hidden">
            <div
              className="bg-brand-500 h-2 rounded-pill transition-all duration-300"
              style={{ width: `${Math.round((progress / validRows.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-center text-ink-400 tabular-nums">{progress} / {validRows.length} idxal edildi...</p>
        </div>
      )}

      {/* Main input UI */}
      {!importing && !results && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              CSV yüklə
            </Button>
            <Button variant="ghost" onClick={downloadTemplate}>
              Şablon endir
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-400 ml-auto">
              <ClipboardPaste className="w-3.5 h-3.5 text-ink-400" />
              Xanaların üzərinə tablar/vergüllə ayrılmış mətn yapışdıra bilərsiniz
            </span>
          </div>

          {/* Spreadsheet table */}
          <div className="overflow-x-auto border border-hairline rounded-tile">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-2 border-b border-hairline">
                  <th className="w-8 px-3 py-2.5 text-left text-xs font-medium text-ink-400 select-none">#</th>
                  {columns.map(col => (
                    <th key={col.key} className="px-3 py-2.5 text-left text-xs font-medium text-ink-400 whitespace-nowrap">
                      {col.label}
                      {col.required && <span className="text-danger ml-0.5">*</span>}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-hairline last:border-0 transition-colors hover:bg-[rgba(20,22,40,0.025)]">
                    <td className="px-3 py-1.5 text-xs text-ink-400 select-none tabular-nums">{ri + 1}</td>
                    {columns.map((col, ci) => (
                      <td key={col.key} className="px-1 py-1">
                        {col.type === 'select' ? (
                          <select
                            value={row[col.key]}
                            onChange={e => updateCell(ri, col.key, e.target.value)}
                            className="w-full border border-hairline rounded-ctl px-2 py-1.5 text-[13px] text-ink-900 bg-white transition-shadow focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/15"
                          >
                            <option value="">—</option>
                            {(col.options || []).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type || 'text'}
                            value={row[col.key]}
                            placeholder={col.placeholder || col.label}
                            onChange={e => updateCell(ri, col.key, e.target.value)}
                            onPaste={e => handlePaste(e, ri, ci)}
                            className="w-full border border-hairline rounded-ctl px-2 py-1.5 text-[13px] text-ink-900 placeholder:text-ink-400 transition-shadow focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/15 min-w-[120px]"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-1 py-1">
                      <button
                        onClick={() => removeRow(ri)}
                        className="p-1.5 rounded-ctl text-ink-400 hover:text-danger hover:bg-danger-tint/60 transition-colors"
                        aria-label="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Sətir əlavə et
          </button>

          <p className="text-xs text-ink-400 tabular-nums">
            {validRows.length} / {rows.length} sətir hazırdır
            {validRows.length < rows.length && ' · Boş məcburi xanalar nəzərə alınmayacaq'}
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={handleClose}>Ləğv et</Button>
            <Button
              onClick={handleImport}
              disabled={validRows.length === 0}
            >
              {validRows.length} qeydi idxal et
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
