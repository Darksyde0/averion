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
  const [deleteError, setDeleteError] = useState('')
  const [deleteBatchModal, setDeleteBatchModal] = useState(false)
  const [deleteBatchItem, setDeleteBatchItem] = useState(null)
  const [deleteBatchError, setDeleteBatchError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expiryModal, setExpiryModal] = useState(false)
  const [expiryBatch, setExpiryBatch] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryLoading, setExpiryLoading] = useState(false)
  const [expiryError, setExpiryError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (profile?.id) fetchSimulations()
  }, [profile])

  async function fetchSimulations() {
    if (!profile?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('simulations').select('*')
        .eq('organization_id', profile.id)
        .order('created_at', { ascending: false })
      if (error) { console.error('fetchSimulations error:', error); setLoading(false); return }
      if (!data) { setLoading(false); return }
      const batchMap = {}
      data.forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) batchMap[bid] = { batch_id: bid, created_at: s.created_at, expires_at: s.expires_at || null, sims: [] }
        batchMap[bid].sims.push({ id: s.id, name: s.scenario_name, category: s.category, difficulty: s.difficulty, type: s.type, hidden: s.hidden, batch_id: bid })
      })
      setBatches(Object.values(batchMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleHide(simId) {
    const sim = batches.flatMap(b => b.sims).find(s => s.id === simId)
    if (!sim) return
    const { error } = await supabase.from('simulations').update({ hidden: !sim.hidden }).eq('id', simId)
    if (!error) setBatches(prev => prev.map(b => ({ ...b, sims: b.sims.map(s => s.id === simId ? { ...s, hidden: !s.hidden } : s) })))
  }

  async function toggleHideBatch(batch) {
    const allHidden = batch.sims.every(s => s.hidden)
    const newHidden = !allHidden
    const ids = batch.sims.map(s => s.id)
    const { error } = await supabase.from('simulations').update({ hidden: newHidden }).in('id', ids)
    if (!error) setBatches(prev => prev.map(b => b.batch_id === batch.batch_id ? { ...b, sims: b.sims.map(s => ({ ...s, hidden: newHidden })) } : b))
  }

  function handleDeleteClick(sim) { setDeleteItem(sim); setDeleteError(''); setDeleteModal(true) }

  async function confirmDelete() {
    if (!deleteItem?.id) return
    setDeleteError('')
    try {
      const { error } = await supabase.from('simulations').delete().eq('id', deleteItem.id)
      if (error) { setDeleteError('Failed to delete. Please try again.'); return }
      setBatches(prev => prev.map(b => ({ ...b, sims: b.sims.filter(s => s.id !== deleteItem.id) })).filter(b => b.sims.length > 0))
      setDeleteModal(false); setDeleteItem(null)
    } catch (err) {
      setDeleteError('Something went wrong.')
    }
  }

  function handleDeleteBatchClick(batch) { setDeleteBatchItem(batch); setDeleteBatchError(''); setDeleteBatchModal(true) }

  async function confirmDeleteBatch() {
    if (!deleteBatchItem) return
    setDeleteBatchError('')
    try {
      const ids = deleteBatchItem.sims.map(s => s.id)
      const { error } = await supabase.from('simulations').delete().in('id', ids)
      if (error) { setDeleteBatchError('Failed to delete batch.'); return }
      setBatches(prev => prev.filter(b => b.batch_id !== deleteBatchItem.batch_id))
      setDeleteBatchModal(false); setDeleteBatchItem(null)
    } catch (err) {
      setDeleteBatchError('Something went wrong.')
    }
  }

  function handleEditExpiry(batch) {
    setExpiryBatch(batch); setExpiryError('')
    setExpiryDate(batch.expires_at ? new Date(batch.expires_at).toISOString().slice(0, 16) : '')
    setExpiryModal(true)
  }

  async function confirmEditExpiry() {
    if (!expiryBatch) return
    setExpiryLoading(true); setExpiryError('')
    try {
      const ids = expiryBatch.sims.map(s => s.id)
      const newExpiry = expiryDate ? new Date(expiryDate).toISOString() : null
      const { error } = await supabase.from('simulations').update({ expires_at: newExpiry }).in('id', ids)
      if (error) { setExpiryError('Failed to update expiry.'); return }
      setBatches(prev => prev.map(b => b.batch_id === expiryBatch.batch_id ? { ...b, expires_at: newExpiry } : b))
      setExpiryModal(false); setExpiryBatch(null); setExpiryDate('')
    } catch (err) {
      setExpiryError('Something went wrong.')
    } finally {
      setExpiryLoading(false)
    }
  }

  function isExpired(d) { return d ? new Date(d) < new Date() : false }
  function isExpiringSoon(d) { return d ? new Date(d) < new Date(Date.now() + 86400000 * 2) && !isExpired(d) : false }
  function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  function formatExpiry(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  function diffColor(d) {
    if (d === 'Easy') return { bg: '#f0fdf4', text: '#16a34a' }
    if (d === 'Medium') return { bg: '#fefce8', text: '#ca8a04' }
    if (d === 'Hard') return { bg: '#fef2f2', text: '#dc2626' }
    return { bg: '#f9fafb', text: '#6b7280' }
  }

  const totalSims = batches.flatMap(b => b.sims).length
  const visibleSims = batches.flatMap(b => b.sims).filter(s => !s.hidden).length
  const hiddenSims = batches.flatMap(b => b.sims).filter(s => s.hidden).length

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.sims.some(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
    )
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'visible' && batch.sims.some(s => !s.hidden)) ||
      (statusFilter === 'hidden' && batch.sims.every(s => s.hidden))
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-lg font-semibold">Simulations</h1>
              <p className="text-gray-400 text-xs mt-0.5">Manage simulation batches and visibility</p>
            </div>
            <button onClick={() => navigate('/admin/simulations/add')}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Simulation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', value: totalSims, filter: 'all', color: '#111827' },
              { label: 'Visible', value: visibleSims, filter: 'visible', color: '#10b981' },
              { label: 'Hidden', value: hiddenSims, filter: 'hidden', color: '#9ca3af' },
            ].map(card => (
              <div key={card.filter} onClick={() => setStatusFilter(card.filter)}
                className={`bg-white rounded-xl px-4 py-3 border cursor-pointer transition
                  ${statusFilter === card.filter ? 'border-gray-300 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{loading ? '—' : card.value}</p>
                <p className="text-gray-300 text-xs mt-0.5">simulations</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search by name or category..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <p className="text-gray-400 text-xs mb-3">
            {loading ? 'Loading...' : `${filteredBatches.length} batch${filteredBatches.length !== 1 ? 'es' : ''} · ${totalSims} simulations`}
          </p>

          {/* Batch list */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
              <p className="text-gray-400 text-sm font-medium mb-1">
                {search ? 'No simulations match your search' : 'No simulations yet'}
              </p>
              <p className="text-gray-300 text-xs mb-4">
                {search ? 'Try a different search term' : 'Add your first simulation to get started'}
              </p>
              {!search && (
                <button onClick={() => navigate('/admin/simulations/add')}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                  Add Simulation
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBatches.map((batch, batchIndex) => {
                const isExpanded = expandedBatch === batch.batch_id
                const allHidden = batch.sims.every(s => s.hidden)
                const someHidden = batch.sims.some(s => s.hidden)
                const categories = [...new Set(batch.sims.map(s => s.category))]
                const expired = isExpired(batch.expires_at)
                const expiringSoon = isExpiringSoon(batch.expires_at)

                return (
                  <div key={batch.batch_id}
                    className={`bg-white rounded-xl border overflow-hidden transition
                      ${expired ? 'border-red-100 opacity-70' : 'border-gray-100'}`}>

                    {/* Expiry banner */}
                    {batch.expires_at && (
                      <div className={`flex items-center justify-between px-5 py-2 text-xs
                        ${expired ? 'bg-red-50 border-b border-red-100 text-red-500'
                          : expiringSoon ? 'bg-amber-50 border-b border-amber-100 text-amber-600'
                          : 'bg-gray-50 border-b border-gray-100 text-gray-400'}`}>
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {expired ? `Expired ${formatExpiry(batch.expires_at)}` : expiringSoon ? `Expiring soon — ${formatExpiry(batch.expires_at)}` : `Expires ${formatExpiry(batch.expires_at)}`}
                        </div>
                        <button onClick={() => handleEditExpiry(batch)} className="font-medium hover:opacity-70 transition underline underline-offset-2">Edit</button>
                      </div>
                    )}

                    {/* Batch row */}
                    <div className={`flex items-center justify-between px-5 py-3.5 ${allHidden ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={() => setExpandedBatch(isExpanded ? null : batch.batch_id)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition">
                          <svg xmlns="http://www.w3.org/2000/svg"
                            className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-gray-700 text-xs font-semibold">
                              {batch.sims.length} simulation{batch.sims.length > 1 ? 's' : ''}
                            </span>
                            {categories.slice(0, 3).map(cat => (
                              <span key={cat} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{cat}</span>
                            ))}
                            {categories.length > 3 && <span className="text-gray-300 text-xs">+{categories.length - 3}</span>}
                            {allHidden && <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">Hidden</span>}
                            {!allHidden && someHidden && <span className="text-xs px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-600">Partial</span>}
                            {expired && <span className="text-xs px-2 py-0.5 rounded-md bg-red-50 text-red-400">Expired</span>}
                          </div>
                          <p className="text-gray-400 text-xs">
                            Batch #{batchIndex + 1} · {formatDate(batch.created_at)}
                            {!batch.expires_at && <span className="text-gray-300"> · No expiry</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEditExpiry(batch)}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                          Expiry
                        </button>
                        <button onClick={() => toggleHideBatch(batch)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition
                            ${allHidden ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {allHidden ? 'Show All' : 'Hide All'}
                        </button>
                        <button onClick={() => handleDeleteBatchClick(batch)}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded rows */}
                    {isExpanded && (
                      <div className="border-t border-gray-50">
                        <div className="grid grid-cols-12 px-5 py-2.5 bg-gray-50/70">
                          {['Name', 'Category', 'Level', 'Type', 'Status', 'Actions'].map((h, i) => (
                            <p key={i} className={`text-gray-400 text-xs font-medium ${i === 0 ? 'col-span-4' : i === 1 ? 'col-span-2' : i === 5 ? 'col-span-3' : 'col-span-1'}`}>{h}</p>
                          ))}
                        </div>

                        {batch.sims.map(sim => {
                          const dc = diffColor(sim.difficulty)
                          return (
                            <div key={sim.id}
                              className={`grid grid-cols-12 items-center px-5 py-3 border-t border-gray-50 hover:bg-gray-50/60 transition
                                ${sim.hidden ? 'opacity-40' : ''}`}>
                              <div className="col-span-4 flex items-center gap-2 min-w-0">
                                {sim.hidden && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                  </svg>
                                )}
                                <p className="text-gray-700 text-xs font-medium truncate">{sim.name}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{sim.category}</span>
                              </div>
                              <div className="col-span-1">
                                <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: dc.bg, color: dc.text }}>{sim.difficulty}</span>
                              </div>
                              <div className="col-span-1">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 capitalize">{sim.type}</span>
                              </div>
                              <div className="col-span-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${sim.hidden ? 'bg-gray-300' : 'bg-emerald-400'}`} />
                              </div>
                              <div className="col-span-3 flex items-center gap-1.5">
                                <button onClick={() => toggleHide(sim.id)}
                                  className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                  {sim.hidden ? 'Show' : 'Hide'}
                                </button>
                                <button onClick={() => navigate(`/admin/simulations/edit/${sim.id}`)}
                                  className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteClick(sim)}
                                  className="text-xs font-medium px-2 py-1 rounded-md bg-red-50 text-red-400 hover:bg-red-100 transition">
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expiry Modal */}
      {expiryModal && expiryBatch && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <p className="text-gray-800 text-sm font-semibold mb-1">Edit Expiry Date</p>
            <p className="text-gray-400 text-xs mb-4">
              Set when this batch of {expiryBatch.sims.length} simulation{expiryBatch.sims.length > 1 ? 's' : ''} expires
            </p>
            {expiryError && <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-3"><p className="text-red-500 text-xs">{expiryError}</p></div>}
            <label className="text-gray-500 text-xs font-medium mb-1.5 block">Date & Time</label>
            <input type="datetime-local" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition mb-2" />
            <p className="text-gray-400 text-xs mb-4">
              {expiryDate ? `Expires ${formatExpiry(expiryDate)}` : 'Leave empty — no expiry'}
            </p>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {[{ label: '+1 Day', days: 1 }, { label: '+1 Week', days: 7 }, { label: '+1 Month', days: 30 }, { label: '+3 Months', days: 90 }].map(p => (
                <button key={p.label} onClick={() => setExpiryDate(new Date(Date.now() + 86400000 * p.days).toISOString().slice(0, 16))}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                  {p.label}
                </button>
              ))}
              <button onClick={() => setExpiryDate('')}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
                No Expiry
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setExpiryModal(false); setExpiryBatch(null); setExpiryDate(''); setExpiryError('') }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">Cancel</button>
              <button onClick={confirmEditExpiry} disabled={expiryLoading}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2
                  ${expiryLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                {expiryLoading ? <><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete sim modal */}
      {deleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 text-center">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <p className="text-gray-800 text-sm font-semibold mb-1">Delete simulation?</p>
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

      {/* Delete batch modal */}
      {deleteBatchModal && deleteBatchItem && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-100 text-center">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <p className="text-gray-800 text-sm font-semibold mb-1">Delete entire batch?</p>
            <p className="text-gray-500 text-xs mb-3">
              This will permanently delete {deleteBatchItem.sims.length} simulation{deleteBatchItem.sims.length > 1 ? 's' : ''}.
            </p>
            <p className="text-gray-300 text-xs mb-4">This cannot be undone.</p>
            {deleteBatchError && <div className="bg-red-50 rounded-lg px-3 py-2 mb-3"><p className="text-red-500 text-xs">{deleteBatchError}</p></div>}
            <div className="flex gap-2">
              <button onClick={() => { setDeleteBatchModal(false); setDeleteBatchItem(null); setDeleteBatchError('') }}
                className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">Cancel</button>
              <button onClick={confirmDeleteBatch}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition">Delete All</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ViewSimulations