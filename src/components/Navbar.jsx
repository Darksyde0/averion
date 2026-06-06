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
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setLangOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const navLinks = [
  { key: 'home',    label: t('nav.home'),    path: '/' },
  { key: 'about',   label: t('nav.about'),   path: '/about' },
  { key: 'contact', label: t('nav.contact'), path: '/contact' },
]

  const currentLangLabel = languages.find(l => l.code === lang)?.label || lang

  return (
    <>
      {/* ── Skip to main content — WCAG 2.4.1 ── */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
  ${scrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-3'
            : 'bg-black/60 backdrop-blur-sm py-5'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" aria-label="Averion — go to homepage"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
            <img src="/images/logo.svg" alt="Averion logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map(item => (
              <Link key={item.key} to={item.path}
                role="listitem"
                className="text-white hover:text-blue-400 text-sm font-medium tracking-wide transition-colors duration-200 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
                {item.label}
                <span aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-label={`Select language, current language is ${currentLangLabel}`}
                className="flex items-center gap-1.5 text-white hover:text-blue-400 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" />
                  <path stroke="currentColor" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                </svg>
                <span className="text-xs font-semibold tracking-wider uppercase">{lang}</span>
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <ul
                  role="listbox"
                  aria-label="Select language"
                  className="absolute right-0 mt-3 w-40 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {languages.map(l => (
                    <li key={l.code} role="option" aria-selected={lang === l.code}>
                      <button
                        onClick={() => { changeLang(l.code); setLangOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
                          ${lang === l.code
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-white hover:text-blue-400 hover:bg-white/5'}`}>
                        <span className="font-bold mr-2 uppercase">{l.code}</span>{l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTA */}
            {showRegister ? (
              <Link to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t('nav.getStarted')}
              </Link>
            ) : (
              <Link to="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
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
            className="md:hidden text-white hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          hidden={!mobileOpen}
          aria-label="Mobile navigation"
          className={`md:hidden bg-black/95 backdrop-blur-md border-t border-white/5 px-8 py-6 flex flex-col gap-4
            ${mobileOpen ? '' : 'hidden'}`}>

          {navLinks.map(item => (
            <Link key={item.key} to={item.path}
              onClick={() => setMobileOpen(false)}
              className="text-white hover:text-blue-400 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
              {item.label}
            </Link>
          ))}

          {/* Mobile language switcher */}
          <div
            className="flex gap-3 pt-2 border-t border-white/5"
            role="group"
            aria-label="Select language">
            {languages.map(l => (
              <button key={l.code}
                onClick={() => { changeLang(l.code); setMobileOpen(false) }}
                aria-pressed={lang === l.code}
                aria-label={`Switch to ${l.label}`}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${lang === l.code ? 'bg-blue-600 text-white' : 'text-white hover:text-blue-400 bg-white/5'}`}>
                {l.code}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5">
            {showRegister ? (
              <Link to="/register"
                onClick={() => setMobileOpen(false)}
                className="block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t('nav.getStarted')}
              </Link>
            ) : (
              <Link to="/login"
                onClick={() => setMobileOpen(false)}
                className="block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar