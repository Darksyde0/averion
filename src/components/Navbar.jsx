import { Link } from 'react-router-dom'
import { useState } from 'react'

function Navbar({ showRegister = false }) {
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('EN')

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'PT', label: 'Português' },
    { code: 'ES', label: 'Español' },
  ]

  function handleSelectLang(code) {
    setSelectedLang(code)
    setLangOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black flex items-center justify-between px-8 py-4">

      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/images/logo.svg"
          alt="Averion Logo"
          className="h-9 w-auto"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-white text-sm hover:text-blue-400 transition">
          Home
        </Link>
        <Link to="/about" className="text-white text-sm hover:text-blue-400 transition">
          About
        </Link>
        <Link to="/contact" className="text-white text-sm hover:text-blue-400 transition">
          Contact
        </Link>

        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-white hover:text-blue-400 transition flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
              <path
                stroke="currentColor"
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"
              />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded shadow-lg z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition
                    ${selectedLang === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                >
                  {lang.code} — {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOGIN or REGISTER depending on page */}
        {showRegister ? (
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded transition"
          >
            REGISTER
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded transition"
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar