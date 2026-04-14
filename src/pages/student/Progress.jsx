import { useAuth } from '../../contexts/AuthContext'
import ProgressView from '../../components/ui/ProgressView'

export default function StudentProgress() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Tərəqqim</h1>
        <p className="text-sm text-gray-500 mt-1">Fənlər üzrə qiymət dinamikası və inkişaf trendləri</p>
      </div>
      <ProgressView studentId={profile?.id} studentName={profile?.full_name} />
    </div>
  )
}
