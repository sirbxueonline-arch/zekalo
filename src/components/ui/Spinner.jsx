import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-purple`} />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-purple" />
    </div>
  )
}
