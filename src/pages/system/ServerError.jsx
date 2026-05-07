export default function ServerError() {
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
          <span className="pastel-text">500</span>
        </div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', marginBottom:10, letterSpacing:'-0.02em' }}>Xəta baş verdi</h1>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, marginBottom:28, maxWidth:340, marginLeft:'auto', marginRight:'auto' }}>
          Server xətası baş verdi. Zəhmət olmasa yenidən cəhd edin.
        </p>
        <button onClick={() => window.location.reload()} className="btn-pastel" style={{ border:'none', cursor:'pointer' }}>
          Yenidən cəhd edin
        </button>
      </div>
    </div>
  )
}
