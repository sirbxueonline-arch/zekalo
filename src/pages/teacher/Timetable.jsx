import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Calendar, Printer, Clock } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'

const days = [
  { key: 1, label: 'Bazar ertəsi', short: 'BE' },
  { key: 2, label: 'Çərşənbə axşamı', short: 'ÇA' },
  { key: 3, label: 'Çərşənbə', short: 'Ç' },
  { key: 4, label: 'Cümə axşamı', short: 'CA' },
  { key: 5, label: 'Cümə', short: 'C' },
  { key: 6, label: 'Şənbə', short: 'Ş' },
]

const periods = [1, 2, 3, 4, 5, 6, 7, 8]

// V3 §4.7 (Amie model): muted = premium. The rainbow per-subject rotation is the
// childish tell here, so it collapses to ONE calm brand-tinted event block —
// ~12% tint fill, a solid 3px brand accent left-bar, dark brand-tint text.
// `hueFor` keeps its signature (call sites unchanged) but always returns this block.
const EVENT_BLOCK = {
  bg: 'rgba(87,79,207,0.08)',
  border: 'var(--hairline)',
  accent: 'var(--brand-500)',
  text: 'var(--brand-700)',
}

function hueFor() {
  return EVENT_BLOCK
}

// Detect today's day-of-week key (1=Mon … 6=Sat)
function todayKey() {
  const d = new Date().getDay() // 0=Sun
  return d === 0 ? null : d
}

export default function TeacherTimetable() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState([])

  const today = todayKey()

  useEffect(() => {
    if (!profile) return
    loadTimetable()
  }, [profile])

  async function loadTimetable() {
    const { data } = await supabase
      .from('timetable_slots')
      .select('*, subject:subjects(name), class:classes(name)')
      .eq('teacher_id', profile.id)
      .eq('published', true)
      .order('period')

    setSlots(data || [])
    setLoading(false)
  }

  function getSlot(dayKey, period) {
    return slots.find(s => s.day_of_week === dayKey && s.period === period)
  }

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="pastel-skeleton h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-chip icon-chip-periwinkle">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-[-0.01em]">
            {t('timetable')}
          </h1>
        </div>

        {slots.length > 0 && (
          <Button onClick={handlePrint} variant="secondary" size="md">
            <Printer className="w-4 h-4" /> {t('print')}
          </Button>
        )}
      </div>

      {!slots.length ? (
        <EmptyState
          tier={1}
          icon={Calendar}
          title="Cədvəl tapılmadı"
          description="Sizin üçün hələ dərs cədvəli dərc olunmayıb."
        />
      ) : (
        <div className="liquid-card overflow-x-auto print:shadow-none">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr>
                {/* Period header */}
                <th
                  className="w-14 px-4 py-3 text-left"
                  style={{
                    background: 'var(--surface-2)',
                    borderBottom: '1px solid var(--hairline)',
                  }}
                >
                  <Clock className="w-3.5 h-3.5 text-ink-400" />
                </th>

                {days.map(d => {
                  const isToday = d.key === today
                  return (
                    <th
                      key={d.key}
                      className="px-3 py-3 text-center"
                      style={{
                        background: isToday ? 'rgba(87,79,207,0.06)' : 'var(--surface-2)',
                        borderBottom: isToday
                          ? '2px solid var(--brand-500)'
                          : '1px solid var(--hairline)',
                      }}
                    >
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.05em] ${
                          isToday ? 'text-brand-500' : 'text-ink-400'
                        }`}
                      >
                        {d.label}
                      </span>
                      {isToday && (
                        <span
                          className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-pill text-[10px] font-bold bg-brand-500 text-white"
                        >
                          bu gün
                        </span>
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {periods.map((period, rowIdx) => (
                <tr key={period}>
                  {/* Period number */}
                  <td
                    className="px-4 py-3 text-center"
                    style={{
                      borderBottom: rowIdx < periods.length - 1 ? '1px solid var(--hairline)' : 'none',
                    }}
                  >
                    <span className="font-semibold text-sm text-ink-400 tabular-nums">
                      {period}
                    </span>
                  </td>

                  {days.map(d => {
                    const slot = getSlot(d.key, period)
                    const hue = slot ? hueFor(slot.subject?.name || '') : null
                    const isToday = d.key === today

                    return (
                      <td
                        key={d.key}
                        className="px-2 py-2"
                        style={{
                          borderBottom: rowIdx < periods.length - 1 ? '1px solid var(--hairline)' : 'none',
                          background: isToday ? 'rgba(87,79,207,0.025)' : 'transparent',
                        }}
                      >
                        {slot ? (
                          <div
                            className="px-3 py-2.5 transition-shadow duration-150 hover:shadow-soft"
                            style={{
                              borderRadius: 6,
                              background: hue.bg,
                              border: `1px solid ${hue.border}`,
                              borderLeft: `3px solid ${hue.accent}`,
                            }}
                          >
                            <p
                              className="text-sm font-semibold truncate leading-snug"
                              style={{ color: 'var(--ink-900)' }}
                            >
                              {slot.subject?.name}
                            </p>
                            <p
                              className="text-xs mt-0.5 truncate font-semibold"
                              style={{ color: hue.text }}
                            >
                              {slot.class?.name}
                            </p>
                            {slot.room && (
                              <p className="text-[11px] mt-0.5 text-ink-400">
                                Otaq {slot.room}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-tile h-14" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
