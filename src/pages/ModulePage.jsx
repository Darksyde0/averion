import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'


function ModulePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(true)
  const profile = useProfile()

  // ── FETCH MODULE DATA FROM SUPABASE ──
  useEffect(() => {
    fetchModule()
  }, [id])

  async function fetchModule() {
    setLoading(true)

    // Fetch module
    const { data: mod, error: modError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single()

    if (modError || !mod) {
      setLoading(false)
      return
    }

    setModule(mod)

    // Fetch lessons with sections
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*, lesson_sections(*)')
      .eq('module_id', id)
      .order('order_index', { ascending: true })

    if (lessonsData) {
      const mapped = lessonsData.map(l => ({
        id: l.id,
        title: l.title,
        subtitle: mod.description,
        content: l.lesson_sections
          .sort((a, b) => a.order_index - b.order_index)
          .map(s => ({
            heading: s.heading || '',
            body: s.body || '',
            bulletLabel: s.bullet_label || 'It usually comes in the form of:',
            list: s.bullets || [],
          }))
      }))
      setLessons(mapped)
    }

    // Fetch quiz questions
    const { data: quizData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('module_id', id)

    if (quizData) {
      const mappedQ = quizData.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
      }))
      setQuiz(mappedQ)
    }

    setLoading(false)
  }

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <p className="text-gray-500 text-sm">Loading module...</p>
      </div>
    )
  }

  // ── NOT FOUND ──
  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl p-10 text-center shadow">
          <p className="text-gray-500 text-sm mb-4">Module not found.</p>
          <button
            onClick={() => navigate('/training')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Back to Training
          </button>
        </div>
      </div>
    )
  }

  const currentLessonData = lessons[currentLesson]
  const isLastLesson = currentLesson === lessons.length - 1
  const totalSteps = lessons.length + 1
  const currentStep = showQuiz ? totalSteps : currentLesson + 1
  const progress = Math.round((currentStep / totalSteps) * 100)

  function handleNext() {
    if (!isLastLesson) {
      setCurrentLesson(currentLesson + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setShowQuiz(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handlePrevious() {
    if (showQuiz) {
      setShowQuiz(false)
    } else if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleQuizAnswer(index, optionIndex) {
    setQuizAnswers({ ...quizAnswers, [index]: optionIndex })
  }

  function handleQuizSubmit() {
    setQuizSubmitted(true)
  }

  const quizScore = quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
  const scorePercent = quiz.length > 0 ? Math.round((quizScore / quiz.length) * 100) : 0

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 p-8">

          {/* Module header */}
          <div className="bg-blue-600 rounded-2xl px-6 py-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{module.name}</h1>
                <p className="text-blue-200 text-sm">{module.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-700 font-semibold text-sm bg-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {module.estimated_time} mins
              </span>
              <span className="text-blue-700 font-semibold text-sm bg-white px-4 py-2 rounded-lg">
                {showQuiz ? '📝 Quiz' : `Lesson ${currentLesson + 1} of ${lessons.length}`}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-gray-600 text-sm font-bold w-12 text-right">{progress}%</span>
          </div>

          {/* Content area */}
          {!showQuiz ? (

            // ── LESSON VIEW ──
            <div>
              {currentLessonData && (
                <>
                  {/* Lesson title bar */}
                  <div className="bg-[#0d1117] rounded-t-2xl px-6 py-5">
                    <h2 className="text-white text-xl font-bold">{currentLessonData.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">{currentLessonData.subtitle}</p>
                  </div>

                  {/* Lesson content */}
                  <div className="bg-[#1a2744] rounded-b-2xl px-8 py-8 mb-6">
                    {currentLessonData.content.map((section, i) => (
                      <div key={i} className={`${i < currentLessonData.content.length - 1 ? 'mb-8 pb-8 border-b border-blue-900' : ''}`}>

                        {/* Section heading */}
                        {section.heading && (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-1 h-6 bg-blue-400 rounded-full flex-shrink-0" />
                            <h3 className="text-blue-300 font-bold text-base">{section.heading}</h3>
                          </div>
                        )}

                        {/* Body text */}
                        {section.body && (
                          <p className="text-gray-300 text-sm leading-relaxed mb-4 ml-4">{section.body}</p>
                        )}

                        {/* Bullet list */}
                        {section.list && section.list.length > 0 && (
                          <div className="ml-4 bg-[#243860] rounded-xl p-4">
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-3">
                              {section.bulletLabel || 'It usually comes in the form of:'}
                            </p>
                            <div className="flex flex-col gap-2">
                              {section.list.map((item, j) => (
                                <div key={j} className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                  <p className="text-gray-200 text-sm">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentLesson === 0}
                  className={`px-8 py-3 rounded-xl font-semibold text-sm transition
                    ${currentLesson === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className={`font-semibold px-8 py-3 rounded-xl transition text-sm flex items-center gap-2
                    ${isLastLesson
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {isLastLesson ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                      Go to Quiz
                    </>
                  ) : (
                    <>
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

          ) : (

            // ── QUIZ VIEW ──
            <div>
              {!quizSubmitted ? (

                <div>
                  {/* Quiz header */}
                  <div className="bg-[#0d1117] rounded-t-2xl px-6 py-5">
                    <h2 className="text-white text-xl font-bold">Module Quiz</h2>
                    <p className="text-gray-400 text-sm mt-1">Answer all questions carefully — you cannot change answers after submitting</p>
                  </div>

                  {/* Quiz questions */}
                  <div className="bg-[#1a2744] rounded-b-2xl px-8 py-8 mb-6">
                    {quiz.map((q, index) => (
                      <div key={index} className={`${index < quiz.length - 1 ? 'mb-8 pb-8 border-b border-blue-900' : ''}`}>

                        <div className="flex items-start gap-3 mb-4">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">
                            Q{index + 1}
                          </span>
                          <p className="text-white font-semibold text-sm leading-relaxed">{q.question}</p>
                        </div>

                        <div className="flex flex-col gap-3 ml-9">
                          {q.options.map((option, optIndex) => (
                            <button
                              key={optIndex}
                              onClick={() => handleQuizAnswer(index, optIndex)}
                              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-left text-sm font-medium transition border-2
                                ${quizAnswers[index] === optIndex
                                  ? 'bg-blue-600 text-white border-blue-400'
                                  : 'bg-[#243860] text-gray-200 border-transparent hover:border-blue-500 hover:bg-[#2d4a7a]'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition
                                ${quizAnswers[index] === optIndex ? 'border-white bg-white' : 'border-gray-500'}`}>
                                {quizAnswers[index] === optIndex && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                )}
                              </div>
                              {option}
                            </button>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Quiz navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl transition text-sm"
                    >
                      Back to Lessons
                    </button>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < quiz.length}
                      className={`px-8 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2
                        ${Object.keys(quizAnswers).length < quiz.length
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Submit Quiz
                    </button>
                  </div>
                </div>

              ) : (

                // ── RESULTS VIEW ──
                <div>

                  {/* Score card */}
                  <div className="bg-[#0d1117] rounded-2xl px-6 py-8 mb-6 text-center">
                    <h2 className="text-white text-2xl font-bold mb-1">Quiz Complete!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      You scored <span className="text-white font-bold">{quizScore}</span> out of <span className="text-white font-bold">{quiz.length}</span>
                    </p>

                    <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center mx-auto mb-4
                      ${scorePercent >= 80 ? 'border-green-500' : scorePercent >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
                      <p className={`text-3xl font-extrabold
                        ${scorePercent >= 80 ? 'text-green-400' : scorePercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {scorePercent}%
                      </p>
                    </div>

                    <span className={`inline-block text-sm font-bold px-6 py-2 rounded-full
                      ${scorePercent >= 80 ? 'bg-green-500 text-white' :
                        scorePercent >= 50 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                      {scorePercent >= 80 ? '✓ Pass' : scorePercent >= 50 ? 'Average' : 'High Risk'}
                    </span>
                  </div>

                  {/* Answer review */}
                  <div className="flex flex-col gap-4 mb-6">
                    {quiz.map((q, index) => {
                      const userAnswer = quizAnswers[index]
                      const isCorrect = userAnswer === q.correctIndex
                      return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

                          <div className="flex items-start gap-3 mb-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5
                              ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Q{index + 1}
                            </span>
                            <p className="text-gray-800 font-semibold text-sm leading-relaxed">{q.question}</p>
                            <span className={`ml-auto flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full
                              ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {isCorrect ? '✓ Correct' : '✗ Wrong'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2 mb-4">
                            {q.options.map((option, optIndex) => {
                              let style = 'bg-gray-50 text-gray-600 border-gray-200'
                              if (optIndex === q.correctIndex) style = 'bg-green-50 text-green-800 border-green-300'
                              if (optIndex === userAnswer && !isCorrect) style = 'bg-red-50 text-red-800 border-red-300'
                              return (
                                <div key={optIndex} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${style}`}>
                                  {optIndex === q.correctIndex && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                  {optIndex === userAnswer && !isCorrect && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                  {optIndex !== q.correctIndex && optIndex !== userAnswer && (
                                    <div className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  {option}
                                </div>
                              )
                            })}
                          </div>

                          <div className="bg-[#0d1117] rounded-xl p-4">
                            <p className="text-blue-400 font-bold text-xs mb-1 uppercase tracking-wide">Explanation</p>
                            <p className="text-gray-300 text-xs leading-relaxed">{q.explanation}</p>
                          </div>

                        </div>
                      )
                    })}
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => navigate('/training')}
                      className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition text-sm"
                    >
                      Back to Training
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
                    >
                      Back to Dashboard
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModulePage