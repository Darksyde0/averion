import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useRef } from 'react'

function FeatureSection() {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
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
      { threshold: 0.15 }
    )

    itemRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const icons = [
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  ]

  const features = t('features.items').map((item, i) => ({
    icon: icons[i],
    title: item.title,
    desc: item.desc,
  }))

  return (
    <section
      ref={sectionRef}
      aria-labelledby="features-heading"
      className="relative py-32 px-8 overflow-hidden"
      style={{ backgroundColor: '#020408' }}>

      {/* Subtle top border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.4), transparent)' }} />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div
          ref={el => itemRefs.current[0] = el}
          className="mb-20"
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: 'rgba(59,130,246,0.7)' }}>
            {t('features.badge')}
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2
              id="features-heading"
              className="text-white font-bold max-w-xl"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: '42px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {t('features.heading')}
            </h2>
            <p className="text-sm leading-relaxed max-w-xs md:text-right"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('features.subtext')}
            </p>
          </div>
        </div>

        {/* Thin divider */}
        <div className="mb-16" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* Features grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px list-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden' }}
          aria-label="Platform features">
          {features.map((feature, i) => (
            <li
              key={i}
              ref={el => itemRefs.current[i + 1] = el}
              className="group relative p-8 flex flex-col gap-5 transition-all duration-300"
              style={{
                backgroundColor: '#020408',
                opacity: 0,
                transform: 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, background-color 0.3s ease`,
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#020408'}>

              {/* Hover accent line */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.5), transparent)' }} />

              {/* Icon */}
              <div aria-hidden="true"
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  color: 'rgba(59,130,246,0.7)',
                }}>
                {feature.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {feature.desc}
                </p>
              </div>

              {/* Arrow — appears on hover */}
              <div className="mt-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40 transition-all duration-300 group-hover:translate-x-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>

            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}

export default FeatureSection