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
        <h1 className="font-serif text-3xl text-gray-900">Şagird Tərəqqisi</h1>
        <p className="text-sm text-gray-500 mt-1">Şagird seçin — qiymət dinamikası və inkişaf trendlərini görün</p>
      </div>

      {/* Student picker */}
      <div className="bg-white border border-border-soft rounded-xl p-5 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ad ilə axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border-soft rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple"
            />
          </div>
          {/* Class filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="appearance-none border border-border-soft rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple"
            >
              <option value="">Bütün siniflər</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Student list */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Şagird tapılmadı</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {filtered.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                  selectedStudent?.id === s.id
                    ? 'border-purple bg-purple-light'
                    : 'border-border-soft hover:border-purple/40 hover:bg-surface'
                }`}
              >
                <Avatar name={s.full_name} size="sm" />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedStudent?.id === s.id ? 'text-purple' : 'text-gray-900'}`}>
                    {s.full_name}
                  </p>
                  {s.class && <p className="text-xs text-gray-400">{s.class.name}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress view for selected student */}
      {selectedStudent ? (
        <div>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-soft">
            <Avatar name={selectedStudent.full_name} size="md" />
            <div>
              <h2 className="font-serif text-2xl text-gray-900">{selectedStudent.full_name}</h2>
              {selectedStudent.class && <p className="text-sm text-gray-500">{selectedStudent.class.name} sinfi</p>}
            </div>
          </div>
          <ProgressView studentId={selectedStudent.id} studentName={selectedStudent.full_name} />
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Şagird seçin"
          description="Yuxarıdan şagird seçin — onun tərəqqi qrafiki burada görünəcək"
        />
      )}
    </div>
  )
}
