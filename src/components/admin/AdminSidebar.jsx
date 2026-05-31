import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function isActive(path) {
    return location.pathname === path
  }

  function linkClass(path) {
    const active = isActive(path)
    return `flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl font-semibold transition w-full
      ${active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white hover:bg-opacity-5'}`
  }

  function iconClass(path) {
    const active = isActive(path)
    return `flex items-center justify-center w-9 h-9 rounded-xl transition mx-auto
      ${active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white hover:bg-opacity-5'}`
  }

  function SectionLabel({ icon, label }) {
    return (
      <div className="flex items-center gap-2 px-3 pt-4 pb-1">
        <span className="text-blue-500">{icon}</span>
        <span className="text-blue-500 font-bold text-xs tracking-widest uppercase">{label}</span>
      </div>
    )
  }

  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )

  const simIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
    </svg>
  )

  const trainingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )

  const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const dashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )

  return (
    <div className={`fixed top-0 left-0 h-screen bg-[#0d1117] border-r border-white border-opacity-5 flex flex-col z-50 transition-all duration-300
      ${isOpen ? 'w-48' : 'w-16'}`}>

      <div className="flex-1 overflow-y-auto py-5 hide-scrollbar">

        {/* Logo */}
        <div className="mb-6 flex justify-center px-2">
          <img src="/images/logo.svg" alt="Averion" className={`object-contain ${isOpen ? 'h-8 w-auto' : 'h-7 w-7'}`} />
        </div>

        <nav className="flex flex-col gap-0.5 px-2">

          {/* Dashboard */}
          {isOpen ? (
            <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
              {dashIcon} Dashboard
            </Link>
          ) : (
            <Link to="/admin/dashboard" className={iconClass('/admin/dashboard')} title="Dashboard">
              {dashIcon}
            </Link>
          )}

          {/* Users */}
          {isOpen ? (
            <>
              <SectionLabel icon={userIcon} label="Users" />
              <Link to="/admin/users" className={linkClass('/admin/users')}>All Users</Link>
              <Link to="/admin/users/add" className={linkClass('/admin/users/add')}>Add User</Link>
            </>
          ) : (
            <Link to="/admin/users" className={iconClass('/admin/users')} title="Users">
              {userIcon}
            </Link>
          )}

          {/* Simulations */}
          {isOpen ? (
            <>
              <SectionLabel icon={simIcon} label="Simulations" />
              <Link to="/admin/simulations/add" className={linkClass('/admin/simulations/add')}>Add Simulation</Link>
              <Link to="/admin/simulations" className={linkClass('/admin/simulations')}>View Simulations</Link>
            </>
          ) : (
            <Link to="/admin/simulations" className={iconClass('/admin/simulations')} title="Simulations">
              {simIcon}
            </Link>
          )}

          {/* Training */}
          {isOpen ? (
            <>
              <SectionLabel icon={trainingIcon} label="Training" />
              <Link to="/admin/training/add" className={linkClass('/admin/training/add')}>Add Module</Link>
              <Link to="/admin/training" className={linkClass('/admin/training')}>View Modules</Link>
            </>
          ) : (
            <Link to="/admin/training" className={iconClass('/admin/training')} title="Training">
              {trainingIcon}
            </Link>
          )}

          {/* Settings */}
          {isOpen ? (
            <div className="mt-2">
              <Link to="/admin/settings" className={linkClass('/admin/settings')}>
                {settingsIcon} Settings
              </Link>
            </div>
          ) : (
            <Link to="/admin/settings" className={iconClass('/admin/settings')} title="Settings">
              {settingsIcon}
            </Link>
          )}

        </nav>
      </div>

      {/* Logout */}
      <div className="py-4 px-2 border-t border-white border-opacity-5">
        {isOpen ? (
          <div className="flex flex-col gap-2">
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 border border-red-900 hover:border-red-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            <p className="text-gray-700 text-xs text-center">Version 1.0</p>
          </div>
        ) : (
          <button onClick={handleLogout} title="Logout"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:text-white hover:bg-red-600 transition mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>

    </div>
  )
}

export default AdminSidebar
