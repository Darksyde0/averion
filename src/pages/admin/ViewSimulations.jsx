import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function ViewSimulations() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedBatch, setExpandedBatch] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleteBatchModal, setDeleteBatchModal] = useState(false)
  const [deleteBatchItem, setDeleteBatchItem] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Expiry modal state ──
  const [expiryModal, setExpiryModal] = useState(false)
  const [expiryBatch, setExpiryBatch] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryLoading, setExpiryLoading] = useState(false)

  useEffect(() => {
    if (profile?.id) fetchSimulations()
  }, [profile])

  async function fetchSimulations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('organization_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const batchMap = {}
      data.forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) {
          batchMap[bid] = {
            batch_id: bid,
            created_at: s.created_at,
            expires_at: s.expires_at || null,
            sims: [],
          }
        }
        batchMap[bid].sims.push({
          id: s.id,
          name: s.scenario_name,
          category: s.category,
          difficulty: s.difficulty,
          type: s.type,
          hidden: s.hidden,
          batch_id: bid,
        })
      })

      const sorted = Object.values(batchMap).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
      setBatches(sorted)
    }
    setLoading(false)
  }

  async function toggleHide(simId) {
    const allSims = batches.flatMap(b => b.sims)
    const sim = allSims.find(s => s.id === simId)
    if (!sim) return
    const { error } = await supabase.from('simulations').update({ hidden: !sim.hidden }).eq('id', simId)
    if (!error) {
      setBatches(prev => prev.map(b => ({
        ...b,
        sims: b.sims.map(s => s.id === simId ? { ...s, hidden: !s.hidden } : s)
      })))
    }
  }

  async function toggleHideBatch(batch) {
    const allHidden = batch.sims.every(s => s.hidden)
    const newHidden = !allHidden
    const ids = batch.sims.map(s => s.id)
    const { error } = await supabase.from('simulations').update({ hidden: newHidden }).in('id', ids)
    if (!error) {
      setBatches(prev => prev.map(b =>
        b.batch_id === batch.batch_id
          ? { ...b, sims: b.sims.map(s => ({ ...s, hidden: newHidden })) }
          : b
      ))
    }
  }

  function handleDeleteClick(sim) { setDeleteItem(sim); setDeleteModal(true) }

  async function confirmDelete() {
    const { error } = await supabase.from('simulations').delete().eq('id', deleteItem.id)
    if (!error) {
      setBatches(prev => prev
        .map(b => ({ ...b, sims: b.sims.filter(s => s.id !== deleteItem.id) }))
        .filter(b => b.sims.length > 0)
      )
      setDeleteModal(false)
      setDeleteItem(null)
    }
  }

  function handleDeleteBatchClick(batch) { setDeleteBatchItem(batch); setDeleteBatchModal(true) }

  async function confirmDeleteBatch() {
    const ids = deleteBatchItem.sims.map(s => s.id)
    const { error } = await supabase.from('simulations').delete().in('id', ids)
    if (!error) {
      setBatches(prev => prev.filter(b => b.batch_id !== deleteBatchItem.batch_id))
      setDeleteBatchModal(false)
      setDeleteBatchItem(null)
    }
  }

  // ── Open expiry modal ──
  function handleEditExpiry(batch) {
    setExpiryBatch(batch)
    setExpiryDate(
      batch.expires_at
        ? new Date(batch.expires_at).toISOString().slice(0, 16)
        : ''
    )
    setExpiryModal(true)
  }

  // ── Save expiry ──
  async function confirmEditExpiry() {
    if (!expiryBatch) return
    setExpiryLoading(true)
    const ids = expiryBatch.sims.map(s => s.id)
    const newExpiry = expiryDate ? new Date(expiryDate).toISOString() : null

    const { error } = await supabase
      .from('simulations')
      .update({ expires_at: newExpiry })
      .in('id', ids)

    if (!error) {
      setBatches(prev => prev.map(b =>
        b.batch_id === expiryBatch.batch_id
          ? { ...b, expires_at: newExpiry }
          : b
      ))
      setExpiryModal(false)
      setExpiryBatch(null)
      setExpiryDate('')
    }
    setExpiryLoading(false)
  }

  function isExpired(dateStr) {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  function isExpiringSoon(dateStr) {
    if (!dateStr) return false
    return new Date(dateStr) < new Date(Date.now() + 86400000 * 2) && !isExpired(dateStr)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatExpiry(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function getDifficultyColor(difficulty) {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const totalSims = batches.flatMap(b => b.sims).length
  const visibleSims = batches.flatMap(b => b.sims).filter(s => !s.hidden).length
  const hiddenSims = batches.flatMap(b => b.sims).filter(s => s.hidden).length

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.sims.some(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    )
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'visible' && batch.sims.some(s => !s.hidden)) ||
      (statusFilter === 'hidden' && batch.sims.every(s => s.hidden))
    return matchesSearch && matchesStatus
  })

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
              <p className="text-gray-400 text-sm mt-0.5">Manage simulation batches and visibility</p>
            </div>
            <button onClick={() => navigate('/admin/simulations/add')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Simulation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total', value: totalSims, color: 'text-blue-600', filter: 'all', active: statusFilter === 'all', ring: 'ring-blue-200 border-blue-400' },
              { label: 'Visible', value: visibleSims, color: 'text-green-600', filter: 'visible', active: statusFilter === 'visible', ring: 'ring-green-200 border-green-400' },
              { label: 'Hidden', value: hiddenSims, color: 'text-gray-500', filter: 'hidden', active: statusFilter === 'hidden', ring: 'ring-gray-200 border-gray-400' },
            ].map(card => (
              <div key={card.filter} onClick={() => setStatusFilter(card.filter)}
                className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition
                  ${card.active ? `${card.ring} ring-2` : 'border-gray-100 hover:border-gray-300'}`}>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{card.label}</p>
                <p className={`text-3xl font-extrabold ${card.color}`}>{loading ? '—' : card.value}</p>
                <p className="text-gray-400 text-xs mt-1">simulations</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search by name or category..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Results count */}
          <p className="text-gray-400 text-xs font-semibold mb-3 ml-1">
            {loading ? 'Loading...' : `${filteredBatches.length} batch${filteredBatches.length !== 1 ? 'es' : ''} · ${totalSims} simulations`}
          </p>

          {/* Batch list */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading simulations...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1">
                {search ? 'No simulations match your search' : 'No simulations yet'}
              </p>
              <p className="text-gray-400 text-xs mb-4">
                {search ? 'Try a different search term' : 'Add your first simulation to get started'}
              </p>
              {!search && (
                <button onClick={() => navigate('/admin/simulations/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition">
                  Add Simulation
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredBatches.map((batch, batchIndex) => {
                const isExpanded = expandedBatch === batch.batch_id
                const allHidden = batch.sims.every(s => s.hidden)
                const someHidden = batch.sims.some(s => s.hidden)
                const categories = [...new Set(batch.sims.map(s => s.category))]
                const expired = isExpired(batch.expires_at)
                const expiringSoon = isExpiringSoon(batch.expires_at)

                return (
                  <div key={batch.batch_id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                      ${expired ? 'border-red-100 opacity-70' : 'border-gray-100'}`}>

                    {/* ── Expiry banner ── */}
                    {batch.expires_at && (
                      <div className={`flex items-center justify-between px-6 py-2 text-xs font-medium
                        ${expired
                          ? 'bg-red-50 border-b border-red-100 text-red-600'
                          : expiringSoon
                            ? 'bg-amber-50 border-b border-amber-100 text-amber-600'
                            : 'bg-gray-50 border-b border-gray-100 text-gray-400'}`}>
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {expired
                            ? `Expired on ${formatExpiry(batch.expires_at)}`
                            : expiringSoon
                              ? `Expiring soon — ${formatExpiry(batch.expires_at)}`
                              : `Expires ${formatExpiry(batch.expires_at)}`}
                        </div>
                        <button onClick={() => handleEditExpiry(batch)}
                          className={`text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition
                            ${expired ? 'text-red-500' : expiringSoon ? 'text-amber-500' : 'text-gray-400'}`}>
                          Edit
                        </button>
                      </div>
                    )}

                    {/* Batch header */}
                    <div className={`flex items-center justify-between px-6 py-4 ${allHidden ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">

                        {/* Expand toggle */}
                        <button onClick={() => setExpandedBatch(isExpanded ? null : batch.batch_id)}
                          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition">
                          <svg xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                              {batch.sims.length} simulation{batch.sims.length > 1 ? 's' : ''}
                            </span>
                            {categories.slice(0, 3).map(cat => (
                              <span key={cat} className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-lg">
                                {cat}
                              </span>
                            ))}
                            {categories.length > 3 && (
                              <span className="text-gray-400 text-xs">+{categories.length - 3} more</span>
                            )}
                            {allHidden && (
                              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Hidden</span>
                            )}
                            {!allHidden && someHidden && (
                              <span className="bg-yellow-50 text-yellow-600 text-xs font-semibold px-2 py-0.5 rounded-full">Partial</span>
                            )}
                            {expired && (
                              <span className="bg-red-100 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">Expired</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">
                            Batch #{batchIndex + 1} · Added {formatDate(batch.created_at)}
                            {!batch.expires_at && (
                              <span className="text-gray-300"> · No expiry</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Batch actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">

                        {/* Edit expiry button */}
                        <button onClick={() => handleEditExpiry(batch)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Expiry
                        </button>

                        <button onClick={() => toggleHideBatch(batch)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition
                            ${allHidden
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                          {allHidden ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Show All
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                              Hide All
                            </>
                          )}
                        </button>

                        <button onClick={() => handleDeleteBatchClick(batch)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete Batch
                        </button>
                      </div>
                    </div>

                    {/* Expanded simulations */}
                    {isExpanded && (
                      <div className="border-t border-gray-50">
                        <div className="grid grid-cols-12 px-6 py-2.5 bg-gray-50">
                          <p className="col-span-4 text-gray-400 text-xs font-semibold uppercase tracking-wide">Name</p>
                          <p className="col-span-2 text-gray-400 text-xs font-semibold uppercase tracking-wide">Category</p>
                          <p className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wide">Level</p>
                          <p className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wide">Type</p>
                          <p className="col-span-1 text-gray-400 text-xs font-semibold uppercase tracking-wide">Status</p>
                          <p className="col-span-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">Actions</p>
                        </div>

                        {batch.sims.map(sim => (
                          <div key={sim.id}
                            className={`grid grid-cols-12 items-center px-6 py-3.5 border-t border-gray-50 hover:bg-gray-50 transition
                              ${sim.hidden ? 'opacity-50' : ''}`}>
                            <div className="col-span-4 flex items-center gap-2">
                              {sim.hidden && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                              )}
                              <p className="text-gray-800 font-medium text-sm truncate">{sim.name}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-lg">{sim.category}</span>
                            </div>
                            <div className="col-span-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getDifficultyColor(sim.difficulty)}`}>{sim.difficulty}</span>
                            </div>
                            <div className="col-span-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${sim.type === 'image' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                {sim.type === 'image' ? 'Image' : 'Text'}
                              </span>
                            </div>
                            <div className="col-span-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sim.hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                                {sim.hidden ? 'Hidden' : 'Visible'}
                              </span>
                            </div>
                            <div className="col-span-3 flex items-center gap-2">
                              <button onClick={() => toggleHide(sim.id)}
                                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition
                                  ${sim.hidden ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                                {sim.hidden ? 'Show' : 'Hide'}
                              </button>
                              <button onClick={() => navigate(`/admin/simulations/edit/${sim.id}`)}
                                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteClick(sim)}
                                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── Edit Expiry Modal ── */}
      {expiryModal && expiryBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-gray-800 text-lg font-bold mb-1 text-center">Edit Expiry Date</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Set when this batch of {expiryBatch.sims.length} simulation{expiryBatch.sims.length > 1 ? 's' : ''} expires
            </p>

            <div className="mb-2">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Expiry Date & Time
              </label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <p className="text-gray-400 text-xs mb-6">
              {expiryDate
                ? `Will expire on ${formatExpiry(expiryDate)}`
                : 'Leave empty to remove expiry — simulation stays active indefinitely'}
            </p>

            {/* Quick presets */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { label: '+1 Day', days: 1 },
                { label: '+1 Week', days: 7 },
                { label: '+1 Month', days: 30 },
                { label: '+3 Months', days: 90 },
              ].map(preset => (
                <button key={preset.label}
                  onClick={() => {
                    const d = new Date(Date.now() + 86400000 * preset.days)
                    setExpiryDate(d.toISOString().slice(0, 16))
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
                  {preset.label}
                </button>
              ))}
              <button onClick={() => setExpiryDate('')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
                No Expiry
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setExpiryModal(false); setExpiryBatch(null); setExpiryDate('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                Cancel
              </button>
              <button onClick={confirmEditExpiry} disabled={expiryLoading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2
                  ${expiryLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {expiryLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete single sim modal */}
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

      {/* Delete batch modal */}
      {deleteBatchModal && deleteBatchItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2 className="text-gray-800 text-lg font-bold mb-1">Delete Entire Batch</h2>
            <p className="text-gray-500 text-sm mb-1">This will permanently delete</p>
            <p className="text-gray-800 font-bold mb-1">{deleteBatchItem.sims.length} simulation{deleteBatchItem.sims.length > 1 ? 's' : ''}</p>
            <p className="text-red-400 text-xs mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteBatchModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                Cancel
              </button>
              <button onClick={confirmDeleteBatch}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ViewSimulations
