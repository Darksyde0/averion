import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function scoreColor(score, hasStarted) {
  if (!hasStarted) return '#9ca3af'
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(score, hasStarted) {
  if (!hasStarted) return 'Not started'
  if (score >= 80) return 'Pass'
  if (score >= 50) return 'Average'
  return 'At risk'
}

const USERS_PER_PAGE = 10

function AllUsers() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('[data-dropdown]')) setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (profile?.id) fetchUsers()
  }, [profile])

  async function fetchUsers() {
    if (!profile?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users').select('*').eq('role', 'user')
        .eq('organization_id', profile.id).order('created_at', { ascending: false })
      if (error) { console.error('fetchUsers error:', error); setLoading(false); return }
      if (!data || data.length === 0) { setUsers([]); setLoading(false); return }
      const userIds = data.map(u => u.id)
      const { data: progressData } = await supabase.from('module_progress')
        .select('user_id, quiz_completed').in('user_id', userIds)
      const { data: simData } = await supabase.from('simulation_results')
        .select('user_id, score').in('user_id', userIds)
      const mapped = data.map(u => {
        const userProgress = progressData?.filter(p => p.user_id === u.id) || []
        const userSims = simData?.filter(s => s.user_id === u.id) || []
        const hasStarted = userProgress.length > 0 || userSims.length > 0
        const avgScore = userSims.length > 0
          ? Math.round(userSims.reduce((sum, s) => sum + s.score, 0) / userSims.length) : 0
        return {
          id: u.id, name: u.full_name, email: u.email,
          department: u.department, jobTitle: u.job_title,
          avatarUrl: u.avatar_url || null,
          progress: avgScore, hasStarted,
          simCount: userSims.length,
          createdAt: u.created_at,
        }
      })
      setUsers(mapped)
    } catch (err) {
      console.error('Unexpected error in fetchUsers:', err)
    } finally {
      setLoading(false)
    }
  }

  function toggleDropdown(e, userId) {
    e.stopPropagation()
    if (openDropdown === userId) { setOpenDropdown(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX - 152 })
    setOpenDropdown(userId)
  }

  function handleExport() {
    const headers = ['Name', 'Email', 'Department', 'Job Title', 'Score', 'Status']
    const rows = users.map(u => [u.name, u.email, u.department, u.jobTitle, u.hasStarted ? `${u.progress}%` : '—', scoreLabel(u.progress, u.hasStarted)])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function handleEditInfo(user) {
    setEditUser({ ...user }); setEditModal(true)
    setEditError(''); setEditSuccess(false); setOpenDropdown(null)
  }

  async function handleEditSave() {
    if (!editUser?.id) return
    setEditSaving(true); setEditError(''); setEditSuccess(false)
    try {
      const { error } = await supabase.from('users')
        .update({ full_name: editUser.name, department: editUser.department })
        .eq('id', editUser.id)
      if (error) { setEditError('Failed to save changes.'); return }
      setUsers(users.map(u => u.id === editUser.id ? { ...u, name: editUser.name, department: editUser.department } : u))
      setEditSuccess(true)
      setTimeout(() => { setEditModal(false); setEditUser(null); setEditSuccess(false) }, 1200)
    } catch (err) {
      setEditError('Something went wrong.')
    } finally {
      setEditSaving(false)
    }
  }

  function handleDeleteAccount(user) {
    setDeleteUser(user); setDeleteModal(true); setDeleteError(''); setOpenDropdown(null)
  }

  async function confirmDelete() {
    if (!deleteUser?.id) return; setDeleteError('')
    try {
      const { error } = await supabase.from('users').delete().eq('id', deleteUser.id)
      if (error) { setDeleteError('Failed to delete user.'); return }
      setUsers(users.filter(u => u.id !== deleteUser.id))
      setDeleteModal(false); setDeleteUser(null)
    } catch (err) {
      setDeleteError('Something went wrong.')
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE)

  const passCount = users.filter(u => u.hasStarted && u.progress >= 80).length
  const atRiskCount = users.filter(u => u.hasStarted && u.progress < 50).length
  const notStartedCount = users.filter(u => !u.hasStarted).length

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      {/* Dropdown */}
      {openDropdown && (
        <div data-dropdown
          className="fixed bg-white rounded-xl shadow-xl z-[9999] overflow-hidden border border-gray-100 w-40"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}>
          <button onClick={() => navigate(`/admin/users/${openDropdown}`)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Profile
          </button>
          <button onClick={() => { const u = users.find(u => u.id === openDropdown); if (u) handleEditInfo(u) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Edit Info
          </button>
          <div className="border-t border-gray-50" />
          <button onClick={() => { const u = users.find(u => u.id === openDropdown); if (u) handleDeleteAccount(u) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-lg font-semibold">Users</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {loading ? 'Loading...' : `${users.length} registered · ${passCount} passing · ${atRiskCount} at risk · ${notStartedCount} not started`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export
              </button>
              <button onClick={() => navigate('/admin/users/add')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* Summary cards */}
          {!loading && users.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total', value: users.length, color: '#111827' },
                { label: 'Passing', value: passCount, color: '#10b981' },
                { label: 'At Risk', value: atRiskCount, color: '#ef4444' },
                { label: 'Not Started', value: notStartedCount, color: '#9ca3af' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search by name, email or department..."
              value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

            {/* Table header */}
            <div className="grid px-5 py-3 border-b border-gray-100 bg-gray-50/70"
              style={{ gridTemplateColumns: '2.5fr 2fr 1.2fr 0.8fr 1fr 36px' }}>
              {['Name', 'Email', 'Department', 'Score', 'Status', ''].map((h, i) => (
                <p key={i} className="text-gray-400 text-xs font-medium uppercase tracking-wide">{h}</p>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading users...</p>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm font-medium">
                  {search ? 'No users match your search' : 'No users yet'}
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  {search ? 'Try a different search term' : 'Add your first user to get started'}
                </p>
                {!search && (
                  <button onClick={() => navigate('/admin/users/add')}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition">
                    Add User
                  </button>
                )}
              </div>
            ) : paginatedUsers.map((user) => (
              <div key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="grid px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition cursor-pointer items-center group"
                style={{ gridTemplateColumns: '2.5fr 2fr 1.2fr 0.8fr 1fr 36px' }}>

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-semibold bg-gray-200">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-gray-500">{getInitials(user.name)}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-sm font-medium truncate group-hover:text-blue-600 transition">{user.name}</p>
                    {user.jobTitle && <p className="text-gray-400 text-xs truncate">{user.jobTitle}</p>}
                  </div>
                </div>

                {/* Email */}
                <p className="text-gray-500 text-xs truncate pr-4">{user.email}</p>

                {/* Department */}
                <p className="text-gray-500 text-xs">{user.department || '—'}</p>

                {/* Score */}
                <div>
                  {user.hasStarted ? (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${user.progress}%`, backgroundColor: scoreColor(user.progress, true) }} />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: scoreColor(user.progress, true) }}>{user.progress}%</p>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-xs">—</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{
                      color: scoreColor(user.progress, user.hasStarted),
                      backgroundColor: user.hasStarted
                        ? user.progress >= 80 ? '#f0fdf4'
                          : user.progress >= 50 ? '#fffbeb'
                            : '#fef2f2'
                        : '#f9fafb',
                    }}>
                    {scoreLabel(user.progress, user.hasStarted)}
                  </span>
                </div>

                {/* Actions */}
                <div data-dropdown>
                  <button onClick={(e) => toggleDropdown(e, user.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-gray-400 text-xs">
                  {(currentPage - 1) * USERS_PER_PAGE + 1}–{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}>
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 rounded-md text-xs font-medium transition ${currentPage === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {editModal && editUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                {editUser.avatarUrl
                  ? <img src={editUser.avatarUrl} alt={editUser.name} className="w-full h-full object-cover rounded-full" />
                  : getInitials(editUser.name)}
              </div>
              <div>
                <p className="text-gray-800 text-sm font-semibold">Edit User</p>
                <p className="text-gray-400 text-xs">{editUser.email}</p>
              </div>
            </div>

            {editError && <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4"><p className="text-red-500 text-xs">{editError}</p></div>}
            {editSuccess && <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 mb-4"><p className="text-green-600 text-xs font-medium">Changes saved</p></div>}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-500 text-xs font-medium mb-1 block">Full Name</label>
                <input type="text" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium mb-1 block">Email</label>
                <input type="email" value={editUser.email} disabled
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                <p className="text-gray-300 text-xs mt-1">Cannot be changed here</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium mb-1 block">Department</label>
                <select value={editUser.department} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition">
                  {['Engineering','Human Resources','Finance','Marketing','Operations','Sales','Management'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4">
              <button onClick={() => { setEditModal(false); handleDeleteAccount(editUser) }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition border border-red-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Account
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setEditModal(false); setEditUser(null) }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${editSaving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && deleteUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 text-center">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <p className="text-gray-800 text-sm font-semibold mb-1">Delete {deleteUser.name}?</p>
            <p className="text-gray-400 text-xs mb-4">This action cannot be undone.</p>
            {deleteError && <div className="bg-red-50 rounded-lg px-3 py-2 mb-3"><p className="text-red-500 text-xs">{deleteError}</p></div>}
            <div className="flex gap-2">
              <button onClick={() => { setDeleteModal(false); setDeleteUser(null); setDeleteError('') }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AllUsers