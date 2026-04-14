import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

export default function Verify() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white border border-border-soft rounded-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-purple-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-purple" />
          </div>
          <h1 className="font-serif text-2xl text-gray-900 mb-2">E-poçtunuzu yoxlayın</h1>
          <p className="text-sm text-gray-500">
            Hesabınızı təsdiqləmək üçün e-poçt ünvanınıza link göndərdik. Linki kliklədikdən sonra daxil ola bilərsiniz.
          </p>
        </div>
        <Link
          to="/daxil-ol"
          className="text-sm text-purple hover:text-purple-dark font-medium transition-colors"
        >
          Daxil olmağa qayıt
        </Link>
      </div>
    </div>
  )
}
