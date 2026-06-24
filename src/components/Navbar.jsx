import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../hooks/useTranslation'

function Navbar({ showRegister = false }) {
  const { t, lang, changeLang } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const langRef = useRef(null)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
  ]

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

      <div className="fixed top-0 left-0 w-full z-50 flex justify-center"
        style={{ padding: '16px 24px' }}>

        <nav
          aria-label="Main navigation"
          className="w-full max-w-3xl flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            backgroundColor: 'rgba(10,12,18,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>

          {/* Logo */}
          <Link to="/"
            aria-label="Averion — go to homepage"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg flex-shrink-0">
            <img src="/images/logo.svg" alt="Averion logo" className="h-6 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(item => (
              <Link
                key={item.key}
                to={item.path}
                className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right — language + CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-label={`Select language, current: ${currentLangLabel}`}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                {lang}
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
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
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-150 focus:outline-none"
                        style={{ color: lang === l.code ? '#0bceff' : 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.color = '#ffffff' }}
                        onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                        <span className="font-bold mr-1.5 uppercase">{l.code}</span>{l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            {showRegister ? (
              <Link to="/register"
                className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: '#0bceff', color: '#0a0c12' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#09b8e6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0bceff'}>
                {t('nav.getStarted')}
              </Link>
            ) : (
              <Link to="/login"
                className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: '#0bceff', color: '#ffffff' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#09b8e6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0bceff'}>
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
            className="md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="absolute top-full left-6 right-6 mt-2 rounded-2xl flex flex-col gap-1 p-4"
            style={{
              backgroundColor: 'rgba(10,12,18,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>

            {navLinks.map(item => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {item.label}
              </Link>
            ))}

            <div className="flex gap-2 pt-3 mt-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              role="group" aria-label="Select language">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { changeLang(l.code); setMobileOpen(false) }}
                  aria-pressed={lang === l.code}
                  aria-label={`Switch to ${l.label}`}
                  className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{
                    backgroundColor: lang === l.code ? '#0bceff' : 'rgba(255,255,255,0.05)',
                    color: lang === l.code ? '#0a0c12' : 'rgba(255,255,255,0.5)',
                  }}>
                  {l.code}
                </button>
              ))}
            </div>

            <div className="pt-3 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {showRegister ? (
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="block text-sm font-semibold px-5 py-3 rounded-full transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: '#0bceff', color: '#0a0c12' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#09b8e6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0bceff'}>
                  {t('nav.getStarted')}
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block text-sm font-semibold px-5 py-3 rounded-full transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: '#0bceff', color: '#ffffff' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#09b8e6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0bceff'}>
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default Navbar