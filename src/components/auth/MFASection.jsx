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
    <div className="liquid-card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:18 }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background: isEnrolled
            ? 'linear-gradient(135deg, rgba(93,184,163,0.25), rgba(93,184,163,0.1))'
            : 'linear-gradient(135deg, rgba(124,110,224,0.18), rgba(124,110,224,0.06))',
          border: `1px solid ${isEnrolled ? 'rgba(93,184,163,0.3)' : 'rgba(124,110,224,0.25)'}`,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          {isEnrolled
            ? <ShieldCheck style={{ width:20, height:20, color:'#5db8a3' }}/>
            : <Shield style={{ width:20, height:20, color:'#7c6ee0' }}/>}
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:4, letterSpacing:'-0.01em' }}>
            İki amilli identifikasiya (2FA)
          </h3>
          <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.55, margin:0 }}>
            {isEnrolled
              ? 'Hesabınız autentikator tətbiqi ilə qorunur. Daxil olarkən hər dəfə 6 rəqəmli kod tələb olunacaq.'
              : 'Authenticator (Google Authenticator, 1Password, Authy, və s.) ilə hesabınızı qoruyun. Yüksək imtiyazlı hesablar üçün məcburidir.'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding:'10px 14px', borderRadius:10, marginBottom:14,
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          color:'#dc2626', fontSize:13,
        }}>{error}</div>
      )}

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'#64748b', fontSize:13.5 }}>
          <Loader2 style={{ width:16, height:16 }} className="animate-spin"/> Yoxlanılır…
        </div>
      ) : isEnrolled ? (
        <div>
          {verified.map(f => (
            <div key={f.id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 16px', borderRadius:12,
              background:'rgba(93,184,163,0.08)', border:'1px solid rgba(93,184,163,0.2)',
              marginBottom:10,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <ShieldCheck style={{ width:16, height:16, color:'#5db8a3' }}/>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:'#1a1a2e', margin:0 }}>
                    {f.friendly_name || 'Authenticator App'}
                  </p>
                  <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>
                    Aktiv · TOTP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDisableOpen(f)}
                style={{
                  fontSize:12.5, fontWeight:600, color:'#dc2626', cursor:'pointer',
                  background:'transparent', border:'none', padding:'6px 10px', borderRadius:8,
                  transition:'background .15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Söndür
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Button onClick={() => navigate('/tehlukesizlik/2fa')}>
          <Shield style={{ width:14, height:14 }}/> 2FA-nı aktivləşdir
        </Button>
      )}

      {/* Disable modal */}
      <Modal open={!!disableOpen} onClose={() => { setDisableOpen(null); setDisableErr(null) }} title="2FA-nı söndür">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{
            display:'flex', gap:12, padding:'14px 16px',
            background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)',
            borderRadius:12,
          }}>
            <AlertTriangle style={{ width:20, height:20, color:'#dc2626', flexShrink:0, marginTop:2 }}/>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#1a1a2e', margin:0 }}>
                Hesabın qorunma səviyyəsi azalacaq
              </p>
              <p style={{ fontSize:13, color:'#64748b', lineHeight:1.55, margin:'4px 0 0' }}>
                2FA söndürüldükdən sonra hesabınız yalnız parol ilə qorunacaq. Bunu yalnız zərurət olduqda edin.
              </p>
            </div>
          </div>

          {disableErr && (
            <div style={{
              display:'flex', gap:10, padding:'12px 14px', borderRadius:10,
              background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)',
              color:'#991b1b', fontSize:13, lineHeight:1.5,
            }}>
              <AlertTriangle style={{ width:16, height:16, flexShrink:0, marginTop:1 }}/>
              <span>{disableErr}</span>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={() => { setDisableOpen(null); setDisableErr(null) }} disabled={disableLoading}>
              Ləğv et
            </Button>
            <Button variant="danger" onClick={confirmDisable} disabled={disableLoading}>
              {disableLoading
                ? <><Loader2 style={{ width:14, height:14 }} className="animate-spin"/> Söndürülür…</>
                : <><ShieldOff style={{ width:14, height:14 }}/> Bəli, söndür</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
