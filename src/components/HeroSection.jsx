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
      className="relative w-full min-h-screen overflow-hidden bg-[#020408]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />

      <div aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.25),transparent)]" />

      <img src="/images/hero-face.png" alt="" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity" />

      <div aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020408] to-transparent" />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-8 pt-24">

        {/* Badge */}
        <div aria-hidden="true"
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
          style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}
        >
          {t('hero.heading1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            {t('hero.heading2')}
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
          {t('hero.subtext')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/register"
            className="group relative bg-blue-600 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020408] text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 tracking-wide overflow-hidden"
            aria-label="Get started with Averion for free">
            <span className="relative z-10">{t('hero.cta')}</span>
            <div aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>

          <Link to="/about"
            className="flex items-center gap-2 text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#020408] rounded text-sm font-medium transition-colors duration-200 group"
            aria-label="Learn how Averion works">
            {t('hero.ctaSecondary')}
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-16 pt-8 border-t border-white/5"
          role="list" aria-label="Platform highlights">
          {stats.map((stat, i) => (
            <div key={i} className="text-center" role="listitem">
              <p className="text-white text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                aria-label={`${stat.value} — ${stat.label}`}>
                {stat.value}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <div aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-blue-500/50" />
        <div className="w-1 h-1 rounded-full bg-blue-500/50" />
      </div>

    </section>
  )
}

export default HeroSection