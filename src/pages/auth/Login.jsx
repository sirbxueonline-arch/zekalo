import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showReset, setShowReset]   = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const [resetError, setResetError] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const { signIn, user, profile, t } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired  = searchParams.get('expired') === '1'
  const passwordReset   = searchParams.get('reset')   === '1'

  useEffect(() => {
    if (user && profile) {
      const d = { student:'/dashboard', teacher:'/muellim/dashboard', parent:'/valideyn/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard' }
      navigate(d[profile.role] || '/dashboard', { replace: true })
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      if (err?.message?.includes('Invalid login'))       setError(t('invalid_login'))
      else if (err?.message?.includes('Email not confirmed')) setError(t('email_not_confirmed'))
      else setError(err?.message || t('error'))
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!resetEmail) { setResetError('E-poçt daxil edin'); return }
    setResetLoading(true); setResetError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/sifre-sifirla'
    })
    setResetLoading(false)
    if (err) { setResetError(err.message); return }
    setResetSent(true)
  }

  /* ── shared input style ── */
  const inp = {
    width:'100%', padding:'13px 16px', borderRadius:12,
    background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.09)',
    color:'#fff', fontSize:14, fontWeight:500,
    outline:'none', transition:'all .2s ease',
    fontFamily:'inherit',
  }
  const focus = e => {
    e.target.style.borderColor = 'rgba(167,139,250,0.55)'
    e.target.style.background  = 'rgba(167,139,250,0.07)'
    e.target.style.boxShadow   = '0 0 0 4px rgba(167,139,250,0.10)'
  }
  const blur = e => {
    e.target.style.borderColor = 'rgba(255,255,255,0.09)'
    e.target.style.background  = 'rgba(255,255,255,0.04)'
    e.target.style.boxShadow   = 'none'
  }
  const lbl = {
    display:'block', fontSize:11, fontWeight:700,
    color:'rgba(255,255,255,0.38)', letterSpacing:'0.09em',
    textTransform:'uppercase', marginBottom:8,
  }

  return (
    <div style={{ minHeight:'100vh', background:'#04040d', fontFamily:'Plus Jakarta Sans, system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes lgnFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(3%,2%) scale(1.05)} }
        @keyframes lgnFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-2%,-3%) scale(1.04)} }
        @keyframes lgnFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgnGlow   { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lgn-card { animation: lgnFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
        .lgn-orb1 { animation: lgnFloat1 18s ease-in-out infinite; }
        .lgn-orb2 { animation: lgnFloat2 24s ease-in-out infinite; }
        .lgn-border { animation: lgnGlow 5s ease-in-out infinite; }
        .lgn-btn { transition: transform .2s ease, box-shadow .2s ease; }
        .lgn-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 18px 40px -12px rgba(139,92,246,0.65) !important; }
        .lgn-btn:active:not(:disabled) { transform: translateY(0); }
        .lgn-link { color: rgba(255,255,255,0.45); text-decoration:none; transition: color .15s; }
        .lgn-link:hover { color: #fff; }
        .lgn-link-purple { color: #a78bfa; text-decoration:none; transition: color .15s; font-weight:600; }
        .lgn-link-purple:hover { color: #c4b5fd; }
        input::placeholder { color: rgba(255,255,255,0.22); }
        input:hover:not(:focus) { border-color: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div className="lgn-orb1" style={{ position:'absolute', top:'-30%', left:'-15%', width:'70%', height:'80%', background:'radial-gradient(ellipse at 40% 40%, rgba(139,92,246,0.25) 0%, transparent 65%)', filter:'blur(40px)' }}/>
        <div className="lgn-orb2" style={{ position:'absolute', bottom:'-25%', right:'-20%', width:'65%', height:'70%', background:'radial-gradient(ellipse at 60% 60%, rgba(99,102,241,0.18) 0%, transparent 65%)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize:'30px 30px', WebkitMaskImage:'radial-gradient(ellipse 70% 55% at 50% 30%, black 0%, transparent 85%)', maskImage:'radial-gradient(ellipse 70% 55% at 50% 30%, black 0%, transparent 85%)' }}/>
      </div>

      {/* Back to home */}
      <div style={{ position:'fixed', top:24, left:32, zIndex:20 }}>
        <Link to="/" className="lgn-link" style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:600 }}>
          <ArrowLeft style={{ width:14, height:14 }}/> Zirva
        </Link>
      </div>

      {/* Card */}
      <div className="lgn-card" style={{ position:'relative', width:'100%', maxWidth:420, zIndex:10 }}>
        {/* Glowing border */}
        <div className="lgn-border" style={{ position:'absolute', inset:-1, borderRadius:24, background:'linear-gradient(145deg, rgba(167,139,250,0.45) 0%, rgba(99,102,241,0.12) 35%, transparent 55%, rgba(124,90,240,0.30) 100%)', filter:'blur(0.5px)' }}/>

        <div style={{ position:'relative', background:'linear-gradient(180deg, rgba(20,16,42,0.94) 0%, rgba(10,8,26,0.97) 100%)', borderRadius:23, padding:'40px 36px', backdropFilter:'blur(20px)', boxShadow:'0 32px 80px -24px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

          {/* Logo */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
            <img src="/logo.png" alt="Zirva" style={{ height:36, opacity:.9 }}/>
          </div>

          {showReset ? (
            /* ── Reset panel ── */
            <div>
              <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:6, textAlign:'center' }}>Şifrəni sıfırla</h1>
              <p style={{ color:'rgba(255,255,255,0.42)', fontSize:13.5, textAlign:'center', marginBottom:28, lineHeight:1.55 }}>
                E-poçtunuza sıfırlama linki göndərəcəyik.
              </p>

              {resetSent ? (
                <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:12, padding:'14px 16px', color:'#4ade80', fontSize:13.5, textAlign:'center', marginBottom:24 }}>
                  Sıfırlama linki e-poçtunuza göndərildi ✓
                </div>
              ) : (
                <>
                  {resetError && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'12px 14px', color:'#f87171', fontSize:13, marginBottom:18 }}>{resetError}</div>}
                  <div style={{ marginBottom:16 }}>
                    <label style={lbl}>E-poçt</label>
                    <input type="email" style={inp} placeholder="ad@mekteb.az" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} onFocus={focus} onBlur={blur}/>
                  </div>
                  <button onClick={handleReset} disabled={resetLoading} className="lgn-btn" style={{ width:'100%', padding:'13px', borderRadius:12, background:'linear-gradient(120deg,#9b6dff 0%,#8b5cf6 40%,#7c5af0 100%)', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:resetLoading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 10px 28px -10px rgba(139,92,246,0.55)', opacity:resetLoading?.75:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {resetLoading ? <><SpinIcon/> Göndərilir…</> : 'Sıfırlama linki göndər'}
                  </button>
                </>
              )}

              <div style={{ textAlign:'center', marginTop:22 }}>
                <button type="button" onClick={()=>{setShowReset(false);setResetSent(false);setResetError(null);setResetEmail('')}} className="lgn-link-purple" style={{ fontSize:13, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                  ← Geri qayıt
                </button>
              </div>
            </div>
          ) : (
            /* ── Login form ── */
            <>
              <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginBottom:6, textAlign:'center' }}>Xoş gəldiniz</h1>
              <p style={{ color:'rgba(255,255,255,0.42)', fontSize:13.5, textAlign:'center', marginBottom:28 }}>{t('login_subtitle')}</p>

              {passwordReset && (
                <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:12, padding:'12px 14px', color:'#4ade80', fontSize:13, marginBottom:18 }}>
                  Şifrəniz uğurla yeniləndi. İndi daxil ola bilərsiniz.
                </div>
              )}
              {sessionExpired && (
                <div style={{ background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'12px 14px', color:'#fbbf24', fontSize:13, marginBottom:18 }}>
                  Sessiyanız başa çatdı. Zəhmət olmasa yenidən daxil olun.
                </div>
              )}
              {error && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'12px 14px', color:'#f87171', fontSize:13, marginBottom:18 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={lbl}>{t('email')}</label>
                  <input required type="email" style={inp} placeholder="ad@mekteb.az" value={email} onChange={e=>setEmail(e.target.value)} onFocus={focus} onBlur={blur}/>
                </div>

                <div>
                  <label style={lbl}>{t('password')}</label>
                  <div style={{ position:'relative' }}>
                    <input required type={showPassword?'text':'password'} style={{ ...inp, paddingRight:44 }} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onFocus={focus} onBlur={blur}/>
                    <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', padding:0, display:'flex' }}>
                      {showPassword ? <EyeOff style={{ width:16, height:16 }}/> : <Eye style={{ width:16, height:16 }}/>}
                    </button>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-4 }}>
                  <button type="button" onClick={()=>setShowReset(true)} className="lgn-link-purple" style={{ fontSize:12.5, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    Şifrəni unutmusunuz?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="lgn-btn" style={{ width:'100%', padding:'13px', borderRadius:12, background:'linear-gradient(120deg,#9b6dff 0%,#8b5cf6 40%,#7c5af0 100%)', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 10px 28px -10px rgba(139,92,246,0.55)', opacity:loading?.75:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
                  {loading ? <><SpinIcon/> Yüklənir…</> : <>{t('login')} <ArrowRight style={{ width:15, height:15 }}/></>}
                </button>
              </form>

              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', marginTop:24 }}>
                {t('no_account')}{' '}
                <Link to="/qeydiyyat" className="lgn-link-purple">{t('signup')}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin .8s linear infinite', flexShrink:0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
