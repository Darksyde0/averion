import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

function Countdown({ expiresAt }) {
  function getTimeLeft() {
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-red-400 text-xs">Expired</span>
      </div>
    )
  }

  const totalMs = new Date(expiresAt) - new Date()
  const urgent = totalMs < 86400000 * 2
  const warning = totalMs < 86400000 * 7
  const color = urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-gray-400'
  const dot = urgent ? 'bg-red-400' : warning ? 'bg-amber-400' : 'bg-emerald-400'
  const parts = timeLeft.days > 0
    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
    : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className={`text-xs ${color}`}>Expires in {parts}</span>
    </div>
  )
}

function SimulationPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [batches, setBatches] = useState([])
  const [activeBatch, setActiveBatch] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [userId, setUserId] = useState(null)
  const [completedBatchIds, setCompletedBatchIds] = useState(new Set())
  const [batchScores, setBatchScores] = useState({})

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { navigate('/login'); return }
      setUserId(user.id)

      const { data: userProfile, error: profileError } = await supabase
        .from('users').select('organization_id').eq('id', user.id).single()
      if (profileError || !userProfile?.organization_id) { setLoading(false); return }

      const now = new Date().toISOString()
      const { data: sims, error: simsError } = await supabase
        .from('simulations').select('*').eq('hidden', false)
        .eq('organization_id', userProfile.organization_id)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: true })
      if (simsError) { console.error('Simulations error:', simsError); setLoading(false); return }
      if (!sims || sims.length === 0) { setLoading(false); return }

      const batchMap = {}
      sims.forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) batchMap[bid] = { batch_id: bid, created_at: s.created_at, expires_at: s.expires_at || null, sims: [] }
        batchMap[bid].sims.push({
          id: s.id, type: s.type, title: s.scenario_name, category: s.category,
          difficulty: s.difficulty, imageUrl: s.image_url || '', question: s.question,
          options: s.options, correctIndex: s.correct_index, explanation: s.explanation, batch_id: bid,
        })
      })
      setBatches(Object.values(batchMap).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))

      const { data: results, error: resultsError } = await supabase
        .from('simulation_results').select('batch_id, score, completed_at').eq('user_id', user.id)
      if (resultsError) console.error('Results error:', resultsError)
      if (results && results.length > 0) {
        const done = new Set(results.map(r => r.batch_id).filter(Boolean))
        const scores = {}
        results.forEach(r => { if (r.batch_id) scores[r.batch_id] = r.score })
        setCompletedBatchIds(done)
        setBatchScores(scores)
      }
    } catch (err) {
      console.error('Unexpected error in fetchData:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleStartBatch(batch) { setActiveBatch(batch); setCurrentIndex(0); setUserAnswers({}); setSubmitError('') }
  function handleSelectOption(index) { setUserAnswers({ ...userAnswers, [currentIndex]: index }) }
  function handleNext() { setCurrentIndex(currentIndex + 1) }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true); setSubmitError('')
    try {
      const sims = activeBatch.sims
      const score = sims.reduce((total, sim, index) => userAnswers[index] === sim.correctIndex ? total + 1 : total, 0)
      const percentage = Math.round((score / sims.length) * 100)
      const { error: insertError } = await supabase.from('simulation_results').insert({
        user_id: userId, simulation_id: sims[0]?.id, batch_id: activeBatch.batch_id,
        score: percentage, total: sims.length, answers: userAnswers, completed_at: new Date().toISOString(),
      })
      if (insertError) { console.error('Submit error:', insertError); setSubmitError('Failed to save your results. Please try again.'); setSubmitting(false); return }
      setCompletedBatchIds(prev => new Set([...prev, activeBatch.batch_id]))
      setBatchScores(prev => ({ ...prev, [activeBatch.batch_id]: percentage }))
      navigate('/simulation-results', { state: { simulations: sims, userAnswers, score, total: sims.length } })
    } catch (err) {
      console.error('Unexpected submit error:', err)
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  function diffColor(d) {
    if (d === 'Easy') return { bg: '#f0fdf4', text: '#16a34a' }
    if (d === 'Medium') return { bg: '#fefce8', text: '#ca8a04' }
    if (d === 'Hard') return { bg: '#fef2f2', text: '#dc2626' }
    return { bg: '#f9fafb', text: '#6b7280' }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  function scoreColor(score) {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // ── Active simulation ──
  if (activeBatch) {
    const sims = activeBatch.sims
    const current = sims[currentIndex]
    const isLastQuestion = currentIndex === sims.length - 1
    const hasSelected = userAnswers[currentIndex] !== undefined
    const answeredCount = Object.keys(userAnswers).length
    const progress = sims.length > 0 ? (currentIndex / sims.length) * 100 : 0
    const dc = diffColor(current.difficulty)

    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 p-6">

            <div className="mb-5">
              <h1 className="text-gray-900 text-lg font-semibold">Security Simulation</h1>
              <p className="text-gray-400 text-xs mt-0.5">Answer each scenario carefully — one attempt only</p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-500 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0">

                {/* Progress */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs">Question <span className="text-gray-800 font-semibold">{currentIndex + 1}</span> of <span className="text-gray-800 font-semibold">{sims.length}</span></p>
                    <p className="text-gray-400 text-xs">{answeredCount} answered</p>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex gap-1 mt-2.5 flex-wrap">
                    {sims.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300
                        ${i === currentIndex ? 'w-5 bg-blue-500' : userAnswers[i] !== undefined ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-gray-200'}`} />
                    ))}
                  </div>
                </div>

                {/* Question card */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className="text-gray-800 text-sm font-semibold truncate">{current.title}</p>
                      {current.category && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 flex-shrink-0">{current.category}</span>
                      )}
                      {current.difficulty && (
                        <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 font-medium"
                          style={{ backgroundColor: dc.bg, color: dc.text }}>{current.difficulty}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs flex-shrink-0">{current.type === 'image' ? 'Image' : 'Text'}</span>
                  </div>

                  {current.type === 'image' && current.imageUrl && (
                    <div className="border-b border-gray-50 bg-gray-50">
                      <img src={current.imageUrl} alt="Scenario" className="w-full max-h-52 object-contain p-4"
                        onError={e => { e.target.src = 'https://placehold.co/800x400/f3f4f6/9ca3af?text=Image+unavailable' }} />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="bg-gray-900 rounded-lg px-4 py-4 mb-4">
                      <p className="text-gray-100 text-sm leading-relaxed">{current.question}</p>
                    </div>
                    <p className="text-gray-400 text-xs mb-3">Select your answer</p>
                    <div className="flex flex-col gap-2">
                      {current.options.map((option, index) => (
                        <button key={index} onClick={() => handleSelectOption(index)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition
                            ${userAnswers[currentIndex] === index
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-semibold transition
                            ${userAnswers[currentIndex] === index
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-200 text-gray-400 bg-white'}`}>
                            {userAnswers[currentIndex] === index
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                              : optionLabels[index]}
                          </div>
                          <span className={`flex-1 text-xs ${userAnswers[currentIndex] === index ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-gray-400 text-xs">
                      {hasSelected ? '✓ Answer selected' : 'Select an answer to continue'}
                    </p>
                    {!isLastQuestion ? (
                      <button onClick={handleNext} disabled={!hasSelected}
                        className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition
                          ${hasSelected ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={!hasSelected || submitting}
                        className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition
                          ${hasSelected && !submitting ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        {submitting ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                        ) : (
                          <>Submit<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Side panel */}
              <div className="w-56 flex-shrink-0 flex flex-col gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-medium mb-3">Session</p>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { label: 'Total', value: sims.length, color: '#111827' },
                      { label: 'Answered', value: answeredCount, color: '#3b82f6' },
                      { label: 'Remaining', value: sims.length - answeredCount, color: '#111827' },
                      { label: 'Completion', value: `${Math.round((answeredCount / sims.length) * 100)}%`, color: '#111827' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">{item.label}</p>
                        <p className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-medium mb-3">This Question</p>
                  <div className="flex flex-col gap-2">
                    {current.category && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">Category</p>
                        <p className="text-gray-600 text-xs font-medium truncate ml-2">{current.category}</p>
                      </div>
                    )}
                    {current.difficulty && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">Difficulty</p>
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: dc.bg, color: dc.text }}>{current.difficulty}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Type</p>
                      <p className="text-gray-600 text-xs font-medium">{current.type === 'image' ? 'Image' : 'Text'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">Security Tip</p>
                  <p className="text-gray-400 text-xs leading-relaxed">Always verify the sender's email address before clicking any links or downloading attachments.</p>
                </div>

                <div className="border border-gray-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-gray-400 text-xs leading-relaxed">One attempt only. Your answers will be submitted to your administrator.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Batch list view ──
  const pendingBatches = batches.filter(b => !completedBatchIds.has(b.batch_id))
  const doneBatches = batches.filter(b => completedBatchIds.has(b.batch_id))

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">Simulations</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {pendingBatches.length > 0
                ? `${pendingBatches.length} pending simulation${pendingBatches.length > 1 ? 's' : ''} assigned to you`
                : batches.length > 0 ? 'All simulations completed' : 'No simulations assigned yet'}
            </p>
          </div>

          {batches.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total', value: batches.length, sub: 'sets assigned', color: '#111827' },
                { label: 'Pending', value: pendingBatches.length, sub: 'to complete', color: '#f59e0b' },
                { label: 'Completed', value: doneBatches.length, sub: 'sets done', color: '#10b981' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-gray-300 text-xs">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {batches.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 text-center">
              <p className="text-gray-400 text-sm font-medium">No simulations assigned yet</p>
              <p className="text-gray-300 text-xs mt-1">Check back later</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {pendingBatches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Pending</p>
                  <div className="flex flex-col gap-2">
                    {pendingBatches.map(batch => {
                      const categories = [...new Set(batch.sims.map(s => s.category).filter(Boolean))]
                      const difficulties = [...new Set(batch.sims.map(s => s.difficulty).filter(Boolean))]
                      const hasHard = difficulties.includes('Hard')
                      const hasMedium = difficulties.includes('Medium')
                      const topDiff = hasHard ? 'Hard' : hasMedium ? 'Medium' : 'Easy'
                      const dc = diffColor(topDiff)
                      const hasExpiry = !!batch.expires_at
                      const isUrgent = hasExpiry && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 2)
                      const isWarning = hasExpiry && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 7)

                      return (
                        <div key={batch.batch_id}
                          className={`bg-white border rounded-xl overflow-hidden transition
                            ${isUrgent ? 'border-red-100' : isWarning ? 'border-amber-100' : 'border-gray-100'}`}>
                          <div className="px-5 py-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 text-sm font-medium mb-1">{formatDate(batch.created_at)}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-400 text-xs">{batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: dc.bg, color: dc.text }}>{topDiff}</span>
                                {categories.slice(0, 2).map(cat => (
                                  <span key={cat} className="text-gray-400 text-xs">· {cat}</span>
                                ))}
                                {categories.length > 2 && <span className="text-gray-400 text-xs">+{categories.length - 2}</span>}
                              </div>
                              {hasExpiry && <Countdown expiresAt={batch.expires_at} />}
                            </div>
                            <button onClick={() => handleStartBatch(batch)}
                              className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                              Start →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {doneBatches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Completed</p>
                  <div className="flex flex-col gap-2">
                    {doneBatches.map(batch => {
                      const score = batchScores[batch.batch_id]
                      const sc = scoreColor(score)
                      const scoreLabel = score >= 80 ? 'Pass' : score >= 50 ? 'Average' : 'At Risk'
                      return (
                        <div key={batch.batch_id}
                          className="bg-white border border-gray-100 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 opacity-70">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-600 text-sm font-medium">{formatDate(batch.created_at)}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}</p>
                          </div>
                          {score !== undefined && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold" style={{ color: sc }}>{score}%</p>
                              <p className="text-xs mt-0.5" style={{ color: sc }}>{scoreLabel}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {pendingBatches.length === 0 && doneBatches.length > 0 && (
                <p className="text-gray-300 text-xs text-center">New simulations will appear here when assigned.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimulationPage