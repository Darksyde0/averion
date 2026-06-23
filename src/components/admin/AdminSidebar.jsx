import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useProfile()
  const [logoError, setLogoError] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function isActive(path) {
    return location.pathname === path
  }

  function CollapsedLogo() {
    if (logoError) {
      return (
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      )
    }
    return (
      <img src="/images/favcon.svg" alt="A" className="h-7 w-7 object-contain"
        onError={() => setLogoError(true)} />
    )
  }

  function NavItem({ to, icon, label, collapsed }) {
    const active = isActive(to)
    if (collapsed) {
      return (
        <Link to={to} title={label}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg mx-auto transition-all duration-150 group"
          style={{ backgroundColor: active ? 'rgba(59,130,246,0.2)' : 'transparent' }}>
          <span style={{ color: active ? '#93c5fd' : '#9ca3af' }}
            className="transition-colors duration-150 group-hover:!text-white">
            {icon}
          </span>
          {active && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full" />
          )}
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
            style={{ backgroundColor: '#1e2433', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
            {label}
          </div>
        </Link>
      )
    }

    return (
      <Link to={to}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group w-full"
        style={{ backgroundColor: active ? 'rgba(59,130,246,0.15)' : 'transparent' }}>
        <span style={{ color: active ? '#93c5fd' : '#9ca3af' }}
          className="flex-shrink-0 transition-colors duration-150 group-hover:!text-white">
          {icon}
        </span>
        <span className="text-xs font-medium transition-colors duration-150 flex-1"
          style={{ color: active ? '#bfdbfe' : '#9ca3af' }}>
          {label}
        </span>
        {active && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
        )}
      </Link>
    )
  }

  const dashIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
  const usersIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
  const addUserIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
  const simIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" /></svg>
  const addSimIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  const trainingIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
  const addModuleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
  const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

  const divider = (
    <div className={`${isOpen ? 'mx-3' : 'mx-auto w-6'}`}
      style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
  )

  return (
    <div
      className={`fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-300 ${isOpen ? 'w-48' : 'w-14'}`}
      style={{ backgroundColor: '#0a0e1a', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Logo */}
      <div className={`flex items-center flex-shrink-0 h-14 ${isOpen ? 'px-5' : 'justify-center px-0'}`}>
        {isOpen ? (
          <img src="/images/logo.svg" alt="Averion" className="h-6 w-auto" />
        ) : (
          <CollapsedLogo />
        )}
      </div>

      {divider}

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>

        {/* Dashboard */}
        <div className="flex flex-col gap-0.5">
          <NavItem to="/admin/dashboard" icon={dashIcon} label="Dashboard" collapsed={!isOpen} />
        </div>

        {divider}

        {/* Users */}
        <div className="flex flex-col gap-0.5">
          <NavItem to="/admin/users" icon={usersIcon} label="All Users" collapsed={!isOpen} />
          <NavItem to="/admin/users/add" icon={addUserIcon} label="Add User" collapsed={!isOpen} />
        </div>

        {divider}

        {/* Simulations */}
        <div className="flex flex-col gap-0.5">
          <NavItem to="/admin/simulations/add" icon={addSimIcon} label="Add Simulation" collapsed={!isOpen} />
          <NavItem to="/admin/simulations" icon={simIcon} label="View Simulations" collapsed={!isOpen} />
        </div>

        {divider}

        {/* Training */}
        <div className="flex flex-col gap-0.5">
          <NavItem to="/admin/training/add" icon={addModuleIcon} label="Add Module" collapsed={!isOpen} />
          <NavItem to="/admin/training" icon={trainingIcon} label="View Modules" collapsed={!isOpen} />
        </div>

        {divider}

        {/* Settings */}
        <div className="flex flex-col gap-0.5">
          <NavItem to="/admin/settings" icon={settingsIcon} label="Settings" collapsed={!isOpen} />
        </div>

      </div>

      {divider}

      {/* Bottom */}
      <div className="flex-shrink-0 py-3">
        {isOpen ? (
          <div className="flex flex-col gap-0.5 w-full">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ backgroundColor: '#1d4ed8' }}>
                {(profile?.full_name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-tight truncate" style={{ color: '#e2e8f0' }}>
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-xs leading-tight mt-0.5" style={{ color: '#6b7280' }}>
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full transition-all duration-150"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              title={profile?.full_name || 'Admin'}
              style={{ backgroundColor: '#1d4ed8' }}>
              {(profile?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default AdminSidebar