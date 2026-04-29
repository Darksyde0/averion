import { Link, useNavigate, useLocation } from 'react-router-dom'

function Sidebar({ isOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    navigate('/login')
  }

  function isActive(path) {
    return location.pathname === path
  }

  function linkStyle(path) {
    const base = isActive(path)
      ? 'bg-blue-600 text-white font-semibold'
      : 'text-gray-400 hover:text-white hover:bg-[#1a2236] transition'

    return `flex items-center py-3 rounded-lg text-sm ${base} ${
      isOpen ? 'gap-3 px-4' : 'justify-center px-0 w-full'
    }`
  }

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-[#0d1117] flex flex-col justify-between py-6 z-50 transition-all duration-300
        ${isOpen ? 'w-60 px-4' : 'w-16 px-2'}`}
    >
      {/* Top — Logo */}
      <div>
        <div className="mb-8 flex justify-center">
          {isOpen ? (
            <img
              src="/images/logo.svg"
              alt="Averion Logo"
              className="h-9 w-auto"
            />
          ) : (
            <img
              src="/images/logo.png"
              alt="Averion Logo"
              className="h-7 w-7 object-contain"
            />
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-2">

          <Link to="/dashboard" className={linkStyle('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            {isOpen && <span>Dashboard</span>}
          </Link>

          <Link to="/simulations" className={linkStyle('/simulations')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
            </svg>
            {isOpen && <span>Simulations</span>}
          </Link>

          <Link to="/training" className={linkStyle('/training')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {isOpen && <span>Training</span>}
          </Link>

          <Link to="/achievements" className={linkStyle('/achievements')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
            {isOpen && <span>Achievements</span>}
          </Link>

          <Link to="/settings" className={linkStyle('/settings')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isOpen && <span>Settings</span>}
          </Link>

        </nav>
      </div>

      {/* Bottom — Logout + Version */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span>Logout</span>}
        </button>
        {isOpen && <p className="text-gray-600 text-xs text-center">Version 1.0</p>}
      </div>

    </div>
  )
}

export default Sidebar