import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [showReset, setShowReset]       = useState(false)
  const [resetEmail, setResetEmail]     = useState('')
  const [resetSent, setResetSent]       = useState(false)
  const [resetError, setResetError]     = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const { signIn, user, profile, t }    = useAuth()
  const navigate                        = useNavigate()
  const [searchParams]                  = useSearchParams()
  const sessionExpired = searchParams.get('expired') === '1'
  const passwordReset  = searchParams.get('reset')   === '1'

  useEffect(() => {
    if (user && profile) {
      const d = { student:'/dashboard', teacher:'/muellim/dashboard', parent:'/valideyn/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard' }
      navigate(d[profile.role] || '/dashboard', { replace: true })
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await signIn(email, password) }
    catch (err) {
      if (err?.message?.includes('Invalid login'))          setError(t('invalid_login'))
      else if (err?.message?.includes('Email not confirmed')) setError(t('email_not_confirmed'))
      else setError(err?.message || t('error'))
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!resetEmail) { setResetError(t('email')); return }
    setResetLoading(true); setResetError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/sifre-sifirla'
    })
    setResetLoading(false)
    if (err) { setResetError(err.message); return }
    setResetSent(true)
  }

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:10,
    background:'#F7F7FB', border:'1.5px solid #E8E8F0',
    color:'#111', fontSize:14, fontWeight:500,
    outline:'none', transition:'all .18s ease', fontFamily:'inherit',
    boxSizing:'border-box',
  }
  const focus = e => { e.target.style.borderColor='#8B5CF6'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E8E8F0'; e.target.style.boxShadow='none' }
  const lbl   = { display:'block', fontSize:11.5, fontWeight:700, color:'#6B7280', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:7 }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F4FF', fontFamily:'Plus Jakarta Sans, system-ui, sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <style>{`
        @keyframes lgnFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lgn-card { animation: lgnFadeUp .5s cubic-bezier(.22,1,.36,1) both; }
        .lgn-btn  { transition: transform .18s ease, box-shadow .18s ease; }
        .lgn-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow: 0 14px 32px -10px rgba(139,92,246,0.45) !important; }
        .lgn-btn:active:not(:disabled) { transform:translateY(0); }
        .lgn-link-muted  { color:#9CA3AF; text-decoration:none; font-size:13px; font-weight:600; transition:color .15s; }
        .lgn-link-muted:hover { color:#111; }
        .lgn-link-purple { color:#7C3AED; text-decoration:none; font-weight:600; transition:color .15s; }
        .lgn-link-purple:hover { color:#5B21B6; }
        input::placeholder { color:#C4C4D0; }
      `}</style>

      {/* Back link */}
      <div style={{ position:'fixed', top:24, left:28, zIndex:20 }}>
        <Link to="/" className="lgn-link-muted" style={{ display:'flex', alignItems:'center', gap:6 }}>
          <ArrowLeft style={{ width:14, height:14 }}/> Zirva
        </Link>
      </div>

      {/* Logo */}
      <div style={{ marginBottom:28, zIndex:10 }}>
        <img src="/logo.png" alt="Zirva" style={{ height:34 }}/>
      </div>

      {/* Card */}
      <div className="lgn-card" style={{ width:'100%', maxWidth:420, background:'#fff', borderRadius:20, padding:'36px 32px', boxShadow:'0 4px 24px rgba(83,74,183,0.08), 0 1px 4px rgba(0,0,0,0.04)', border:'1px solid rgba(83,74,183,0.08)' }}>

        {showReset ? (
          <>
            <h1 style={{ color:'#111', fontSize:21, fontWeight:800, letterSpacing:'-0.02em', marginBottom:6, textAlign:'center' }}>{t('reset_password')}</h1>
            <p style={{ color:'#9CA3AF', fontSize:13.5, textAlign:'center', marginBottom:26, lineHeight:1.55 }}>
              {t('forgot_subtitle')}
            </p>

            {resetSent ? (
              <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'13px 15px', color:'#16A34A', fontSize:13.5, textAlign:'center', marginBottom:22 }}>
                {t('reset_link_sent')}
              </div>
            ) : (
              <>
                {resetError && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'11px 14px', color:'#DC2626', fontSize:13, marginBottom:16 }}>{resetError}</div>}
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>{t('email')}</label>
                  <input type="email" style={inp} placeholder="ad@mekteb.az" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} onFocus={focus} onBlur={blur}/>
                </div>
                <button onClick={handleReset} disabled={resetLoading} className="lgn-btn" style={{ width:'100%', padding:'12px', borderRadius:10, background:'#7C3AED', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:resetLoading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 8px 20px -8px rgba(124,58,237,0.45)', opacity:resetLoading?.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {resetLoading ? <><SpinIcon/> {t('sending')}</> : t('send_link')}
                </button>
              </>
            )}

            <div style={{ textAlign:'center', marginTop:20 }}>
              <button type="button" onClick={()=>{setShowReset(false);setResetSent(false);setResetError(null);setResetEmail('')}} className="lgn-link-purple" style={{ fontSize:13, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                ← {t('back_to_login')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ color:'#111', fontSize:21, fontWeight:800, letterSpacing:'-0.02em', marginBottom:5, textAlign:'center' }}>{t('login_welcome')}</h1>
            <p style={{ color:'#9CA3AF', fontSize:13.5, textAlign:'center', marginBottom:26 }}>{t('login_subtitle')}</p>

            {passwordReset && <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'11px 14px', color:'#16A34A', fontSize:13, marginBottom:16 }}>{t('password_updated')}</div>}
            {sessionExpired && <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'11px 14px', color:'#92400E', fontSize:13, marginBottom:16 }}>{t('session_expired')}</div>}
            {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'11px 14px', color:'#DC2626', fontSize:13, marginBottom:16 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={lbl}>{t('email')}</label>
                <input required type="email" style={inp} placeholder="ad@mekteb.az" value={email} onChange={e=>setEmail(e.target.value)} onFocus={focus} onBlur={blur}/>
              </div>
              <div>
                <label style={lbl}>{t('password')}</label>
                <div style={{ position:'relative' }}>
                  <input required type={showPassword?'text':'password'} style={{ ...inp, paddingRight:42 }} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onFocus={focus} onBlur={blur}/>
                  <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:0, display:'flex' }}>
                    {showPassword ? <EyeOff style={{ width:15, height:15 }}/> : <Eye style={{ width:15, height:15 }}/>}
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-4 }}>
                <button type="button" onClick={()=>setShowReset(true)} className="lgn-link-purple" style={{ fontSize:12.5, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                  {t('forgot_password')}
                </button>
              </div>

              <button type="submit" disabled={loading} className="lgn-btn" style={{ width:'100%', padding:'13px', borderRadius:10, background:'#7C3AED', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 8px 20px -8px rgba(124,58,237,0.45)', opacity:loading?.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:2 }}>
                {loading ? <><SpinIcon/> {t('loading')}</> : <>{t('login')} <ArrowRight style={{ width:15, height:15 }}/></>}
              </button>
            </form>

            <p style={{ color:'#9CA3AF', fontSize:13, textAlign:'center', marginTop:22 }}>
              {t('no_account')}{' '}
              <Link to="/qeydiyyat" className="lgn-link-purple">{t('signup')}</Link>
            </p>
          </>
        )}
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
