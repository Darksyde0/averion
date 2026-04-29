import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { supabase } from '../../supabaseClient'

function getStatus(progress) {
  if (progress >= 80) return { label: 'Excellent', color: 'bg-green-500' }
  if (progress >= 50) return { label: 'Good', color: 'bg-blue-500' }
  return { label: 'Needs Attention', color: 'bg-red-500' }
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const avatarColors = [
  'bg-blue-600', 'bg-purple-600', 'bg-green-600',
  'bg-orange-500', 'bg-pink-600', 'bg-teal-600',
  'bg-red-600', 'bg-indigo-600',
]

const USERS_PER_PAGE = 8

function AllUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState(null)

  // Edit modal
  const [editModal, setEditModal] = useState(false)
  const [editUser, setEditUser] = useState(null)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteUser, setDeleteUser] = useState(null)

  // ── FETCH USERS FROM SUPABASE ──
  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const mapped = data.map(u => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        department: u.department,
        progress: 0,
      }))
      setUsers(mapped)
    }
    setLoading(false)
  }

  function toggleDropdown(userId) {
    setOpenDropdown(openDropdown === userId ? null : userId)
  }

  // ── EDIT ──
  function handleEditInfo(user) {
    setEditUser({ ...user })
    setEditModal(true)
    setOpenDropdown(null)
  }

  async function handleEditSave() {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: editUser.name,
        email: editUser.email,
        department: editUser.department,
      })
      .eq('id', editUser.id)

    if (!error) {
      setUsers(users.map(u => u.id === editUser.id ? editUser : u))
      setEditModal(false)
      setEditUser(null)
    }
  }

  // ── DELETE ──
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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-full pl-1 pr-5 py-1">
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <p className="text-white font-bold text-sm leading-tight">John Doe</p>
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">
                ADMIN
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-gray-800 text-3xl font-bold">All Users</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and track all registered users</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm px-5 py-2 rounded-lg transition">Filter</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition">Add User</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition">Export</button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="bg-[#1a2744] rounded-2xl overflow-hidden shadow-lg">

            {/* Table header */}
            <div
              className="px-6 py-4 border-b border-blue-900 grid items-center"
              style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr' }}
            >
              <p className="text-gray-300 text-sm font-semibold">Name</p>
              <p className="text-gray-300 text-sm font-semibold">Email</p>
              <p className="text-gray-300 text-sm font-semibold">Department</p>
              <p className="text-gray-300 text-sm font-semibold">Progress</p>
              <p className="text-gray-300 text-sm font-semibold">Status</p>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="px-6 py-10 text-center">
                <p className="text-gray-400 text-sm">Loading users...</p>
              </div>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => {
                const status = getStatus(user.progress)
                const initials = getInitials(user.name || '')
                const avatarColor = avatarColors[index % avatarColors.length]

                return (
                  <div
                    key={user.id}
                    className="px-6 py-4 border-b border-blue-900 hover:bg-[#1e2f55] transition grid items-center relative"
                    style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{initials}</span>
                      </div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                    </div>

                    <p className="text-gray-300 text-sm truncate pr-2">{user.email}</p>

                    <div>
                      <span className="bg-[#243860] text-gray-200 text-xs font-medium px-3 py-1 rounded-lg">
                        {user.department}
                      </span>
                    </div>

                    <p className="text-white text-sm font-semibold">{user.progress}%</p>

                    <div className="flex items-center justify-between relative">
                      <span className={`${status.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {status.label}
                      </span>

                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(user.id)}
                          className="text-gray-400 hover:text-white transition ml-2 flex-shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>

                        {openDropdown === user.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                            <button
                              onClick={() => handleEditInfo(user)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              Edit Personal Info
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-gray-400 text-sm">No users found matching your search.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 px-6 py-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`text-sm font-semibold transition ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:text-blue-400'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-full text-sm font-semibold transition ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`text-sm font-semibold transition ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:text-blue-400'}`}
              >
                Next
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── EDIT PERSONAL INFO MODAL ── */}
      {editModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

            <h2 className="text-gray-800 text-xl font-bold mb-1">Edit Personal Info</h2>
            <p className="text-gray-400 text-sm mb-6">Update details for {editUser.name}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Department</label>
                <select
                  value={editUser.department}
                  onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
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

            {/* Danger Zone */}
            <div className="border-t border-gray-100 mt-6 pt-5">
              <p className="text-gray-400 text-xs font-semibold mb-3">Danger Zone</p>
              <button
                onClick={() => {
                  setEditModal(false)
                  handleDeleteAccount(editUser)
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Account
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT MODAL ── */}
      {deleteModal && deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">

            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            <h2 className="text-gray-800 text-xl font-bold mb-2">Delete Account</h2>
            <p className="text-gray-500 text-sm mb-1">Are you sure you want to delete</p>
            <p className="text-gray-800 font-bold text-base mb-2">{deleteUser.name}</p>
            <p className="text-red-400 text-xs mb-6">This action cannot be undone. All data will be permanently removed.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition"
              >
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default AllUsers