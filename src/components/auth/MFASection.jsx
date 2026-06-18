import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ShieldCheck, ShieldOff, Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

// Status + disable surface for 2FA. The actual enrollment flow lives at
// /tehlukesizlik/2fa as a dedicated full-page experience — clicking the
// "aktivləşdir" button just navigates there.

export default function MFASection() {
  const navigate = useNavigate()
  const [factors, setFactors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Disable modal
  const [disableOpen, setDisableOpen]       = useState(null) // factor object or null
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableErr, setDisableErr]         = useState(null)

  useEffect(() => { loadFactors() }, [])

  async function loadFactors() {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      setFactors(data?.totp || [])
    } catch (e) {
      setError(e.message || String(e))
    } finally { setLoading(false) }
  }

  async function confirmDisable() {
    if (!disableOpen) return
    setDisableLoading(true)
    setDisableErr(null)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: disableOpen.id })
      if (error) throw error
      setDisableOpen(null)
      await loadFactors()
    } catch (e) {
      // Most common case: Supabase requires the session to be at AAL2 to
      // disable MFA. Surface a clear message inside the modal so the user
      // doesn't think the button is broken.
      const msg = e.message || String(e)
      const friendly = /aal2|assurance level/i.test(msg)
        ? '2FA-nı söndürmək üçün əvvəlcə cari sessiyanı 2FA ilə təsdiqləməlisiniz. Çıxış edib yenidən daxil olun və daxil olarkən authenticator kodunu daxil edin — sonra bu düyməni təkrar işlədin.'
        : msg
      setDisableErr(friendly)
    } finally {
      setDisableLoading(false)
    }
  }

  const verified   = factors.filter(f => f.status === 'verified')
  const isEnrolled = verified.length > 0

  return (
    <div className="liquid-card" style={{ padding: 24 }}>
      <div className="flex items-start gap-3.5 mb-5">
        <div className={`icon-chip ${isEnrolled ? 'icon-chip-mint' : 'icon-chip-periwinkle'}`}>
          {isEnrolled
            ? <ShieldCheck className="w-5 h-5" />
            : <Shield className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-[17px] font-bold text-ink-900 mb-1 tracking-tight">
            İki amilli identifikasiya (2FA)
          </h3>
          <p className="text-[13.5px] text-ink-600 leading-relaxed m-0">
            {isEnrolled
              ? 'Hesabınız autentikator tətbiqi ilə qorunur. Daxil olarkən hər dəfə 6 rəqəmli kod tələb olunacaq.'
              : 'Authenticator (Google Authenticator, 1Password, Authy, və s.) ilə hesabınızı qoruyun. Yüksək imtiyazlı hesablar üçün məcburidir.'}
          </p>
        </div>
        {isEnrolled && (
          <span className="pill-mint shrink-0 mt-0.5">Aktiv</span>
        )}
      </div>

      {error && (
        <div className="mb-3.5 rounded-tile bg-danger/[0.08] border border-danger/20 text-[#DC2626] text-[13px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2.5 text-ink-600 text-[13.5px]">
          <Loader2 className="w-4 h-4 animate-spin" /> Yoxlanılır…
        </div>
      ) : isEnrolled ? (
        <div className="space-y-2.5">
          {verified.map(f => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-tile bg-mint/[0.08] border border-mint/25 px-4 py-3.5"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink-900 m-0">
                    {f.friendly_name || 'Authenticator App'}
                  </p>
                  <p className="text-[12px] text-ink-400 mt-0.5 mb-0 tabular-nums">
                    Aktiv · TOTP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDisableOpen(f)}
                className="shrink-0 text-[12.5px] font-semibold text-danger rounded-lg px-2.5 py-1.5 transition-colors hover:bg-danger/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
              >
                Söndür
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Button onClick={() => navigate('/tehlukesizlik/2fa')}>
          <Shield className="w-3.5 h-3.5" /> 2FA-nı aktivləşdir
        </Button>
      )}

      {/* Disable modal */}
      <Modal open={!!disableOpen} onClose={() => { setDisableOpen(null); setDisableErr(null) }} title="2FA-nı söndür">
        <div className="flex flex-col gap-3.5">
          <div className="flex gap-3 rounded-tile bg-danger/[0.06] border border-danger/[0.18] px-4 py-3.5">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-ink-900 m-0">
                Hesabın qorunma səviyyəsi azalacaq
              </p>
              <p className="text-[13px] text-ink-600 leading-relaxed mt-1 mb-0">
                2FA söndürüldükdən sonra hesabınız yalnız parol ilə qorunacaq. Bunu yalnız zərurət olduqda edin.
              </p>
            </div>
          </div>

          {disableErr && (
            <div className="flex gap-2.5 rounded-tile bg-danger/[0.08] border border-danger/[0.22] text-[#991B1B] text-[13px] leading-normal px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{disableErr}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="ghost" onClick={() => { setDisableOpen(null); setDisableErr(null) }} disabled={disableLoading}>
              Ləğv et
            </Button>
            <Button variant="danger" onClick={confirmDisable} disabled={disableLoading}>
              {disableLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Söndürülür…</>
                : <><ShieldOff className="w-3.5 h-3.5" /> Bəli, söndür</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
