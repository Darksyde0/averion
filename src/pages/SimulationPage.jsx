import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

const simulations = [
  {
    id: 1,
    type: 'image',
    title: 'Social Engineering Scenario',
    imageUrl: '/images/phishing-email.png',
    question: 'You are working on your computer when you receive the following email. What should you do in this situation?',
    options: [
      'Click the link and enter your details immediately',
      'Verify the request by contacting IT through official channels',
      'Reply to the email asking if it is real',
      'Ignore the email completely',
    ],
    correctIndex: 1,
    explanation: `This is likely a social engineering attack. Red flags include urgent tone, request for sensitive information, and a suspicious link that is not the official company domain. Attackers rely on fear and urgency to trick users.`,
  },
  {
    id: 2,
    type: 'text',
    title: 'Password Security Check',
    question: 'Your manager sends you a WhatsApp message asking for your login password urgently because the system is down. What should you do?',
    options: [
      'Send the password immediately since it is your manager',
      'Ignore the message completely',
      'Verify the request through official company channels before doing anything',
      'Change your password and then send the new one',
    ],
    correctIndex: 2,
    explanation: `Legitimate managers and IT teams will never ask for your password through WhatsApp or any messaging app. This is a classic social engineering attack. Always verify unusual requests through official channels before taking any action.`,
  },
]

// Simulating a completed state — when backend is ready
// this will come from the database
const completedData = {
  completed: false,
  score: null,
  date: null,
}

function SimulationPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [hasCompleted, setHasCompleted] = useState(completedData.completed)
  const [finalScore, setFinalScore] = useState(completedData.score)
  const [completedDate, setCompletedDate] = useState(completedData.date)

  const current = simulations[currentIndex]

  function handleSelectOption(index) {
    setUserAnswers({ ...userAnswers, [currentIndex]: index })
  }

  function handleNext() {
    setCurrentIndex(currentIndex + 1)
  }

  function handleSubmit() {
    const score = simulations.reduce((total, sim, index) => {
      return userAnswers[index] === sim.correctIndex ? total + 1 : total
    }, 0)

    const percentage = Math.round((score / simulations.length) * 100)
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    // Mark as completed
    setHasCompleted(true)
    setFinalScore(percentage)
    setCompletedDate(today)

    navigate('/simulation-results', {
      state: {
        simulations,
        userAnswers,
        score,
        total: simulations.length,
      },
    })
  }

  const isLastQuestion = currentIndex === simulations.length - 1
  const hasSelected = userAnswers[currentIndex] !== undefined

  // ── COMPLETED SCREEN ──
  if (hasCompleted) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

          {/* Top bar */}
          <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">John Doe</p>
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">USER</span>
              </div>
            </div>
          </div>

          {/* Completed screen */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">

              {/* Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h2 className="text-gray-800 text-2xl font-bold mb-2">
                Simulation Completed!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                You have already completed this simulation. Your results have been sent to your administrator.
              </p>

              {/* Score card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                <p className="text-gray-500 text-xs font-semibold mb-3">YOUR RESULT</p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm">Score</p>
                  <p className={`text-lg font-extrabold
                    ${finalScore >= 80 ? 'text-green-500' :
                      finalScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                    {finalScore}%
                  </p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm">Status</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full
                    ${finalScore >= 80 ? 'bg-green-100 text-green-600' :
                      finalScore >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {finalScore >= 80 ? 'Pass' : finalScore >= 50 ? 'Average' : 'High Risk'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Completed on</p>
                  <p className="text-gray-800 text-sm font-semibold">{completedDate}</p>
                </div>
              </div>

              {/* Info note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-blue-700 text-xs leading-relaxed">
                  This simulation can only be taken once. Contact your administrator if you need to retake it.
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                Back to Dashboard
              </button>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SIMULATION SCREEN ──
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">John Doe</p>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">USER</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-2xl font-bold mb-2">
            {current.title}
          </h1>

          {simulations.length > 1 && (
            <p className="text-gray-500 text-sm mb-4">
              Question {currentIndex + 1} of {simulations.length}
            </p>
          )}

          {/* Main simulation card */}
          <div className="bg-blue-600 rounded-2xl p-6 mb-6 max-w-5xl">

            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold text-sm">Scenario Content</span>
              <span className="text-white text-sm">
                <span className="font-bold">Scenario type: </span>
                {current.type === 'image' ? 'Image' : 'Text'}
              </span>
            </div>

            {current.type === 'image' && (
              <div className="rounded-xl overflow-hidden mb-5 border-4 border-black">
                <img
                  src={current.imageUrl}
                  alt="Scenario"
                  className="w-full max-h-64 object-contain rounded-xl bg-white"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x400/1e3a5f/ffffff?text=Scenario+Image'
                  }}
                />
              </div>
            )}

            <p className="text-white text-base font-extrabold mb-5 leading-relaxed">
              {current.question}
            </p>

            <div className="flex flex-col gap-3">
              {current.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`
                    flex items-center gap-4 px-5 py-4 rounded-xl border text-left text-sm font-medium transition
                    ${userAnswers[currentIndex] === index
                      ? 'bg-blue-800 text-white border-blue-400'
                      : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300'
                    }
                  `}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${userAnswers[currentIndex] === index
                      ? 'border-white bg-white'
                      : 'border-gray-500'
                    }`}
                  >
                    {userAnswers[currentIndex] === index && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  {option}
                </button>
              ))}
            </div>

          </div>

          {/* Next / Submit button */}
          <div className="flex justify-end max-w-5xl">
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!hasSelected}
                className={`font-semibold px-10 py-4 rounded-xl transition text-base
                  ${hasSelected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!hasSelected}
                className={`font-semibold px-10 py-4 rounded-xl transition text-base
                  ${hasSelected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Submit
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default SimulationPage