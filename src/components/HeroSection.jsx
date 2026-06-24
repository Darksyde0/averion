import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import GradientText from './GradientText'

function HeroSection() {
  const canvasRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.35 + 0.05,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${p.opacity})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resize()
    init()
    if (!prefersReducedMotion) draw()
    window.addEventListener('resize', () => { resize(); init() })
    return () => { cancelAnimationFrame(animId) }
  }, [])

  const stats = [
    { value: t('hero.stat1Value'), label: t('hero.stat1Label') },
    { value: t('hero.stat2Value'), label: t('hero.stat2Label') },
    { value: t('hero.stat3Value'), label: t('hero.stat3Label') },
  ]

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full min-h-screen"
      style={{ backgroundColor: '#020408' }}>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        role="presentation"
        className="absolute inset-0 w-full h-full z-0" />

      {/* Radial gradient */}
      <div aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(29,78,216,0.22), transparent)' }} />

      {/* Hero face — desktop */}
      <img
        src="/images/hero-face.svg"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute opacity-20 mix-blend-luminosity z-0"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
        }} />

      {/* Hero face — mobile */}
      <img
        src="/images/hero-face-mobile.svg"
        alt=""
        aria-hidden="true"
        className="block md:hidden absolute opacity-20 mix-blend-luminosity z-0"
        style={{
          top: '30%', left: '50%',
          transform: 'translate(-50%, -20%)',
          width: '95%', maxWidth: '420px',
        }} />

      {/* Bottom fade */}
      <div aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-48 z-0"
        style={{ background: 'linear-gradient(to top, #020408, transparent)' }} />

      {/* Main content */}
      <div
        id="main-content"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-28 pb-24">

        {/* Badge */}
        <div
          aria-hidden="true"
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10"
          style={{
            backgroundColor: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.18)',
          }}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
            {t('hero.badge')}
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="font-bold mb-7 max-w-4xl"
          style={{
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            fontSize: 'clamp(40px, 7vw, 80px)',
            color: '#ffffff',
          }}>
          {t('hero.heading1')}
          <br />
          <span aria-hidden="true">
            <GradientText
              colors={["#3b82f6", "#06b6d4", "#60a5fa", "#3b82f6"]}
              animationSpeed={6}
              showBorder={false}
              className="font-bold"
              style={{ fontSize: 'inherit' }}>
              {t('hero.heading2')}
            </GradientText>
          </span>
          <span className="sr-only">{t('hero.heading2')}</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl leading-relaxed mb-12 max-w-xl"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t('hero.subtext')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-20">
          <Link
            to="/register"
            className="group relative font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ backgroundColor: '#0bceff', color: '#0a0c12' }}
            aria-label="Get started with Averion for free"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#09b8e6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0bceff'}>
            {t('hero.cta')}
          </Link>

          <Link
            to="/about"
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 group rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Learn how Averion works"
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            {t('hero.ctaSecondary')}
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-10 md:gap-16 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          role="list"
          aria-label="Platform highlights">
          {stats.map((stat, i) => (
            <div key={i} className="text-center" role="listitem">
              <span
                aria-hidden="true"
                className="block font-bold mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '26px', color: '#ffffff', letterSpacing: '-0.02em' }}>
                {stat.value}
              </span>
              <span
                className="block text-xs"
                aria-hidden="true"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {stat.label}
              </span>
              <span className="sr-only">{stat.value} — {stat.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        style={{ animation: 'heroScroll 1.8s ease-in-out infinite' }}>
        <div className="w-px h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.4))' }} />
        <div className="w-1 h-1 rounded-full"
          style={{ backgroundColor: 'rgba(59,130,246,0.4)' }} />
      </div>

      <style>{`
        @keyframes heroScroll {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          50% { transform: translateX(-50%) translateY(6px); opacity: 0.5; }
        }
      `}</style>

    </section>
  )
}

export default HeroSection