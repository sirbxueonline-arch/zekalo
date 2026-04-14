import Button from '../../components/ui/Button'

export default function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <span className="text-[120px] font-serif text-border-soft leading-none">500</span>
      <h1 className="font-serif text-3xl text-gray-900 mt-4 mb-2">Xəta baş verdi</h1>
      <p className="text-sm text-gray-500 mb-8">Server xətası baş verdi. Zəhmət olmasa yenidən cəhd edin.</p>
      <Button onClick={() => window.location.reload()}>Yenidən cəhd edin</Button>
    </div>
  )
}
