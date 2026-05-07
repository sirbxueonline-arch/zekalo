import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'

export default function StudentProgress() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <span className="pastel-text">Tərəqqim</span>
        </h1>
        <p className="text-sm mt-2" style={{ color: '#64748b' }}>
          Fənlər üzrə qiymət dinamikası və inkişaf trendləri
        </p>
      </div>
      <ProgressView studentId={profile?.id} studentName={profile?.full_name} />
    </div>
  )
}
