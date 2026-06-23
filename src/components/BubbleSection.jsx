import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useRef } from 'react'

function BubbleSection() {
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

  const steps = [
    {
      number: '01',
      title: t('bubble.step1Title'),
      desc: t('bubble.step1Desc'),
    },
    {
      number: '02',
      title: t('bubble.step2Title'),
      desc: t('bubble.step2Desc'),
    },
    {
      number: '03',
      title: t('bubble.step3Title'),
      desc: t('bubble.step3Desc'),
    },
  ]

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="relative py-32 px-8 overflow-hidden"
      style={{ backgroundColor: '#04080f' }}>

      {/* Subtle center glow */}
      <div aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left — text */}
          <div>
            <div
              ref={el => itemRefs.current[0] = el}
              style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: 'rgba(59,130,246,0.7)' }}>
                {t('bubble.badge')}
              </p>
              <h2
                id="how-it-works-heading"
                className="text-white font-bold mb-5"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '42px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {t('bubble.heading1')}
                <br />
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('bubble.heading2')}</span>
              </h2>
              <p className="text-sm leading-relaxed mb-14 max-w-sm"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t('bubble.subtext')}
              </p>
            </div>

            {/* Steps */}
            <ol className="flex flex-col list-none" aria-label="How Averion works"
              style={{ gap: '0' }}>
              {steps.map((step, i) => (
                <li
                  key={i}
                  ref={el => itemRefs.current[i + 1] = el}
                  className="flex items-start gap-6 group relative"
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 100 + 200}ms, transform 0.5s ease ${i * 100 + 200}ms`,
                    paddingBottom: i < steps.length - 1 ? '32px' : '0',
                  }}>

                  {/* Number + connector line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        color: '#3b82f6',
                        fontFamily: 'monospace',
                      }}>
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 mt-3"
                        style={{ backgroundColor: 'rgba(59,130,246,0.1)', minHeight: '32px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-1 pb-2">
                    <h3 className="text-white font-semibold text-sm mb-1.5 tracking-tight">
                      <span className="sr-only">Step {step.number}: </span>
                      {step.title}
                    </h3>
                    <p className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right — image */}
          <div
            ref={el => itemRefs.current[4] = el}
            className="relative"
            style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s' }}>

            {/* Glow behind image */}
            <div aria-hidden="true"
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div aria-hidden="true"
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, #04080f 0%, transparent 40%), linear-gradient(to right, #04080f 0%, transparent 30%)' }} />
              <img
                src="/images/woman-laptop.jpg"
                alt="A professional working on a laptop, representing Averion cybersecurity training in action"
                className="w-full object-cover object-center"
                style={{ height: 'clamp(280px, 40vw, 480px)' }}
                onError={e => {
                  e.target.src = 'https://placehold.co/800x480/0d1117/1d4ed8?text=Averion+Training'
                  e.target.alt = 'Averion cybersecurity training platform preview'
                }} />
            </div>

            {/* Floating stat card */}
            <aside
              aria-label="Platform stat: active protection rate"
              className="absolute bottom-6 left-6 z-20 rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(4,8,15,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                maxWidth: '180px',
              }}>
              <div className="flex items-center gap-2 mb-2">
                <div aria-hidden="true"
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                <p className="text-xs font-medium" style={{ color: '#10b981' }}>
                  {t('bubble.activeProtection')}
                </p>
              </div>
              <p className="text-white font-bold"
                style={{ fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1 }}
                aria-label="94 percent">
                94%
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('bubble.statLabel')}
              </p>
            </aside>

          </div>
        </div>
      </div>
    </section>
  )
}

export default BubbleSection