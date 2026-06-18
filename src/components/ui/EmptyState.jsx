import Button from './Button'
import Mascot from './Mascot'

/**
 * <EmptyState /> — empty-state surface, tiered per Design System V3 §4.9.
 *
 * Two tiers, selected via the `tier` prop (default 2 → backward compatible):
 *   • Tier 1 — dense data screens (roster/gradebook empty). Restraint: a small
 *     MONOCHROME line glyph (~80px, the `icon` prop or a default), heading 15/600,
 *     one grey 13px line, one button. NO mascot, no cartoon.
 *   • Tier 2 — first-run / student-parent home. The contained <Mascot /> (~76px)
 *     OR a passed illustration + heading + line + single primary.
 *
 * Backward compatible: every existing call site uses
 *   icon, title, description, actionLabel, onAction
 * — all preserved with identical behavior. With no `tier`, Tier 2 renders the
 * mascot exactly as before. New props are optional.
 *
 * @param {1|2}                  [tier]         Visual tier (default 2 — unchanged behavior).
 * @param {React.ComponentType} [icon]         Optional icon component. In Tier 1 it is the
 *                                              monochrome line glyph; in Tier 2 it renders in an icon-chip.
 * @param {string}              title          Headline.
 * @param {string}              [description]  Muted one-line subcopy.
 * @param {string}              [actionLabel]  CTA label.
 * @param {Function}            [onAction]     CTA click handler.
 * @param {string}              [pose]         Mascot pose when no icon (Tier 2 only, default 'thinking').
 * @param {number}              [mascotSize]   Mascot size in px (Tier 2 default 132).
 * @param {React.ReactNode}     [action]       Custom CTA node, overrides actionLabel/onAction.
 * @param {React.ReactNode}     [illustration] Custom illustration node, overrides icon/mascot.
 * @param {string}              [className]    Extra classes on the wrapper.
 */

/** Default monochrome line glyph for Tier 1 (stroke-only, currentColor, ~80px). */
function DefaultGlyph({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="10" y="14" width="44" height="36" rx="4" />
      <path d="M10 24h44" />
      <path d="M20 34h24M20 42h16" />
    </svg>
  )
}

export default function EmptyState({
  tier = 2,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  pose = 'thinking',
  mascotSize = 132,
  action,
  illustration,
  className = '',
}) {
  const isTier1 = tier === 1

  return (
    <div
      className={`liquid-card flex flex-col items-center text-center ${className}`}
      style={{
        padding: isTier1 ? '40px 32px' : '48px 32px',
        borderStyle: 'dashed',
        borderColor: 'var(--hairline-strong)',
      }}
    >
      {/* Illustration slot */}
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : isTier1 ? (
        /* Tier 1: monochrome line glyph (icon prop or default) — no chip, no mascot. */
        <div style={{ color: 'var(--ink-400)' }}>
          {Icon ? <Icon style={{ width: 80, height: 80 }} strokeWidth={1.5} /> : <DefaultGlyph size={80} />}
        </div>
      ) : Icon ? (
        <div className="icon-chip icon-chip-periwinkle" style={{ width: 64, height: 64 }}>
          <Icon className="w-8 h-8" />
        </div>
      ) : (
        <Mascot pose={pose} size={isTier1 ? 76 : mascotSize} />
      )}

      <h3
        className="font-display mt-3"
        style={{
          fontSize: isTier1 ? 15 : 18,
          fontWeight: isTier1 ? 600 : 700,
          color: 'var(--ink-900)',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="mt-1.5 max-w-sm"
          style={{ fontSize: isTier1 ? 13 : 14, color: 'var(--ink-400)', lineHeight: 1.55 }}
        >
          {description}
        </p>
      )}

      {action ? (
        <div className="mt-6">{action}</div>
      ) : (
        actionLabel && onAction && (
          <div className="mt-6">
            <Button onClick={onAction} variant="primary">{actionLabel}</Button>
          </div>
        )
      )}
    </div>
  )
}
