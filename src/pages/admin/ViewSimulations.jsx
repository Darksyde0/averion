import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function ViewSimulations() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    if (profile?.id) fetchSimulations()
  }, [profile])

  async function fetchSimulations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('organization_id', profile.id) // ← org filter
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSimulations(data.map(s => ({
        id: s.id,
        name: s.scenario_name,
        category: s.category,
        difficulty: s.difficulty,
        type: s.type,
        date: new Date(s.created_at).toLocaleDateString(),
        hidden: s.hidden,
      })))
    }
    setLoading(false)
  }

  function handleDeleteClick(sim) {
    setDeleteItem(sim)
    setDeleteModal(true)
  }

  async function confirmDelete() {
    const { error } = await supabase.from('simulations').delete().eq('id', deleteItem.id)
    if (!error) {
      setSimulations(simulations.filter(s => s.id !== deleteItem.id))
      setDeleteModal(false)
      setDeleteItem(null)
    }
  }

  async function toggleHide(id) {
    const sim = simulations.find(s => s.id === id)
    const { error } = await supabase.from('simulations').update({ hidden: !sim.hidden }).eq('id', id)
    if (!error) {
      setSimulations(simulations.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s))
    }
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
    const matchesCategory = categoryFilter === 'all' || sim.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  function getDifficultyColor(difficulty) {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Simulations</h1>
              <p className="text-gray-400 text-sm mt-0.5">Manage and control simulation visibility</p>
            </div>
            <button onClick={() => navigate('/admin/simulations/add')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Simulation
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total', value: totalCount, color: 'text-blue-600', filter: 'all', active: statusFilter === 'all', ring: 'ring-blue-200 border-blue-400' },
              { label: 'Visible', value: visibleCount, color: 'text-green-600', filter: 'visible', active: statusFilter === 'visible', ring: 'ring-green-200 border-green-400' },
              { label: 'Hidden', value: hiddenCount, color: 'text-gray-500', filter: 'hidden', active: statusFilter === 'hidden', ring: 'ring-gray-200 border-gray-400' },
            ].map((card) => (
              <div key={card.filter} onClick={() => setStatusFilter(card.filter)}
                className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition
                  ${card.active ? `${card.ring} ring-2` : 'border-gray-100 hover:border-gray-300'}`}>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{card.label}</p>
                <p className={`text-3xl font-extrabold ${card.color}`}>{loading ? '—' : card.value}</p>
                <p className="text-gray-400 text-xs mt-1">simulations</p>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col gap-3">

            {/* Search */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search simulations..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                    ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

          </div>

          {/* Results count */}
          <p className="text-gray-400 text-xs font-semibold mb-3 ml-1">
            {loading ? 'Loading...' : `${filteredSimulations.length} of ${totalCount} simulations`}
          </p>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="col-span-4 text-gray-500 text-xs font-semibold uppercase tracking-wide">Name</p>
              <p className="col-span-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">Category</p>
              <p className="col-span-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">Level</p>
              <p className="col-span-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">Type</p>
              <p className="col-span-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">Status</p>
              <p className="col-span-3 text-gray-500 text-xs font-semibold uppercase tracking-wide">Actions</p>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading simulations...</p>
              </div>
            ) : filteredSimulations.length > 0 ? (
              filteredSimulations.map((sim) => (
                <div key={sim.id}
                  className={`grid grid-cols-12 items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition
                    ${sim.hidden ? 'opacity-50' : ''}`}>

                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-2">
                    {sim.hidden && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                    <p className="text-gray-800 font-semibold text-sm truncate">{sim.name}</p>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {sim.category}
                    </span>
                  </div>

                  {/* Difficulty */}
                  <div className="col-span-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(sim.difficulty)}`}>
                      {sim.difficulty}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg
                      ${sim.type === 'image' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {sim.type === 'image' ? 'Image' : 'Text'}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                      ${sim.hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                      {sim.hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center gap-2">
                    <button onClick={() => toggleHide(sim.id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition
                        ${sim.hidden
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                      {sim.hidden ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Show
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                          Hide
                        </>
                      )}
                    </button>

                    <button onClick={() => navigate(`/admin/simulations/edit/${sim.id}`)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteClick(sim)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-semibold mb-1">
                  {search || categoryFilter !== 'all' ? 'No simulations match your filters' : 'No simulations yet'}
                </p>
                <p className="text-gray-400 text-xs mb-4">
                  {search || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'Add your first simulation to get started'}
                </p>
                {!search && categoryFilter === 'all' && (
                  <button onClick={() => navigate('/admin/simulations/add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition">
                    Add Simulation
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2 className="text-gray-800 text-lg font-bold mb-1">Delete Simulation</h2>
            <p className="text-gray-500 text-sm mb-1">You are about to delete</p>
            <p className="text-gray-800 font-bold mb-1">{deleteItem.name}</p>
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

export default ViewSimulations