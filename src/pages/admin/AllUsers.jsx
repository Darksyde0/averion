import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'

function getStatus(progress, hasStarted) {
  if (!hasStarted) return { label: 'Not Started', color: 'bg-gray-500' }
  if (progress >= 80) return { label: 'Excellent', color: 'bg-green-500' }
  if (progress >= 50) return { label: 'Good', color: 'bg-blue-500' }
  return { label: 'Needs Attention', color: 'bg-red-500' }
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = [
  'bg-blue-600', 'bg-purple-600', 'bg-green-600',
  'bg-orange-500', 'bg-pink-600', 'bg-teal-600',
  'bg-red-600', 'bg-indigo-600',
]

const USERS_PER_PAGE = 8

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
    setLoading(true)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'user')
      .eq('organization_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const userIds = data.map(u => u.id)

      const { data: progressData } = await supabase
        .from('module_progress')
        .select('user_id, completed')
        .in('user_id', userIds)

      const { data: simData } = await supabase
        .from('simulation_results')
        .select('user_id, score')
        .in('user_id', userIds)

      const mapped = data.map(u => {
        const userProgress = progressData?.filter(p => p.user_id === u.id) || []
        const userSims = simData?.filter(s => s.user_id === u.id) || []
        const hasStarted = userProgress.length > 0 || userSims.length > 0
        const avgScore = userSims.length > 0
          ? Math.round(userSims.reduce((sum, s) => sum + s.score, 0) / userSims.length)
          : 0

        return {
          id: u.id,
          name: u.full_name,
          email: u.email,
          department: u.department,
          avatarUrl: u.avatar_url || null,
          progress: avgScore,
          hasStarted,
        }
      })

      setUsers(mapped)
    }
    setLoading(false)
  }

  function toggleDropdown(e, userId) {
    if (openDropdown === userId) {
      setOpenDropdown(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX - 140,
    })
    setOpenDropdown(userId)
  }

  function handleExport() {
    const headers = ['Name', 'Email', 'Department', 'Score', 'Status']
    const rows = users.map(u => {
      const status = getStatus(u.progress, u.hasStarted).label
      return [u.name, u.email, u.department, `${u.progress}%`, status]
    })
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `averion-users-${new Date().toLocaleDateString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleEditInfo(user) {
    setEditUser({ ...user })
    setEditModal(true)
    setEditError('')
    setEditSuccess(false)
    setOpenDropdown(null)
  }

  async function handleEditSave() {
    setEditSaving(true)
    setEditError('')
    setEditSuccess(false)

    const { error } = await supabase
      .from('users')
      .update({
        full_name: editUser.name,
        email: editUser.email,
        department: editUser.department,
      })
      .eq('id', editUser.id)

    setEditSaving(false)

    if (error) {
      setEditError('Failed to save changes. Please try again.')
    } else {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, ...editUser } : u))
      setEditSuccess(true)
      setTimeout(() => {
        setEditModal(false)
        setEditUser(null)
        setEditSuccess(false)
      }, 1500)
    }
  }

  function handleDeleteAccount(user) {
    setDeleteUser(user)
    setDeleteModal(true)
    setOpenDropdown(null)
  }

  async function confirmDelete() {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', deleteUser.id)

    if (!error) {
      setUsers(users.filter(u => u.id !== deleteUser.id))
      setDeleteModal(false)
      setDeleteUser(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      {/* Portal dropdown — Edit only */}
      {openDropdown && (
        <div
          data-dropdown
          className="fixed bg-white rounded-xl shadow-2xl z-[9999] overflow-hidden border border-gray-100 w-44"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <button
            onClick={() => {
              const user = users.find(u => u.id === openDropdown)
              if (user) handleEditInfo(user)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Edit Info
          </button>
        </div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">All Users</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {loading ? 'Loading...' : `${users.length} registered user${users.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export
              </button>
              <button onClick={() => navigate('/admin/users/add')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="px-6 py-3 border-b border-gray-100 grid items-center bg-gray-50"
              style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr 40px' }}>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Name</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Email</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Department</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Score</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Status</p>
              <p></p>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading users...</p>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-semibold">
                  {search ? 'No users match your search' : 'No users yet'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {search ? 'Try a different search term' : 'Click Add User to get started'}
                </p>
              </div>
            ) : (
              paginatedUsers.map((user, index) => {
                const status = getStatus(user.progress, user.hasStarted)
                const initials = getInitials(user.name)
                const avatarColor = avatarColors[index % avatarColors.length]

                return (
                  <div key={user.id}
                    className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition grid items-center"
                    style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr 40px' }}>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold
                        ${!user.avatarUrl ? avatarColor : ''}`}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <p className="text-gray-800 text-sm font-semibold">{user.name}</p>
                    </div>

                    <p className="text-gray-500 text-sm truncate pr-4">{user.email}</p>

                    <span className="text-gray-600 text-xs font-medium bg-gray-100 px-3 py-1 rounded-lg w-fit">
                      {user.department || '—'}
                    </span>

                    <p className="text-gray-800 text-sm font-semibold">
                      {user.hasStarted ? `${user.progress}%` : '—'}
                    </p>

                    <span className={`${status.color} text-white text-xs font-semibold px-3 py-1 rounded-full w-fit`}>
                      {status.label}
                    </span>

                    <div data-dropdown>
                      <button
                        onClick={(e) => toggleDropdown(e, user.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>

                  </div>
                )
              })
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs">
                  Showing {(currentPage - 1) * USERS_PER_PAGE + 1}–{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                      ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                        ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                      ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold
                ${!editUser.avatarUrl ? avatarColors[0] : ''}`}>
                {editUser.avatarUrl ? (
                  <img src={editUser.avatarUrl} alt={editUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(editUser.name)}</span>
                )}
              </div>
              <div>
                <h2 className="text-gray-800 text-lg font-bold">Edit User</h2>
                <p className="text-gray-400 text-sm">{editUser.email}</p>
              </div>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-600 text-sm">✗ {editError}</p>
              </div>
            )}

            {editSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-green-600 text-sm font-semibold">✓ Changes saved successfully!</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Full Name</label>
                <input type="text" value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Email Address</label>
                <input type="email" value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Department</label>
                <select value={editUser.department}
                  onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Engineering</option>
                  <option>Human Resources</option>
                  <option>Finance</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                  <option>Sales</option>
                  <option>Management</option>
                </select>
              </div>
            </div>

            {/* Danger Zone — Delete button back in panel */}
            <div className="border-t border-gray-100 mt-6 pt-4">
              <p className="text-gray-400 text-xs font-semibold mb-3">Danger Zone</p>
              <button
                onClick={() => { setEditModal(false); handleDeleteAccount(editUser) }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition border border-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Account
              </button>
            </div>

            <div className="flex gap-3 mt-3">
              <button onClick={() => { setEditModal(false); setEditUser(null) }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition
                  ${editSaving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2 className="text-gray-800 text-lg font-bold mb-1">Delete Account</h2>
            <p className="text-gray-500 text-sm mb-1">You are about to delete</p>
            <p className="text-gray-800 font-bold mb-1">{deleteUser.name}</p>
            <p className="text-red-400 text-xs mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition">
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