import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone } from 'lucide-react'

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
    body: `We're looking for engineers, designers, and education specialists who are passionate about transforming schools. We offer competitive salaries, flexible working, and the chance to build technology used by thousands of students every day.\n\nTo apply or enquire about open roles, send your CV to hello@birclick.az with the subject line "Careers".`,
    color: 'teal',
  },
  'partners': {
    title: 'Partners',
    subtitle: 'Work with us to reach more schools',
    body: `Zirva partners with education consultancies, IB authorisation advisors, government bodies, and technology resellers across Azerbaijan and the region. If your organisation works with schools and you see value in introducing Zirva, we'd love to explore a partnership.\n\nGet in touch at hello@birclick.az.`,
    color: 'purple',
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'Let\'s talk about your school',
    body: `Whether you're ready to start a pilot, want a product demo, or just have a question — we'd love to hear from you. Our team typically responds within a few hours.`,
    color: 'teal',
    isContact: true,
  },
}

export default function InfoPage({ type: typeProp }) {
  const { type: typeParam } = useParams()
  const type = typeProp || typeParam
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
          <Link to="/qeydiyyat" className="bg-purple text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-purple-dark transition-colors">
            Demo al
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
              <a href="mailto:hello@birclick.az"
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-light border border-purple/10 hover:border-purple/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-purple">hello@birclick.az</p>
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
              <Link to="/qeydiyyat"
                className="bg-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors text-sm shadow-lg shadow-purple/20">
                Demo al
              </Link>
              <a href="mailto:hello@birclick.az"
                className={`${accentText} text-sm font-semibold hover:underline`}>
                hello@birclick.az
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
