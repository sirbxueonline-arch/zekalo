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
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,110,224,0.12) 0%, rgba(93,184,163,0.12) 100%)',
            border: '1px solid rgba(124,110,224,0.18)',
          }}
        >
          <Search className="w-5 h-5" style={{ color: '#7c6ee0' }} />
        </div>
        <p className="text-sm text-[#64748b] font-medium">{emptyMessage}</p>
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
        <thead className={sticky ? 'sticky top-0 z-10' : ''}>
          <tr style={{ background: 'rgba(248,247,251,0.85)', borderBottom: '1px solid rgba(124,110,224,0.18)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`text-xs font-bold text-[#64748b] uppercase tracking-wider px-5 py-3.5 text-left${col.sortable ? ' cursor-pointer select-none hover:text-[#7c6ee0] transition-colors' : ''}`}
              >
                {col.sortable ? (
                  <span className="flex items-center gap-1">
                    {col.label}
                    <span className="text-xs transition-colors" style={{ color: sortKey === col.key ? '#7c6ee0' : 'rgba(124,110,224,0.35)' }}>
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
              className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{ borderBottom: '1px solid rgba(124,110,224,0.08)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,110,224,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-sm text-[#1a1a2e]">
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
