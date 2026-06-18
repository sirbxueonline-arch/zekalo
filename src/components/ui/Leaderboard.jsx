import Avatar from './Avatar'

// <Leaderboard> + <LeaderboardRow> — a gamification ranking surface for
// student/parent (HIGH) surfaces. Rows show: color-coded rank, avatar, name
// (+ role subtitle), and right-aligned points (tabular-nums). The current
// user's row is tinted brand-50 with a brand outline. Optional top-3 podium
// header and a dashed "↑ Promotion zone ↑" divider helper.
//
// All logic-free / presentational — pass it pre-computed, pre-sorted rows.

// ── Rank coloring ──────────────────────────────────────────────────────────
// Gold / silver / bronze for the top three; green inside the promotion zone;
// neutral otherwise. Returns inline style for the rank badge.
function rankStyle(rank, inPromotionZone) {
  if (rank === 1) return { color: '#CA9A04', background: '#FEF7D6' } // gold
  if (rank === 2) return { color: '#64748B', background: '#EEF1F6' } // silver
  if (rank === 3) return { color: '#B45309', background: '#FEF3C7' } // bronze
  if (inPromotionZone) return { color: '#15803D', background: '#DCFCE7' } // mint
  return { color: 'var(--ink-600)', background: 'var(--surface-2)' }
}

export function LeaderboardRow({
  rank,
  name,
  role,
  points,
  avatarSrc,
  highlighted = false,
  inPromotionZone = false,
}) {
  const rs = rankStyle(rank, inPromotionZone)
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-tile transition-colors"
      style={
        highlighted
          ? {
              background: 'var(--brand-50)',
              boxShadow: 'inset 0 0 0 2px var(--brand-300)',
            }
          : undefined
      }
    >
      {/* Rank badge */}
      <span
        className="flex items-center justify-center rounded-pill font-display font-extrabold tabular-nums shrink-0"
        style={{ width: 28, height: 28, fontSize: 13, ...rs }}
        aria-label={`#${rank}`}
      >
        {rank}
      </span>

      {/* Avatar */}
      <Avatar src={avatarSrc} name={name} size="sm" ring={false} />

      {/* Name + role subtitle */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[14px] truncate ${
            highlighted ? 'text-brand-700 font-bold' : 'text-ink-900 font-semibold'
          }`}
        >
          {name}
        </p>
        {role && (
          <p className="text-[12px] text-ink-400 truncate">{role}</p>
        )}
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <span className="font-display font-extrabold text-[15px] text-ink-900 tabular-nums">
          {typeof points === 'number' ? points.toLocaleString('az-AZ') : points}
        </span>
      </div>
    </div>
  )
}

export default function Leaderboard({
  rows = [],
  currentUserId,
  promotionZone = 0,
  showPodium = false,
  className = '',
}) {
  // Defensive: render nothing extra for an empty list (callers own empty states).
  const ranked = rows.map((r, i) => ({ ...r, rank: r.rank ?? i + 1 }))

  // Promotion zone = the top N ranks (excluding the podium top-3 which already
  // gets medal coloring). The dashed divider is drawn after rank === promotionZone.
  const podium = showPodium ? ranked.slice(0, 3) : []
  const listStart = showPodium ? 3 : 0

  return (
    <div className={className}>
      {/* Optional top-3 podium header */}
      {showPodium && podium.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-4">
          {/* Order: 2nd, 1st, 3rd for a classic podium silhouette */}
          {[podium[1], podium[0], podium[2]]
            .filter(Boolean)
            .map((p) => {
              const isFirst = p.rank === 1
              const rs = rankStyle(p.rank, false)
              return (
                <div
                  key={p.id ?? p.rank}
                  className="flex flex-col items-center"
                  style={{ width: isFirst ? 96 : 80 }}
                >
                  <div className={isFirst ? 'animate-bob' : ''}>
                    <Avatar
                      src={p.avatarSrc}
                      name={p.name}
                      size={isFirst ? 'lg' : 'md'}
                    />
                  </div>
                  <span
                    className="mt-1.5 flex items-center justify-center rounded-pill font-display font-extrabold tabular-nums"
                    style={{ width: 22, height: 22, fontSize: 12, ...rs }}
                  >
                    {p.rank}
                  </span>
                  <p className="mt-1 text-[12.5px] font-semibold text-ink-900 text-center truncate w-full">
                    {p.name}
                  </p>
                  <p className="text-[12px] text-sun-dark font-display font-extrabold tabular-nums">
                    {typeof p.points === 'number'
                      ? p.points.toLocaleString('az-AZ')
                      : p.points}
                  </p>
                </div>
              )
            })}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-1">
        {ranked.slice(listStart).map((r, i) => {
          const showDivider =
            promotionZone > 0 && r.rank === promotionZone
          return (
            <div key={r.id ?? r.rank}>
              <LeaderboardRow
                rank={r.rank}
                name={r.name}
                role={r.role}
                points={r.points}
                avatarSrc={r.avatarSrc}
                highlighted={currentUserId != null && r.id === currentUserId}
                inPromotionZone={promotionZone > 0 && r.rank <= promotionZone}
              />
              {showDivider && <PromotionDivider />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// "↑ Promotion zone ↑" dashed divider helper — exported for callers who build
// custom row lists but still want the divider styling.
export function PromotionDivider({ label = 'Promotion zone' }) {
  return (
    <div className="flex items-center gap-2 my-2 px-2" aria-hidden="true">
      <span
        className="flex-1 border-t-2 border-dashed"
        style={{ borderColor: 'rgba(34,197,94,0.45)' }}
      />
      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-mint-dark flex items-center gap-1">
        <span>↑</span>
        {label}
        <span>↑</span>
      </span>
      <span
        className="flex-1 border-t-2 border-dashed"
        style={{ borderColor: 'rgba(34,197,94,0.45)' }}
      />
    </div>
  )
}
