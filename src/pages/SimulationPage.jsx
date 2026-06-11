import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

// ── Countdown ──
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
        <div className="relative flex-shrink-0 w-1.5 h-1.5">
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          <div className="relative rounded-full w-1.5 h-1.5 bg-red-400" />
        </div>
        <span className="text-red-400 text-xs font-medium">Expired</span>
      </div>
    )
  }

  const totalMs = new Date(expiresAt) - new Date()
  const urgent = totalMs < 86400000 * 2
  const warning = totalMs < 86400000 * 7
  const color = urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-gray-400'
  const dot = urgent ? 'bg-red-400' : warning ? 'bg-amber-400' : 'bg-green-400'

  const parts = timeLeft.days > 0
    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
    : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="relative flex-shrink-0 w-1.5 h-1.5">
        <div className={`absolute inset-0 rounded-full ${dot} animate-ping opacity-75`} />
        <div className={`relative rounded-full w-1.5 h-1.5 ${dot}`} />
      </div>
      <span className={`text-xs font-medium ${color}`}>Expires in {parts}</span>
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
      // ── Step 1: auth guard ──
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        navigate('/login')
        return
      }
      setUserId(user.id)

      // ── Step 2: get org ──
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile?.organization_id) {
        setLoading(false)
        return
      }

      const now = new Date().toISOString()

      // ── Step 3: fetch simulations for this org only ──
      const { data: sims, error: simsError } = await supabase
        .from('simulations')
        .select('*')
        .eq('hidden', false)
        .eq('organization_id', userProfile.organization_id)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: true })

      if (simsError) {
        console.error('Simulations error:', simsError)
        setLoading(false)
        return
      }

      if (!sims || sims.length === 0) {
        setLoading(false)
        return
      }

      // ── Step 4: group into batches ──
      const batchMap = {}
      sims.forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) {
          batchMap[bid] = {
            batch_id: bid,
            created_at: s.created_at,
            expires_at: s.expires_at || null,
            sims: []
          }
        }
        batchMap[bid].sims.push({
          id: s.id, type: s.type, title: s.scenario_name,
          category: s.category, difficulty: s.difficulty,
          imageUrl: s.image_url || '', question: s.question,
          options: s.options, correctIndex: s.correct_index,
          explanation: s.explanation, batch_id: bid,
        })
      })

      const batchList = Object.values(batchMap).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
      setBatches(batchList)

      // ── Step 5: fetch completed results ──
      const { data: results, error: resultsError } = await supabase
        .from('simulation_results')
        .select('batch_id, score, completed_at')
        .eq('user_id', user.id)

      if (resultsError) {
        console.error('Results error:', resultsError)
      }

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

  function handleStartBatch(batch) {
    setActiveBatch(batch)
    setCurrentIndex(0)
    setUserAnswers({})
    setSubmitError('')
  }

  function handleSelectOption(index) {
    setUserAnswers({ ...userAnswers, [currentIndex]: index })
  }

  function handleNext() { setCurrentIndex(currentIndex + 1) }

  async function handleSubmit() {
    if (submitting) return // ── prevent double submit ──
    setSubmitting(true)
    setSubmitError('')

    try {
      const sims = activeBatch.sims
      const score = sims.reduce((total, sim, index) => {
        return userAnswers[index] === sim.correctIndex ? total + 1 : total
      }, 0)
      const percentage = Math.round((score / sims.length) * 100)

      // ── Insert result ──
      const { error: insertError } = await supabase
        .from('simulation_results')
        .insert({
          user_id: userId,
          simulation_id: sims[0]?.id,
          batch_id: activeBatch.batch_id,
          score: percentage,
          total: sims.length,
          answers: userAnswers,
          completed_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Submit error:', insertError)
        setSubmitError('Failed to save your results. Please try again.')
        setSubmitting(false)
        return
      }

      // ── Update local state ──
      setCompletedBatchIds(prev => new Set([...prev, activeBatch.batch_id]))
      setBatchScores(prev => ({ ...prev, [activeBatch.batch_id]: percentage }))

      navigate('/simulation-results', {
        state: { simulations: sims, userAnswers, score, total: sims.length },
      })

    } catch (err) {
      console.error('Unexpected submit error:', err)
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  function getDifficultyColor(d) {
    if (d === 'Easy') return 'bg-green-100 text-green-700'
    if (d === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (d === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
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

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 p-8">
            <div className="mb-6">
              <h1 className="text-gray-900 text-2xl font-bold">Security Simulation</h1>
              <p className="text-gray-400 text-sm mt-0.5">Answer each scenario carefully — this can only be taken once</p>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs font-semibold">
                      Question <span className="text-gray-800 font-bold">{currentIndex + 1}</span> of <span className="text-gray-800 font-bold">{sims.length}</span>
                    </p>
                    <p className="text-gray-400 text-xs">{answeredCount} answered</p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0e7490, #06b6d4)' }} />
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {sims.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300
                        ${i === currentIndex ? 'w-6 bg-cyan-500' : userAnswers[i] !== undefined ? 'w-1.5 bg-cyan-300' : 'w-1.5 bg-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-gray-800 font-bold text-base">{current.title}</h2>
                      {current.category && (
                        <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-0.5 rounded-lg">{current.category}</span>
                      )}
                      {current.difficulty && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${getDifficultyColor(current.difficulty)}`}>{current.difficulty}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs font-semibold flex-shrink-0 ml-2">
                      {current.type === 'image' ? '🖼 Image' : '📝 Text'}
                    </span>
                  </div>

                  {current.type === 'image' && current.imageUrl && (
                    <div className="border-b border-gray-50 bg-gray-50">
                      <img src={current.imageUrl} alt="Scenario"
                        className="w-full max-h-64 object-contain p-4"
                        onError={e => { e.target.src = 'https://placehold.co/800x400/f3f4f6/9ca3af?text=Image+unavailable' }} />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="rounded-xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>
                      <p className="text-white text-sm font-semibold leading-relaxed">{current.question}</p>
                    </div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Select your answer</p>
                    <div className="flex flex-col gap-2.5">
                      {current.options.map((option, index) => (
                        <button key={index} onClick={() => handleSelectOption(index)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left text-sm transition
                            ${userAnswers[currentIndex] === index
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-800 font-semibold'
                              : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-cyan-200 hover:bg-cyan-50'}`}>
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition
                            ${userAnswers[currentIndex] === index
                              ? 'border-cyan-600 bg-cyan-600 text-white'
                              : 'border-gray-300 text-gray-400 bg-white'}`}>
                            {userAnswers[currentIndex] === index
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              : optionLabels[index]}
                          </div>
                          <span className="flex-1">{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-gray-400 text-xs">
                      {hasSelected ? '✓ Answer selected' : 'Select an answer to continue'}
                    </p>
                    {!isLastQuestion ? (
                      <button onClick={handleNext} disabled={!hasSelected}
                        className={`flex items-center gap-2 font-semibold px-6 py-2 rounded-xl transition text-sm
                          ${hasSelected ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!hasSelected || submitting}
                        className={`flex items-center gap-2 font-semibold px-6 py-2 rounded-xl transition text-sm
                          ${hasSelected && !submitting ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Submit
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar panel */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Session</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Total Questions</p>
                      <p className="text-gray-800 text-xs font-bold">{sims.length}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Answered</p>
                      <p className="text-cyan-600 text-xs font-bold">{answeredCount}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Remaining</p>
                      <p className="text-gray-800 text-xs font-bold">{sims.length - answeredCount}</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Completion</p>
                      <p className="text-gray-800 text-xs font-bold">{Math.round((answeredCount / sims.length) * 100)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">This Question</p>
                  <div className="flex flex-col gap-3">
                    {current.category && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Category</p>
                        <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-lg">{current.category}</span>
                      </div>
                    )}
                    {current.difficulty && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Difficulty</p>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(current.difficulty)}`}>{current.difficulty}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Type</p>
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {current.type === 'image' ? 'Image' : 'Text'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <p className="text-white text-xs font-bold">Security Tip</p>
                  </div>
                  <p className="text-cyan-100 text-xs leading-relaxed">
                    Always verify the sender's email address before clicking any links or downloading attachments.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    One attempt only. Your answers will be submitted to your administrator.
                  </p>
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6 lg:p-8">

          <div className="mb-8">
            <h1 className="text-gray-900 text-xl font-bold">Simulations</h1>
            <p className="text-gray-400 text-sm mt-1">
              {pendingBatches.length > 0
                ? `${pendingBatches.length} pending simulation${pendingBatches.length > 1 ? 's' : ''} assigned to you`
                : batches.length > 0 ? 'All simulations completed' : 'No simulations assigned yet'}
            </p>
          </div>

          {batches.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total', value: batches.length, sub: 'sets assigned', valueColor: 'text-gray-900' },
                { label: 'Pending', value: pendingBatches.length, sub: 'to complete', valueColor: 'text-orange-400' },
                { label: 'Completed', value: doneBatches.length, sub: 'sets done', valueColor: 'text-green-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">{s.label}</p>
                  <p className={`text-2xl font-extrabold mb-0.5 ${s.valueColor}`}>{s.value}</p>
                  <p className="text-gray-400 text-xs">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {batches.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-16 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No simulations assigned yet</p>
              <p className="text-gray-400 text-xs mt-1">Check back later</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">

              {pendingBatches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Pending</p>
                  <div className="flex flex-col gap-3">
                    {pendingBatches.map(batch => {
                      const categories = [...new Set(batch.sims.map(s => s.category).filter(Boolean))]
                      const difficulties = [...new Set(batch.sims.map(s => s.difficulty).filter(Boolean))]
                      const hasHard = difficulties.includes('Hard')
                      const hasMedium = difficulties.includes('Medium')
                      const topDiff = hasHard ? 'Hard' : hasMedium ? 'Medium' : 'Easy'
                      const hasExpiry = !!batch.expires_at
                      const isUrgent = hasExpiry && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 2)
                      const isWarning = hasExpiry && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 7)

                      return (
                        <div key={batch.batch_id}
                          className={`bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200
                            ${isUrgent ? 'border-red-100' : isWarning ? 'border-amber-100' : 'border-gray-100'}`}>
                          <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 text-sm font-semibold mb-1.5">
                                {formatDate(batch.created_at)}
                              </p>
                              <div className="flex items-center gap-2 text-gray-400 text-xs flex-wrap">
                                <span>{batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}</span>
                                {topDiff && <><span>·</span><span>{topDiff}</span></>}
                                {categories.slice(0, 2).map(cat => (
                                  <span key={cat}>· {cat}</span>
                                ))}
                                {categories.length > 2 && <span>+{categories.length - 2} more</span>}
                              </div>
                              {hasExpiry && <Countdown expiresAt={batch.expires_at} />}
                            </div>
                            <button onClick={() => handleStartBatch(batch)}
                              className="flex-shrink-0 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors duration-200">
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
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">Completed</p>
                  <div className="flex flex-col gap-2">
                    {doneBatches.map(batch => {
                      const score = batchScores[batch.batch_id]
                      const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500'
                      const scoreLabel = score >= 80 ? 'Pass' : score >= 50 ? 'Average' : 'High Risk'

                      return (
                        <div key={batch.batch_id}
                          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-600 text-sm font-semibold mb-1.5">{formatDate(batch.created_at)}</p>
                            <p className="text-gray-400 text-xs">{batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}</p>
                          </div>
                          {score !== undefined && (
                            <div className="text-right flex-shrink-0">
                              <p className={`text-sm font-bold ${scoreColor}`}>{score}%</p>
                              <p className={`text-xs mt-0.5 ${scoreColor} opacity-75`}>{scoreLabel}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {pendingBatches.length === 0 && doneBatches.length > 0 && (
                <p className="text-gray-400 text-xs text-center pt-2">
                  You're all caught up — new simulations will appear here when assigned.
                </p>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimulationPage