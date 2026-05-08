import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ShieldCheck, Loader2, Copy, CheckCheck, AlertTriangle, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import { rolePath } from '../../lib/domain'

// Dedicated full-page 2FA enrollment flow.
// User clicks "2FA-nı aktivləşdir" anywhere → navigates here → enrolls inline.
// On success → navigate back to their dashboard.

export default function Setup2FA() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [step, setStep]               = useState('init') // init | qr | verifying | error | done
  const [factor, setFactor]           = useState(null)   // { id, totp: { qr_code, secret, uri } }
  const [code, setCode]               = useState('')
  const [err, setErr]                 = useState(null)
  const [secretCopied, setSecretCopied] = useState(false)

  useEffect(() => { startEnroll() }, [])

  function backToDashboard() {
    navigate(rolePath(profile?.role) || '/dashboard', { replace: true })
  }

  async function startEnroll() {
    setStep('init'); setErr(null); setCode('')
    try {
      // Clean up any stale unverified factors so we don't hit
      // "factor friendly name already exists" on retry.
      const { data: list } = await supabase.auth.mfa.listFactors()
      const stale = (list?.totp || []).filter(f => f.status !== 'verified')
      for (const f of stale) {
        try { await supabase.auth.mfa.unenroll({ factorId: f.id }) } catch {}
      }

      // If a verified factor already exists, jump straight to "done" state.
      const verified = (list?.totp || []).find(f => f.status === 'verified')
      if (verified) {
        setStep('done')
        return
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Authenticator App ${Date.now()}`,
      })
      if (error) throw error
      if (!data?.totp?.qr_code) throw new Error('Supabase did not return a QR code. MFA may be disabled in this project.')
      setFactor(data)
      setStep('qr')
    } catch (e) {
      setErr(e.message || String(e))
      setStep('error')
    }
  }

  async function confirmEnroll() {
    if (!code.trim() || code.trim().length !== 6) {
      setErr('6 rəqəmli kod daxil edin')
      return
    }
    setStep('verifying'); setErr(null)
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id })
      if (chErr) throw chErr
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: ch.id,
        code: code.trim(),
      })
      if (vErr) throw vErr
      setStep('done')
    } catch (e) {
      setErr(e.message?.replace('Invalid TOTP code entered', 'Yanlış kod, yenidən cəhd edin') || String(e))
      setStep('qr')
    }
  }

  async function cancelEnroll() {
    if (factor?.id) {
      try { await supabase.auth.mfa.unenroll({ factorId: factor.id }) } catch {}
    }
    backToDashboard()
  }

  function copySecret() {
    if (!factor?.totp?.secret) return
    navigator.clipboard.writeText(factor.totp.secret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #f5f3ff 0%, #ecfdf5 100%)',
      padding:'40px 20px',
    }}>
      <div style={{ maxWidth:560, margin:'0 auto' }}>
        <button
          onClick={backToDashboard}
          style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'transparent', border:'none', color:'#64748b',
            fontSize:13.5, fontWeight:600, cursor:'pointer',
            padding:'8px 0', marginBottom:16,
          }}
        >
          <ArrowLeft style={{ width:16, height:16 }}/> Geri
        </button>

        <div className="liquid-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
            <div style={{
              width:52, height:52, borderRadius:14,
              background: step === 'done'
                ? 'linear-gradient(135deg, rgba(93,184,163,0.25), rgba(93,184,163,0.1))'
                : 'linear-gradient(135deg, rgba(124,110,224,0.2), rgba(124,110,224,0.08))',
              border:`1px solid ${step === 'done' ? 'rgba(93,184,163,0.35)' : 'rgba(124,110,224,0.3)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {step === 'done'
                ? <ShieldCheck style={{ width:24, height:24, color:'#5db8a3' }}/>
                : <Shield style={{ width:24, height:24, color:'#7c6ee0' }}/>}
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:'#1a1a2e', margin:0, letterSpacing:'-0.01em' }}>
                İki amilli identifikasiya
              </h1>
              <p style={{ fontSize:13.5, color:'#64748b', margin:'4px 0 0' }}>
                Authenticator tətbiqi ilə hesabınızı qoruyun
              </p>
            </div>
          </div>

          {step === 'init' && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 20px' }}>
              <Loader2 style={{ width:36, height:36, color:'#7c6ee0' }} className="animate-spin"/>
            </div>
          )}

          {step === 'error' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{
                display:'flex', gap:10, padding:'14px 16px', borderRadius:12,
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                color:'#dc2626', fontSize:13.5,
              }}>
                <AlertTriangle style={{ width:18, height:18, flexShrink:0, marginTop:1 }}/>
                <div>
                  <p style={{ fontWeight:600, margin:0 }}>2FA-nı aktivləşdirmək alınmadı</p>
                  <p style={{ margin:'4px 0 0', color:'#7f1d1d', lineHeight:1.5 }}>{err}</p>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                <Button variant="ghost" onClick={backToDashboard}>Bağla</Button>
                <Button onClick={startEnroll}>Yenidən cəhd et</Button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div style={{
                padding:'16px 18px', borderRadius:12,
                background:'rgba(93,184,163,0.1)', border:'1px solid rgba(93,184,163,0.25)',
              }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#1a1a2e', margin:0 }}>
                  2FA hesabınızda aktivdir
                </p>
                <p style={{ fontSize:13, color:'#64748b', margin:'4px 0 0', lineHeight:1.55 }}>
                  Növbəti dəfə daxil olarkən authenticator tətbiqindən 6 rəqəmli kod tələb olunacaq.
                </p>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <Button onClick={backToDashboard}>Dashboard-a qayıt</Button>
              </div>
            </div>
          )}

          {(step === 'qr' || step === 'verifying') && factor && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
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
                  src={factor.totp.qr_code}
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
                    {factor.totp.secret}
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
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  disabled={step === 'verifying'}
                  className="pastel-input"
                  style={{ width:'100%', textAlign:'center', fontSize:24, letterSpacing:'0.4em', fontWeight:600 }}
                />
              </div>

              {err && (
                <div style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 14px', borderRadius:10,
                  background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                  color:'#dc2626', fontSize:13,
                }}>
                  <AlertTriangle style={{ width:14, height:14 }}/> {err}
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                <Button variant="ghost" onClick={cancelEnroll} disabled={step === 'verifying'}>
                  Ləğv et
                </Button>
                <Button onClick={confirmEnroll} disabled={step === 'verifying' || code.length !== 6}>
                  {step === 'verifying'
                    ? <><Loader2 style={{ width:14, height:14 }} className="animate-spin"/> Yoxlanılır…</>
                    : 'Təsdiqlə və aktivləşdir'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
