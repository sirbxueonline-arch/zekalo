/**
 * <Mascot /> — Zirva's friendly owl mascot, fully inline SVG (no external assets).
 *
 * V3 refinement: FLAT and GEOMETRIC (Headspace-leaning). Solid brand fills,
 * no gradients, calmer face — still friendly but less cartoonish. One base
 * body; each pose varies the eyes, brows, beak/mouth, wings and a small
 * accessory so it reads as a different mood (waving, reading, cheering,
 * thinking, sleeping, pointing).
 *
 * Used sparingly (student home, tier-2 empty states, celebration) — never in
 * auth or data views, ≤1 per screen.
 *
 * Idle bob uses the shared `animate-bob` utility (≤3px, collapsed under
 * `prefers-reduced-motion` globally — see src/index.css). No JS motion here.
 *
 * Public API (stable):
 *   <Mascot pose="thinking" size={140} className="..." bob title="..." />
 *     pose : 'waving' | 'reading' | 'cheering' | 'thinking' | 'sleeping' | 'pointing'
 *     size : number (px, square) — default 140
 *     bob  : boolean — gentle idle bob, default true
 */

const POSES = ['waving', 'reading', 'cheering', 'thinking', 'sleeping', 'pointing']

export default function Mascot({
  pose = 'thinking',
  size = 140,
  bob = true,
  className = '',
  title,
  ...props
}) {
  const p = POSES.includes(pose) ? pose : 'thinking'

  // ---- pose-driven flags --------------------------------------------------
  const asleep = p === 'sleeping'
  const happy = p === 'cheering' || p === 'waving'

  return (
    <span
      role="img"
      aria-label={title || `Zirva mascot, ${p}`}
      className={`inline-flex ${bob ? 'animate-bob' : ''} ${className}`}
      style={{ width: size, height: size, lineHeight: 0 }}
      {...props}
    >
      <svg
        viewBox="0 0 160 160"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ground shadow — grounds the bob (neutral, low-opacity) */}
        <ellipse cx="80" cy="148" rx="32" ry="5" fill="var(--ink-900)" opacity="0.08" />

        {/* ---- accessory: thinking thought bubbles (behind head, top-right) ---- */}
        {p === 'thinking' && (
          <g fill="var(--brand-200)">
            <circle cx="126" cy="44" r="5" />
            <circle cx="138" cy="32" r="3.4" />
            <circle cx="146" cy="23" r="2.2" />
          </g>
        )}

        {/* ---- accessory: sleeping Zzz ---- */}
        {asleep && (
          <g fill="var(--brand-300)" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700">
            <text x="118" y="42" fontSize="16">z</text>
            <text x="130" y="30" fontSize="20">Z</text>
            <text x="144" y="20" fontSize="13">z</text>
          </g>
        )}

        {/* ---- ear tufts (behind body) ---- */}
        <BodyTufts />

        {/* ---- body (flat brand fill) ---- */}
        <path
          d="M80 26
             C112 26 130 50 130 84
             C130 122 110 142 80 142
             C50 142 30 122 30 84
             C30 50 48 26 80 26 Z"
          fill="var(--brand-500)"
        />

        {/* belly — flat tint panel */}
        <path
          d="M80 70
             C100 70 112 86 112 106
             C112 128 98 140 80 140
             C62 140 48 128 48 106
             C48 86 60 70 80 70 Z"
          fill="var(--brand-50)"
        />

        {/* ---- wings (flat, one deeper brand step) ---- */}
        {p === 'waving' ? (
          // raised right wing waving
          <g fill="var(--brand-600)">
            <path d="M50 92 C36 96 30 110 36 124 C44 120 50 110 52 100 Z" />
            <g transform="rotate(-28 120 86)">
              <path d="M110 78 C128 70 140 78 138 96 C128 100 116 96 108 90 Z" />
            </g>
          </g>
        ) : p === 'cheering' ? (
          // both wings up
          <g fill="var(--brand-600)">
            <g transform="rotate(36 48 88)">
              <path d="M50 92 C36 92 28 80 34 66 C44 72 50 82 52 92 Z" />
            </g>
            <g transform="rotate(-36 112 88)">
              <path d="M110 92 C124 92 132 80 126 66 C116 72 110 82 108 92 Z" />
            </g>
          </g>
        ) : p === 'pointing' ? (
          // left wing down, right wing pointing out
          <g fill="var(--brand-600)">
            <path d="M50 96 C38 100 33 114 39 126 C47 122 51 112 53 102 Z" />
            <path d="M110 96 C126 92 140 96 144 104 C138 110 124 110 112 104 Z" />
          </g>
        ) : (
          // resting wings (reading, thinking, sleeping)
          <g fill="var(--brand-600)">
            <path d="M50 92 C36 96 31 110 37 124 C45 120 51 110 53 100 Z" />
            <path d="M110 92 C124 96 129 110 123 124 C115 120 109 110 107 100 Z" />
          </g>
        )}

        {/* ---- eyes ---- */}
        {asleep ? (
          // closed, sleepy lashes
          <g stroke="var(--ink-900)" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M52 64 C58 70 70 70 76 64" />
            <path d="M84 64 C90 70 102 70 108 64" />
          </g>
        ) : (
          <g>
            {/* white eye discs */}
            <circle cx="64" cy="62" r="17" fill="#FFFFFF" />
            <circle cx="96" cy="62" r="17" fill="#FFFFFF" />
            {/* eye rims (rounded glasses for 'reading') */}
            {p === 'reading' && (
              <g stroke="var(--ink-900)" strokeWidth="3" fill="none">
                <circle cx="64" cy="62" r="18" />
                <circle cx="96" cy="62" r="18" />
                <path d="M81 60 H79" strokeLinecap="round" />
                <path d="M46 56 L40 50" strokeLinecap="round" />
                <path d="M114 56 L120 50" strokeLinecap="round" />
              </g>
            )}
            {/* pupils — look direction varies by pose (flat, no catch-light) */}
            {(() => {
              // pupil offset (dx, dy) from disc centers
              let dx = 0, dy = 0
              if (p === 'reading') dy = 6        // looking down at book
              else if (p === 'thinking') { dx = 4; dy = -4 } // up-right
              else if (p === 'pointing') dx = 7  // toward the point
              else if (p === 'waving') dx = 2
              return (
                <g fill="var(--ink-900)">
                  <circle cx={64 + dx} cy={62 + dy} r="7" />
                  <circle cx={96 + dx} cy={62 + dy} r="7" />
                </g>
              )
            })()}
          </g>
        )}

        {/* ---- brows (expression) ---- */}
        {!asleep && (
          <g stroke="var(--brand-700)" strokeWidth="3.4" strokeLinecap="round" fill="none">
            {p === 'thinking' ? (
              <>
                <path d="M52 42 L74 46" />
                <path d="M88 44 L104 40" />
              </>
            ) : happy ? (
              <>
                <path d="M50 44 C56 40 70 40 76 44" />
                <path d="M84 44 C90 40 104 40 110 44" />
              </>
            ) : (
              <>
                <path d="M52 44 L74 44" />
                <path d="M86 44 L108 44" />
              </>
            )}
          </g>
        )}

        {/* ---- beak (flat) ---- */}
        <path d="M80 74 L72 84 C76 90 84 90 88 84 Z" fill="var(--sun)" />

        {/* ---- accessory: reading book ---- */}
        {p === 'reading' && (
          <g>
            <path d="M58 122 L80 116 L80 142 L58 146 Z" fill="#FFFFFF" stroke="var(--brand-200)" strokeWidth="1.5" />
            <path d="M102 122 L80 116 L80 142 L102 146 Z" fill="#FFFFFF" stroke="var(--brand-200)" strokeWidth="1.5" />
            <path d="M63 126 L76 123 M63 131 L76 128 M63 136 L76 133" stroke="var(--brand-300)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M97 126 L84 123 M97 131 L84 128 M97 136 L84 133" stroke="var(--brand-300)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M80 116 L80 142" stroke="var(--brand-400)" strokeWidth="2" />
          </g>
        )}

        {/* ---- accessory: cheering sparkles ---- */}
        {p === 'cheering' && (
          <g fill="var(--sun)">
            <Sparkle x={30} y={48} s={6} />
            <Sparkle x={130} y={50} s={5} />
            <Sparkle x={120} y={120} s={4} />
          </g>
        )}

        {/* ---- accessory: pointing guidance star at wing tip ---- */}
        {p === 'pointing' && (
          <g fill="var(--sky)">
            <Sparkle x={142} y={100} s={6} />
          </g>
        )}

        {/* ---- feet (flat) ---- */}
        <g fill="none" stroke="var(--sun)" strokeWidth="2.4" strokeLinecap="round">
          <path d="M66 140 q-6 6 -2 9 M66 140 q0 7 0 9 M66 140 q6 6 2 9" />
          <path d="M94 140 q-6 6 -2 9 M94 140 q0 7 0 9 M94 140 q6 6 2 9" />
        </g>
      </svg>
    </span>
  )
}

// Ear tufts as a tiny sub-component (flat brand fill).
function BodyTufts() {
  return (
    <g fill="var(--brand-500)">
      <path d="M54 34 L46 14 L66 30 Z" />
      <path d="M106 34 L114 14 L94 30 Z" />
    </g>
  )
}

// 4-point sparkle star.
function Sparkle({ x, y, s }) {
  return (
    <path
      d={`M${x} ${y - s} C${x + s * 0.3} ${y - s * 0.3} ${x + s * 0.3} ${y - s * 0.3} ${x + s} ${y}
          C${x + s * 0.3} ${y + s * 0.3} ${x + s * 0.3} ${y + s * 0.3} ${x} ${y + s}
          C${x - s * 0.3} ${y + s * 0.3} ${x - s * 0.3} ${y + s * 0.3} ${x - s} ${y}
          C${x - s * 0.3} ${y - s * 0.3} ${x - s * 0.3} ${y - s * 0.3} ${x} ${y - s} Z`}
    />
  )
}
