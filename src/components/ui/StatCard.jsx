const ICON_PALETTES = {
  periwinkle: { bg: 'rgba(124,110,224,0.12)', color: '#7c6ee0' },
  mint: { bg: 'rgba(93,184,163,0.14)', color: '#5db8a3' },
  peach: { bg: 'rgba(232,168,124,0.16)', color: '#e8a87c' },
  blue: { bg: 'rgba(107,157,222,0.14)', color: '#6b9dde' },
  red: { bg: 'rgba(220,38,38,0.12)', color: '#dc2626' },
}

// Map legacy tailwind iconBg/iconColor classes to our pastel palette so
// existing pages automatically get pastel treatment without per-page edits.
function resolvePalette({ iconBg, iconColor, tone }) {
  if (tone && ICON_PALETTES[tone]) return ICON_PALETTES[tone]
  const probe = `${iconBg || ''} ${iconColor || ''}`
  if (/teal|emerald|green|mint/i.test(probe)) return ICON_PALETTES.mint
  if (/amber|orange|yellow|peach/i.test(probe)) return ICON_PALETTES.peach
  if (/sky|cyan|blue|indigo/i.test(probe)) return ICON_PALETTES.blue
  if (/red|rose|pink/i.test(probe)) return ICON_PALETTES.red
  return ICON_PALETTES.periwinkle
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconBg,
  iconColor,
  tone,
  className = '',
}) {
  const palette = resolvePalette({ iconBg, iconColor, tone })

  return (
    <div className={`liquid-card p-6 flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-[#1a1a2e] mt-1.5 tabular-nums">{value}</p>
        {trend != null && (
          <p
            className="text-xs font-semibold mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              color: trend > 0 ? '#3a8170' : trend < 0 ? '#dc2626' : '#64748b',
              background: trend > 0 ? 'rgba(93,184,163,0.12)' : trend < 0 ? 'rgba(239,68,68,0.10)' : 'rgba(100,116,139,0.10)',
            }}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          style={{ background: palette.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: palette.color }} />
        </div>
      )}
    </div>
  )
}
