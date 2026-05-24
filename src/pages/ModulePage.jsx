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
  const [currentSection, setCurrentSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const profile = useProfile()

  useEffect(() => { fetchModule() }, [id])

  async function fetchModule() {
    setLoading(true)

    // ── Get current user ──
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: mod, error: modError } = await supabase
      .from('modules').select('*').eq('id', id).single()
    if (modError || !mod) { setLoading(false); return }
    setModule(mod)

    const { data: lessonsData } = await supabase
      .from('lessons').select('*, lesson_sections(*)')
      .eq('module_id', id).order('order_index', { ascending: true })

    if (lessonsData) {
      setLessons(lessonsData.map(l => ({
        id: l.id,
        title: l.title,
        content: l.lesson_sections
          .sort((a, b) => a.order_index - b.order_index)
          .map(s => ({
            heading: s.heading || '',
            body: s.body || '',
            bulletLabel: s.bullet_label || 'It usually comes in the form of:',
            list: s.bullets || [],
          }))
      })))
    }

    const { data: quizData } = await supabase
      .from('quiz_questions').select('*').eq('module_id', id)
    if (quizData) {
      setQuiz(quizData.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
      })))
    }

    // ── Mark as in-progress when module is opened ──
    if (user) {
      await supabase.from('module_progress').upsert({
        user_id: user.id,
        module_id: id,
        lessons_completed: 0,
        quiz_completed: false,
        score: null,
      }, { onConflict: 'user_id,module_id', ignoreDuplicates: true })
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-4">Module not found.</p>
          <button onClick={() => navigate('/training')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
            Back to Training
          </button>
        </div>
      </div>
    )
  }

  const currentLessonData = lessons[currentLesson]
  const sections = currentLessonData?.content || []
  const currentSectionData = sections[currentSection]
  const isLastSection = currentSection === sections.length - 1
  const isLastLesson = currentLesson === lessons.length - 1
  const isLastQuestion = currentQuestion === quiz.length - 1
  const currentQuestionData = quiz[currentQuestion]
  const isFirstEver = currentLesson === 0 && currentSection === 0 && !showQuiz

  const totalSections = lessons.reduce((acc, l) => acc + l.content.length, 0)
  const completedSections = lessons.slice(0, currentLesson).reduce((acc, l) => acc + l.content.length, 0) + currentSection
  const totalSteps = totalSections + quiz.length
  const currentStep = showQuiz ? totalSections + currentQuestion + 1 : completedSections + 1
  const progress = Math.round((currentStep / totalSteps) * 100)

  const quizScore = quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
  const scorePercent = quiz.length > 0 ? Math.round((quizScore / quiz.length) * 100) : 0
  const optionLabels = ['A', 'B', 'C', 'D']

  async function handleNext() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!isLastSection) {
      setCurrentSection(currentSection + 1)
    } else if (!isLastLesson) {
      const nextLesson = currentLesson + 1
      setCurrentLesson(nextLesson)
      setCurrentSection(0)
      // ── Update lessons_completed ──
      if (userId) {
        await supabase.from('module_progress').upsert({
          user_id: userId,
          module_id: id,
          lessons_completed: nextLesson,
          quiz_completed: false,
        }, { onConflict: 'user_id,module_id' })
      }
    } else {
      // ── All lessons done, going to quiz ──
      if (userId) {
        await supabase.from('module_progress').upsert({
          user_id: userId,
          module_id: id,
          lessons_completed: lessons.length,
          quiz_completed: false,
        }, { onConflict: 'user_id,module_id' })
      }
      setShowQuiz(true)
    }
  }

  function handlePrevious() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (showQuiz) {
      if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
      else { setShowQuiz(false); setCurrentLesson(lessons.length - 1); setCurrentSection(lessons[lessons.length - 1].content.length - 1) }
    } else if (currentSection > 0) setCurrentSection(currentSection - 1)
    else if (currentLesson > 0) { const p = currentLesson - 1; setCurrentLesson(p); setCurrentSection(lessons[p].content.length - 1) }
  }

  function handleQuizAnswer(optionIndex) {
    setQuizAnswers({ ...quizAnswers, [currentQuestion]: optionIndex })
  }

  async function handleQuizNext() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (!isLastQuestion) {
    setCurrentQuestion(currentQuestion + 1)
  } else {
    console.log('userId:', userId)
    console.log('module id:', id)
    console.log('scorePercent:', scorePercent)

    if (userId) {
      const { data, error } = await supabase.from('module_progress').upsert({
        user_id: userId,
        module_id: id,
        lessons_completed: lessons.length,
        quiz_completed: true,
        score: scorePercent,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,module_id' })

      console.log('upsert data:', data)
      console.log('upsert error:', error)
    } else {
      console.log('NO USER ID — upsert skipped')
    }

    setQuizSubmitted(true)
  }
}

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          {/* ── Top module bar ── */}
          <div className="bg-[#0d1117] rounded-2xl px-5 py-3.5 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-sm font-bold">{module.name}</h1>
                <p className="text-gray-500 text-xs">{module.category} · {module.estimated_time} mins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-white bg-opacity-10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: showQuiz ? '#9333ea' : '#3b82f6' }} />
                </div>
                <span className="text-gray-400 text-xs font-semibold">{progress}%</span>
              </div>
              <button onClick={() => navigate('/training')}
                className="text-gray-500 hover:text-gray-300 transition text-xs font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit
              </button>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="flex gap-5 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <div className="w-56 flex-shrink-0 flex flex-col gap-3">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Lessons</p>
                </div>
                <div className="p-2">
                  {lessons.map((lesson, li) => {
                    const isActive = !showQuiz && li === currentLesson
                    const isDone = !showQuiz ? li < currentLesson : true
                    return (
                      <div key={lesson.id}
                        className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 transition
                          ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold
                          ${isDone ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone
                            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            : li + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-700' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lesson.title}
                          </p>
                          {isActive && (
                            <p className="text-blue-400 text-xs mt-0.5">Section {currentSection + 1} of {sections.length}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${showQuiz ? 'border-purple-200' : 'border-gray-100'}`}>
                <div className={`px-4 py-3 border-b ${showQuiz ? 'border-purple-100 bg-purple-50' : 'border-gray-50'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${showQuiz ? 'text-purple-600' : 'text-gray-500'}`}>Quiz</p>
                </div>
                <div className="p-3">
                  {quiz.length === 0 ? (
                    <p className="text-gray-400 text-xs px-1">No questions</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {quiz.map((_, qi) => {
                        const isActiveQ = showQuiz && qi === currentQuestion && !quizSubmitted
                        const isDoneQ = showQuiz && (quizSubmitted || qi < currentQuestion)
                        const isAnswered = quizAnswers[qi] !== undefined
                        return (
                          <div key={qi} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isActiveQ ? 'bg-purple-50' : ''}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                              ${isDoneQ || isAnswered ? 'bg-purple-600 text-white' : isActiveQ ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                              {isDoneQ || isAnswered
                                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                : qi + 1}
                            </div>
                            <p className={`text-xs truncate ${isActiveQ ? 'text-purple-700 font-semibold' : isDoneQ || isAnswered ? 'text-gray-400' : 'text-gray-500'}`}>
                              Question {qi + 1}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">About</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Category</p>
                    <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-lg">{module.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="text-gray-700 text-xs font-semibold">{module.estimated_time} mins</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Lessons</p>
                    <p className="text-gray-700 text-xs font-semibold">{lessons.length}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Quiz</p>
                    <p className="text-gray-700 text-xs font-semibold">{quiz.length} questions</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT — main content ── */}
            <div className="flex-1 min-w-0">

              {/* ── LESSON VIEW ── */}
              {!showQuiz && currentLessonData && currentSectionData && (
                <div>
                  <div className="bg-[#0d1117] rounded-t-2xl px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Lesson {currentLesson + 1}</span>
                      <span className="text-gray-700 text-xs">·</span>
                      <span className="text-gray-500 text-xs">Section {currentSection + 1} of {sections.length}</span>
                    </div>
                    <h2 className="text-white text-lg font-bold">{currentLessonData.title}</h2>
                  </div>

                  <div className="bg-[#1a2744] rounded-b-2xl px-7 py-7 mb-5">
                    {currentSectionData.heading && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-blue-400 rounded-full flex-shrink-0" />
                        <h3 className="text-blue-300 font-bold text-base">{currentSectionData.heading}</h3>
                      </div>
                    )}
                    {currentSectionData.body && (
                      <p className="text-gray-300 text-sm leading-relaxed mb-5 ml-4">{currentSectionData.body}</p>
                    )}
                    {currentSectionData.list && currentSectionData.list.length > 0 && (
                      <div className="ml-4 bg-[#243860] rounded-xl p-4">
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-3">
                          {currentSectionData.bulletLabel || 'It usually comes in the form of:'}
                        </p>
                        <div className="flex flex-col gap-2">
                          {currentSectionData.list.map((item, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                              <p className="text-gray-200 text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {sections.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-8 justify-center">
                        {sections.map((_, i) => (
                          <div key={i} className={`rounded-full transition-all duration-300
                            ${i === currentSection ? 'w-6 h-1.5 bg-blue-400' : i < currentSection ? 'w-1.5 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-gray-600'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={handlePrevious} disabled={isFirstEver}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition
                        ${isFirstEver ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      Previous
                    </button>
                    <p className="text-gray-400 text-xs">
                      {isLastSection && isLastLesson ? 'Last section — quiz is next!' : isLastSection ? `Next: Lesson ${currentLesson + 2}` : `Section ${currentSection + 1} of ${sections.length}`}
                    </p>
                    <button onClick={handleNext}
                      className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition text-sm
                        ${isLastSection && isLastLesson ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {isLastSection && isLastLesson ? (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg> Start Quiz</>
                      ) : isLastSection ? (
                        <>Next Lesson <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                      ) : (
                        <>Next <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUIZ VIEW ── */}
              {showQuiz && !quizSubmitted && currentQuestionData && (
                <div>
                  <div className="bg-[#0d1117] rounded-t-2xl px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">Quiz</span>
                      <span className="text-gray-700 text-xs">·</span>
                      <span className="text-gray-500 text-xs">Question {currentQuestion + 1} of {quiz.length}</span>
                    </div>
                    <h2 className="text-white text-lg font-bold">Module Quiz</h2>
                  </div>

                  <div className="bg-[#1a2744] rounded-b-2xl px-7 py-7 mb-5">
                    <div className="flex items-start gap-3 mb-6">
                      <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">
                        Q{currentQuestion + 1}
                      </span>
                      <p className="text-white font-semibold text-base leading-relaxed">{currentQuestionData.question}</p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {currentQuestionData.options.map((option, optIndex) => (
                        <button key={optIndex} onClick={() => handleQuizAnswer(optIndex)}
                          className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left text-sm font-medium transition border-2
                            ${quizAnswers[currentQuestion] === optIndex
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-[#243860] text-gray-200 border-transparent hover:border-purple-500 hover:bg-[#2d4a7a]'
                            }`}>
                          <div className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition
                            ${quizAnswers[currentQuestion] === optIndex ? 'border-white bg-white text-purple-600' : 'border-gray-500 text-gray-400'}`}>
                            {quizAnswers[currentQuestion] === optIndex
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                              : optionLabels[optIndex]}
                          </div>
                          {option}
                        </button>
                      ))}
                    </div>
                    {quiz.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-8 justify-center">
                        {quiz.map((_, i) => (
                          <div key={i} className={`rounded-full transition-all duration-300
                            ${i === currentQuestion ? 'w-6 h-1.5 bg-purple-400' : quizAnswers[i] !== undefined ? 'w-1.5 h-1.5 bg-purple-600' : 'w-1.5 h-1.5 bg-gray-600'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={handlePrevious}
                      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      Previous
                    </button>
                    <p className="text-gray-400 text-xs">
                      {quizAnswers[currentQuestion] !== undefined ? '✓ Answer selected' : 'Select an answer to continue'}
                    </p>
                    <button onClick={handleQuizNext} disabled={quizAnswers[currentQuestion] === undefined}
                      className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition text-sm
                        ${quizAnswers[currentQuestion] === undefined
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isLastQuestion ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}>
                      {isLastQuestion ? (
                        <>Submit Quiz <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></>
                      ) : (
                        <>Next <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── RESULTS VIEW ── */}
              {showQuiz && quizSubmitted && (
                <div>
                  <div className="bg-[#0d1117] rounded-2xl px-6 py-8 mb-5 text-center">
                    <h2 className="text-white text-2xl font-bold mb-1">Quiz Complete!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      You scored <span className="text-white font-bold">{quizScore}</span> out of <span className="text-white font-bold">{quiz.length}</span>
                    </p>
                    <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center mx-auto mb-4
                      ${scorePercent >= 80 ? 'border-green-500' : scorePercent >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
                      <p className={`text-2xl font-extrabold ${scorePercent >= 80 ? 'text-green-400' : scorePercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {scorePercent}%
                      </p>
                    </div>
                    <span className={`inline-block text-sm font-bold px-6 py-2 rounded-full
                      ${scorePercent >= 80 ? 'bg-green-500 text-white' : scorePercent >= 50 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                      {scorePercent >= 80 ? '✓ Pass' : scorePercent >= 50 ? 'Average' : 'High Risk'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 mb-5">
                    {quiz.map((q, index) => {
                      const userAnswer = quizAnswers[index]
                      const isCorrect = userAnswer === q.correctIndex
                      return (
                        <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                          <div className="flex items-start gap-3 mb-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5
                              ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Q{index + 1}
                            </span>
                            <p className="text-gray-800 font-semibold text-sm leading-relaxed flex-1">{q.question}</p>
                            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full
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
                                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: optIndex === q.correctIndex ? '#dcfce7' : optIndex === userAnswer && !isCorrect ? '#fee2e2' : '#f3f4f6',
                                      color: optIndex === q.correctIndex ? '#15803d' : optIndex === userAnswer && !isCorrect ? '#dc2626' : '#6b7280'
                                    }}>
                                    {optionLabels[optIndex]}
                                  </span>
                                  {option}
                                  {optIndex === q.correctIndex && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                  {optIndex === userAnswer && !isCorrect && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="bg-[#0d1117] rounded-xl p-4">
                            <p className="text-purple-400 font-bold text-xs mb-1 uppercase tracking-wide">Explanation</p>
                            <p className="text-gray-300 text-xs leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => navigate('/training')}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm">
                      Back to Training
                    </button>
                    <button onClick={() => navigate('/dashboard')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModulePage