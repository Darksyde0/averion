import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const initialSimulations = [
  {
    id: 1,
    name: 'Phishing Email 1',
    category: 'Phishing Detection',
    difficulty: 'Medium',
    type: 'image',
    date: '4/9/2026',
    hidden: false,
  },
  {
    id: 2,
    name: 'Password Security Check',
    category: 'Password Security',
    difficulty: 'Easy',
    type: 'text',
    date: '4/9/2026',
    hidden: false,
  },
  {
    id: 3,
    name: 'Social Engineering Trap',
    category: 'Social Engineering',
    difficulty: 'Hard',
    type: 'text',
    date: '4/9/2026',
    hidden: true,
  },
]

function ViewSimulations() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [simulations, setSimulations] = useState(initialSimulations)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  function handleDeleteClick(sim) {
    setDeleteItem(sim)
    setDeleteModal(true)
  }

  function confirmDelete() {
    setSimulations(simulations.filter(s => s.id !== deleteItem.id))
    setDeleteModal(false)
    setDeleteItem(null)
  }

  function toggleHide(id) {
    setSimulations(simulations.map(s =>
      s.id === id ? { ...s, hidden: !s.hidden } : s
    ))
  }

  const totalCount = simulations.length
  const visibleCount = simulations.filter(s => !s.hidden).length
  const hiddenCount = simulations.filter(s => s.hidden).length

  const categories = ['all', ...new Set(simulations.map(s => s.category))]

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch =
      sim.name.toLowerCase().includes(search.toLowerCase()) ||
      sim.category.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'visible' && !sim.hidden) ||
      (statusFilter === 'hidden' && sim.hidden)
    const matchesCategory =
      categoryFilter === 'all' || sim.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const filterBtnClass = (active) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition
    ${active
      ? 'bg-blue-600 text-white'
      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-0'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-full pl-1 pr-5 py-1">
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-white font-bold text-sm leading-tight">John Doe</p>
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">ADMIN</span>
              </div>
            </div>
            <button className="relative text-white hover:text-blue-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1117]" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          {/* Page heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-gray-800 text-3xl font-bold">View Simulations</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and control simulation visibility</p>
            </div>
            <button
              onClick={() => navigate('/admin/simulations/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Simulation
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div
              onClick={() => setStatusFilter('all')}
              className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition
                ${statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">Total</p>
              <p className="text-blue-600 text-3xl font-bold">{totalCount}</p>
              <p className="text-gray-400 text-xs mt-1">simulations created</p>
            </div>

            <div
              onClick={() => setStatusFilter('visible')}
              className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition
                ${statusFilter === 'visible' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'}`}
            >
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">Visible</p>
              <p className="text-green-500 text-3xl font-bold">{visibleCount}</p>
              <p className="text-gray-400 text-xs mt-1">visible to users</p>
            </div>

            <div
              onClick={() => setStatusFilter('hidden')}
              className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition
                ${statusFilter === 'hidden' ? 'border-gray-500 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">Hidden</p>
              <p className="text-gray-500 text-3xl font-bold">{hiddenCount}</p>
              <p className="text-gray-400 text-xs mt-1">hidden from users</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search simulations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={filterBtnClass(categoryFilter === cat)}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide mr-1">Status:</span>
            <button onClick={() => setStatusFilter('all')} className={filterBtnClass(statusFilter === 'all')}>All</button>
            <button onClick={() => setStatusFilter('visible')} className={filterBtnClass(statusFilter === 'visible')}>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visible
              </span>
            </button>
            <button onClick={() => setStatusFilter('hidden')} className={filterBtnClass(statusFilter === 'hidden')}>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                Hidden
              </span>
            </button>
          </div>

          {/* Results count */}
          <p className="text-gray-500 text-xs font-semibold mb-3">
            Showing {filteredSimulations.length} of {totalCount} simulations
          </p>

          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 mb-2">
            <p className="col-span-3 text-gray-500 text-sm font-semibold">Simulation Name</p>
            <p className="col-span-3 text-gray-500 text-sm font-semibold">Category</p>
            <p className="col-span-1 text-gray-500 text-sm font-semibold">Type</p>
            <p className="col-span-2 text-gray-500 text-sm font-semibold">Date</p>
            <p className="col-span-1 text-gray-500 text-sm font-semibold">Status</p>
            <p className="col-span-2 text-gray-500 text-sm font-semibold">Actions</p>
          </div>

          {/* Simulation rows */}
          {filteredSimulations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className={`bg-[#1a2744] rounded-2xl grid grid-cols-12 items-center px-6 py-5 transition
                    ${sim.hidden ? 'opacity-50' : 'opacity-100'}`}
                >
                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-2">
                    {sim.hidden && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                    <p className="text-white font-semibold text-sm">{sim.name}</p>
                  </div>

                  {/* Category */}
                  <div className="col-span-3">
                    <span className="bg-[#243860] text-gray-200 text-xs font-medium px-3 py-1 rounded-lg">
                      {sim.category}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${sim.type === 'image' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}
                    >
                      {sim.type === 'image' ? 'Image' : 'Text'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-gray-300 text-sm">{sim.date}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${sim.hidden ? 'bg-gray-600 text-gray-300' : 'bg-green-500 text-white'}`}
                    >
                      {sim.hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-3">

                    {/* Hide / Unhide */}
                    <button
                      onClick={() => toggleHide(sim.id)}
                      className={`transition flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg
                        ${sim.hidden
                          ? 'text-green-400 hover:text-green-300 bg-green-900 bg-opacity-30 hover:bg-opacity-50'
                          : 'text-yellow-400 hover:text-yellow-300 bg-yellow-900 bg-opacity-30 hover:bg-opacity-50'
                        }`}
                    >
                      {sim.hidden ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Unhide
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                          Hide
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/admin/simulations/edit/${sim.id}`)}
                      className="text-white hover:text-blue-400 transition"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteClick(sim)}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1">
                {statusFilter === 'hidden'
                  ? 'No hidden simulations'
                  : statusFilter === 'visible'
                  ? 'No visible simulations'
                  : 'No simulations found'
                }
              </p>
              <p className="text-gray-400 text-xs mb-4">
                {statusFilter === 'all' && search === '' && categoryFilter === 'all'
                  ? 'Get started by adding your first simulation'
                  : 'Try adjusting your filters or search'
                }
              </p>
              {statusFilter === 'all' && search === '' && categoryFilter === 'all' && (
                <button
                  onClick={() => navigate('/admin/simulations/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition"
                >
                  Add Simulation
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">

            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            <h2 className="text-gray-800 text-xl font-bold mb-2">Delete Simulation</h2>
            <p className="text-gray-500 text-sm mb-1">Are you sure you want to delete</p>
            <p className="text-gray-800 font-bold text-base mb-2">{deleteItem.name}</p>
            <p className="text-red-400 text-xs mb-6">This action cannot be undone.</p>

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

export default ViewSimulations