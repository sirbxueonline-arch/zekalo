import { useState } from 'react'
import { Search } from 'lucide-react'

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
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-400 font-medium">{emptyMessage}</p>
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
          <tr className="bg-surface border-b-2 border-border-soft">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5 text-left${col.sortable ? ' cursor-pointer select-none hover:text-purple transition-colors' : ''}`}
              >
                {col.sortable ? (
                  <span className="flex items-center gap-1">
                    {col.label}
                    <span className={`text-xs transition-colors ${sortKey === col.key ? 'text-purple' : 'text-gray-300'}`}>
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
              className={`border-b border-border-soft last:border-0 transition-colors duration-100 ${onRowClick ? 'hover:bg-purple-light/30 cursor-pointer' : 'hover:bg-surface/60'}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-sm">
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
