import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../hooks/useTranslation'

function Navbar({ showRegister = false }) {
  const { t, lang, changeLang } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const langRef = useRef(null)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
  ]

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') { setLangOpen(false); setMobileOpen(false) }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const navLinks = [
    { key: 'home', label: t('nav.home'), path: '/' },
    { key: 'about', label: t('nav.about'), path: '/about' },
    { key: 'contact', label: t('nav.contact'), path: '/contact' },
  ]

  const currentLangLabel = languages.find(l => l.code === lang)?.label || lang

  return (
    <>
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          padding: scrolled ? '10px 0' : '18px 0',
          backgroundColor: scrolled ? 'rgba(2,4,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}>

        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">

          {/* Logo */}
          <Link to="/"
            aria-label="Averion — go to homepage"
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
            <img src="/images/logo.svg" alt="Averion logo" className="h-7 w-auto" />
          </Link>

          {/* Desktop nav — centered links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(item => (
              <Link
                key={item.key}
                to={item.path}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right — language + CTA */}
          <div className="hidden md:flex items-center gap-3">

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-label={`Select language, current: ${currentLangLabel}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" />
                  <path stroke="currentColor" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                </svg>
                {lang}
              </button>

              {langOpen && (
                <ul
                  role="listbox"
                  aria-label="Select language"
                  className="absolute right-0 mt-2 w-36 rounded-xl overflow-hidden shadow-2xl"
                  style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {languages.map(l => (
                    <li key={l.code} role="option" aria-selected={lang === l.code}>
                      <button
                        onClick={() => { changeLang(l.code); setLangOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                        style={{ color: lang === l.code ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.color = '#ffffff' }}
                        onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                        <span className="font-bold mr-1.5 uppercase">{l.code}</span>{l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA pill */}
            {showRegister ? (
              <Link to="/register"
                className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}>
                {t('nav.getStarted')}
              </Link>
            ) : (
              <Link to="/login"
                className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}>
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm p-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="md:hidden px-8 py-6 flex flex-col gap-2"
            style={{ backgroundColor: 'rgba(2,4,8,0.98)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

            {navLinks.map(item => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {item.label}
              </Link>
            ))}

            {/* Mobile language */}
            <div
              className="flex gap-2 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              role="group"
              aria-label="Select language">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { changeLang(l.code); setMobileOpen(false) }}
                  aria-pressed={lang === l.code}
                  aria-label={`Switch to ${l.label}`}
                  className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{
                    backgroundColor: lang === l.code ? '#2563eb' : 'rgba(255,255,255,0.05)',
                    color: lang === l.code ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  }}>
                  {l.code}
                </button>
              ))}
            </div>

            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {showRegister ? (
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-white text-sm font-semibold px-5 py-3 rounded-xl transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {t('nav.getStarted')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-white text-sm font-semibold px-5 py-3 rounded-xl transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar