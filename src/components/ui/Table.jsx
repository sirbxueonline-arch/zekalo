import { useState } from 'react'

export default function Table({ columns, data, onRowClick, emptyMessage = 'Məlumat tapılmadı' }) {
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
      <div className="py-16 text-center">
        <p className="text-gray-400 text-sm">Nəticə tapılmadı</p>
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left${col.sortable ? ' cursor-pointer select-none hover:bg-surface' : ''}`}
              >
                {col.sortable ? (
                  <span className="flex items-center gap-1">
                    {col.label}
                    <span className="text-gray-400 text-xs">
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                ) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id || i}
              className={`border-b border-border-soft hover:bg-surface transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
