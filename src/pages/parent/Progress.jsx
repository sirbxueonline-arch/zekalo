import { useState, useEffect } from 'react'
import { ChevronDown, Users, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'
import { PageSpinner } from '../../components/ui/Spinner'

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

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
      <div className="liquid-card p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,110,224,0.12)' }}
          >
            <Users className="w-8 h-8" style={{ color: '#7c6ee0' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Uşaq tapılmadı</h3>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Hesabınıza hələ uşaq əlavə edilməyib</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            <span className="pastel-text">Tərəqqi</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Uşağınızın qiymət dinamikası</p>
        </div>

        {children.length > 1 && (
          <div className="relative">
            <select
              value={selectedChild?.id || ''}
              onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))}
              className="appearance-none rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none font-semibold"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(124,110,224,0.25)',
                backdropFilter: 'blur(12px)',
                color: '#1a1a2e',
              }}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#7c6ee0' }}
            />
          </div>
        )}
      </div>

      {/* Child glass switcher when multiple */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = pastelColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                        color: '#fff',
                        border: '1px solid rgba(124,110,224,0.3)',
                        boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.6)',
                        color: '#1a1a2e',
                        border: '1px solid rgba(124,110,224,0.2)',
                        backdropFilter: 'blur(12px)',
                      }
                }
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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

      {selectedChild && (
        <div className="liquid-card p-6">
          <ProgressView studentId={selectedChild.id} studentName={selectedChild.full_name} />
        </div>
      )}
    </div>
  )
}
