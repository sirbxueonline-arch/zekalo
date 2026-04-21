import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function LandingNav({ s, lang, setLang }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl" style={{ boxShadow:'0 0 0 1px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-[68px]">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Zirva" width={26} height={26} className="object-contain" />
          <span className="text-[18px] font-extrabold text-gray-900 tracking-tight">Zirva</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="flex items-center rounded-lg p-0.5 mr-2" style={{ background:'rgba(0,0,0,0.05)' }}>
            {['az','en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="px-2.5 py-1.5 rounded-md text-[11px] font-extrabold tracking-wide transition-all"
                style={lang===l ? {background:'#fff',color:'#534AB7',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'} : {color:'#9ca3af'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/daxil-ol" className="px-4 py-2 text-[13.5px] text-gray-500 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all">{s.nav_signin}</Link>
          <Link to="/contact" className="inline-flex items-center text-white text-[13.5px] font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px"
            style={{background:'linear-gradient(135deg,#6056CC,#534AB7)',boxShadow:'0 2px 10px rgba(83,74,183,0.4)'}}>
            {s.nav_contact}
          </Link>
        </div>
        <button onClick={() => setOpen(v=>!v)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100">
          {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex rounded-lg p-0.5" style={{background:'rgba(0,0,0,0.06)'}}>
            {['az','en'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} className="px-3 py-1.5 rounded-md text-xs font-extrabold transition-all"
                style={lang===l?{background:'#fff',color:'#534AB7',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'}:{color:'#9ca3af'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/daxil-ol" className="text-sm text-gray-500 font-semibold px-3 py-2">{s.nav_signin}</Link>
            <Link to="/contact" className="text-white text-sm font-bold px-4 py-2 rounded-xl"
              style={{background:'linear-gradient(135deg,#6056CC,#534AB7)'}}>{s.nav_contact}</Link>
          </div>
        </div>
      )}
    </header>
  )
}
