import { useState, useEffect } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const AVATAR_COLORS = ['var(--brand-400)', 'var(--grape)', 'var(--mint)', 'var(--sky)']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

export default function ParentProgress() {
  const { profile } = useAuth()
  const [children, setChildren]         = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading]           = useState(true)

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
        pose="thinking"
        title="Uşaq tapılmadı"
        description="Hesabınıza hələ uşaq əlavə edilməyib"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div
            className="icon-chip icon-chip-periwinkle flex-shrink-0"
            style={{ width: 48, height: 48 }}
          >
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-[30px] font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
              Tərəqqi
            </h1>
            <p className="text-[15px] text-ink-400 mt-0.5">Uşağınızın qiymət dinamikası</p>
          </div>
        </div>

        {/* Dropdown for >1 child (compact, used alongside pill switcher below) */}
        {children.length > 1 && (
          <div className="relative">
            <select
              value={selectedChild?.id || ''}
              onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))}
              className="appearance-none rounded-input pl-4 pr-10 py-2.5 text-sm focus:outline-none font-semibold text-ink-900 bg-surface"
              style={{ border: '1px solid var(--hairline)' }}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--brand-500)' }}
            />
          </div>
        )}
      </div>

      {/* Child pill switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = avatarColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-pill text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? { background: 'var(--brand-500)', color: '#fff' }
                    : { background: 'var(--surface)', color: 'var(--ink-700)', border: '1px solid var(--hairline)' }
                }
              >
                <span
                  className="w-7 h-7 rounded-pill flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : color }}
                >
                  {childInitials(child.full_name)}
                </span>
                {child.full_name}
              </button>
            )
          })}
        </div>
      )}

      {/* Progress view card */}
      {selectedChild && (
        <div className="liquid-card p-6">
          <ProgressView studentId={selectedChild.id} studentName={selectedChild.full_name} />
        </div>
      )}
    </div>
  )
}
