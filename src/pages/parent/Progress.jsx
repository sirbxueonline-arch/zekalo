import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function ParentProgress() {
  const { profile } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) fetchChildren()
  }, [profile?.id])

  async function fetchChildren() {
    try {
      const { data } = await supabase
        .from('parent_children')
        .select('child:profiles!parent_children_child_id_fkey(id, full_name)')
        .eq('parent_id', profile.id)
      const kids = (data || []).map(r => r.child).filter(Boolean)
      setChildren(kids)
      if (kids.length > 0) setSelectedChild(kids[0])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza hələ uşaq əlavə edilməyib"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Tərəqqi</h1>
          <p className="text-sm text-gray-500 mt-1">Uşağınızın qiymət dinamikası</p>
        </div>

        {/* Child selector — only shown when multiple children */}
        {children.length > 1 && (
          <div className="relative">
            <select
              value={selectedChild?.id || ''}
              onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))}
              className="appearance-none border border-border-soft rounded-lg pl-4 pr-10 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple font-medium text-gray-800"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {selectedChild && (
        <ProgressView studentId={selectedChild.id} studentName={selectedChild.full_name} />
      )}
    </div>
  )
}
