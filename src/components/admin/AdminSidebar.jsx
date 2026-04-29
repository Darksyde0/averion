import { Link, useNavigate, useLocation } from 'react-router-dom'

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    navigate('/login')
  }

  const menuLinkClass = (path) => {
  const active = location.pathname === path
  return `flex items-center gap-2 px-4 py-2 text-sm rounded-full font-semibold transition w-full
    ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a2236]'}`
}

  const iconOnlyClass = (path) => {
    const active = location.pathname === path
    return `flex items-center justify-center w-10 h-10 rounded-full transition mx-auto
      ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a2236]'}`
  }

  return (
    <div className={`fixed top-0 left-0 h-screen bg-[#0d1117] flex flex-col z-50 transition-all duration-300
      ${isOpen ? 'w-48' : 'w-16'}`}
    >
      <div className="flex-1 overflow-y-auto py-6 hide-scrollbar">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
  {isOpen ? (
    <img src="/images/logo.svg" alt="Averion Logo" className="h-9 w-auto" />
  ) : (
    <img src="/images/logo.svg" alt="Averion Logo" className="h-7 w-7 object-contain" />
  )}
</div>

        <nav className="flex flex-col gap-1 px-2">

          {/* Dashboard */}
          {isOpen ? (
            <Link to="/admin/dashboard" className={menuLinkClass('/admin/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              DASHBOARD
            </Link>
          ) : (
            <Link to="/admin/dashboard" className={iconOnlyClass('/admin/dashboard')} title="Dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </Link>
          )}

          {/* USER section */}
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 px-2 py-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-blue-400 font-bold text-sm">USER</span>
              </div>
              <Link to="/admin/users" className={menuLinkClass('/admin/users')}>View all users</Link>
              <Link to="/admin/users/add" className={menuLinkClass('/admin/users/add')}>Add User</Link>
            </>
          ) : (
            <Link to="/admin/users" className={iconOnlyClass('/admin/users')} title="Users">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}

          {/* SIMULATIONS section */}
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 px-2 py-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                </svg>
                <span className="text-blue-400 font-bold text-sm">SIMULATIONS</span>
              </div>
              <Link to="/admin/simulations/add" className={menuLinkClass('/admin/simulations/add')}>Add Simulation</Link>
              <Link to="/admin/simulations" className={menuLinkClass('/admin/simulations')}>View Simulations</Link>
            </>
          ) : (
            <Link to="/admin/simulations" className={iconOnlyClass('/admin/simulations')} title="Simulations">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
              </svg>
            </Link>
          )}

          {/* TRAINING section */}
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 px-2 py-3 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="text-blue-400 font-bold text-sm">TRAINING</span>
              </div>
              <Link to="/admin/training/add" className={menuLinkClass('/admin/training/add')}>Add module</Link>
              <Link to="/admin/training" className={menuLinkClass('/admin/training')}>View modules</Link>
            </>
          ) : (
            <Link to="/admin/training" className={iconOnlyClass('/admin/training')} title="Training">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </Link>
          )}

          {/* SETTINGS */}
          {isOpen ? (
            <div className="mt-4">
              <Link to="/admin/settings" className={menuLinkClass('/admin/settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                SETTINGS
              </Link>
            </div>
          ) : (
            <Link to="/admin/settings" className={iconOnlyClass('/admin/settings')} title="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          )}

        </nav>
      </div>

      {/* Logout */}
      <div className="flex flex-col gap-3 py-4 px-2 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition text-sm flex items-center justify-center gap-2
            ${isOpen ? 'w-full px-4' : 'w-10 h-10 mx-auto'}`}
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

export default AdminSidebar