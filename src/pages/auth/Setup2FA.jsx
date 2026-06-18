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
      minHeight: '100vh',
      background: 'var(--canvas)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .s2fa-fade { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .s2fa-field-label {
          display:block; font-size:12px; font-weight:600; color:var(--ink-700);
          letter-spacing:.04em; text-transform:uppercase; margin-bottom:6px;
        }
        .s2fa-code-input {
          width:100%; background:var(--surface); border:1px solid var(--hairline-strong);
          border-radius:10px; padding:14px 18px; font-size:26px; letter-spacing:.4em;
          font-weight:700; text-align:center; color:var(--ink-900);
          outline:none; font-family:'Plus Jakarta Sans', monospace; font-variant-numeric:tabular-nums; box-sizing:border-box;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .s2fa-code-input:focus {
          border-color: var(--brand-500);
          box-shadow: 0 0 0 3px rgba(87,79,207,0.15);
        }
        .s2fa-code-input:disabled { background: var(--surface-2); color: var(--ink-400); cursor:not-allowed; }
        .s2fa-code-input::placeholder { color: var(--ink-400); letter-spacing:.3em; }
        .s2fa-secret-code {
          flex:1; padding:10px 14px; border-radius:10px;
          background: var(--surface-2); border:1px solid var(--hairline-strong);
          font-size:13px; font-family:monospace; color:var(--ink-900);
          word-break:break-all; line-height:1.5;
        }
        .s2fa-copy-btn {
          padding:10px 14px; border-radius:10px;
          background: var(--brand-50); border:1px solid var(--hairline-strong);
          color:var(--brand-500); cursor:pointer; display:flex; align-items:center; gap:6px;
          font-size:13px; font-weight:600; flex-shrink:0; white-space:nowrap;
          transition: background .15s ease, border-color .15s ease;
        }
        .s2fa-copy-btn:hover { background: var(--brand-100); border-color: var(--brand-300); }
        .s2fa-back-btn {
          display:inline-flex; align-items:center; gap:6px;
          background:transparent; border:none; color:var(--ink-600);
          font-size:13.5px; font-weight:600; cursor:pointer;
          padding:8px 0; transition:color .15s ease;
        }
        .s2fa-back-btn:hover { color:var(--ink-900); }
        @media (prefers-reduced-motion: reduce) {
          .s2fa-fade { animation: none; }
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 5 }}>
        {/* Back button */}
        <button onClick={backToDashboard} className="s2fa-back-btn" style={{ marginBottom: 20 }}>
          <ArrowLeft style={{ width: 16, height: 16 }}/> Geri
        </button>

        {/* Card */}
        <div className="liquid-card s2fa-fade" style={{ padding: '32px 28px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              ...(step === 'done'
                ? { background: '#E7F6EE' }
                : { background: 'var(--brand-50)' }
              ),
            }}>
              {step === 'done'
                ? <ShieldCheck style={{ width: 24, height: 24, color: 'var(--success)' }}/>
                : <Shield style={{ width: 24, height: 24, color: 'var(--brand-500)' }}/>}
            </div>
            <div>
              <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-900)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                İki amilli identifikasiya
              </h1>
              <p style={{ fontSize: 13.5, color: 'var(--ink-600)', margin: '3px 0 0', lineHeight: 1.45 }}>
                Authenticator tətbiqi ilə hesabınızı qoruyun
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--hairline)', marginBottom: 24 }} />

          {/* ── INIT (loading) ─────────────────────── */}
          {step === 'init' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 16 }}>
              <Loader2 style={{ width: 30, height: 30, color: 'var(--brand-400)' }} className="animate-spin" />
              <p style={{ fontSize: 13.5, color: 'var(--ink-600)', margin: 0 }}>QR kod hazırlanır…</p>
            </div>
          )}

          {/* ── ERROR ──────────────────────────────── */}
          {step === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 10,
                background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)',
                color: '#B91C1C',
              }}>
                <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}/>
                <div style={{ fontSize: 13.5 }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>2FA-nı aktivləşdirmək alınmadı</p>
                  <p style={{ margin: '4px 0 0', color: '#7f1d1d', lineHeight: 1.5 }}>{err}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="ghost" onClick={backToDashboard}>Bağla</Button>
                <Button onClick={startEnroll}>Yenidən cəhd et</Button>
              </div>
            </div>
          )}

          {/* ── DONE ───────────────────────────────── */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                padding: '16px 18px', borderRadius: 12,
                background: '#E7F6EE', border: '1px solid rgba(31,168,85,0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="icon-chip icon-chip-mint" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }}>
                    <ShieldCheck style={{ width: 16, height: 16 }} />
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                      2FA hesabınızda aktivdir
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '3px 0 0', lineHeight: 1.55 }}>
                      Növbəti dəfə daxil olarkən authenticator tətbiqindən 6 rəqəmli kod tələb olunacaq.
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={backToDashboard}>Dashboard-a qayıt</Button>
              </div>
            </div>
          )}

          {/* ── QR / VERIFYING ─────────────────────── */}
          {(step === 'qr' || step === 'verifying') && factor && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Steps guide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Telefonunuzda authenticator tətbiqini açın (Google Authenticator, 1Password, Authy)',
                  'Aşağıdakı QR kodu skan edin və ya sirr açarını əl ilə daxil edin',
                  'Tətbiqin verdiyi 6 rəqəmli kodu aşağıdakı sahəyə yazın',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--brand-500)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, marginTop: 1,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--ink-700)', margin: 0, lineHeight: 1.55 }}>{step}</p>
                  </div>
                ))}
              </div>

              {/* QR code */}
              <div style={{
                padding: 20, borderRadius: 12,
                background: 'var(--surface)', border: '1px solid var(--hairline-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={factor.totp.qr_code}
                  alt="2FA QR code"
                  width={200}
                  height={200}
                  style={{ display: 'block', imageRendering: 'pixelated', borderRadius: 8 }}
                />
              </div>

              {/* Secret key */}
              <div>
                <label className="s2fa-field-label">Sirr açarı</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <code className="s2fa-secret-code">
                    {factor.totp.secret}
                  </code>
                  <button onClick={copySecret} className="s2fa-copy-btn">
                    {secretCopied
                      ? <><CheckCheck style={{ width: 14, height: 14 }}/> Köçürüldü</>
                      : <><Copy style={{ width: 14, height: 14 }}/> Köçür</>}
                  </button>
                </div>
              </div>

              {/* Code input */}
              <div>
                <label className="s2fa-field-label">6 rəqəmli kod</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0  0  0  0  0  0"
                  disabled={step === 'verifying'}
                  className="s2fa-code-input"
                />
                {/* Character progress dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < code.length ? 'var(--brand-500)' : 'var(--hairline-strong)',
                      transition: 'background .15s ease',
                    }} />
                  ))}
                </div>
              </div>

              {/* Inline error */}
              {err && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#B91C1C', fontSize: 13,
                }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }}/> {err}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="ghost" onClick={cancelEnroll} disabled={step === 'verifying'}>
                  Ləğv et
                </Button>
                <Button onClick={confirmEnroll} disabled={step === 'verifying' || code.length !== 6} loading={step === 'verifying'}>
                  {step === 'verifying' ? 'Yoxlanılır…' : 'Təsdiqlə və aktivləşdir'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
