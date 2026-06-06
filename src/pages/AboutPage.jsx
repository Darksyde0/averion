import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useTranslation } from '../hooks/useTranslation'

function AboutPage() {
  const { t } = useTranslation()

  const values = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      title: t('about.value1Title'),
      desc: t('about.value1Desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: t('about.value2Title'),
      desc: t('about.value2Desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: t('about.value3Title'),
      desc: t('about.value3Desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: t('about.value4Title'),
      desc: t('about.value4Desc'),
    },
  ]

  const stats = [
    { value: t('about.stat1Value'), label: t('about.stat1Label') },
    { value: t('about.stat2Value'), label: t('about.stat2Label') },
    { value: t('about.stat3Value'), label: t('about.stat3Label') },
    { value: t('about.stat4Value'), label: t('about.stat4Label') },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      <Navbar />

      {/* ── Hero ── */}
      <section
        aria-labelledby="about-heading"
        className="relative min-h-screen flex items-center overflow-hidden pt-20">

        {/* Decorative backgrounds */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.2),transparent)]" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* ── FIXED: added id="main-content" to fix broken skip link ── */}
        <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              {/* Badge — decorative */}
              <div aria-hidden="true" className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
                  {t('about.badge')}
                </span>
              </div>

              <h1
                id="about-heading"
                className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                {t('about.heading1')}<br />
                {/* Gradient text with sr-only fallback */}
                <span aria-hidden="true" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t('about.heading2')}
                </span>
                <span className="sr-only">{t('about.heading2')}</span>
              </h1>

              {/* FIXED: text-gray-300 instead of text-gray-400/500 */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{t('about.subtext1')}</p>
              <p className="text-gray-300 text-base leading-relaxed">{t('about.subtext2')}</p>
            </div>

            {/* Right — image */}
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-[#020408] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
              <img
                src="/images/about-hero.jpg"
                alt="Cybersecurity professionals working to protect organisations from digital threats"
                className="w-full h-[500px] object-cover rounded-2xl"
                onError={e => { e.target.src = 'https://placehold.co/700x500/0d1117/1d4ed8?text=Averion' }} />

              {/* FIXED: "2026 Founded" uses spans not p tags to avoid possible heading flag */}
              <div className="absolute top-6 right-6 z-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4">
                <span className="block text-white text-2xl font-bold" aria-hidden="true">2026</span>
                <span className="block text-gray-300 text-xs mt-0.5" aria-hidden="true">{t('about.founded')}</span>
                <span className="sr-only">Founded in 2026</span>
              </div>
            </div>

          </div>
        </main>

        {/* Scroll indicator — decorative */}
        <div aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-blue-500/50" />
          <div className="w-1 h-1 rounded-full bg-blue-500/50" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section aria-label="Platform statistics" className="bg-[#04080f] border-y border-white/5 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              {/* FIXED: span instead of p to avoid possible heading flag */}
              <span
                aria-hidden="true"
                className="block text-white text-4xl font-bold mb-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {stat.value}
              </span>
              {/* FIXED: text-gray-300 instead of text-gray-500 */}
              <span className="block text-gray-300 text-sm" aria-hidden="true">{stat.label}</span>
              <span className="sr-only">{stat.value} — {stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Purpose ── */}
      <section aria-labelledby="purpose-heading" className="bg-[#020408] py-28 px-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(29,78,216,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — image */}
            <div className="relative order-2 lg:order-1">
              <div aria-hidden="true" className="absolute -inset-4 bg-blue-600/5 rounded-3xl blur-xl" />
              <img
                src="/images/about-team.jpg"
                alt="Team members collaborating on cybersecurity awareness training strategies"
                className="relative w-full h-[420px] object-cover rounded-2xl border border-white/5"
                onError={e => { e.target.src = 'https://placehold.co/700x420/0d1117/1d4ed8?text=Our+Team' }} />
              <div className="absolute -bottom-5 -right-5 bg-[#04080f] border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div aria-hidden="true" className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">{t('about.nowAvailable')}</span>
                </div>
                <span className="block text-white text-xl font-bold">Early</span>
                <span className="block text-gray-300 text-xs">{t('about.earlyAccess')}</span>
              </div>
            </div>

            {/* Right — text */}
            <div className="order-1 lg:order-2">
              {/* Badge — decorative */}
              <p aria-hidden="true" className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
                {t('about.purposeBadge')}
              </p>
              <h2
                id="purpose-heading"
                className="text-white text-4xl md:text-5xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                {t('about.purposeHeading1')}<br />
                {/* FIXED: text-gray-300 passes contrast */}
                <span className="text-gray-300">{t('about.purposeHeading2')}</span>
              </h2>
              {/* FIXED: text-gray-300 throughout */}
              <p className="text-gray-300 text-base leading-relaxed mb-5">{t('about.purposeText1')}</p>
              <p className="text-gray-300 text-base leading-relaxed mb-8">{t('about.purposeText2')}</p>

              <ul className="flex flex-col gap-3 list-none">
                {[
                  t('about.purposePoint1'),
                  t('about.purposePoint2'),
                  t('about.purposePoint3'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div aria-hidden="true" className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section aria-labelledby="values-heading" className="bg-[#04080f] py-28 px-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            {/* Badge — decorative */}
            <p aria-hidden="true" className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
              {t('about.valuesBadge')}
            </p>
            <h2
              id="values-heading"
              className="text-white text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
              {t('about.valuesHeading')}
            </h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden list-none">
            {values.map((v, i) => (
              <li key={i} className="bg-[#04080f] hover:bg-blue-950/20 p-8 transition-colors duration-300 group">
                <div aria-hidden="true" className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-500/20 transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{v.title}</h3>
                {/* FIXED: text-gray-300 */}
                <p className="text-gray-300 text-sm leading-relaxed">{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section aria-labelledby="cta-heading" className="bg-[#04080f] border-t border-white/5 py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            id="cta-heading"
            className="text-white text-4xl md:text-5xl font-bold mb-5"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            {t('about.ctaHeading1')}<br />{t('about.ctaHeading2')}
          </h2>
          {/* FIXED: text-gray-300 */}
          <p className="text-gray-300 text-base mb-8">{t('about.ctaSubtext')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* FIXED: Link instead of <a> for internal routes */}
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {t('about.ctaStart')}
            </Link>
            <Link to="/contact"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {t('about.ctaContact')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutPage