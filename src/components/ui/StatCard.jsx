// Each tone maps to a redesigned .icon-chip palette (accent-tinted gradient tile
// + accent glyph). grape = achievements, sun = XP/points, coral = streak warmth.
const ICON_CHIPS = {
  periwinkle: 'icon-chip-periwinkle',
  mint: 'icon-chip-mint',
  peach: 'icon-chip-peach',
  blue: 'icon-chip-blue',
  grape: 'icon-chip-grape',
  sun: 'icon-chip-sun',
  coral: 'icon-chip-coral',
  red: 'icon-chip-coral',
}

// Map legacy tailwind iconBg/iconColor classes to our pastel palette so
// existing pages automatically get pastel treatment without per-page edits.
function resolveChip({ iconBg, iconColor, tone }) {
  if (tone && ICON_CHIPS[tone]) return ICON_CHIPS[tone]
  const probe = `${iconBg || ''} ${iconColor || ''}`
  if (/teal|emerald|green|mint/i.test(probe)) return ICON_CHIPS.mint
  if (/amber|orange|yellow|gold|sun/i.test(probe)) return ICON_CHIPS.sun
  if (/peach/i.test(probe)) return ICON_CHIPS.peach
  if (/violet|grape|purple/i.test(probe)) return ICON_CHIPS.grape
  if (/sky|cyan|blue|indigo/i.test(probe)) return ICON_CHIPS.blue
  if (/red|rose|pink|coral/i.test(probe)) return ICON_CHIPS.coral
  return ICON_CHIPS.periwinkle
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
  const chip = resolveChip({ iconBg, iconColor, tone })

  return (
    <div
      className={`bg-surface border border-hairline rounded-card p-5 flex items-start justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[0.04em] truncate">
          {label}
        </p>
        <p className="font-display font-bold text-[27px] text-ink-900 mt-1.5 tabular-nums leading-none tracking-[-0.01em]">
          {value}
        </p>
        {trend != null && (
          <span
            className="text-xs font-semibold mt-2 inline-flex items-center gap-1 tabular-nums"
            style={{
              color: trend > 0 ? '#15803D' : trend < 0 ? '#B91C1C' : 'var(--ink-600)',
            }}
          >
            <span aria-hidden="true">{trend > 0 ? '↑' : trend < 0 ? '↓' : '•'}</span>
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      {Icon && (
        <div className={`icon-chip ${chip}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}
