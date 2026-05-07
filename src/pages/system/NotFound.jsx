import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function NotFound() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  function goHome() {
    if (!profile) return navigate('/daxil-ol')
    const paths = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard' }
    navigate(paths[profile.role] || '/daxil-ol')
  }

  return (
    <div style={{
      minHeight:'100vh', position:'relative', overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px',
      background:'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
      backgroundSize:'400% 400%',
      animation:'heroGradient 12s ease infinite',
    }}>
      <div className="hb1"/><div className="hb2"/><div className="hb4"/><div className="hb6"/>

      <div className="liquid-card" style={{ position:'relative', zIndex:1, padding:'56px 48px', textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:120, fontWeight:800, lineHeight:1, letterSpacing:'-0.04em', marginBottom:8 }}>
          <span className="pastel-text">404</span>
        </div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', marginBottom:10, letterSpacing:'-0.02em' }}>Səhifə tapılmadı</h1>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, marginBottom:28, maxWidth:340, marginLeft:'auto', marginRight:'auto' }}>
          Axtardığınız səhifə mövcud deyil və ya silinib.
        </p>
        <button onClick={goHome} className="btn-pastel" style={{ border:'none', cursor:'pointer' }}>
          Ana səhifəyə qayıt
        </button>
      </div>
    </div>
  )
}
