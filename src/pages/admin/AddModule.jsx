import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { supabase } from '../../supabaseClient'

function AddModule() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [moduleData, setModuleData] = useState({
    name: '',
    description: '',
    category: 'Phishing Detection',
    estimatedTime: '',
  })

  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: '',
      sections: [
        { id: 1, heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }
      ]
    }
  ])

  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }
  ])

  function handleModuleChange(e) {
    setModuleData({ ...moduleData, [e.target.name]: e.target.value })
  }

  // ── Lesson handlers ──
  function addLesson() {
    setLessons([...lessons, {
      id: Date.now(),
      title: '',
      sections: [{ id: Date.now() + 1, heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }]
    }])
  }

  function deleteLesson(lessonId) {
    if (lessons.length === 1) return
    setLessons(lessons.filter(l => l.id !== lessonId))
  }

  function updateLessonTitle(lessonId, value) {
    setLessons(lessons.map(l => l.id === lessonId ? { ...l, title: value } : l))
  }

  // ── Section handlers ──
  function addSection(lessonId) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: [...l.sections, {
          id: Date.now(),
          heading: '',
          body: '',
          bulletLabel: 'It usually comes in the form of:',
          bullets: ['']
        }]
      }
    }))
  }

  function deleteSection(lessonId, sectionId) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      if (l.sections.length === 1) return l
      return { ...l, sections: l.sections.filter(s => s.id !== sectionId) }
    }))
  }

  function updateSection(lessonId, sectionId, field, value) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s =>
          s.id === sectionId ? { ...s, [field]: value } : s
        )
      }
    }))
  }

  // ── Bullet handlers ──
  function updateBullet(lessonId, sectionId, bulletIndex, value) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          const newBullets = [...s.bullets]
          newBullets[bulletIndex] = value
          return { ...s, bullets: newBullets }
        })
      }
    }))
  }

  function addBullet(lessonId, sectionId) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          return { ...s, bullets: [...s.bullets, ''] }
        })
      }
    }))
  }

  function deleteBullet(lessonId, sectionId, bulletIndex) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          if (s.bullets.length === 1) return s
          return { ...s, bullets: s.bullets.filter((_, i) => i !== bulletIndex) }
        })
      }
    }))
  }

  // ── Quiz handlers ──
  function addQuestion() {
    setQuestions([...questions, {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctIndex: null,
      explanation: '',
    }])
  }

  function deleteQuestion(id) {
    if (questions.length === 1) return
    setQuestions(questions.filter(q => q.id !== id))
  }

  function updateQuestion(id, field, value) {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  function updateOption(id, index, value) {
    setQuestions(questions.map(q => {
      if (q.id !== id) return q
      const newOptions = [...q.options]
      newOptions[index] = value
      return { ...q, options: newOptions }
    }))
  }

  function setCorrect(id, index) {
    setQuestions(questions.map(q => q.id === id ? { ...q, correctIndex: index } : q))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (moduleData.description.length < 50) {
      alert('Brief description must be at least 50 characters.')
      return
    }
    for (const q of questions) {
      if (q.correctIndex === null) {
        alert('Please mark the correct answer for all quiz questions.')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      // Step 1 — Insert module
      const { data: moduleRow, error: moduleError } = await supabase
        .from('modules')
        .insert({
          name: moduleData.name,
          description: moduleData.description,
          category: moduleData.category,
          estimated_time: parseInt(moduleData.estimatedTime),
          hidden: false,
        })
        .select()
        .single()

      if (moduleError) {
        setError('Failed to save module: ' + moduleError.message)
        setLoading(false)
        return
      }

      // Step 2 — Insert lessons and sections
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]

        const { data: lessonRow, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleRow.id,
            title: lesson.title,
            order_index: i,
          })
          .select()
          .single()

        if (lessonError) {
          setError('Failed to save lesson: ' + lessonError.message)
          setLoading(false)
          return
        }

        // Insert sections for this lesson
        for (let j = 0; j < lesson.sections.length; j++) {
          const section = lesson.sections[j]

          const { error: sectionError } = await supabase
            .from('lesson_sections')
            .insert({
              lesson_id: lessonRow.id,
              heading: section.heading,
              body: section.body,
              bullet_label: section.bulletLabel,
              bullets: section.bullets.filter(b => b !== ''),
              order_index: j,
            })

          if (sectionError) {
            setError('Failed to save section: ' + sectionError.message)
            setLoading(false)
            return
          }
        }
      }

      // Step 3 — Insert quiz questions
      for (const q of questions) {
        const { error: quizError } = await supabase
          .from('quiz_questions')
          .insert({
            module_id: moduleRow.id,
            question: q.question,
            options: q.options,
            correct_index: q.correctIndex,
            explanation: q.explanation,
          })

        if (quizError) {
          setError('Failed to save quiz question: ' + quizError.message)
          setLoading(false)
          return
        }
      }

      setSubmitted(true)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const descLen = moduleData.description.length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-full pl-1 pr-5 py-1">
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-white font-bold text-sm leading-tight">John Doe</p>
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">ADMIN</span>
              </div>
            </div>
            <button className="relative text-white hover:text-blue-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1117]" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          {!submitted ? (

            <div className="w-full">

              <div className="mb-8">
                <h1 className="text-gray-800 text-3xl font-bold">Add Training Module</h1>
                <p className="text-gray-500 text-sm mt-1">Create a new training module with lessons and quiz questions</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* ── Module Info ── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-gray-800 text-lg font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    Module Information
                  </h2>

                  <div className="grid grid-cols-2 gap-5 mb-5">

                    {/* Module Name */}
                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Module Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={moduleData.name}
                        onChange={handleModuleChange}
                        placeholder="e.g. Phishing Detection Fundamentals"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>

                    {/* Brief Description */}
                    <div className="col-span-2">
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Brief Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={moduleData.description}
                        onChange={handleModuleChange}
                        placeholder="Write a clear description of what this module covers, who it is for, and what users will learn..."
                        rows={4}
                        maxLength={200}
                        className={`w-full bg-gray-50 border text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none transition
                          ${descLen > 0 && descLen < 50
                            ? 'border-red-400 focus:ring-red-400'
                            : descLen >= 50
                            ? 'border-green-400 focus:ring-green-400'
                            : 'border-gray-200 focus:ring-blue-500'
                          }`}
                      />

                      {/* Character counter */}
                      <div className="flex items-center justify-between mt-2">
                        <div className={`flex items-center gap-2 text-sm font-semibold
                          ${descLen === 0
                            ? 'text-gray-500'
                            : descLen < 50
                            ? 'text-red-500'
                            : 'text-green-600'
                          }`}>
                          {descLen === 0 && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                              </svg>
                              Minimum 50 characters required
                            </>
                          )}
                          {descLen > 0 && descLen < 50 && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                              </svg>
                              {50 - descLen} more characters needed
                            </>
                          )}
                          {descLen >= 50 && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Good description!
                            </>
                          )}
                        </div>
                        <span className={`text-sm font-bold
                          ${descLen >= 180 ? 'text-red-500' : descLen >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                          {descLen} / 200
                        </span>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={moduleData.category}
                        onChange={handleModuleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option>Phishing Detection</option>
                        <option>Password Security</option>
                        <option>Social Engineering</option>
                        <option>Data Privacy</option>
                        <option>Network Security</option>
                      </select>
                    </div>

                    {/* Estimated Time */}
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">
                        Estimated Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="estimatedTime"
                          value={moduleData.estimatedTime}
                          onChange={handleModuleChange}
                          placeholder="e.g. 30"
                          min="1"
                          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mins</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── Lessons ── */}
                <div className="flex flex-col gap-6">
                  {lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                      {/* Lesson header */}
                      <div className="flex items-center justify-between px-6 py-4 bg-[#0d1117]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{lessonIndex + 1}</span>
                          </div>
                          <span className="text-white font-bold text-base">Lesson {lessonIndex + 1}</span>
                        </div>
                        {lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete Lesson
                          </button>
                        )}
                      </div>

                      <div className="p-6">

                        {/* Lesson Title */}
                        <div className="mb-6">
                          <label className="text-gray-700 text-sm font-semibold mb-2 block">
                            Lesson Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
                            placeholder="e.g. Introduction to Phishing"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                        </div>

                        {/* Sections divider */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Lesson Sections</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Sections */}
                        <div className="flex flex-col gap-4">
                          {lesson.sections.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-200 rounded-2xl overflow-hidden">

                              {/* Section header */}
                              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                                  <span className="text-gray-700 text-sm font-semibold">Section {sectionIndex + 1}</span>
                                </div>
                                {lesson.sections.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => deleteSection(lesson.id, section.id)}
                                    className="text-red-400 hover:text-red-600 text-xs font-semibold transition"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="p-4 flex flex-col gap-4">

                                {/* Section Heading — optional */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Section Heading
                                    <span className="text-gray-400 font-normal ml-1 normal-case">(optional — leave blank for no heading)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={section.heading}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'heading', e.target.value)}
                                    placeholder="e.g. What is Phishing?"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>

                                {/* Body Text */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Body Text <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    value={section.body}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'body', e.target.value)}
                                    placeholder="Explain this section in detail..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                                    required
                                  />
                                </div>

                                {/* Bullet Label */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Bullet Section Label
                                    <span className="text-gray-400 font-normal ml-1 normal-case">(optional — customize the heading above bullets)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={section.bulletLabel}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'bulletLabel', e.target.value)}
                                    placeholder="e.g. It usually comes in the form of:"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                  />
                                </div>

                                {/* Bullet Points */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Bullet Points
                                    <span className="text-gray-400 font-normal ml-1 normal-case">(optional — shown in highlighted card)</span>
                                  </label>
                                  <div className="flex flex-col gap-2">
                                    {section.bullets.map((bullet, bulletIndex) => (
                                      <div key={bulletIndex} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                        <input
                                          type="text"
                                          value={bullet}
                                          onChange={(e) => updateBullet(lesson.id, section.id, bulletIndex, e.target.value)}
                                          placeholder={`Bullet point ${bulletIndex + 1}`}
                                          className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                        {section.bullets.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => deleteBullet(lesson.id, section.id, bulletIndex)}
                                            className="text-red-400 hover:text-red-600 transition flex-shrink-0"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addBullet(lesson.id, section.id)}
                                      className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-xs font-semibold transition mt-1 ml-4"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                      Add bullet point
                                    </button>
                                  </div>
                                </div>

                                {/* Live Preview */}
                                {(section.heading || section.body || section.bullets.some(b => b)) && (
                                  <div className="mt-2">
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">👁 Live Preview</p>
                                    <div className="bg-[#1a2744] rounded-xl p-4">
                                      {section.heading && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-1 h-5 bg-blue-400 rounded-full flex-shrink-0" />
                                          <p className="text-blue-300 font-bold text-sm">{section.heading}</p>
                                        </div>
                                      )}
                                      {section.body && (
                                        <p className="text-gray-300 text-xs leading-relaxed mb-3 ml-3">{section.body}</p>
                                      )}
                                      {section.bullets.some(b => b) && (
                                        <div className="ml-3 bg-[#243860] rounded-xl p-3">
                                          <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-2">
                                            {section.bulletLabel || 'It usually comes in the form of:'}
                                          </p>
                                          <div className="flex flex-col gap-1.5">
                                            {section.bullets.filter(b => b).map((bullet, i) => (
                                              <div key={i} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                <p className="text-gray-200 text-xs">{bullet}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          ))}

                          {/* Add Section button */}
                          <button
                            type="button"
                            onClick={() => addSection(lesson.id)}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 font-semibold text-sm py-3 rounded-xl transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Section
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson button */}
                  <button
                    type="button"
                    onClick={addLesson}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-500 hover:text-blue-700 font-bold text-sm py-4 rounded-2xl transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Lesson
                  </button>

                </div>

                {/* ── Quiz Section ── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray.800 text-lg font-bold flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      Quiz Questions
                    </h2>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Question
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {questions.map((q, qIndex) => (
                      <div key={q.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50">

                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                            Question {qIndex + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteQuestion(q.id)}
                              className="text-red-400 hover:text-red-600 transition flex items-center gap-1 text-xs font-semibold"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="text-gray-700 text-sm font-semibold mb-2 block">
                            Question <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={q.question}
                            onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="text-gray-700 text-sm font-semibold mb-3 block">
                            Answer Options <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-2">— click the circle to mark correct answer</span>
                          </label>
                          <div className="flex flex-col gap-3">
                            {q.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setCorrect(q.id, i)}
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                                    ${q.correctIndex === i
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300 bg-white hover:border-green-400'
                                    }`}
                                >
                                  {q.correctIndex === i && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(q.id, i, e.target.value)}
                                  placeholder={`Option ${i + 1}`}
                                  className={`flex-1 border text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition
                                    ${q.correctIndex === i
                                      ? 'bg-green-50 border-green-300'
                                      : 'bg-white border-gray-200'
                                    }`}
                                  required
                                />
                                {q.correctIndex === i && (
                                  <span className="text-green-600 text-xs font-bold flex-shrink-0">✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-700 text-sm font-semibold mb-2 block">
                            Explanation <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={q.explanation}
                            onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                            placeholder="Explain why the correct answer is right..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                            required
                          />
                        </div>

                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 font-semibold text-sm py-3 rounded-xl transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Another Question
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between pb-8">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/training')}
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-10 py-3 rounded-xl text-sm font-bold transition
                      ${loading
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {loading ? 'Saving...' : 'Save Module'}
                  </button>
                </div>

              </form>
            </div>

          ) : (

            // ── SUCCESS VIEW ──
            <div className="max-w-lg mx-auto mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-gray-800 text-2xl font-bold mb-2">Module Saved!</h2>
                <p className="text-gray-500 text-sm mb-8">
                  <span className="font-semibold text-gray-700">{moduleData.name}</span> has been created successfully.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left mb-8">
                  <p className="text-gray-700 text-sm font-bold mb-3">Module Summary</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Module Name</p>
                      <p className="text-gray-800 text-xs font-semibold">{moduleData.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Category</p>
                      <p className="text-gray-800 text-xs font-semibold">{moduleData.category}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Estimated Time</p>
                      <p className="text-gray-800 text-xs font-semibold">{moduleData.estimatedTime} mins</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Lessons</p>
                      <p className="text-gray-800 text-xs font-semibold">{lessons.length} lesson{lessons.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Quiz Questions</p>
                      <p className="text-gray-800 text-xs font-semibold">{questions.length} question{questions.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModuleData({ name: '', description: '', category: 'Phishing Detection', estimatedTime: '' })
                      setLessons([{ id: 1, title: '', sections: [{ id: 1, heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }] }])
                      setQuestions([{ id: 1, question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }])
                      setSubmitted(false)
                      setError('')
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                  >
                    Add Another
                  </button>
                  <button
                    onClick={() => navigate('/admin/training')}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    View Modules
                  </button>
                </div>
              </div>
            </div>

          )}
        </div>
      </div>
    </div>
  )
}

export default AddModule