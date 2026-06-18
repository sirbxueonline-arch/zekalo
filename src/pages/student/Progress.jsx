import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'
import { TrendingUp } from 'lucide-react'

export default function StudentProgress() {
  const { profile } = useAuth()

  return (
    <div className="space-y-8">
      {/* Page hero */}
      <div className="flex items-center gap-4">
        <div
          className="icon-chip icon-chip-periwinkle"
          style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0 }}
        >
          <TrendingUp className="w-7 h-7" />
        </div>
        <div>
          <h1
            className="font-display text-ink-900"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12 }}
          >
            Tərəqqim
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Fənlər üzrə qiymət dinamikası və inkişaf trendləri
          </p>
        </div>
      </div>

      <ProgressView studentId={profile?.id} studentName={profile?.full_name} />
    </div>
  )
}
