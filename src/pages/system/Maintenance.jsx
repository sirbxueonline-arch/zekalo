export default function Maintenance() {
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
        <h1 style={{ fontSize:32, fontWeight:800, marginBottom:24, letterSpacing:'-0.02em' }}>
          <span style={{ color:'#1a1a2e' }}>Zir</span>
          <span className="pastel-text">va</span>
        </h1>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#1a1a2e', marginBottom:10, letterSpacing:'-0.015em' }}>Texniki xidmət</h2>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6 }}>
          Zirva yenilənir. Tezliklə geri qayıdacağıq.
        </p>
      </div>
    </div>
  )
}
