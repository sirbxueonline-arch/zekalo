import { useState } from 'react'
import { Search } from 'lucide-react'

export default function Table({ columns, data, onRowClick, emptyMessage = 'Məlumat tapılmadı', sticky = false }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rows = data || []

  if (rows.length === 0) {
    return (
      <div
        className="rounded-tile overflow-hidden bg-surface shadow-soft"
        style={{ border: '1px solid var(--hairline-strong)' }}
      >
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
          <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48 }}>
            <Search className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--ink-400)' }}>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'az')
        return sortDir === 'asc' ? cmp : -cmp
      })
    : rows

  return (
    <div
      className="rounded-tile overflow-hidden bg-surface shadow-soft"
      style={{ border: '1px solid var(--hairline-strong)' }}
    >
      <div className="overflow-x-auto">
        <table className="pastel-table">
          <thead className={sticky ? 'sticky top-0 z-10' : ''}>
            <tr>
              {columns.map((col) => {
                const isNum = col.align === 'right'
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    onKeyDown={col.sortable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSort(col.key)
                      }
                    } : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    aria-sort={col.sortable ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    className={`${isNum ? 'num' : ''}${col.sortable ? ' cursor-pointer select-none' : ''}`}
                    style={col.sortable ? { transition: 'color .15s var(--ease-out-quint)' } : undefined}
                  >
                    {col.sortable ? (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ justifyContent: isNum ? 'flex-end' : 'flex-start' }}
                      >
                        {col.label}
                        <span
                          className="text-[10px]"
                          style={{ color: sortKey === col.key ? 'var(--brand-500)' : 'var(--ink-400)', opacity: sortKey === col.key ? 1 : 0.5 }}
                        >
                          {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </span>
                    ) : col.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id || i}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onRowClick(row)
                  }
                } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.align === 'right' ? 'num' : ''}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
