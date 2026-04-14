import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, Printer } from 'lucide-react'

const days = [
  { key: 1, label: 'Bazar ertəsi' },
  { key: 2, label: 'Chərshenbe axshami' },
  { key: 3, label: 'Chərshenbe' },
  { key: 4, label: 'Cumə axshami' },
  { key: 5, label: 'Cumə' },
  { key: 6, label: 'Shənbe' },
]

const periods = [1, 2, 3, 4, 5, 6, 7, 8]

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

  if (loading) return <PageSpinner />

  if (!slots.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="Cədvəl tapilmadi"
        description="Sizin ucun hələ dərs cədvəli dərc olunmayib"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('timetable')}</h1>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          {t('print')}
        </Button>
      </div>

      <Card hover={false} className="overflow-x-auto print:shadow-none print:border-0">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-surface">
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-left w-16">Saat</th>
              {days.map(d => (
                <th key={d.key} className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 text-center">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period} className="border-b border-border-soft">
                <td className="px-4 py-4 text-sm font-medium text-gray-500 text-center">{period}</td>
                {days.map(d => {
                  const slot = getSlot(d.key, period)
                  return (
                    <td key={d.key} className="px-2 py-2 text-center">
                      {slot ? (
                        <div className="bg-purple-light border border-purple-mid/30 rounded-lg px-3 py-2">
                          <p className="text-sm font-medium text-purple-dark">{slot.subject?.name}</p>
                          <p className="text-xs text-gray-500">{slot.class?.name}</p>
                          {slot.room && <p className="text-xs text-gray-400">Otaq {slot.room}</p>}
                        </div>
                      ) : (
                        <div className="h-12" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
