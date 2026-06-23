import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function ViewModules() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (profile?.id) fetchModules()
  }, [profile])

  async function fetchModules() {
    if (!profile?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*, lessons(count), quiz_questions(count)')
        .eq('organization_id', profile.id)
        .order('created_at', { ascending: false })
      if (error) { console.error('fetchModules error:', error); setLoading(false); return }
      if (data) {
        setModules(data.map(m => ({
          id: m.id, name: m.name, category: m.category,
          estimatedTime: m.estimated_time,
          lessons: m.lessons?.[0]?.count ?? 0,
          questions: m.quiz_questions?.[0]?.count ?? 0,
          date: new Date(m.created_at).toLocaleDateString(),
          hidden: m.hidden,
        })))
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteClick(mod) { setDeleteItem(mod); setDeleteError(''); setDeleteModal(true) }

  async function confirmDelete() {
    if (!deleteItem?.id) return
    setDeleteError('')
    try {
      const { error } = await supabase.from('modules').delete().eq('id', deleteItem.id)
      if (error) { setDeleteError('Failed to delete. Please try again.'); return }
      setModules(modules.filter(m => m.id !== deleteItem.id))
      setDeleteModal(false); setDeleteItem(null)
    } catch (err) {
      setDeleteError('Something went wrong.')
    }
  }

  async function toggleHide(id) {
    const mod = modules.find(m => m.id === id)
    if (!mod) return
    setModules(prev => prev.map(m => m.id === id ? { ...m, hidden: !m.hidden } : m))
    const { error } = await supabase.from('modules').update({ hidden: !mod.hidden }).eq('id', id)
    if (error) {
      console.error('toggleHide error:', error)
      setModules(prev => prev.map(m => m.id === id ? { ...m, hidden: mod.hidden } : m))
    }
  }

  const totalCount = modules.length
  const visibleCount = modules.filter(m => !m.hidden).length
  const hiddenCount = modules.filter(m => m.hidden).length
  const categories = ['all', ...new Set(modules.map(m => m.category))]

  const filteredModules = modules.filter(mod => {
    const matchesSearch = mod.name?.toLowerCase().includes(search.toLowerCase()) || mod.category?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'visible' && !mod.hidden) || (statusFilter === 'hidden' && mod.hidden)
    const matchesCategory = categoryFilter === 'all' || mod.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-lg font-semibold">Training Modules</h1>
              <p className="text-gray-400 text-xs mt-0.5">Manage and control module visibility</p>
            </div>
            <button onClick={() => navigate('/admin/training/add')}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Module
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', value: totalCount, filter: 'all', color: '#111827' },
              { label: 'Visible', value: visibleCount, filter: 'visible', color: '#10b981' },
              { label: 'Hidden', value: hiddenCount, filter: 'hidden', color: '#9ca3af' },
            ].map(card => (
              <div key={card.filter} onClick={() => setStatusFilter(card.filter)}
                className={`bg-white rounded-xl px-4 py-3 border cursor-pointer transition
                  ${statusFilter === card.filter ? 'border-gray-300 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{loading ? '—' : card.value}</p>
                <p className="text-gray-300 text-xs mt-0.5">modules</p>
              </div>
            ))}
          </div>

          {/* Search + category filters */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search modules..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition
                      ${categoryFilter === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-gray-400 text-xs mb-3">
            {loading ? 'Loading...' : `${filteredModules.length} of ${totalCount} modules`}
          </p>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50/70 border-b border-gray-100">
              {['Module Name', 'Category', 'Time', 'Lessons', 'Quiz', 'Status', 'Actions'].map((h, i) => (
                <p key={i} className={`text-gray-400 text-xs font-medium
                  ${i === 0 ? 'col-span-4' : i === 1 ? 'col-span-2' : i === 6 ? 'col-span-2' : 'col-span-1'}`}>
                  {h}
                </p>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            ) : filteredModules.length > 0 ? (
              filteredModules.map(mod => (
                <div key={mod.id}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition
                    ${mod.hidden ? 'opacity-40' : ''}`}>

                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    {mod.hidden && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                    <p className="text-gray-700 text-xs font-medium truncate">{mod.name}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{mod.category}</span>
                  </div>

                  <div className="col-span-1">
                    <span className="text-gray-500 text-xs">{mod.estimatedTime}m</span>
                  </div>

                  <div className="col-span-1">
                    <span className="text-gray-600 text-xs font-medium">{mod.lessons}</span>
                  </div>

                  <div className="col-span-1">
                    <span className="text-gray-600 text-xs font-medium">{mod.questions}</span>
                  </div>

                  <div className="col-span-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${mod.hidden ? 'bg-gray-300' : 'bg-emerald-400'}`} />
                  </div>

                  <div className="col-span-2 flex items-center gap-1.5">
                    <button onClick={() => toggleHide(mod.id)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      {mod.hidden ? 'Show' : 'Hide'}
                    </button>
                    <button onClick={() => navigate(`/admin/training/edit/${mod.id}`)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(mod)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-red-50 text-red-400 hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm font-medium mb-1">
                  {search || categoryFilter !== 'all' ? 'No modules match your filters' : 'No modules yet'}
                </p>
                <p className="text-gray-300 text-xs mb-4">
                  {search || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'Add your first module to get started'}
                </p>
                {!search && categoryFilter === 'all' && (
                  <button onClick={() => navigate('/admin/training/add')}
                    className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                    Add Module
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 text-center">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <p className="text-gray-800 text-sm font-semibold mb-1">Delete module?</p>
            <p className="text-gray-500 text-xs mb-1 truncate px-4">{deleteItem.name}</p>
            <p className="text-gray-300 text-xs mb-4">This cannot be undone.</p>
            {deleteError && <div className="bg-red-50 rounded-lg px-3 py-2 mb-3"><p className="text-red-500 text-xs">{deleteError}</p></div>}
            <div className="flex gap-2">
              <button onClick={() => { setDeleteModal(false); setDeleteItem(null); setDeleteError('') }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">Cancel</button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ViewModules