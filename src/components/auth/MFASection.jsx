import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, CheckCheck, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

// Reusable Multi-Factor Authentication enrollment / disable section.
// Drop into any profile or settings page:
//
//   import MFASection from '../../components/auth/MFASection'
//   <MFASection />
//
// Uses Supabase MFA: TOTP factor type. Requires MFA enabled in Supabase
// Auth → Multi-Factor Authentication settings.

export default function MFASection() {
  const [factors, setFactors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Enroll modal state
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollStep, setEnrollStep] = useState('init')   // init | qr | verifying
  const [enrollFactor, setEnrollFactor] = useState(null) // { id, totp: { qr_code, secret, uri } }
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollErr, setEnrollErr]   = useState(null)
  const [secretCopied, setSecretCopied] = useState(false)

  // Disable modal
  const [disableOpen, setDisableOpen] = useState(null) // factor object or null
  const [disableLoading, setDisableLoading] = useState(false)

  useEffect(() => { loadFactors() }, [])

  async function loadFactors() {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      // data.totp is an array of TOTP factors with { id, friendly_name, status, factor_type }
      setFactors(data?.totp || [])
    } catch (e) {
      setError(e.message || String(e))
    } finally { setLoading(false) }
  }

  async function startEnroll() {
    setEnrollOpen(true); setEnrollStep('init'); setEnrollErr(null); setEnrollCode('')
    try {
      // Clean up any stale unverified TOTP factors from prior aborted attempts —
      // Supabase rejects new enrolls with "factor friendly name already exists".
      const { data: list } = await supabase.auth.mfa.listFactors()
      const stale = (list?.totp || []).filter(f => f.status !== 'verified')
      for (const f of stale) {
        try { await supabase.auth.mfa.unenroll({ factorId: f.id }) } catch {}
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator App ${Date.now()}`,
      })
      if (error) throw error
      if (!data?.totp?.qr_code) throw new Error('Supabase did not return a QR code. MFA may be disabled in this project.')
      setEnrollFactor(data)
      setEnrollStep('qr')
    } catch (e) {
      setEnrollErr(e.message || String(e))
      setEnrollStep('error')
    }
  }

  async function confirmEnroll() {
    if (!enrollCode.trim() || enrollCode.trim().length !== 6) {
      setEnrollErr('6 rəqəmli kod daxil edin')
      return
    }
    setEnrollStep('verifying'); setEnrollErr(null)
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactor.id })
      if (chErr) throw chErr
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId:    enrollFactor.id,
        challengeId: ch.id,
        code:        enrollCode.trim(),
      })
      if (vErr) throw vErr
      // Success
      setEnrollOpen(false)
      setEnrollFactor(null)
      setEnrollCode('')
      await loadFactors()
    } catch (e) {
      setEnrollErr(e.message?.replace('Invalid TOTP code entered', 'Yanlış kod, yenidən cəhd edin') || String(e))
      setEnrollStep('qr')
    }
  }

  async function cancelEnroll() {
    if (enrollFactor?.id) {
      try { await supabase.auth.mfa.unenroll({ factorId: enrollFactor.id }) } catch {}
    }
    setEnrollOpen(false)
    setEnrollFactor(null)
    setEnrollCode('')
  }

  async function confirmDisable() {
    if (!disableOpen) return
    setDisableLoading(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: disableOpen.id })
      if (error) throw error
      setDisableOpen(null)
      await loadFactors()
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setDisableLoading(false)
    }
  }

  function copySecret() {
    if (!enrollFactor?.totp?.secret) return
    navigator.clipboard.writeText(enrollFactor.totp.secret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  const verified = factors.filter(f => f.status === 'verified')
  const isEnrolled = verified.length > 0

  return (
    <div className="liquid-card" style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:18 }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background: isEnrolled ? 'linear-gradient(135deg, rgba(93,184,163,0.25), rgba(93,184,163,0.1))'
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
        <Button onClick={startEnroll}>
          <Shield style={{ width:14, height:14 }}/> 2FA-nı aktivləşdir
        </Button>
      )}

      {/* Enroll modal */}
      <Modal open={enrollOpen} onClose={cancelEnroll} title="İki amilli identifikasiyanı qur" size="full">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'24px 4px' }}>
        {enrollStep === 'init' && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 20px' }}>
            <Loader2 style={{ width:40, height:40, color:'#7c6ee0' }} className="animate-spin"/>
          </div>
        )}
        {enrollStep === 'error' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{
              display:'flex', gap:10, padding:'14px 16px', borderRadius:12,
              background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
              color:'#dc2626', fontSize:13.5,
            }}>
              <AlertTriangle style={{ width:18, height:18, flexShrink:0, marginTop:1 }}/>
              <div>
                <p style={{ fontWeight:600, margin:0 }}>2FA-nı aktivləşdirmək alınmadı</p>
                <p style={{ margin:'4px 0 0', color:'#7f1d1d', lineHeight:1.5 }}>{enrollErr}</p>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Button variant="ghost" onClick={cancelEnroll}>Bağla</Button>
              <Button onClick={startEnroll}>Yenidən cəhd et</Button>
            </div>
          </div>
        )}
        {(enrollStep === 'qr' || enrollStep === 'verifying') && enrollFactor && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <ol style={{ margin:0, paddingLeft:20, color:'#475569', fontSize:14, lineHeight:1.7 }}>
              <li>Telefonunuzda authenticator tətbiqini açın (Google Authenticator, 1Password, Authy)</li>
              <li>Aşağıdakı QR kodu skan edin <strong>və ya</strong> sirr açarını əl ilə daxil edin</li>
              <li>Tətbiqin verdiyi 6 rəqəmli kodu aşağıdakı sahəyə yazın</li>
            </ol>

            <div style={{
              padding:20, borderRadius:14, background:'#ffffff',
              border:'1px solid rgba(124,110,224,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <img
                src={enrollFactor.totp.qr_code}
                alt="2FA QR code"
                width={200}
                height={200}
                style={{ display:'block', imageRendering:'pixelated' }}
              />
            </div>

            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
                Sirr açarı
              </label>
              <div style={{ display:'flex', gap:8 }}>
                <code style={{
                  flex:1, padding:'10px 14px', borderRadius:10,
                  background:'rgba(124,110,224,0.06)', border:'1px solid rgba(124,110,224,0.2)',
                  fontSize:13, fontFamily:'monospace', color:'#1a1a2e',
                  wordBreak:'break-all',
                }}>
                  {enrollFactor.totp.secret}
                </code>
                <button
                  onClick={copySecret}
                  style={{
                    padding:'10px 14px', borderRadius:10,
                    background:'rgba(124,110,224,0.1)', border:'1px solid rgba(124,110,224,0.3)',
                    color:'#7c6ee0', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                    fontSize:13, fontWeight:600,
                  }}
                >
                  {secretCopied ? <CheckCheck style={{ width:14, height:14 }}/> : <Copy style={{ width:14, height:14 }}/>}
                  {secretCopied ? 'Köçürüldü' : 'Köçür'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#1a1a2e', display:'block', marginBottom:6 }}>
                6 rəqəmli kod
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={enrollCode}
                onChange={e => setEnrollCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                disabled={enrollStep === 'verifying'}
                className="pastel-input"
                style={{ width:'100%', textAlign:'center', fontSize:22, letterSpacing:'0.4em', fontWeight:600 }}
              />
            </div>

            {enrollErr && (
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'10px 14px', borderRadius:10,
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                color:'#dc2626', fontSize:13,
              }}>
                <AlertTriangle style={{ width:14, height:14 }}/> {enrollErr}
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:4 }}>
              <Button variant="ghost" onClick={cancelEnroll} disabled={enrollStep === 'verifying'}>
                Ləğv et
              </Button>
              <Button onClick={confirmEnroll} disabled={enrollStep === 'verifying' || enrollCode.length !== 6}>
                {enrollStep === 'verifying' ? <><Loader2 style={{ width:14, height:14 }} className="animate-spin"/> Yoxlanılır…</> : 'Təsdiqlə və aktivləşdir'}
              </Button>
            </div>
          </div>
        )}
        </div>
      </Modal>

      {/* Disable modal */}
      <Modal open={!!disableOpen} onClose={() => setDisableOpen(null)} title="2FA-nı söndür">
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

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={() => setDisableOpen(null)} disabled={disableLoading}>
              Ləğv et
            </Button>
            <Button variant="danger" onClick={confirmDisable} disabled={disableLoading}>
              {disableLoading ? <><Loader2 style={{ width:14, height:14 }} className="animate-spin"/> Söndürülür…</> : <><ShieldOff style={{ width:14, height:14 }}/> Bəli, söndür</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
