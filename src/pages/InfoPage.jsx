import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, ArrowRight, MapPin, Clock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

const PAGES = {
  'ib-diploma': {
    title: 'IB Diploma (DP)',
    subtitle: 'Full support for the IB Diploma Programme',
    body: `The IB Diploma Programme (DP) is a rigorous pre-university course for students aged 16–19. Zirva provides complete DP management including subject selection, assessment criteria tracking (A–D scale), CAS management, Theory of Knowledge documentation, and Extended Essay workflow. Our platform integrates directly with IBIS for exam registration and e-coursework submission.`,
    color: 'purple',
  },
  'ib-career': {
    title: 'IB Career-Related (CP)',
    subtitle: 'Dedicated tools for the IB Career-related Programme',
    body: `The IB Career-related Programme (CP) combines the rigour of the IB with a career-related study. Zirva supports CP schools with personalised learning records, reflective project management, service learning tracking, and language development documentation — all within a single platform.`,
    color: 'teal',
  },
  'ib-myp': {
    title: 'IB Middle Years (MYP)',
    subtitle: 'Collaborative Programme of Inquiry planning',
    body: `The IB Middle Years Programme (MYP) provides a framework of academic challenge for students aged 11–16. Zirva's MYP tools include unit planner collaboration, interdisciplinary learning tracking, criterion-referenced assessment (A–D), MYP eAssessment preparation, and personal project management.`,
    color: 'purple',
  },
  'ib-pyp': {
    title: 'IB Primary Years (PYP)',
    subtitle: 'The same powerful support for younger students',
    body: `The IB Primary Years Programme (PYP) nurtures and develops young students as caring, active participants in a lifelong journey of learning. Zirva supports PYP schools with exhibition planning, transdisciplinary theme tracking, portfolio management, and learner profile documentation.`,
    color: 'teal',
  },
  'government-schools': {
    title: 'Government Schools',
    subtitle: 'Dedicated mode for Azerbaijani public schools',
    body: `Zirva's Government School edition is built specifically for Azerbaijani state schools. It includes full integration with the Ministry of Education reporting system, E-Gov.az export, ASAN Xidmət compatibility, national 10-point grading, and automatic compliance reports. All data is hosted on Azerbaijani servers in full compliance with local legislation.`,
    color: 'teal',
  },
  'mobile': {
    title: 'Mobile App',
    subtitle: 'Zirva on the go — iOS & Android',
    body: `The Zirva mobile app gives students, parents, and teachers full access to the platform from their phones. Check grades, record attendance, send messages, view timetables, and receive real-time notifications — all from a native mobile experience. Available on iOS and Android. Coming soon.`,
    color: 'purple',
  },
  'online-exams': {
    title: 'Online Exams',
    subtitle: 'Secure digital assessment at scale',
    body: `Zirva's online exam module supports both IB and national curriculum assessments. Create, distribute, and automatically mark exams. Built-in anti-plagiarism tools, time limits, randomised question banks, and instant result reporting make digital assessment seamless for teachers and students alike.`,
    color: 'teal',
  },
  'ceo-letter': {
    title: 'CEO Letter',
    subtitle: 'A message from our founder',
    body: `Zirva was founded with a single belief: that every student in Azerbaijan — whether in an IB World School or a state school — deserves world-class education technology. We built this platform to eliminate the administrative burden on teachers and give every student a personal AI tutor in their pocket.\n\nWe are just getting started. If you share this vision, we'd love to hear from you.\n\n— Zirva Founding Team`,
    color: 'purple',
  },
  'resources': {
    title: 'Resource Library',
    subtitle: 'Guides, templates, and best practices',
    body: `Our resource library contains implementation guides, curriculum planning templates, assessment rubrics, and best practice articles for IB and government school educators. New resources are added regularly. Get in touch to request specific resources for your school.`,
    color: 'teal',
  },
  'events': {
    title: 'Events & Webinars',
    subtitle: 'Learn, connect, and grow with Zirva',
    body: `Join our webinars, workshops, and school visits to learn how leading schools are using Zirva to transform their operations. Events are held online and in Baku. Subscribe to our newsletter or contact us to be notified of upcoming sessions.`,
    color: 'purple',
  },
  'blog': {
    title: 'Blog',
    subtitle: 'Insights on education, technology, and school leadership',
    body: `The Zirva blog covers topics including AI in education, IB programme management, Azerbaijani education policy, school leadership, and ed-tech trends. Written by our team and guest contributors from the international school community.`,
    color: 'teal',
  },
  'product-portal': {
    title: 'Product Portal',
    subtitle: 'Track what we\'re building',
    body: `The Zirva product portal is where you can see our public roadmap, vote on features, and submit your own ideas. We build Zirva in close collaboration with the schools that use it — your feedback directly shapes every release.`,
    color: 'purple',
  },
  'reviews': {
    title: 'Customer Reviews',
    subtitle: 'Stories from schools using Zirva',
    body: `Hear from IB Coordinators, IT leaders, and school administrators who have deployed Zirva. Our pilot schools have reported significant reductions in administrative time, improved parent communication, and measurable gains in data quality. Get in touch to speak with a reference school.`,
    color: 'teal',
  },
  'faq': {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about Zirva',
    body: `**How long does implementation take?** Most schools are fully onboarded within 2–4 weeks.\n\n**Is my data safe?** All data is hosted on Azerbaijani servers and is fully compliant with local data protection law and GDPR.\n\n**Does Zirva support both IB and national curriculum?** Yes — Zirva is the only platform in Azerbaijan that natively supports both IB programmes and the national curriculum in a single system.\n\n**How does pricing work?** Pricing is per school, based on student enrolment. Contact us for a quote.`,
    color: 'purple',
  },
  'premium-support': {
    title: 'Premium Support',
    subtitle: '24/7 dedicated support for your school',
    body: `Premium Support includes a dedicated account manager, priority response times (under 2 hours), on-site implementation assistance, staff training sessions, and quarterly review calls. Available as an add-on to any Zirva subscription. Contact us to learn more.`,
    color: 'purple',
  },
  'support': {
    title: 'Help & Support',
    subtitle: 'We\'re here whenever you need us',
    body: `Our support team is available 24/7 by email and during business hours by phone. For self-service, our knowledge base contains step-by-step guides for every feature in Zirva. For urgent issues, Premium Support customers have access to a dedicated hotline.`,
    color: 'teal',
  },
  'about': {
    title: 'About Zirva',
    subtitle: 'The digital school infrastructure for Azerbaijan',
    body: `Zirva is an Azerbaijani ed-tech company building the next generation of school management software. We serve both IB World Schools and government schools with a single, unified platform covering curriculum planning, assessment, attendance, communications, AI tutoring, and ministry reporting.\n\nOur team combines deep experience in international education, enterprise software, and artificial intelligence. We are headquartered in Baku, Azerbaijan.`,
    color: 'purple',
  },
  'careers': {
    title: 'Careers at Zirva',
    subtitle: 'Help us build the future of education in Azerbaijan',
    body: `We're looking for engineers, designers, and education specialists who are passionate about transforming schools. We offer competitive salaries, flexible working, and the chance to build technology used by thousands of students every day.\n\nTo apply or enquire about open roles, send your CV to hello@tryzirva.com with the subject line "Careers".`,
    color: 'teal',
  },
  'partners': {
    title: 'Partners',
    subtitle: 'Work with us to reach more schools',
    body: `Zirva partners with education consultancies, IB authorisation advisors, government bodies, and technology resellers across Azerbaijan and the region. If your organisation works with schools and you see value in introducing Zirva, we'd love to explore a partnership.\n\nGet in touch at hello@tryzirva.com.`,
    color: 'purple',
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'Let\'s talk about your school',
    body: `Whether you're ready to start a pilot, want a product demo, or just have a question — we'd love to hear from you. Our team typically responds within a few hours.`,
    color: 'teal',
    isContact: true,
  },
  'privacy': {
    title: 'Privacy Policy',
    subtitle: 'How Zirva collects, uses, and protects your data',
    body: `Last updated: 16 April 2026

Zirva ("we", "us", or "our") is committed to protecting the privacy of students, parents, teachers, and school administrators who use our platform. This Privacy Policy explains what personal data we collect, how we use it, and your rights regarding that data.

1. Data We Collect

We collect the following categories of personal data: account information (name, email address, role); school and class information; academic records (grades, attendance, assignments, exam results); communications sent through the platform; device and usage data (IP address, browser type, pages visited); and, where applicable, government identification numbers required for Ministry of Education reporting.

2. How We Use Your Data

We use your data to provide and improve the Zirva platform; to generate academic reports and comply with Ministry of Education requirements; to facilitate communication between students, parents, and teachers; to provide AI-powered tutoring and analytics features; and to send important notifications about your account and your school.

3. Data Storage and Security

All data is stored on servers located within the Republic of Azerbaijan, in full compliance with Azerbaijani data protection legislation and the General Data Protection Regulation (GDPR). We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest), role-based access controls, and regular independent security audits to protect your information.

4. Data Sharing

We do not sell your personal data. We share data only with: your school administration and authorised staff; the Ministry of Education of Azerbaijan, where required by law; trusted sub-processors (cloud infrastructure, email delivery) under strict data processing agreements; and law enforcement or regulatory bodies when legally required.

5. Data Retention

Student and staff records are retained for the duration of the school's subscription plus a 7-year period required by Azerbaijani educational legislation. You may request deletion of your personal account data at any time, subject to legal retention obligations.

6. Your Rights

You have the right to access, correct, and request deletion of your personal data. You also have the right to data portability and to object to certain processing activities. To exercise these rights, contact us at privacy@tryzirva.com. We will respond within 30 days.

7. Cookies

Zirva uses strictly necessary cookies to maintain your session and preferences. We do not use advertising or tracking cookies.

8. Children's Privacy

Zirva is used by students of all ages, including children under 18. Schools are responsible for obtaining appropriate parental consent before enrolling students on the platform. We do not knowingly collect data from children without school authorisation.

9. Changes to This Policy

We may update this policy periodically. Schools will be notified of material changes by email at least 30 days before they take effect.

10. Contact

For any privacy-related questions or requests, contact our Data Protection Officer at privacy@tryzirva.com or write to Zirva, Baku, Azerbaijan.`,
    color: 'purple',
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: 'The rules governing use of the Zirva platform',
    body: `Last updated: 16 April 2026

These Terms of Service ("Terms") govern access to and use of the Zirva school management platform operated by Birclick LLC ("Zirva", "we", "us"). By accessing or using Zirva, you agree to be bound by these Terms.

1. Eligibility

Zirva is a B2B platform licensed to schools and educational institutions. Individual access is granted by a school administrator. You must be at least 13 years old (or have parental consent if younger) and authorised by your school to use the platform.

2. Licence

Subject to payment of applicable fees and compliance with these Terms, we grant your school a non-exclusive, non-transferable licence to access and use Zirva for the school's internal educational management purposes during the subscription term.

3. Acceptable Use

You agree not to: share your login credentials with unauthorised persons; attempt to access accounts or data that do not belong to you; upload harmful, offensive, or illegal content; use the platform to harass, bully, or discriminate against any person; reverse-engineer, decompile, or create derivative works of the platform; or use the platform in any way that violates Azerbaijani law or applicable international regulations.

4. Subscription and Payment

Access to Zirva requires a paid school subscription. Fees are billed annually per the agreed quote. Subscriptions renew automatically unless cancelled at least 30 days before the renewal date. All fees are non-refundable except as required by law.

5. Data Ownership

Your school retains full ownership of all data uploaded to or generated within Zirva. We act as a data processor on behalf of your school. Upon termination, you may export all school data in standard formats within 90 days. After that period, data may be deleted.

6. Availability and Support

We target 99.5% monthly uptime, excluding scheduled maintenance. Support is provided by email and, for Premium Support subscribers, by phone. We do not guarantee specific response times on the standard plan.

7. Intellectual Property

The Zirva platform, including its design, code, and AI models, is the intellectual property of Birclick LLC. Nothing in these Terms transfers ownership of any intellectual property to you.

8. Limitation of Liability

To the maximum extent permitted by law, Zirva's liability for any claim arising out of or relating to these Terms is limited to the fees paid by your school in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.

9. Termination

Either party may terminate the subscription at the end of any subscription term. We may suspend or terminate access immediately if you materially breach these Terms and fail to remedy the breach within 14 days of written notice.

10. Governing Law

These Terms are governed by the laws of the Republic of Azerbaijan. Any disputes shall be resolved by the courts of Baku, Azerbaijan.

11. Changes to These Terms

We may update these Terms from time to time. Schools will be notified of material changes by email at least 30 days before they take effect. Continued use after that date constitutes acceptance of the updated Terms.

12. Contact

For questions about these Terms, contact us at hello@tryzirva.com or write to Zirva, Baku, Azerbaijan.`,
    color: 'teal',
  },
}

/* ─── CONTACT PAGE ─── */
function ContactPage() {
  const [form, setForm] = useState({ name:'', school:'', role:'', email:'', message:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const roles = ['School Director / Principal', 'IB Coordinator', 'IT Manager', 'Teacher', 'Other']

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Save to Supabase
    await supabase.from('contact_submissions').insert([{
      name: form.name, email: form.email,
      school: form.school, role: form.role, message: form.message,
    }])

    // 2. Send email via EmailJS
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          name:         form.name,
          message:      `Email: ${form.email}\nSchool: ${form.school}\nRole: ${form.role}\n\n${form.message}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
    } catch (err) {
      console.error('EmailJS error:', err)
      // Still show success — submission saved to Supabase
    }

    setLoading(false)
    setSent(true)
  }

  const inputStyle = {
    width:'100%', padding:'12px 16px', borderRadius:12,
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.10)',
    color:'#fff', fontSize:14, fontWeight:500,
    outline:'none', transition:'border-color .15s',
    fontFamily:'inherit',
  }
  const labelStyle = { display:'block', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }

  return (
    <div style={{ minHeight:'100vh', background:'#060614', fontFamily:'Plus Jakarta Sans, system-ui, sans-serif' }}>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'70%', background:'radial-gradient(ellipse at 40% 40%, rgba(99,75,215,0.18) 0%, transparent 65%)' }}/>
        <div style={{ position:'absolute', top:'-10%', right:'-15%', width:'50%', height:'60%', background:'radial-gradient(ellipse at 60% 35%, rgba(65,50,190,0.12) 0%, transparent 62%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize:'44px 44px', WebkitMaskImage:'radial-gradient(ellipse 80% 60% at 50% 20%, black 0%, transparent 75%)', maskImage:'radial-gradient(ellipse 80% 60% at 50% 20%, black 0%, transparent 75%)' }}/>
      </div>

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, padding:'20px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', color:'rgba(255,255,255,0.5)', fontSize:14, fontWeight:600, transition:'color .15s' }}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
          <ArrowLeft style={{ width:16, height:16 }}/> Zirva
        </Link>
        <img src="/logo.png" alt="Zirva" style={{ height:28, opacity:.85 }}/>
      </nav>

      {/* Main */}
      <div style={{ position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding:'72px 24px 96px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:72 }}>
          <h1 style={{ fontSize:'clamp(2.4rem,6vw,4.5rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1.05, marginBottom:20 }}>
            Let's talk about<br/><span style={{ background:'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 40%,#8b5cf6 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>your school</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:16.5, lineHeight:1.75, maxWidth:460, margin:'0 auto', fontWeight:500 }}>
            Whether you're exploring a pilot, want a demo, or just have a question — we're ready.
          </p>
        </div>

        {/* Two-col layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, alignItems:'start' }}>

          {/* LEFT — Form */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'40px 36px' }}>
            {sent ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(34,197,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                  <span style={{ fontSize:28 }}>✓</span>
                </div>
                <h3 style={{ color:'#fff', fontWeight:800, fontSize:22, marginBottom:12 }}>Message sent!</h3>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1.7 }}>We'll get back to you within a few hours.</p>
                <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:32, padding:'12px 28px', borderRadius:999, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:14, fontWeight:600 }}>← Back to home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <h2 style={{ color:'#fff', fontWeight:800, fontSize:20, marginBottom:4, letterSpacing:'-0.01em' }}>Send us a message</h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={labelStyle}>Your name</label>
                    <input required style={inputStyle} placeholder="e.g. Rauf Aliyev" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                      onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input required type="email" style={inputStyle} placeholder="you@school.az" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                      onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>School name</label>
                  <input required style={inputStyle} placeholder="e.g. Baku International School" value={form.school} onChange={e=>setForm(f=>({...f,school:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
                </div>
                <div>
                  <label style={labelStyle}>Your role</label>
                  <select required style={{ ...inputStyle, cursor:'pointer' }} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}>
                    <option value="" style={{ background:'#1a1a2e' }}>Select your role…</option>
                    {roles.map(r => <option key={r} value={r} style={{ background:'#1a1a2e' }}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea required rows={4} style={{ ...inputStyle, resize:'vertical', lineHeight:1.65 }} placeholder="Tell us about your school and what you're looking for…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
                </div>
                {error && <p style={{ color:'#f87171', fontSize:13, fontWeight:600, textAlign:'center' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 28px', borderRadius:999, background: loading ? 'rgba(255,255,255,0.7)' : '#fff', color:'#09090f', fontWeight:700, fontSize:15, border:'none', cursor: loading ? 'not-allowed' : 'pointer', transition:'transform .17s ease', fontFamily:'inherit', opacity: loading ? 0.8 : 1 }}
                  onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform='translateY(-2px)' }} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  {loading ? 'Sending…' : <>Send message <ArrowRight style={{ width:15, height:15 }}/></>}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT — Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

            {/* Direct contact */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'28px 28px' }}>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:20 }}>Direct contact</p>
              <a href="mailto:hello@tryzirva.com" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none', marginBottom:16 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'rgba(167,139,250,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Mail style={{ width:18, height:18, color:'#a78bfa' }}/>
                </div>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:600, marginBottom:2 }}>Email</p>
                  <p style={{ color:'#fff', fontSize:14, fontWeight:700 }}>hello@tryzirva.com</p>
                </div>
              </a>
              <a href="tel:+994502411442" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none' }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'rgba(29,158,117,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Phone style={{ width:18, height:18, color:'#1D9E75' }}/>
                </div>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:600, marginBottom:2 }}>Phone</p>
                  <p style={{ color:'#fff', fontSize:14, fontWeight:700 }}>+994 50 241 14 42</p>
                </div>
              </a>
            </div>

            {/* What to expect */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'28px', overflow:'hidden', position:'relative' }}>
              {/* subtle gradient accent */}
              <div style={{ position:'absolute', top:0, right:0, width:160, height:160, background:'radial-gradient(circle at 100% 0%, rgba(167,139,250,0.08) 0%, transparent 65%)', pointerEvents:'none' }}/>

              <p style={{ color:'rgba(255,255,255,0.28)', fontSize:10.5, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:22 }}>What to expect</p>

              {[
                { icon:Clock,    label:'Fast reply',   text:'We get back within a few hours on business days', color:'#a78bfa' },
                { icon:Sparkles, label:'Live demo',    text:'A personalised walkthrough built around your school', color:'#34d399' },
                { icon:MapPin,   label:'Meet in Baku', text:'We\'re local — happy to come to you in person', color:'#60a5fa' },
              ].map(({ icon:Icon, label, text, color }, i) => (
                <div key={label} style={{ display:'flex', gap:14, paddingTop: i > 0 ? 18 : 0, marginTop: i > 0 ? 18 : 0, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <Icon style={{ width:15, height:15, color }}/>
                  </div>
                  <div>
                    <p style={{ color:'#fff', fontSize:13.5, fontWeight:700, marginBottom:3 }}>{label}</p>
                    <p style={{ color:'rgba(255,255,255,0.38)', fontSize:12.5, lineHeight:1.6, fontWeight:500 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Already have an account */}
            <div style={{ background:'rgba(83,74,183,0.08)', border:'1px solid rgba(83,74,183,0.18)', borderRadius:20, padding:'22px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13.5, fontWeight:600 }}>Already have an account?</p>
              <Link to="/daxil-ol" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:999, background:'rgba(83,74,183,0.25)', border:'1px solid rgba(83,74,183,0.35)', color:'#c4b5fd', textDecoration:'none', fontSize:13, fontWeight:700 }}>
                Sign in <ArrowRight style={{ width:13, height:13 }}/>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function InfoPage({ type: typeProp }) {
  const { type: typeParam } = useParams()
  const type = typeProp || typeParam

  if (type === 'contact') return <ContactPage />

  const page = PAGES[type]

  if (!page) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Page not found</p>
          <Link to="/" className="text-purple font-medium hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  const accentBg   = page.color === 'teal' ? 'bg-teal'   : 'bg-purple'
  const accentText = page.color === 'teal' ? 'text-teal'  : 'text-purple'
  const accentLight = page.color === 'teal' ? 'bg-teal-light' : 'bg-purple-light'

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav strip */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Zirva
          </Link>
          <Link to="/contact" className="bg-purple text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-purple-dark transition-colors">
            Bizimlə Əlaqə
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className={`${accentBg} px-6 py-16`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-white text-4xl md:text-5xl mb-3 leading-tight">{page.title}</h1>
          <p className="text-white/70 text-lg">{page.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl border border-border-soft p-8 md:p-12 shadow-sm">
          {page.body.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed mb-5 last:mb-0">{para}</p>
          ))}

          {page.isContact ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="mailto:hello@tryzirva.com"
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-light border border-purple/10 hover:border-purple/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-purple">hello@tryzirva.com</p>
                </div>
              </a>
              <a href="tel:+994502411442"
                className="flex items-center gap-3 p-4 rounded-xl bg-teal-light border border-teal/10 hover:border-teal/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Telefon</p>
                  <p className="text-sm font-semibold text-teal">+994 50 241 14 42</p>
                </div>
              </a>
            </div>
          ) : (
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link to="/contact"
                className="bg-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors text-sm shadow-lg shadow-purple/20">
                Bizimlə Əlaqə
              </Link>
              <a href="mailto:hello@tryzirva.com"
                className={`${accentText} text-sm font-semibold hover:underline`}>
                hello@tryzirva.com
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
