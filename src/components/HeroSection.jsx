import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useTranslation } from '../hooks/useTranslation'

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
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
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
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 120)})`
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
      className="relative w-full min-h-screen bg-[#020408]"
    >
      {/* ── Decorative canvas ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        role="presentation"
        className="absolute inset-0 w-full h-full z-0" />

      {/* ── Decorative gradients ── */}
      <div aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.25),transparent)]" />

      {/* ── Decorative image — desktop ── */}
      <img
        src="/images/hero-face.svg"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute opacity-30 mix-blend-luminosity z-0"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
        }} />

      {/* ── Decorative image — mobile ── */}
      <img
        src="/images/hero-face-mobile.svg"
        alt=""
        aria-hidden="true"
        className="block md:hidden absolute opacity-25 mix-blend-luminosity z-0"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          width: '95%',
          maxWidth: '420px',
        }} />

      <div aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020408] to-transparent z-0" />

      {/* ── Main content ── */}
      <div
        id="main-content"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-8 pt-24 pb-20">

        {/* Badge — fully decorative, hidden from all AT */}
        <div
          aria-hidden="true"
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
            {t('hero.badge')}
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-white text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
          {t('hero.heading1')}{' '}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
            aria-hidden="true">
            {t('hero.heading2')}
          </span>
          <span className="sr-only">{t('hero.heading2')}</span>
        </h1>

        {/* Subtext — improved contrast: text-gray-200 instead of text-gray-300 */}
        <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
          {t('hero.subtext')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/register"
            className="group relative bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 tracking-wide overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Get started with Averion for free">
            <span className="relative z-10">{t('hero.cta')}</span>
            <div aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>

          <Link to="/about"
            className="flex items-center gap-2 text-gray-200 hover:text-white text-sm font-medium transition-colors duration-200 group rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Learn how Averion works">
            {t('hero.ctaSecondary')}
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
              aria-hidden="true"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Stats — fixed: use <p> not bold text that looks like headings */}
        <div
          className="flex items-center gap-8 mt-16 pt-8 border-t border-white/5 mb-16"
          role="list"
          aria-label="Platform highlights">
          {stats.map((stat, i) => (
            <div key={i} className="text-center" role="listitem">
              <span
                aria-hidden="true"
                className="block text-white text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {stat.value}
              </span>
              <span className="block text-gray-300 text-xs mt-0.5" aria-hidden="true">
                {stat.label}
              </span>
              <span className="sr-only">{stat.value} — {stat.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Scroll indicator — fully decorative, no interactive elements ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        style={{ animation: 'bounce 1s infinite' }}>
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-blue-500/50" />
        <div className="w-1 h-1 rounded-full bg-blue-500/50" />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>

    </section>
  )
}

export default HeroSection