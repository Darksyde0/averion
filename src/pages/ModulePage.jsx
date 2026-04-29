import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

const moduleData = {
  1: {
    title: 'Social Engineering Awareness',
    subtitle: 'Expand your cybersecurity knowledge',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    time: '5 mins',
    lessons: [
      {
        id: 1,
        title: 'Introduction to Social Engineering',
        subtitle: 'Understanding what social engineering is and why it is dangerous',
        content: [
          {
            heading: 'What is Social Engineering?',
            body: 'Social engineering is a type of cyber attack where someone manipulates people into giving away sensitive information such as passwords, bank details, or company data.',
            list: ['Phone calls', 'Emails', 'In-person deception'],
          },
          {
            heading: 'Why is it Dangerous?',
            body: 'Unlike technical hacking, social engineering exploits human psychology. Attackers use trust, fear, and urgency to trick victims.',
            list: ['It targets people, not systems', 'Hard to detect', 'Can bypass all technical security'],
          },
        ],
      },
      {
        id: 2,
        title: 'Common Social Engineering Tactics',
        subtitle: 'Learn how attackers manipulate people',
        content: [
          {
            heading: 'Pretexting',
            body: 'The attacker creates a fabricated scenario to extract information. For example, pretending to be IT support to get your password.',
            list: ['Fake IT support calls', 'Impersonating managers', 'Fake surveys'],
          },
          {
            heading: 'Baiting',
            body: 'Attackers leave infected USB drives in public places or offer free downloads that contain malware.',
            list: ['Infected USB drives', 'Free software downloads', 'Fake prize notifications'],
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'What is social engineering?',
        options: ['Hacking into computer systems', 'Manipulating people to give away sensitive information', 'Installing malware on devices', 'Breaking encryption codes'],
        correctIndex: 1,
        explanation: 'Social engineering is about manipulating people, not systems. Attackers exploit human psychology rather than technical vulnerabilities.',
      },
      {
        question: 'Which of the following is an example of baiting?',
        options: ['Sending a fake email from IT support', 'Calling someone pretending to be their manager', 'Leaving an infected USB drive in a parking lot', 'Creating a fake login page'],
        correctIndex: 2,
        explanation: 'Baiting involves leaving infected physical media like USB drives in public places hoping someone will plug them in out of curiosity.',
      },
    ],
  },
  2: {
    title: 'Phishing Detection Fundamentals',
    subtitle: 'Expand your cybersecurity knowledge',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    time: '5 mins',
    lessons: [
      {
        id: 1,
        title: 'Introduction to Phishing',
        subtitle: 'Understanding what phishing is and why it is dangerous',
        content: [
          {
            heading: 'What is Phishing?',
            body: 'Phishing is a type of cyber attack where someone tries to trick you into giving away sensitive information such as passwords, bank details, or company data.',
            list: ['Emails', 'Messages', 'Fake websites'],
          },
          {
            heading: 'Why Should You Care?',
            body: 'Phishing is the most common form of cyber attack. Most data breaches start with a phishing email.',
            list: ['Most common cyber attack', 'Targets everyone', 'Easy to fall for'],
          },
        ],
      },
      {
        id: 2,
        title: 'How to Spot a Phishing Email',
        subtitle: 'Learn the red flags to watch out for',
        content: [
          {
            heading: 'Check the Sender Email',
            body: 'Always look at the full email address, not just the display name. Phishing emails often use domains that look similar to real ones.',
            list: ['support@paypa1.com instead of paypal.com', 'admin@company-secure.net', 'noreply@g00gle.com'],
          },
          {
            heading: 'Watch for Urgency',
            body: 'Phishing emails often create a sense of urgency to make you act without thinking.',
            list: ['Your account will be suspended', 'Act immediately', 'Verify now or lose access'],
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the first thing you should check in a suspicious email?',
        options: ['The subject line', 'The sender email address', 'The email body', 'The attachments'],
        correctIndex: 1,
        explanation: 'Always check the full sender email address first. Phishing emails disguise themselves with familiar display names but use fake domains.',
      },
      {
        question: 'Why do phishing emails create urgency?',
        options: ['To make the email look important', 'To trick you into acting without thinking', 'Because they are sent automatically', 'To get your attention'],
        correctIndex: 1,
        explanation: 'Urgency is a psychological trick. When people feel pressured they make poor decisions and are more likely to click links without checking.',
      },
    ],
  },
  3: {
    title: 'Password Security Best Practices',
    subtitle: 'Expand your cybersecurity knowledge',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    time: '5 mins',
    lessons: [
      {
        id: 1,
        title: 'Why Password Security Matters',
        subtitle: 'Understanding the importance of strong passwords',
        content: [
          {
            heading: 'Weak Passwords are Dangerous',
            body: 'Weak passwords are one of the most common causes of data breaches. Attackers use automated tools to guess millions of passwords per second.',
            list: ['123456 is the most used password', 'Names and birthdays are easy to guess', 'Short passwords are cracked in seconds'],
          },
          {
            heading: 'What Makes a Strong Password?',
            body: 'A strong password is long, random and uses a mix of characters.',
            list: ['At least 12 characters', 'Mix of uppercase and lowercase', 'Numbers and special characters'],
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Which of the following is the strongest password?',
        options: ['password123', 'John1990', 'Tr$9#mK!2pL@', '123456789'],
        correctIndex: 2,
        explanation: 'A strong password uses a mix of uppercase, lowercase, numbers and special characters.',
      },
    ],
  },
}

function ModulePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const module = moduleData[id]

  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Module not found.</p>
      </div>
    )
  }

  const lessons = module.lessons
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

  const quizScore = module.quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
  const scorePercent = Math.round((quizScore / module.quiz.length) * 100)

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
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
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

          {/* Module header */}
          <div className="bg-blue-600 rounded-2xl px-6 py-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                {module.icon}
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{module.title}</h1>
                <p className="text-blue-200 text-sm">{module.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-700 font-semibold text-sm bg-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {module.time}
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
              {/* Lesson title bar */}
              <div className="bg-[#0d1117] rounded-t-2xl px-6 py-5">
                <h2 className="text-white text-xl font-bold">{currentLessonData.title}</h2>
                <p className="text-gray-400 text-sm mt-1">{currentLessonData.subtitle}</p>
              </div>

              {/* Lesson content — dark navy */}
              <div className="bg-[#1a2744] rounded-b-2xl px-8 py-8 mb-6">
                {currentLessonData.content.map((section, i) => (
                  <div key={i} className={`${i < currentLessonData.content.length - 1 ? 'mb-8 pb-8 border-b border-blue-900' : ''}`}>

                    {/* Section heading */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-1 h-6 bg-blue-400 rounded-full flex-shrink-0" />
                      <h3 className="text-blue-300 font-bold text-base">
                        {section.heading}
                      </h3>
                    </div>

                    {/* Body text */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 ml-4">
                      {section.body}
                    </p>

                    {/* Bullet list */}
                    {section.list && (
                      <div className="ml-4 bg-[#243860] rounded-xl p-4">
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-3">
                          It usually comes in the form of:
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
                    {module.quiz.map((q, index) => (
                      <div key={index} className={`${index < module.quiz.length - 1 ? 'mb-8 pb-8 border-b border-blue-900' : ''}`}>

                        {/* Question */}
                        <div className="flex items-start gap-3 mb-4">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">
                            Q{index + 1}
                          </span>
                          <p className="text-white font-semibold text-sm leading-relaxed">
                            {q.question}
                          </p>
                        </div>

                        {/* Options */}
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
                                ${quizAnswers[index] === optIndex
                                  ? 'border-white bg-white'
                                  : 'border-gray-500'
                                }`}
                              >
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
                      disabled={Object.keys(quizAnswers).length < module.quiz.length}
                      className={`px-8 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2
                        ${Object.keys(quizAnswers).length < module.quiz.length
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
                      You scored <span className="text-white font-bold">{quizScore}</span> out of <span className="text-white font-bold">{module.quiz.length}</span>
                    </p>

                    {/* Score circle */}
                    <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center mx-auto mb-4
                      ${scorePercent >= 80 ? 'border-green-500' : scorePercent >= 50 ? 'border-yellow-500' : 'border-red-500'}`}
                    >
                      <p className={`text-3xl font-extrabold
                        ${scorePercent >= 80 ? 'text-green-400' : scorePercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {scorePercent}%
                      </p>
                    </div>

                    <span className={`inline-block text-sm font-bold px-6 py-2 rounded-full
                      ${scorePercent >= 80 ? 'bg-green-500 text-white' :
                        scorePercent >= 50 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {scorePercent >= 80 ? '✓ Pass' : scorePercent >= 50 ? 'Average' : 'High Risk'}
                    </span>
                  </div>

                  {/* Answer review */}
                  <div className="flex flex-col gap-4 mb-6">
                    {module.quiz.map((q, index) => {
                      const userAnswer = quizAnswers[index]
                      const isCorrect = userAnswer === q.correctIndex
                      return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

                          {/* Question header */}
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

                          {/* Options */}
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

                          {/* Explanation */}
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