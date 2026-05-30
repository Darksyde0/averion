import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar({ showRegister = false }) {
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('EN')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'PT', label: 'Português' },
    { code: 'ES', label: 'Español' },
  ]

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${scrolled
        ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-3'
        : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/images/logo.svg" alt="Averion" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'About', 'Contact'].map(item => (
            <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-gray-400 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 relative group">
              {item}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-5">

          {/* Language */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" />
                <path stroke="currentColor" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
              </svg>
              <span className="text-xs font-semibold tracking-wider">{selectedLang}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setLangOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                      ${selectedLang === lang.code ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <span className="font-bold mr-2">{lang.code}</span>{lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          {showRegister ? (
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 tracking-wide">
              Get Started
            </Link>
          ) : (
            <Link to="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 tracking-wide">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/5 px-8 py-6 flex flex-col gap-4">
          {['Home', 'About', 'Contact'].map(item => (
            <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {item}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5">
            {showRegister ? (
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition text-center">
                Get Started
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition text-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar