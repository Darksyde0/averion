import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useTranslation } from '../hooks/useTranslation'

function AboutPage() {
  const { t } = useTranslation()
  const itemRefs = useRef([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    itemRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const values = [
    {
      title: t('about.value1Title'),
      desc: t('about.value1Desc'),
    },
    {
      title: t('about.value2Title'),
      desc: t('about.value2Desc'),
    },
    {
      title: t('about.value3Title'),
      desc: t('about.value3Desc'),
    },
    {
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

  const numbers = ['01', '02', '03', '04']

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#020408' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        aria-labelledby="about-heading"
        className="relative min-h-screen flex items-center overflow-hidden pt-20">

        <div aria-hidden="true" className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.18), transparent)' }} />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left */}
            <div
              ref={el => itemRefs.current[0] = el}
              style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
              <p aria-hidden="true"
                className="text-xs font-semibold tracking-widest uppercase mb-6"
                style={{ color: 'rgba(59,130,246,0.7)' }}>
                {t('about.badge')}
              </p>
              <h1
                id="about-heading"
                className="text-white font-bold mb-7"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {t('about.heading1')}<br />
                <span aria-hidden="true"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t('about.heading2')}
                </span>
                <span className="sr-only">{t('about.heading2')}</span>
              </h1>
              <p className="text-base leading-relaxed mb-4"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('about.subtext1')}
              </p>
              <p className="text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('about.subtext2')}
              </p>
            </div>

            {/* Right — image */}
            <div
              ref={el => itemRefs.current[1] = el}
              className="relative"
              style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s' }}>
              <div aria-hidden="true"
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, #020408 0%, transparent 40%), linear-gradient(to left, #020408 0%, transparent 30%)' }} />
                <img
                  src="/images/about-hero.jpg"
                  alt="Cybersecurity professionals working to protect organisations from digital threats"
                  className="w-full object-cover object-center"
                  style={{ height: 'clamp(300px, 40vw, 500px)' }}
                  onError={e => { e.target.src = 'https://placehold.co/700x500/0d1117/1d4ed8?text=Averion' }} />
              </div>
              <div className="absolute top-5 right-5 z-20 rounded-xl px-4 py-3"
                style={{ backgroundColor: 'rgba(2,4,8,0.9)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <span className="block text-white font-bold"
                  style={{ fontSize: '22px', letterSpacing: '-0.02em', lineHeight: 1 }}
                  aria-hidden="true">2026</span>
                <span className="block text-xs mt-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  aria-hidden="true">{t('about.founded')}</span>
                <span className="sr-only">Founded in 2026</span>
              </div>
            </div>

          </div>
        </main>

        <div aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ animation: 'aboutScroll 1.8s ease-in-out infinite' }}>
          <div className="w-px h-10"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.35))' }} />
          <div className="w-1 h-1 rounded-full"
            style={{ backgroundColor: 'rgba(59,130,246,0.35)' }} />
        </div>

        <style>{`
          @keyframes aboutScroll {
            0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
            50% { transform: translateX(-50%) translateY(6px); opacity: 0.4; }
          }
        `}</style>
      </section>

      {/* ── Stats ── */}
      <section
        aria-label="Platform statistics"
        ref={el => itemRefs.current[2] = el}
        className="py-16 px-8"
        style={{
          backgroundColor: '#04080f',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          opacity: 0,
          transform: 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span aria-hidden="true"
                className="block font-bold mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '36px', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {stat.value}
              </span>
              <span className="block text-xs mt-2"
                aria-hidden="true"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </span>
              <span className="sr-only">{stat.value} — {stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Purpose ── */}
      <section
        aria-labelledby="purpose-heading"
        className="relative py-32 px-8 overflow-hidden"
        style={{ backgroundColor: '#020408' }}>
        <div aria-hidden="true" className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(29,78,216,0.06), transparent)' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left — image */}
            <div
              ref={el => itemRefs.current[3] = el}
              className="relative order-2 lg:order-1"
              style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
              <div aria-hidden="true"
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src="/images/about-team.jpg"
                  alt="Team members collaborating on cybersecurity awareness training strategies"
                  className="w-full object-cover object-center"
                  style={{ height: 'clamp(280px, 35vw, 420px)' }}
                  onError={e => { e.target.src = 'https://placehold.co/700x420/0d1117/1d4ed8?text=Our+Team' }} />
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl p-4"
                style={{ backgroundColor: '#04080f', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                  <span className="text-xs font-medium" style={{ color: '#10b981' }}>{t('about.nowAvailable')}</span>
                </div>
                <span className="block text-white font-bold" style={{ fontSize: '18px', letterSpacing: '-0.01em' }}>Early</span>
                <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('about.earlyAccess')}</span>
              </div>
            </div>

            {/* Right — text */}
            <div
              ref={el => itemRefs.current[4] = el}
              className="order-1 lg:order-2"
              style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}>
              <p aria-hidden="true"
                className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: 'rgba(59,130,246,0.7)' }}>
                {t('about.purposeBadge')}
              </p>
              <h2
                id="purpose-heading"
                className="text-white font-bold mb-6"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {t('about.purposeHeading1')}<br />
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('about.purposeHeading2')}</span>
              </h2>
              <p className="text-sm leading-relaxed mb-4"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('about.purposeText1')}
              </p>
              <p className="text-sm leading-relaxed mb-10"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('about.purposeText2')}
              </p>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  t('about.purposePoint1'),
                  t('about.purposePoint2'),
                  t('about.purposePoint3'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div aria-hidden="true"
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#3b82f6' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section
        aria-labelledby="values-heading"
        className="relative py-32 px-8 overflow-hidden"
        style={{ backgroundColor: '#04080f' }}>
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-6xl mx-auto relative">
          <div
            ref={el => itemRefs.current[5] = el}
            className="mb-16"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <p aria-hidden="true"
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'rgba(59,130,246,0.7)' }}>
              {t('about.valuesBadge')}
            </p>
            <h2
              id="values-heading"
              className="text-white font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.02em' }}>
              {t('about.valuesHeading')}
            </h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px list-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden' }}>
            {values.map((v, i) => (
              <li
                key={i}
                ref={el => itemRefs.current[i + 6] = el}
                className="group flex flex-col gap-5 p-8 transition-all duration-300"
                style={{
                  backgroundColor: '#04080f',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, background-color 0.3s ease`,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#04080f'}>

                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)' }} />

                <span className="text-xs font-mono" style={{ color: 'rgba(59,130,246,0.5)' }}>
                  {numbers[i]}
                </span>

                <div>
                  <h3 className="text-white font-semibold text-sm mb-2 tracking-tight">
                    {v.title}
                  </h3>
                  <p className="text-xs leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {v.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        aria-labelledby="cta-heading"
        ref={el => itemRefs.current[10] = el}
        className="py-28 px-8"
        style={{
          backgroundColor: '#04080f',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          opacity: 0,
          transform: 'translateY(24px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: 'rgba(59,130,246,0.7)' }}>
            Get started
          </p>
          <h2
            id="cta-heading"
            className="text-white font-bold mb-5"
            style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {t('about.ctaHeading1')}<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('about.ctaHeading2')}</span>
          </h2>
          <p className="text-sm leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('about.ctaSubtext')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ backgroundColor: '#2563eb' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}>
              {t('about.ctaStart')}
            </Link>
            <Link to="/contact"
              className="font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
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