/**
 * Locale-safe Azerbaijani date utilities.
 *
 * Many browsers don't support the `az-AZ` locale properly and fall back to
 * formats like "M04 16" instead of "Aprel 16".  These helpers use hardcoded
 * Azerbaijani name arrays so the output is always correct.
 */

export const AZ_MONTHS_LONG = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

export const AZ_MONTHS_SHORT = [
  'Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn',
  'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek',
]

export const AZ_WEEKDAYS_LONG = [
  'Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə',
  'Cümə axşamı', 'Cümə', 'Şənbə',
]

export const AZ_WEEKDAYS_SHORT = [
  'Baz', 'B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən',
]

/**
 * Returns a formatted date string using Azerbaijani names.
 *
 * @param {Date|string} date
 * @param {{ weekday?: 'long'|'short', day?: 'numeric'|'2-digit', month?: 'long'|'short'|'2-digit'|'numeric', year?: 'numeric' }} opts
 * @returns {string}
 *
 * Examples:
 *   fmtDate(new Date(), { weekday:'long', day:'numeric', month:'long', year:'numeric' })
 *   → "Çərşənbə, 16 Aprel 2026"
 *
 *   fmtDate('2026-04-16', { day:'2-digit', month:'short' })
 *   → "16 Apr"
 */
export function fmtDate(date, opts = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return '—'

  const parts = []

  if (opts.weekday === 'long')  parts.push(AZ_WEEKDAYS_LONG[d.getDay()])
  if (opts.weekday === 'short') parts.push(AZ_WEEKDAYS_SHORT[d.getDay()])

  const dayNum = d.getDate()
  const day = opts.day === '2-digit'
    ? String(dayNum).padStart(2, '0')
    : opts.day === 'numeric'
    ? String(dayNum)
    : null

  const monthIdx = d.getMonth()
  const month =
    opts.month === 'long'    ? AZ_MONTHS_LONG[monthIdx]
    : opts.month === 'short' ? AZ_MONTHS_SHORT[monthIdx]
    : opts.month === '2-digit' ? String(monthIdx + 1).padStart(2, '0')
    : opts.month === 'numeric' ? String(monthIdx + 1)
    : null

  const year = opts.year === 'numeric' ? String(d.getFullYear()) : null

  // Azerbaijani date order: weekday, day month year
  if (opts.weekday) {
    // "Çərşənbə, 16 Aprel 2026"
    const dateParts = [day, month, year].filter(Boolean).join(' ')
    if (dateParts) parts.push(dateParts)
  } else if (opts.day && (opts.month === 'long' || opts.month === 'short')) {
    // "16 Aprel 2026" or "16 Apr"
    const dateParts = [day, month, year].filter(Boolean).join(' ')
    parts.push(dateParts)
  } else {
    // Numeric only: dd.mm.yyyy  or  dd/mm/yyyy
    const d2 = day || (opts.day ? String(dayNum) : null)
    const m2 = month || (opts.month ? String(monthIdx + 1).padStart(2, '0') : null)
    const y2 = year
    const numParts = [d2, m2, y2].filter(Boolean)
    parts.push(numParts.join('.'))
  }

  return parts.join(', ')
}

/**
 * Quick helpers for the most common formats.
 */

/** "Çərşənbə, 16 Aprel 2026" */
export function todayFull() {
  return fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** "16 Aprel 2026" */
export function fmtLong(date) {
  return fmtDate(date, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** "16 Apr" */
export function fmtShort(date) {
  return fmtDate(date, { day: '2-digit', month: 'short' })
}

/** "16.04.2026" */
export function fmtNumeric(date) {
  return fmtDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** "16.04" */
export function fmtDayMonth(date) {
  return fmtDate(date, { day: '2-digit', month: '2-digit' })
}

/** "Çərşənbə" (just weekday) */
export function fmtWeekday(date) {
  const d = date instanceof Date ? date : new Date(date)
  return AZ_WEEKDAYS_LONG[d.getDay()]
}
