import { useState, useEffect, useRef } from 'react'
import { useProfile } from '../../hooks/useProfile'

function AdminTopBar({ onMenuClick }) {
  const profile = useProfile()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-[#0d1117] border-b border-white border-opacity-5 flex items-center justify-between px-6 h-14 flex-shrink-0">

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white hover:bg-opacity-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white hover:bg-opacity-5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-gray-800 text-sm font-bold">Notifications</p>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">Welcome to Averion 1.0</p>
                    <p className="text-gray-400 text-xs mt-0.5">New updates are available on Averion 1.0</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin pill */}
        <div className="flex items-center gap-2.5 bg-white bg-opacity-5 border border-white border-opacity-5 rounded-full pl-3 pr-1.5 py-1.5">

          {/* Name + role */}
          <div className="text-right">
            <p className="text-white text-xs font-semibold leading-tight">
              {profile?.full_name || 'Loading...'}
            </p>
            <p className="text-red-400 text-xs leading-tight">Admin</p>
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0 ring-1 ring-white ring-opacity-10">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminTopBar