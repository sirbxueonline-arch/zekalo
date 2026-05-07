import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Calendar, Printer, Clock } from 'lucide-react'

const days = [
  { key: 1, label: 'Bazar ertəsi' },
  { key: 2, label: 'Çərşənbə axşamı' },
  { key: 3, label: 'Çərşənbə' },
  { key: 4, label: 'Cümə axşamı' },
  { key: 5, label: 'Cümə' },
  { key: 6, label: 'Şənbə' },
]

const periods = [1, 2, 3, 4, 5, 6, 7, 8]

// Hash subject name → pastel hue (so each subject has a stable color)
const PASTEL_HUES = [
  { bg: 'rgba(124,110,224,0.10)', accent: '#7c6ee0' },
  { bg: 'rgba(93,184,163,0.12)',  accent: '#5db8a3' },
  { bg: 'rgba(232,168,124,0.14)', accent: '#d68a5a' },
  { bg: 'rgba(107,157,222,0.12)', accent: '#6b9dde' },
  { bg: 'rgba(200,158,212,0.14)', accent: '#c89ed4' },
  { bg: 'rgba(214,138,90,0.14)',  accent: '#d68a5a' },
]

function hueFor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_HUES[Math.abs(h) % PASTEL_HUES.length]
}

export default function TeacherTimetable() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState([])

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">{t('timetable')}</span>
        </h1>
        {slots.length > 0 && (
          <button onClick={handlePrint} className="btn-ghost-pastel" style={{ padding: '10px 18px', fontSize: 13 }}>
            <Printer className="w-4 h-4" /> {t('print')}
          </button>
        )}
      </div>

      {!slots.length ? (
        <div className="liquid-card p-12">
          <div className="text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Cədvəl tapılmadı</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Sizin üçün hələ dərs cədvəli dərc olunmayıb</p>
          </div>
        </div>
      ) : (
        <div className="liquid-card overflow-x-auto print:shadow-none">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr>
                <th className="text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left w-16"
                  style={{ color: '#64748b', background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                >
                  <Clock className="w-3.5 h-3.5 inline" />
                </th>
                {days.map(d => (
                  <th key={d.key}
                    className="text-xs font-semibold uppercase tracking-wider px-4 py-3 text-center"
                    style={{ color: '#64748b', background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <td className="px-4 py-4 text-sm font-bold text-center"
                    style={{ color: '#7c6ee0', borderBottom: '1px solid rgba(124,110,224,0.06)' }}
                  >
                    {period}
                  </td>
                  {days.map(d => {
                    const slot = getSlot(d.key, period)
                    const hue = slot ? hueFor(slot.subject?.name || '') : null
                    return (
                      <td key={d.key} className="px-2 py-2"
                        style={{ borderBottom: '1px solid rgba(124,110,224,0.06)' }}
                      >
                        {slot ? (
                          <div
                            className="rounded-xl px-3 py-2 smooth-trans drop-target cursor-default"
                            style={{
                              background: hue.bg,
                              border: `1px solid ${hue.accent}33`,
                              borderLeft: `3px solid ${hue.accent}`,
                            }}
                          >
                            <p className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>
                              {slot.subject?.name}
                            </p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: hue.accent, fontWeight: 600 }}>
                              {slot.class?.name}
                            </p>
                            {slot.room && <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>Otaq {slot.room}</p>}
                          </div>
                        ) : (
                          <div className="rounded-xl drop-target h-14" />
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
