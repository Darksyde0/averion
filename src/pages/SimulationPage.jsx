import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'

function SimulationPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [hasCompleted, setHasCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [completedDate, setCompletedDate] = useState(null)
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const profile = useProfile()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    if (user) {
      const { data: results } = await supabase
        .from('simulation_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (results && results.length > 0) {
        setHasCompleted(true)
        setFinalScore(results[0].score)
        setCompletedDate(new Date(results[0].completed_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }))
        setLoading(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setSimulations(data.map(s => ({
        id: s.id,
        type: s.type,
        title: s.scenario_name,
        category: s.category,
        difficulty: s.difficulty,
        imageUrl: s.image_url || '',
        question: s.question,
        options: s.options,
        correctIndex: s.correct_index,
        explanation: s.explanation,
      })))
    }
    setLoading(false)
  }

  const current = simulations[currentIndex]

  function handleSelectOption(index) {
    setUserAnswers({ ...userAnswers, [currentIndex]: index })
  }

  function handleNext() { setCurrentIndex(currentIndex + 1) }

  async function handleSubmit() {
    const score = simulations.reduce((total, sim, index) => {
      return userAnswers[index] === sim.correctIndex ? total + 1 : total
    }, 0)
    const percentage = Math.round((score / simulations.length) * 100)
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    if (userId) {
      await supabase.from('simulation_results').insert({
        user_id: userId,
        simulation_id: simulations[0]?.id,
        score: percentage,
        total: simulations.length,
        answers: userAnswers,
      })
    }

    setHasCompleted(true)
    setFinalScore(percentage)
    setCompletedDate(today)

    navigate('/simulation-results', {
      state: { simulations, userAnswers, score, total: simulations.length },
    })
  }

  const isLastQuestion = currentIndex === simulations.length - 1
  const hasSelected = userAnswers[currentIndex] !== undefined
  const progress = simulations.length > 0 ? ((currentIndex) / simulations.length) * 100 : 0
  const answeredCount = Object.keys(userAnswers).length
  const optionLabels = ['A', 'B', 'C', 'D']

  function getDifficultyColor(difficulty) {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading simulations...</p>
        </div>
      </div>
    )
  }

  // ── Completed ──
  if (hasCompleted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-gray-800 text-xl font-bold mb-1">Already Completed</h2>
              <p className="text-gray-400 text-sm mb-6">Your results have been sent to your administrator.</p>
              <div className="bg-gray-50 rounded-xl p-5 mb-5 text-left">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <p className="text-gray-500 text-xs">Score</p>
                  <p className={`text-2xl font-extrabold ${finalScore >= 80 ? 'text-green-500' : finalScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {finalScore}%
                  </p>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <p className="text-gray-500 text-xs">Status</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${finalScore >= 80 ? 'bg-green-100 text-green-600' : finalScore >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    {finalScore >= 80 ? 'Pass' : finalScore >= 50 ? 'Average' : 'High Risk'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs">Completed on</p>
                  <p className="text-gray-700 text-xs font-semibold">{completedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3.5 mb-6 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-blue-600 text-xs leading-relaxed">
                  This simulation can only be taken once. Contact your administrator if you need to retake it.
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── No simulations ──
  if (simulations.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1">No simulations available</p>
              <p className="text-gray-400 text-xs mb-5">Check back later or contact your administrator.</p>
              <button onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Simulation screen ──
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-gray-900 text-2xl font-bold">Security Simulation</h1>
            <p className="text-gray-400 text-sm mt-0.5">Answer each scenario carefully — this can only be taken once</p>
          </div>

          <div className="flex gap-6 items-start">

            {/* ── Left: Question ── */}
            <div className="flex-1 min-w-0">

              {/* Progress bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs font-semibold">
                    Question <span className="text-gray-800 font-bold">{currentIndex + 1}</span> of <span className="text-gray-800 font-bold">{simulations.length}</span>
                  </p>
                  <p className="text-gray-400 text-xs">{answeredCount} answered</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0e7490, #06b6d4)' }}
                  />
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {simulations.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300
                      ${i === currentIndex ? 'w-6' : 'w-1.5'}
                      ${i === currentIndex ? 'bg-cyan-500' : userAnswers[i] !== undefined ? 'bg-cyan-300' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>

              {/* ── Question card — white ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">

                {/* Card header */}
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-gray-800 font-bold text-base">{current.title}</h2>
                    {current.category && (
                      <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                        {current.category}
                      </span>
                    )}
                    {current.difficulty && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${getDifficultyColor(current.difficulty)}`}>
                        {current.difficulty}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs font-semibold flex-shrink-0 ml-2">
                    {current.type === 'image' ? '🖼 Image' : '📝 Text'}
                  </span>
                </div>

                {/* Image */}
                {current.type === 'image' && current.imageUrl && (
                  <div className="border-b border-gray-50 bg-gray-50">
                    <img
                      src={current.imageUrl}
                      alt="Scenario"
                      className="w-full max-h-64 object-contain p-4"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/800x400/f3f4f6/9ca3af?text=Image+unavailable'
                      }}
                    />
                  </div>
                )}

                {/* Question + options */}
                <div className="p-6">

                  {/* ── Only the question box is cyan gradient ── */}
                  <div
                    className="rounded-xl p-5 mb-5"
                    style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}
                  >
                    <p className="text-white text-sm font-semibold leading-relaxed">{current.question}</p>
                  </div>

                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                    Select your answer
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {current.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left text-sm transition
                          ${userAnswers[currentIndex] === index
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-800 font-semibold'
                            : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-cyan-200 hover:bg-cyan-50'
                          }`}
                      >
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition
                          ${userAnswers[currentIndex] === index
                            ? 'border-cyan-600 bg-cyan-600 text-white'
                            : 'border-gray-300 text-gray-400 bg-white'
                          }`}>
                          {userAnswers[currentIndex] === index
                            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            : optionLabels[index]
                          }
                        </div>
                        <span className="flex-1">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
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
                    <button onClick={handleSubmit} disabled={!hasSelected}
                      className={`flex items-center gap-2 font-semibold px-6 py-2 rounded-xl transition text-sm
                        ${hasSelected ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                      Submit
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* ── Right: Info panel ── */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-4">

              {/* Session info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Session</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Total Questions</p>
                    <p className="text-gray-800 text-xs font-bold">{simulations.length}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Answered</p>
                    <p className="text-cyan-600 text-xs font-bold">{answeredCount}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Remaining</p>
                    <p className="text-gray-800 text-xs font-bold">{simulations.length - answeredCount}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Completion</p>
                    <p className="text-gray-800 text-xs font-bold">{Math.round((answeredCount / simulations.length) * 100)}%</p>
                  </div>
                </div>
              </div>

              {/* Current question info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">This Question</p>
                <div className="flex flex-col gap-3">
                  {current.category && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Category</p>
                      <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {current.category}
                      </span>
                    </div>
                  )}
                  {current.difficulty && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Difficulty</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(current.difficulty)}`}>
                        {current.difficulty}
                      </span>
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

              {/* Tip */}
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

              {/* One attempt warning */}
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

export default SimulationPage