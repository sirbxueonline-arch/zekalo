import { useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import { Users } from 'lucide-react'

export default function AdminStudentProgress() {
  const { profile } = useAuth()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [classFilter, setClassFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      const [studentsRes, classesRes, membersRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('school_id', profile.school_id).eq('role', 'student').order('full_name'),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('class_members').select('student_id, class_id, class:classes(id, name)'),
      ])
      const classMap = {}
      ;(membersRes.data || []).forEach(m => { if (m.class) classMap[m.student_id] = m.class })
      const studentsWithClass = (studentsRes.data || []).map(s => ({ ...s, class: classMap[s.id] || null }))
      setStudents(studentsWithClass)
      setClasses(classesRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const filtered = students
    .filter(s => !classFilter || s.class?.id === classFilter)
    .filter(s =>
      !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">Şagird Tərəqqisi</h1>
        <p className="text-sm text-ink-400 mt-0.5">Şagird seçin — qiymət dinamikası və inkişaf trendlərini görün</p>
      </div>

      {/* Student picker */}
      <div className="liquid-card p-5 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ad ilə axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pastel-input pl-10"
            />
          </div>
          {/* Class filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="pastel-input appearance-none pr-9 cursor-pointer"
            >
              <option value="">Bütün siniflər</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Student list */}
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-4">Şagird tapılmadı</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map(s => {
              const isSelected = selectedStudent?.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-tile text-left transition-colors border ${
                    isSelected
                      ? 'bg-brand-50 border-brand-300'
                      : 'bg-surface border-hairline hover:border-brand-200 hover:bg-brand-50/40'
                  }`}
                >
                  <Avatar name={s.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-700' : 'text-ink-900'}`}>
                      {s.full_name}
                    </p>
                    {s.class && (
                      <p className="text-xs text-ink-400 truncate">{s.class.name}</p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Progress view for selected student */}
      {selectedStudent ? (
        <div>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-hairline">
            <Avatar name={selectedStudent.full_name} size="md" />
            <div>
              <h2 className="text-xl font-semibold text-ink-900">{selectedStudent.full_name}</h2>
              {selectedStudent.class && (
                <p className="text-sm text-ink-400">{selectedStudent.class.name} sinfi</p>
              )}
            </div>
          </div>
          <ProgressView studentId={selectedStudent.id} studentName={selectedStudent.full_name} />
        </div>
      ) : (
        <EmptyState
          tier={1}
          icon={Users}
          title="Şagird seçin"
          description="Yuxarıdan şagird seçin — onun tərəqqi qrafiki burada görünəcək"
        />
      )}
    </div>
  )
}
