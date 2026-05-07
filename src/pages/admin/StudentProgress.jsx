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
        <h1 className="text-3xl font-bold tracking-tight"><span className="pastel-text">Şagird Tərəqqisi</span></h1>
        <p className="text-sm text-[#64748b] mt-1">Şagird seçin — qiymət dinamikası və inkişaf trendlərini görün</p>
      </div>

      {/* Student picker */}
      <div className="liquid-card p-5 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7c6ee0' }} />
            <input
              type="text"
              placeholder="Ad ilə axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(124,110,224,0.25)', color: '#1a1a2e' }}
            />
          </div>
          {/* Class filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="appearance-none rounded-full pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(124,110,224,0.25)', color: '#1a1a2e' }}
            >
              <option value="">Bütün siniflər</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7c6ee0' }} />
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
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all backdrop-blur-md"
                style={selectedStudent?.id === s.id
                  ? { background: 'rgba(124,110,224,0.12)', border: '1px solid rgba(124,110,224,0.4)' }
                  : { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.15)' }}
              >
                <Avatar name={s.full_name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: selectedStudent?.id === s.id ? '#5e4fc7' : '#1a1a2e' }}>
                    {s.full_name}
                  </p>
                  {s.class && <p className="text-xs" style={{ color: '#94a3b8' }}>{s.class.name}</p>}
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
