import { useProfile } from '../../hooks/useProfile'

function TopBar({ onMenuClick }) {
  const profile = useProfile()

  return (
    <div style={{ backgroundColor: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      className="flex items-center justify-between px-6 h-12 flex-shrink-0">

      {/* Hamburger */}
      <button onClick={onMenuClick}
        className="text-gray-500 hover:text-white transition p-1.5 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right — user info */}
      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <p className="text-white text-xs font-medium leading-tight">
            {profile?.full_name || 'Loading...'}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
            <p className="text-gray-500 text-xs leading-tight">User</p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
        </div>
      </div>

    </div>
  )
}

export default TopBar