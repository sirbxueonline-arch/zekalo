import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Check, Download, Send, Bell, Shield, BarChart3,
  MessageSquare, FileText, BookOpen, Calendar, Sparkles,
  TrendingUp, Globe, Database, ChevronRight
} from 'lucide-react'

const demoMeta = {
  jurnal:               { title: 'Qiymətləndirmə Jurnalı', subtitle: 'Gradebook' },
  davamiyyat:           { title: 'Davamiyyət Reyestri',     subtitle: 'Attendance' },
  zeka:                 { title: 'Zəka — AI Müəllim',       subtitle: 'AI Tutor' },
  mesajlar:             { title: 'Mesajlaşma',               subtitle: 'Messaging' },
  hesabatlar:           { title: 'Hesabatlar',               subtitle: 'Reports' },
  'ib-dovlet':          { title: 'IB & Dövlət',              subtitle: 'IB & State' },
  'milli-panel':        { title: 'Milli İzləmə Paneli',      subtitle: 'National Panel' },
  'avtomatik-hesabatlar': { title: 'Avtomatik Hesabatlar',   subtitle: 'Auto Reports' },
  melumat:              { title: 'Məlumat Suverenliyi',      subtitle: 'Data Sovereignty' },
  analitika:            { title: 'Trend Analitikası',        subtitle: 'Analytics' },
  bildirisler:          { title: 'Ani Bildirişlər',          subtitle: 'Notifications' },
  egov:                 { title: 'E-Gov İnteqrasiyası',      subtitle: 'E-Gov Integration' },
}

/* ─── Gradebook Demo ─── */
function JurnalDemo() {
  const students = [
    { name: 'Əli Həsənov',      grades: [8, 7, 9, 8, 7], avg: 7.8 },
    { name: 'Leyla Məmmədova',  grades: [9, 9, 8, 9, 10], avg: 9.0 },
    { name: 'Nicat Rəsuli',     grades: [6, 7, 6, 7, 6], avg: 6.4 },
    { name: 'Aytən Əliyeva',    grades: [10, 9, 10, 9, 9], avg: 9.4 },
    { name: 'Rauf Quliyev',     grades: [7, 6, 7, 8, 7], avg: 7.0 },
    { name: 'Sevinc Hüseynova', grades: [8, 8, 9, 7, 8], avg: 8.0 },
  ]
  const subjects = ['Riyaziyyat', 'İngilis dili', 'Biologiya', 'Tarix', 'Fizika']

  function gradeColor(g) {
    if (g >= 9) return 'bg-teal-light text-teal font-semibold'
    if (g >= 7) return 'bg-purple-light text-purple font-semibold'
    return 'bg-red-50 text-red-500 font-semibold'
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Siniflər</p>
        </div>
        {['9A', '9B', '10A', '10B', '11A'].map((cls, i) => (
          <button
            key={cls}
            className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 transition-colors ${i === 0 ? 'bg-purple-light text-purple font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {cls} Sinifi
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sub-header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">9A Sinifi — Riyaziyyat Jurnalı</h2>
            <p className="text-[11px] text-gray-400">2024–2025 · II Rüb</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['KR.A', 'KR.B', 'KR.C', 'KR.D'].map((k, i) => (
                <button key={k} className={`px-3 py-1 text-[11px] rounded-full border ${i === 0 ? 'bg-purple text-white border-purple' : 'border-gray-200 text-gray-500 hover:border-purple hover:text-purple'}`}>{k}</button>
              ))}
              <button className="px-3 py-1 text-[11px] rounded-full border border-teal/30 text-teal bg-teal-light ml-1">Dövlət (1–10)</button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">
              <Check className="w-3 h-3" />
              Sinxronizasiya edildi
            </div>
            <button className="bg-purple text-white text-xs px-4 py-1.5 rounded-full hover:bg-purple/90 transition-colors">Saxla</button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium w-48">Şagird</th>
                  {subjects.map(s => (
                    <th key={s} className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">{s}</th>
                  ))}
                  <th className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">Orta</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => (
                  <tr key={st.name} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-light flex items-center justify-center text-purple text-[11px] font-semibold flex-shrink-0">
                          {st.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-800 text-sm font-medium">{st.name}</span>
                      </div>
                    </td>
                    {st.grades.map((g, j) => (
                      <td key={j} className="px-4 py-3 text-center">
                        <span className={`inline-block w-9 h-9 rounded-lg flex items-center justify-center text-sm ${gradeColor(g)}`}>{g}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">{st.avg.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Attendance Demo ─── */
function DavamiyyatDemo() {
  const students = [
    { name: 'Əli Həsənov',      initials: 'ƏH', present: true,  time: '08:05' },
    { name: 'Leyla Məmmədova',  initials: 'LM', present: true,  time: '08:02' },
    { name: 'Nicat Rəsuli',     initials: 'NR', present: false, time: '—'     },
    { name: 'Aytən Əliyeva',    initials: 'AƏ', present: true,  time: '07:58' },
    { name: 'Rauf Quliyev',     initials: 'RQ', present: true,  time: '08:11' },
    { name: 'Sevinc Hüseynova', initials: 'SH', present: true,  time: '08:03' },
    { name: 'Tural İsmayılov',  initials: 'Tİ', present: true,  time: '08:09' },
    { name: 'Günel Babayeva',   initials: 'GB', present: false, time: '—'     },
    { name: 'Orxan Nəsirov',    initials: 'ON', present: true,  time: '08:00' },
    { name: 'Nərmin Əsgərova',  initials: 'NƏ', present: true,  time: '08:07' },
  ]
  const today = '14 Aprel 2026, Çərşənbə'

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Date header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-purple-light rounded-xl px-4 py-2 border border-purple/20">
            <p className="text-[10px] text-purple uppercase tracking-wider font-medium">Tarix</p>
            <p className="text-sm font-semibold text-gray-900">{today}</p>
          </div>
          <div className="bg-teal-light rounded-xl px-4 py-2 border border-teal/20">
            <p className="text-[10px] text-teal uppercase tracking-wider font-medium">Sinif</p>
            <p className="text-sm font-semibold text-gray-900">9A — 30 şagird</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
          <Bell className="w-3 h-3" />
          2 valideyn SMS ilə xəbərdar edildi
        </div>
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {students.map((st) => (
            <div key={st.name} className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 hover:border-purple/30 transition-colors shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${st.present ? 'bg-teal-light text-teal' : 'bg-red-50 text-red-400'}`}>
                {st.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{st.name}</p>
                <p className="text-[11px] text-gray-400">{st.present ? `Gəldi · ${st.time}` : 'Gəlmədi'}</p>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${st.present ? 'bg-teal-light text-teal' : 'bg-red-50 text-red-400'}`}>
                {st.present ? <><Check className="w-3 h-3" /> Gəldi</> : <><span className="text-base leading-none">✕</span> Yoxdur</>}
              </div>
              <p className="text-sm font-mono text-gray-400 w-12 text-right">{st.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-teal font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" />
            28 gəldi
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            2 gəlmədi
          </span>
        </div>
        <button className="bg-purple text-white text-sm px-6 py-2 rounded-full hover:bg-purple/90 transition-colors font-medium">Saxla</button>
      </div>
    </div>
  )
}

/* ─── AI Tutor Demo ─── */
function ZekaDemo() {
  const messages = [
    { role: 'student', text: 'Kvadrat tənliyi nə vaxt istifadə edirik?' },
    {
      role: 'ai',
      text: null,
      blocks: [
        { type: 'p', content: 'Kvadrat tənlik — ax² + bx + c = 0 formasında yazılan tənlikdir.' },
        { type: 'p', content: 'Real həyatda istifadə nümunələri:' },
        { type: 'list', items: ['Fizikada mərmi hərəkəti hesablanması', 'Mühəndislikdə sahə hesablamaları', 'Maliyyədə gəlir-xərc modelləri'] },
        { type: 'formula', content: 'x = (−b ± √(b²−4ac)) / 2a' },
      ]
    },
    { role: 'student', text: 'Məsələ verə bilərsən?' },
    {
      role: 'ai',
      text: null,
      blocks: [
        { type: 'p', content: 'Əlbəttə! Budur bir praktik məsələ:' },
        { type: 'problem', content: 'x² − 5x + 6 = 0 tənliyini həll edin.' },
        { type: 'p', content: 'İpucu: a=1, b=−5, c=6. Diskriminantı tapıb kökləri hesablayın.' },
      ]
    },
  ]

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left sidebar */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Fənn seçin</p>
          <div className="space-y-1">
            {['Riyaziyyat', 'Biologiya', 'İngilis dili', 'Tarix', 'Kimya'].map((s, i) => (
              <button key={s} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 flex-1 overflow-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Son sessiyalar</p>
          <div className="space-y-2">
            {['Kvadrat tənliklər', 'İntegral — giriş', 'Loqarifm funksiyası', 'Triqonometriya'].map((s, i) => (
              <button key={s} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${i === 0 ? 'bg-purple-light text-purple border border-purple/20' : 'text-gray-500 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-[10px] text-purple bg-purple-light rounded-full px-3 py-1.5 border border-purple/20 justify-center">
            <Sparkles className="w-3 h-3" />
            Claude ilə gücləndirilmiş
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-100 px-6 py-3 flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple to-purple/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Zəka</p>
            <p className="text-[11px] text-teal">Onlayn · Riyaziyyat sessiyası</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'gap-3'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'student' ? 'bg-purple-light border border-purple/20 text-purple rounded-br-sm' : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                {msg.text && <p>{msg.text}</p>}
                {msg.blocks && msg.blocks.map((b, j) => (
                  <div key={j} className="mb-2 last:mb-0">
                    {b.type === 'p' && <p className="leading-relaxed">{b.content}</p>}
                    {b.type === 'formula' && <div className="bg-purple-light border border-purple/20 rounded-lg px-3 py-2 font-mono text-xs text-purple my-2">{b.content}</div>}
                    {b.type === 'problem' && <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700 text-xs font-medium my-2">{b.content}</div>}
                    {b.type === 'list' && <ul className="space-y-1 mt-1">{b.items.map((it, k) => <li key={k} className="flex items-start gap-2"><span className="text-purple mt-0.5">•</span>{it}</li>)}</ul>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <input className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" placeholder="Sual yazın..." defaultValue="" readOnly />
            <button className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center hover:bg-purple/90 transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Messaging Demo ─── */
function MesajlarDemo() {
  const conversations = [
    { name: 'Müəllim Əliyev',    preview: 'İmtahan nəticəsi barədə...', time: '09:15', unread: 2, active: true  },
    { name: 'Valideyn Həsənova', preview: 'Övladımın davamiyyəti...',   time: '08:47', unread: 0, active: false },
    { name: 'Sinif Elanı',       preview: '📢 Riyaziyyat imtahanı...',   time: '08:20', unread: 1, active: false },
    { name: 'Admin',             preview: 'Hesabat hazırlamaq üçün...', time: 'Dün',   unread: 0, active: false },
  ]

  const chatMessages = [
    { from: 'Müəllim Əliyev', text: 'Salam! Növbəti həftə riyaziyyat imtahanı keçiriləcək. Şagirdlər hazırlaşsın.', time: '08:30', mine: false },
    { from: 'Siz',            text: 'Salam, müəllim. Hansı mövzular daxil olacaq?', time: '08:32', mine: true },
    { from: 'Müəllim Əliyev', text: 'Kvadrat tənliklər, loqarifmlər və triqonometriya. Material paylaşacağam.', time: '08:35', mine: false },
    { from: 'Siz',            text: 'Çox sağ olun! Zəka ilə hazırlaşacağam.', time: '08:40', mine: true },
    { from: 'Müəllim Əliyev', text: 'Əla! İmtahan saat 10:00-da başlayır. Uğurlar 👍', time: '09:15', mine: false },
  ]

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Conversations */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <span className="text-sm text-gray-400">Axtar...</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {conversations.map((c) => (
            <div key={c.name} className={`px-4 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${c.active ? 'bg-purple-light/50 border-l-2 border-l-purple' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-light flex items-center justify-center text-purple text-xs font-semibold flex-shrink-0">
                  {c.name.split(' ')[0][0]}{c.name.split(' ')[1]?.[0] || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.preview}</p>
                </div>
                {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-purple text-white text-[10px] flex items-center justify-center flex-shrink-0">{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active chat */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center text-teal text-sm font-semibold">MƏ</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Müəllim Əliyev</p>
            <p className="text-[11px] text-teal">Onlayn</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50/30">
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.mine ? 'justify-end' : 'gap-3'}`}>
              {!m.mine && (
                <div className="w-7 h-7 rounded-full bg-teal-light flex items-center justify-center text-teal text-[10px] font-semibold flex-shrink-0 mt-1">MƏ</div>
              )}
              <div className={`max-w-[65%] rounded-2xl px-4 py-2.5 text-sm ${m.mine ? 'bg-purple text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm'}`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.mine ? 'text-white/60' : 'text-gray-400'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <input className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" placeholder="Mesaj yazın..." readOnly />
            <button className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center hover:bg-purple/90 transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Reports Demo ─── */
function HesabatlarDemo() {
  const reports = [
    { name: 'Q1 2025 Rüblük Hesabat',    date: '01 Apr 2025', status: 'Hazır',            statusColor: 'text-teal bg-teal-light', dot: 'bg-teal'          },
    { name: 'Yanvar Davamiyyət',           date: '01 Feb 2025', status: 'E-Gov ✓',          statusColor: 'text-teal bg-teal-light', dot: 'bg-teal'          },
    { name: 'IB Audit 2025',              date: '15 Mar 2025', status: 'Hazırlanır...',    statusColor: 'text-amber-600 bg-amber-50', dot: 'bg-amber-400'   },
    { name: 'Milli Kurikulum Uyğunluğu', date: '20 Mar 2025', status: 'Tamamlandı',       statusColor: 'text-purple bg-purple-light', dot: 'bg-purple'     },
    { name: 'Fevral Davamiyyət',          date: '01 Mar 2025', status: 'E-Gov ✓',          statusColor: 'text-teal bg-teal-light', dot: 'bg-teal'          },
    { name: 'Şagird İnkişaf Hesabatı',   date: '10 Apr 2025', status: 'Qaralama',         statusColor: 'text-gray-500 bg-gray-100', dot: 'bg-gray-400'    },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Hesabatlar</h2>
          <p className="text-[11px] text-gray-400">2024–2025 tədris ili</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none">
            <option>PDF</option>
            <option>Excel</option>
            <option>E-Gov.az</option>
          </select>
          <button className="bg-purple text-white text-sm px-4 py-2 rounded-full hover:bg-purple/90 transition-colors font-medium">+ Yeni hesabat yarat</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {reports.map((r) => (
            <div key={r.name} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:border-purple/30 transition-colors shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.dot}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{r.date}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${r.statusColor}`}>{r.status}</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-purple hover:text-purple transition-colors">
                  <Download className="w-3 h-3" />PDF
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-teal hover:text-teal transition-colors">
                  <Download className="w-3 h-3" />Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── IB & State Demo ─── */
function IbDovletDemo() {
  const criteria = [
    { label: 'A — Bilik və anlama',   ib: 6, ibMax: 8 },
    { label: 'B — Araşdırma',         ib: 7, ibMax: 8 },
    { label: 'C — Ünsiyyət',          ib: 5, ibMax: 8 },
    { label: 'D — Düşünmə bacarığı',  ib: 6, ibMax: 8 },
  ]
  const students = [
    { name: 'Əli Həsənov',      ib: { A: 6, B: 7, C: 5, D: 6 }, total: 24, gov: 8 },
    { name: 'Leyla Məmmədova',  ib: { A: 7, B: 8, C: 7, D: 7 }, total: 29, gov: 9 },
    { name: 'Nicat Rəsuli',     ib: { A: 5, B: 5, C: 4, D: 5 }, total: 19, gov: 6 },
    { name: 'Aytən Əliyeva',    ib: { A: 8, B: 8, C: 7, D: 8 }, total: 31, gov: 10 },
  ]

  function ibToGov(ibTotal) {
    if (ibTotal >= 30) return 10
    if (ibTotal >= 26) return 9
    if (ibTotal >= 22) return 8
    if (ibTotal >= 18) return 7
    if (ibTotal >= 14) return 6
    return 5
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">IB & Dövlət Uyğunluğu</h2>
          <p className="text-[11px] text-gray-400">MYP Kriteriyaları ↔ Milli 10 ballıq şkala — Avtomatik çevrilmə</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-teal bg-teal-light rounded-full px-3 py-1.5 border border-teal/20">
          <Check className="w-3 h-3" />
          IB uyğunluğu təsdiqləndi
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* Conversion formula */}
        <div className="bg-white rounded-xl border border-purple/20 p-5 mb-5 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Avtomatik çevrilmə düsturu</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-purple-light rounded-xl px-5 py-3 text-center border border-purple/20">
              <p className="text-[10px] text-purple uppercase mb-1">IB MYP</p>
              <p className="text-2xl font-bold text-purple">A+B+C+D</p>
              <p className="text-[11px] text-purple/60">Maks: 32</p>
            </div>
            <div className="text-2xl text-gray-300 font-light">→</div>
            <div className="bg-teal-light rounded-xl px-5 py-3 text-center border border-teal/20">
              <p className="text-[10px] text-teal uppercase mb-1">Dövlət şkalası</p>
              <p className="text-2xl font-bold text-teal">1–10</p>
              <p className="text-[11px] text-teal/60">Milli kurikulum</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
              <p className="text-[11px] text-amber-700 font-medium mb-1">Nümunə:</p>
              <p className="text-xs text-amber-600">IB cəmi 24/32 = Dövlət <strong>8/10</strong></p>
              <p className="text-xs text-amber-600">IB cəmi 29/32 = Dövlət <strong>9/10</strong></p>
            </div>
          </div>
        </div>

        {/* Student table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium">Şagird</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.A</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.B</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.C</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.D</th>
                <th className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">IB Cəm</th>
                <th className="px-4 py-3 text-[11px] text-teal uppercase tracking-wider font-medium text-center">Dövlət</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-light flex items-center justify-center text-purple text-[10px] font-semibold">
                        {st.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-800">{st.name}</span>
                    </div>
                  </td>
                  {Object.values(st.ib).map((score, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 rounded-lg bg-purple-light text-purple font-semibold text-sm flex items-center justify-center">{score}</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span className="bg-gray-100 text-gray-700 font-bold text-sm px-2.5 py-1 rounded-lg">{st.total}/32</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${st.gov >= 9 ? 'bg-teal text-white' : st.gov >= 7 ? 'bg-teal-light text-teal' : 'bg-amber-50 text-amber-600'}`}>{st.gov}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── National Panel Demo ─── */
function MilliPanelDemo() {
  const kpis = [
    { label: 'Məktəb',       value: '12',    icon: '🏫', sub: '+3 bu rübdə',     color: 'text-gray-900' },
    { label: 'Şagird',       value: '5,247', icon: '👤', sub: '+214 bu ay',       color: 'text-purple'   },
    { label: 'S.İ. Sessiya', value: '52,841',icon: '✨', sub: '+1.2k bu həftə',   color: 'text-teal'     },
    { label: 'Orta Qiymət',  value: '7.8',   icon: '📊', sub: '↑ 0.4 artış',      color: 'text-amber-600'},
  ]
  const schools = [
    { name: 'TISA (IB)',   score: 8.9, bar: 100, trend: '+0.3' },
    { name: 'Məktəb №132', score: 8.4, bar: 93,  trend: '+0.2' },
    { name: 'Məktəb №6',   score: 8.1, bar: 90,  trend: '+0.1' },
    { name: 'Məktəb №47',  score: 7.8, bar: 86,  trend: '-0.1' },
    { name: 'Məktəb №89',  score: 7.4, bar: 81,  trend: '+0.4' },
  ]
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Snt', 'Okt', 'Noy', 'Dek']
  const vals =   [62, 65, 61, 68, 70, 74, 73, 78, 77, 82, 80, 87]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold">Nazirlik İdarəetmə Paneli</p>
          <h2 className="font-semibold text-gray-900">Azərbaycan Respublikası Təhsil Nazirliyi</h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-teal">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          Canlı · Son yenilənmə: 09:42
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{k.label}</p>
                <span className="text-xl">{k.icon}</span>
              </div>
              <p className={`text-2xl font-bold mb-1 ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-gray-400">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bar chart */}
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Aylıq Performans Meyli</p>
              <span className="text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">↑ 4.2%</span>
            </div>
            <div className="flex items-end gap-1.5 h-28 mb-2">
              {vals.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm transition-all ${i === vals.length - 1 ? 'bg-purple' : i >= 8 ? 'bg-purple/50' : 'bg-purple/20'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between px-0.5">
              {months.map(m => <span key={m} className="text-[9px] text-gray-400">{m}</span>)}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">Son Hadisələr</p>
            <div className="space-y-4">
              {[
                { text: 'Məktəb №47 aylıq hesabat göndərdi',   time: '09:12', color: 'bg-teal'       },
                { text: 'Yeni məktəb qoşuldu: №89',            time: '08:54', color: 'bg-purple'     },
                { text: 'E-Gov ixracı avtomatik tamamlandı',   time: '08:30', color: 'bg-amber-400'  },
                { text: 'TISA davamiyyət hesabatı alındı',     time: '08:01', color: 'bg-teal'       },
                { text: 'Sistem yedəkləməsi tamamlandı',       time: 'Dün',   color: 'bg-gray-400'   },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${e.color} mt-1.5 flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">{e.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* School ranking */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Məktəb Reytinqi</p>
            <span className="text-[11px] text-purple bg-purple-light rounded-full px-3 py-1">Bu rübdə · 2025</span>
          </div>
          <div className="space-y-3">
            {schools.map((sc, i) => (
              <div key={sc.name} className="flex items-center gap-4">
                <span className="text-[11px] text-gray-400 font-medium w-4">{i + 1}</span>
                <p className="text-sm text-gray-800 w-36 font-medium">{sc.name}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple to-purple/60 rounded-full transition-all" style={{ width: `${sc.bar}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 w-8 text-right">{sc.score}</span>
                <span className={`text-[11px] font-medium w-10 text-right ${sc.trend.startsWith('+') ? 'text-teal' : 'text-red-400'}`}>{sc.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Auto Reports Demo ─── */
function AvtomatikHesabatlarDemo() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="font-semibold text-gray-900">Avtomatik Hesabat Generatoru</h2>
        <p className="text-[11px] text-gray-400">PDF, Excel, E-Gov.az formatında bir kliklə ixrac</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Config panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-5">Hesabat parametrləri</p>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">Hesabat növü</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>Rüblük Akademik Hesabat</option>
                  <option>Davamiyyət Hesabatı</option>
                  <option>IB MYP Audit</option>
                  <option>Nazirlik İcmalı</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">Tarix aralığı</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>Q1 2025 (Yan – Mar)</option>
                  <option>Q2 2025 (Apr – İyn)</option>
                  <option>2024–2025 Tədris İli</option>
                  <option>Yanvar 2025</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">Məktəb</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>Bütün məktəblər</option>
                  <option>TISA</option>
                  <option>Məktəb №132</option>
                  <option>Məktəb №6</option>
                  <option>Məktəb №47</option>
                </select>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Avtomatik göndər</p>
                  <p className="text-[11px] text-gray-400">Hər ayın 1-i — Nazirlik e-poçtu</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-teal relative cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white shadow absolute top-0.5 right-0.5 transition-transform" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-purple text-white text-sm py-2.5 rounded-lg hover:bg-purple/90 transition-colors font-medium">
                  <Download className="w-4 h-4" />PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-teal text-teal text-sm py-2.5 rounded-lg hover:bg-teal-light transition-colors font-medium">
                  <Download className="w-4 h-4" />Excel
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-amber-300 text-amber-600 text-sm py-2.5 rounded-lg hover:bg-amber-50 transition-colors font-medium">
                  <Globe className="w-4 h-4" />E-Gov
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Önizləmə</p>
              <span className="text-[11px] text-teal bg-teal-light rounded-full px-2.5 py-1">Q1 2025</span>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="text-center border-b border-gray-200 pb-3">
                <p className="text-xs font-bold text-gray-900">Azərbaycan Respublikası Təhsil Nazirliyi</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Q1 2025 Rüblük Akademik Hesabat</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Bütün məktəblər · 01 Yanvar – 31 Mart 2025</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Ümumi Məktəb',    value: '12' },
                  { label: 'Aktiv Şagird',     value: '5,247' },
                  { label: 'Orta Qiymət',      value: '7.8 / 10' },
                  { label: 'Davamiyyət',        value: '94.2%' },
                  { label: 'S.İ. Sessiyaları', value: '52,841' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-[10px] text-gray-400 text-center">Zirva MIS · zirva.az · Gizli sənəd</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Data Sovereignty Demo ─── */
function MelumatDemo() {
  const accessLog = [
    { user: 'Nazirlik Portalı',       action: 'Q1 hesabatı oxundu',         time: '09:12 · Bugün',  status: 'İcazəli' },
    { user: 'E-Gov.az Sistemi',        action: 'Davamiyyət ixrac edildi',    time: '08:30 · Bugün',  status: 'İcazəli' },
    { user: 'Audit Xidməti',           action: 'IB audit sənədi oxundu',     time: '14:22 · Dünən',  status: 'İcazəli' },
    { user: 'ASAN Xidmət Gateway',    action: 'Şagird kimlik doğrulama',    time: '11:05 · Dünən',  status: 'İcazəli' },
    { user: 'Sistem Yedəkləməsi',     action: 'Avtomatik yedəkləmə',        time: '03:00 · Dünən',  status: 'Sistem'  },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="font-semibold text-gray-900">Məlumat Suverenliyi Paneli</h2>
        <p className="text-[11px] text-gray-400">Azərbaycan qanunvericiliyinə tam uyğun infrastruktur</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Server Yeri',       value: 'Bakı, AZ 🇦🇿',  status: 'Aktiv', color: 'text-teal' },
            { label: 'Şifrələmə',         value: 'AES-256',       status: 'Aktiv', color: 'text-teal' },
            { label: 'Dövlət Nəzarəti',  value: 'Tam Nəzarət',   status: 'Aktiv', color: 'text-teal' },
            { label: 'GDPR Uyğunluğu',   value: 'Sertifikatlaşdırılmış', status: '2025', color: 'text-purple' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{c.label}</p>
              <p className={`text-sm font-bold ${c.color} mb-1`}>{c.value}</p>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-teal" />
                <span className="text-[10px] text-teal">{c.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Sertifikatlar & Uyğunluq</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Azərbaycan "Elektron İmza" Qanunu',  color: 'bg-blue-50 border-blue-200 text-blue-600' },
              { label: 'ISO 27001 Məlumat Təhlükəsizliyi',   color: 'bg-purple-light border-purple/20 text-purple' },
              { label: 'GDPR Uyğunluğu',                     color: 'bg-teal-light border-teal/20 text-teal' },
              { label: 'Dövlət Şifrələmə Standartı',         color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'AES-256 Şifrələmə',                  color: 'bg-gray-100 border-gray-200 text-gray-700' },
            ].map(b => (
              <span key={b.label} className={`text-xs font-medium px-3 py-1.5 rounded-full border ${b.color} flex items-center gap-1.5`}>
                <Check className="w-3 h-3" />
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Access log */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Giriş Jurnalı</p>
            <span className="text-[11px] text-gray-400">Son 5 hadisə</span>
          </div>
          <div className="divide-y divide-gray-100">
            {accessLog.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.user}</p>
                  <p className="text-[11px] text-gray-400">{log.action}</p>
                </div>
                <p className="text-[11px] text-gray-400">{log.time}</p>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${log.status === 'İcazəli' ? 'bg-teal-light text-teal' : 'bg-gray-100 text-gray-500'}`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Analytics Demo ─── */
function AnalItikaDemo() {
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Snt', 'Okt', 'Noy', 'Dek']
  const lineData = [6.8, 7.0, 6.9, 7.2, 7.4, 7.3, 7.6, 7.5, 7.8, 7.7, 8.0, 8.1]
  const maxVal = 10
  const svgH = 120
  const svgW = 600
  const padL = 30, padR = 10, padT = 10, padB = 20
  const drawW = svgW - padL - padR
  const drawH = svgH - padT - padB

  const pts = lineData.map((v, i) => {
    const x = padL + (i / (lineData.length - 1)) * drawW
    const y = padT + drawH - ((v - 5) / (maxVal - 5)) * drawH
    return `${x},${y}`
  })
  const polyline = pts.join(' ')

  const schools = [
    { name: 'TISA',        score: 8.9, color: 'bg-purple' },
    { name: 'Məktəb №132', score: 8.4, color: 'bg-purple/70' },
    { name: 'Məktəb №6',   score: 8.1, color: 'bg-teal' },
    { name: 'Məktəb №47',  score: 7.8, color: 'bg-teal/70' },
    { name: 'Məktəb №89',  score: 7.4, color: 'bg-gray-300' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Trend Analitikası</h2>
          <p className="text-[11px] text-gray-400">2024–2025 tədris ili · Milli izləmə</p>
        </div>
        <div className="flex gap-1.5">
          {['Orta qiymət', 'Davamiyyət', 'S.İ. İstifadəsi'].map((m, i) => (
            <button key={m} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${i === 0 ? 'bg-purple text-white border-purple' : 'border-gray-200 text-gray-500 hover:border-purple hover:text-purple'}`}>{m}</button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-5">
        {/* Line chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Orta Qiymət Meyli — 12 aylıq</p>
            <span className="text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">↑ 18.8% illik artım</span>
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
            {/* Grid lines */}
            {[6, 7, 8, 9].map(v => {
              const y = padT + drawH - ((v - 5) / (maxVal - 5)) * drawH
              return <line key={v} x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f0eeff" strokeWidth="1" />
            })}
            {/* Area fill */}
            <polygon
              points={`${padL},${padT + drawH} ${pts.join(' ')} ${svgW - padR},${padT + drawH}`}
              fill="rgba(83,74,183,0.07)"
            />
            {/* Line */}
            <polyline points={polyline} fill="none" stroke="#534AB7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Dots */}
            {pts.map((pt, i) => {
              const [x, y] = pt.split(',')
              return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#534AB7" strokeWidth="2" />
            })}
            {/* X labels */}
            {months.map((m, i) => {
              const x = padL + (i / (months.length - 1)) * drawW
              return <text key={m} x={x} y={svgH - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{m}</text>
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* School comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">Məktəb Müqayisəsi</p>
            <div className="space-y-3">
              {schools.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <p className="text-xs text-gray-700 w-28">{s.name}</p>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full flex items-center justify-end pr-2`} style={{ width: `${(s.score / 10) * 100}%` }}>
                      <span className="text-[9px] text-white font-bold">{s.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top/Bottom table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">Ən Yaxşı & Ən Zəif</p>
            <div className="space-y-2">
              <p className="text-[10px] text-teal uppercase tracking-wider font-medium">Top 3</p>
              {schools.slice(0, 3).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-4">{i + 1}</span>
                    <span className="text-xs text-gray-700">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-teal">{s.score}</span>
                </div>
              ))}
              <p className="text-[10px] text-red-400 uppercase tracking-wider font-medium pt-2">Diqqət</p>
              {schools.slice(3).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-4">{schools.length - schools.slice(3).length + i + 1}</span>
                    <span className="text-xs text-gray-700">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-red-400">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Notifications Demo ─── */
function BildirislerDemo() {
  const notifications = [
    { emoji: '🏫', text: 'Məktəb №47 aylıq hesabat göndərdi', time: '09:12', type: 'hesabat', read: false },
    { emoji: '⚠️', text: 'Məktəb №6 davamiyyət faizi aşağı düşdü (88%)', time: '08:54', type: 'kritik', read: false },
    { emoji: '✅', text: 'E-Gov.az ixracı avtomatik tamamlandı', time: '08:30', type: 'sistem', read: true },
    { emoji: '🎓', text: 'Yeni məktəb qoşuldu: Məktəb №89', time: 'Dünən', type: 'sistem', read: true },
    { emoji: '📊', text: 'TISA Q1 hesabatı hazırlandı — PDF hazırdır', time: 'Dünən', type: 'hesabat', read: true },
    { emoji: '🔒', text: 'Sistem yedəkləməsi uğurla tamamlandı', time: 'Dünən', type: 'sistem', read: true },
    { emoji: '⚠️', text: 'Məktəb №132 IB audit sənədini təqdim etmədi', time: '2 gün', type: 'kritik', read: true },
  ]
  const tabs = ['Hamısı', 'Kritik', 'Hesabat', 'Sistem']

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">Bildirişlər</h2>
          <p className="text-[11px] text-gray-400">2 oxunmamış bildiriş</p>
        </div>
        <button className="text-sm text-purple hover:text-purple/70 transition-colors font-medium">Hamısını oxunmuş say</button>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-0">
          {tabs.map((t, i) => (
            <button key={t} className={`px-4 py-3 text-sm border-b-2 transition-colors ${i === 0 ? 'border-purple text-purple font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors ${!n.read ? 'border-purple/30 shadow-sm' : 'border-gray-200'}`}>
              <span className="text-xl flex-shrink-0 mt-0.5">{n.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">{n.time}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    n.type === 'kritik' ? 'bg-red-50 text-red-400' :
                    n.type === 'hesabat' ? 'bg-purple-light text-purple' :
                    'bg-gray-100 text-gray-500'
                  }`}>{n.type}</span>
                </div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-purple flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── E-Gov Integration Demo ─── */
function EgovDemo() {
  const services = [
    { name: 'ASAN Xidmət',    icon: '🏛️', status: 'Bağlı',   lastSync: '09:42 · Bugün',  color: 'text-teal bg-teal-light border-teal/20' },
    { name: 'E-Gov.az',        icon: '🌐', status: 'Bağlı',   lastSync: '09:30 · Bugün',  color: 'text-teal bg-teal-light border-teal/20' },
    { name: 'Dövlət Reyestri', icon: '📋', status: 'Bağlı',   lastSync: '08:00 · Bugün',  color: 'text-teal bg-teal-light border-teal/20' },
    { name: 'MİM',             icon: '🎓', status: 'Bağlı',   lastSync: 'Dünən, 23:00',   color: 'text-teal bg-teal-light border-teal/20' },
  ]
  const exportLog = [
    { type: 'Davamiyyət İxracı',   dest: 'E-Gov.az',      time: '09:30', status: 'Uğurlu' },
    { type: 'Hesabat Paketi Q1',   dest: 'Nazirlik Portalı', time: '08:15', status: 'Uğurlu' },
    { type: 'Şagird Siyahısı',     dest: 'Dövlət Reyestri',time: '07:00', status: 'Uğurlu' },
    { type: 'IB Audit Sənədləri', dest: 'ASAN Xidmət',    time: 'Dünən', status: 'Gözlənir' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">E-Gov İnteqrasiya Paneli</h2>
          <p className="text-[11px] text-gray-400">ASAN Xidmət, E-Gov.az, Dövlət Reyestri ilə tam inteqrasiya</p>
        </div>
        <button className="flex items-center gap-2 bg-teal text-white text-sm px-5 py-2 rounded-full hover:bg-teal/90 transition-colors font-medium">
          <Send className="w-4 h-4" />
          E-Gov-a Göndər
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
        {/* Connected services */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map(s => (
            <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{s.name}</p>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${s.color} flex items-center gap-1 justify-center`}>
                <Check className="w-3 h-3" />{s.status}
              </span>
              <p className="text-[10px] text-gray-400 mt-2">{s.lastSync}</p>
            </div>
          ))}
        </div>

        {/* Push data */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Məlumat İxracı</p>
            <span className="text-[11px] text-gray-400">Avtomatik: hər gün 08:00</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Davamiyyət', count: '5,247 qeyd', color: 'border-teal/20 bg-teal-light text-teal' },
              { label: 'Qiymətlər', count: '31,482 qeyd', color: 'border-purple/20 bg-purple-light text-purple' },
              { label: 'Hesabatlar', count: '47 sənəd', color: 'border-amber-200 bg-amber-50 text-amber-600' },
            ].map(item => (
              <div key={item.label} className={`rounded-lg border px-4 py-3 text-center ${item.color}`}>
                <p className="text-base font-bold">{item.count}</p>
                <p className="text-[11px] font-medium mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export log */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Son İxrac Jurnalı</p>
          </div>
          <div className="divide-y divide-gray-100">
            {exportLog.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.type}</p>
                  <p className="text-[11px] text-gray-400">→ {log.dest}</p>
                </div>
                <p className="text-[11px] text-gray-400">{log.time}</p>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${log.status === 'Uğurlu' ? 'bg-teal-light text-teal' : 'bg-amber-50 text-amber-600'}`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Demo router ─── */
const demoComponents = {
  jurnal:                  JurnalDemo,
  davamiyyat:              DavamiyyatDemo,
  zeka:                    ZekaDemo,
  mesajlar:                MesajlarDemo,
  hesabatlar:              HesabatlarDemo,
  'ib-dovlet':             IbDovletDemo,
  'milli-panel':           MilliPanelDemo,
  'avtomatik-hesabatlar':  AvtomatikHesabatlarDemo,
  melumat:                 MelumatDemo,
  analitika:               AnalItikaDemo,
  bildirisler:             BildirislerDemo,
  egov:                    EgovDemo,
}

export default function Demo() {
  const { id } = useParams()
  const meta = demoMeta[id] || { title: 'Demo', subtitle: '' }
  const DemoContent = demoComponents[id]

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="h-14 px-5 flex items-center justify-between max-w-screen-2xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-serif text-base">
              <span className="text-gray-900">Zir</span>
              <span className="text-purple">va</span>
            </span>
          </Link>

          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-900 leading-none">{meta.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{meta.subtitle} · Demo</p>
          </div>

          <Link
            to="/qeydiyyat"
            className="bg-purple text-white text-sm px-5 py-2 rounded-full hover:bg-purple/90 transition-colors font-medium shadow-sm shadow-purple/20"
          >
            Qeydiyyat
          </Link>
        </div>
      </header>

      {/* Demo content */}
      <main className="flex-1">
        {DemoContent ? (
          <DemoContent />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <p className="text-lg font-medium mb-2">Demo tapılmadı</p>
            <Link to="/" className="text-sm text-purple hover:underline">Ana səhifəyə qayıt</Link>
          </div>
        )}
      </main>
    </div>
  )
}
