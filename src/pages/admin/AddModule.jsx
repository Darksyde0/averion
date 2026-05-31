import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

// ── Reusable Tooltip ──
function Tooltip({ text }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  function handleMouseEnter() {
    const rect = ref.current.getBoundingClientRect()
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
    setShow(true)
  }

  return (
    <div className="relative inline-flex items-center ml-1.5"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}>
      <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center cursor-default transition">
        <span className="text-gray-500 hover:text-blue-600 font-bold leading-none transition" style={{ fontSize: '10px' }}>?</span>
      </div>
      {show && (
        <div className="fixed z-[9999] pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl w-56 leading-relaxed text-center">
            {text}
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}

function emptySection(idOffset = 0) {
  return {
    id: Date.now() + idOffset,
    heading: '',
    body: '',
    bulletLabel: '',
    bullets: [''],
    contentBlocks: [],
  }
}

function AddModule() {
  const navigate = useNavigate()
  const profile = useProfile()
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
    { id: 1, title: '', sections: [emptySection(1)] }
  ])

  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }
  ])

  function handleModuleChange(e) {
    setModuleData({ ...moduleData, [e.target.name]: e.target.value })
  }

  // ── Lesson handlers ──
  function addLesson() {
    setLessons([...lessons, { id: Date.now(), title: '', sections: [emptySection()] }])
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
      return { ...l, sections: [...l.sections, emptySection()] }
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
      return { ...l, sections: l.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s) }
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
      return { ...l, sections: l.sections.map(s => s.id === sectionId ? { ...s, bullets: [...s.bullets, ''] } : s) }
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

  // ── Content block handlers ──
  function addContentBlock(lessonId, sectionId) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          return { ...s, contentBlocks: [...s.contentBlocks, { id: Date.now(), heading: '', body: '' }] }
        })
      }
    }))
  }

  function updateContentBlock(lessonId, sectionId, blockId, field, value) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          return { ...s, contentBlocks: s.contentBlocks.map(b => b.id === blockId ? { ...b, [field]: value } : b) }
        })
      }
    }))
  }

  function deleteContentBlock(lessonId, sectionId, blockId) {
    setLessons(lessons.map(l => {
      if (l.id !== lessonId) return l
      return {
        ...l,
        sections: l.sections.map(s => {
          if (s.id !== sectionId) return s
          return { ...s, contentBlocks: s.contentBlocks.filter(b => b.id !== blockId) }
        })
      }
    }))
  }

  // ── Quiz handlers ──
  function addQuestion() {
    setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }])
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
    if (!profile?.id) return
    if (moduleData.description.length < 50) { alert('Brief description must be at least 50 characters.'); return }
    for (const q of questions) {
      if (q.correctIndex === null) { alert('Please mark the correct answer for all quiz questions.'); return }
    }

    setLoading(true)
    setError('')

    try {
      const { data: moduleRow, error: moduleError } = await supabase
        .from('modules')
        .insert({
          name: moduleData.name,
          description: moduleData.description,
          category: moduleData.category,
          estimated_time: parseInt(moduleData.estimatedTime),
          hidden: false,
          organization_id: profile.id,
        })
        .select()
        .single()

      if (moduleError) { setError('Failed to save module: ' + moduleError.message); setLoading(false); return }

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]
        const { data: lessonRow, error: lessonError } = await supabase
          .from('lessons')
          .insert({ module_id: moduleRow.id, title: lesson.title, order_index: i })
          .select()
          .single()

        if (lessonError) { setError('Failed to save lesson: ' + lessonError.message); setLoading(false); return }

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
              content_blocks: section.contentBlocks,
              order_index: j,
            })

          if (sectionError) { setError('Failed to save section: ' + sectionError.message); setLoading(false); return }
        }
      }

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

        if (quizError) { setError('Failed to save quiz: ' + quizError.message); setLoading(false); return }
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">
          {!submitted ? (
            <div className="w-full">

              <div className="mb-8">
                <h1 className="text-gray-900 text-2xl font-bold">Add Training Module</h1>
                <p className="text-gray-400 text-sm mt-0.5">Create a new training module with lessons and quiz questions</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* ── Module Info ── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-gray-800 font-bold mb-6 flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    Module Information
                  </h2>

                  <div className="grid grid-cols-2 gap-5">

                    <div className="col-span-2">
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                        Module Name <span className="text-red-400 ml-0.5">*</span>
                        <Tooltip text="The title users will see in their training list. Make it clear and specific." />
                      </label>
                      <input type="text" name="name" value={moduleData.name} onChange={handleModuleChange}
                        placeholder="e.g. Phishing Detection Fundamentals"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                        Brief Description <span className="text-red-400 ml-0.5">*</span>
                        <Tooltip text="A short summary shown on the module card. Minimum 50 characters. Helps users understand what they'll learn before starting." />
                      </label>
                      <textarea name="description" value={moduleData.description} onChange={handleModuleChange}
                        placeholder="Write a clear description of what this module covers..."
                        rows={4} maxLength={200}
                        className={`w-full bg-gray-50 border text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none transition
                          ${descLen > 0 && descLen < 50 ? 'border-red-400 focus:ring-red-400' : descLen >= 50 ? 'border-green-400 focus:ring-green-400' : 'border-gray-200 focus:ring-blue-500'}`} />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs font-semibold ${descLen === 0 ? 'text-gray-400' : descLen < 50 ? 'text-red-500' : 'text-green-600'}`}>
                          {descLen === 0 ? 'Minimum 50 characters required' : descLen < 50 ? `${50 - descLen} more characters needed` : '✓ Good description!'}
                        </p>
                        <span className={`text-xs font-bold ${descLen >= 180 ? 'text-red-500' : descLen >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                          {descLen} / 200
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                        Category <span className="text-red-400 ml-0.5">*</span>
                        <Tooltip text="Groups this module with similar training topics. You can type your own or pick from the suggestions." />
                      </label>
                      <input type="text" name="category" value={moduleData.category} onChange={handleModuleChange}
                        placeholder="e.g. Phishing Detection" list="module-category-options"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required />
                      <datalist id="module-category-options">
                        <option value="Phishing Detection" />
                        <option value="Password Security" />
                        <option value="Social Engineering" />
                        <option value="Data Privacy" />
                        <option value="Network Security" />
                      </datalist>
                    </div>

                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                        Estimated Time <span className="text-red-400 ml-0.5">*</span>
                        <Tooltip text="How long it takes to complete this module in minutes. Shown to users so they can plan their time." />
                      </label>
                      <div className="relative">
                        <input type="number" name="estimatedTime" value={moduleData.estimatedTime} onChange={handleModuleChange}
                          placeholder="e.g. 30" min="1"
                          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                          required />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">mins</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── Lessons ── */}
                <div className="flex flex-col gap-5">
                  {lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">

                      {/* Lesson header */}
                      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0d1117] rounded-t-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{lessonIndex + 1}</span>
                          </div>
                          <span className="text-white font-bold text-sm">Lesson {lessonIndex + 1}</span>
                        </div>
                        {lessons.length > 1 && (
                          <button type="button" onClick={() => deleteLesson(lesson.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold transition flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete Lesson
                          </button>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="mb-5">
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                            Lesson Title <span className="text-red-400 ml-0.5">*</span>
                            <Tooltip text="Each lesson is like a chapter. Break your module into logical steps — e.g. 'Introduction', 'How to Spot It', 'What to Do'." />
                          </label>
                          <input type="text" value={lesson.title} onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
                            placeholder="e.g. Introduction to Phishing"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Sections</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <div className="flex flex-col gap-4">
                          {lesson.sections.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-100 rounded-2xl">

                              {/* Section header */}
                              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100 rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                  <span className="text-gray-600 text-xs font-semibold">Section {sectionIndex + 1}</span>
                                </div>
                                {lesson.sections.length > 1 && (
                                  <button type="button" onClick={() => deleteSection(lesson.id, section.id)}
                                    className="text-red-400 hover:text-red-600 text-xs font-semibold transition">
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="p-4 flex flex-col gap-4">

                                {/* Heading */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                    Heading
                                    <span className="text-gray-400 font-normal normal-case ml-1">(optional)</span>
                                    <Tooltip text="A bold title shown above the body text. Use it to introduce what this section covers — e.g. 'What is Phishing?'" />
                                  </label>
                                  <input type="text" value={section.heading}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'heading', e.target.value)}
                                    placeholder="e.g. What is Phishing?"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>

                                {/* Body */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                    Body Text <span className="text-red-400 ml-0.5">*</span>
                                    <Tooltip text="The main paragraph users will read. Explain the concept clearly. This appears directly below the heading." />
                                  </label>
                                  <textarea value={section.body}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'body', e.target.value)}
                                    placeholder="Explain this section in detail..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                                    required />
                                </div>

                                {/* Bullet Label */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                    Bullet Label
                                    <span className="text-gray-400 font-normal normal-case ml-1">(optional)</span>
                                    <Tooltip text="The intro line shown above your bullet points — e.g. 'It usually comes in the form of:' or 'Common examples include:'" />
                                  </label>
                                  <input type="text" value={section.bulletLabel}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'bulletLabel', e.target.value)}
                                    placeholder="e.g. It usually comes in the form of:"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>

                                {/* Bullets */}
                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                    Bullet Points
                                    <span className="text-gray-400 font-normal normal-case ml-1">(optional)</span>
                                    <Tooltip text="Key takeaways or examples shown as a list. Great for breaking down complex ideas into digestible points." />
                                  </label>
                                  <div className="flex flex-col gap-2">
                                    {section.bullets.map((bullet, bulletIndex) => (
                                      <div key={bulletIndex} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        <input type="text" value={bullet}
                                          onChange={(e) => updateBullet(lesson.id, section.id, bulletIndex, e.target.value)}
                                          placeholder={`Bullet ${bulletIndex + 1}`}
                                          className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        {section.bullets.length > 1 && (
                                          <button type="button" onClick={() => deleteBullet(lesson.id, section.id, bulletIndex)}
                                            className="text-red-400 hover:text-red-600 transition flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addBullet(lesson.id, section.id)}
                                      className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-xs font-semibold transition mt-1 ml-4">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                      Add bullet
                                    </button>
                                  </div>
                                </div>

                                {/* ── Content blocks after bullets ── */}
                                {section.contentBlocks.map((block, blockIndex) => (
                                  <div key={block.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/30 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-400 rounded-full" />
                                        <span className="text-blue-600 text-xs font-semibold">Continued Block {blockIndex + 1}</span>
                                      </div>
                                      <button type="button" onClick={() => deleteContentBlock(lesson.id, section.id, block.id)}
                                        className="text-red-400 hover:text-red-600 text-xs font-semibold transition">
                                        Remove
                                      </button>
                                    </div>

                                    <div>
                                      <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                        Heading
                                        <span className="text-gray-400 font-normal normal-case ml-1">(optional)</span>
                                        <Tooltip text="An optional bold title for this continued block — shown after the bullet list in the same section." />
                                      </label>
                                      <input type="text" value={block.heading}
                                        onChange={(e) => updateContentBlock(lesson.id, section.id, block.id, 'heading', e.target.value)}
                                        placeholder="e.g. Why it matters"
                                        className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                    </div>

                                    <div>
                                      <label className="text-gray-600 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                                        Body Text <span className="text-red-400 ml-0.5">*</span>
                                        <Tooltip text="Continues the explanation after the bullet list — stays inside the same section without starting a new one." />
                                      </label>
                                      <textarea value={block.body}
                                        onChange={(e) => updateContentBlock(lesson.id, section.id, block.id, 'body', e.target.value)}
                                        placeholder="Continue explaining..."
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                                        required />
                                    </div>
                                  </div>
                                ))}

                                {/* Add content block */}
                                <button type="button" onClick={() => addContentBlock(lesson.id, section.id)}
                                  className="flex items-center justify-center gap-2 border border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-400 hover:text-blue-600 font-semibold text-xs py-2.5 rounded-xl transition">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                  Add heading + text after bullets
                                </button>

                                {/* Preview */}
                                {(section.heading || section.body || section.bullets.some(b => b) || section.contentBlocks.some(b => b.body)) && (
                                  <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Preview</p>
                                    <div className="bg-[#1a2744] rounded-xl p-4">
                                      {section.heading && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-1 h-4 bg-blue-400 rounded-full flex-shrink-0" />
                                          <p className="text-blue-300 font-bold text-sm">{section.heading}</p>
                                        </div>
                                      )}
                                      {section.body && (
                                        <p className="text-gray-300 text-xs leading-relaxed mb-3 ml-3">{section.body}</p>
                                      )}
                                      {section.bullets.some(b => b) && (
                                        <div className="ml-3 bg-[#243860] rounded-xl p-3 mb-3">
                                          {section.bulletLabel && (
                                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-2">
                                              {section.bulletLabel}
                                            </p>
                                          )}
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
                                      {section.contentBlocks.filter(b => b.body).map((block, i) => (
                                        <div key={i} className="ml-3 mt-2">
                                          {block.heading && (
                                            <div className="flex items-center gap-2 mb-1.5">
                                              <div className="w-1 h-3.5 bg-blue-400 rounded-full flex-shrink-0" />
                                              <p className="text-blue-300 font-bold text-xs">{block.heading}</p>
                                            </div>
                                          )}
                                          {block.body && (
                                            <p className="text-gray-300 text-xs leading-relaxed ml-3">{block.body}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          ))}

                          <button type="button" onClick={() => addSection(lesson.id)}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-600 font-semibold text-sm py-3 rounded-xl transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Section
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={addLesson}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-400 hover:text-blue-700 font-bold text-sm py-4 rounded-2xl transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Lesson
                  </button>
                </div>

                {/* ── Quiz ── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-800 font-bold flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      Quiz Questions
                      <Tooltip text="Users answer these after completing all lessons. Their score determines if they pass, average, or are high risk." />
                    </h2>
                    <button type="button" onClick={addQuestion}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-3.5 py-2 rounded-xl transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Question
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {questions.map((q, qIndex) => (
                      <div key={q.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50">

                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                            Question {qIndex + 1}
                          </span>
                          {questions.length > 1 && (
                            <button type="button" onClick={() => deleteQuestion(q.id)}
                              className="text-red-400 hover:text-red-600 text-xs font-semibold transition flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                            Question <span className="text-red-400">*</span>
                          </label>
                          <textarea value={q.question} onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                            required />
                        </div>

                        <div className="mb-4">
                          <label className="text-gray-700 text-xs font-semibold mb-2 flex items-center uppercase tracking-wide">
                            Answer Options <span className="text-red-400 ml-0.5">*</span>
                            <Tooltip text="Add 4 answer options then click the circle next to the correct one to mark it green." />
                          </label>
                          <div className="flex flex-col gap-2.5">
                            {q.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <button type="button" onClick={() => setCorrect(q.id, i)}
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                                    ${q.correctIndex === i ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white hover:border-green-400'}`}>
                                  {q.correctIndex === i && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </button>
                                <input type="text" value={opt} onChange={(e) => updateOption(q.id, i, e.target.value)}
                                  placeholder={`Option ${i + 1}`}
                                  className={`flex-1 border text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition
                                    ${q.correctIndex === i ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}
                                  required />
                                {q.correctIndex === i && (
                                  <span className="text-green-600 text-xs font-bold flex-shrink-0">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 flex items-center uppercase tracking-wide">
                            Explanation <span className="text-red-400 ml-0.5">*</span>
                            <Tooltip text="Shown to the user after they answer — explains why the correct answer is right. Reinforces the learning." />
                          </label>
                          <textarea value={q.explanation} onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                            placeholder="Explain why the correct answer is right..."
                            rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                            required />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addQuestion}
                    className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-600 font-semibold text-sm py-3 rounded-xl transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Another Question
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-between pb-8">
                  <button type="button" onClick={() => navigate('/admin/training')}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition
                      ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {loading ? 'Saving...' : 'Save Module'}
                  </button>
                </div>

              </form>
            </div>

          ) : (

            <div className="max-w-md mx-auto mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-gray-800 text-xl font-bold mb-1">Module Saved!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  <span className="font-semibold text-gray-600">{moduleData.name}</span> has been created successfully.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Module Name', value: moduleData.name },
                      { label: 'Category', value: moduleData.category },
                      { label: 'Estimated Time', value: `${moduleData.estimatedTime} mins` },
                      { label: 'Lessons', value: `${lessons.length} lesson${lessons.length > 1 ? 's' : ''}` },
                      { label: 'Quiz Questions', value: `${questions.length} question${questions.length > 1 ? 's' : ''}` },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <p className="text-gray-400 text-xs">{item.label}</p>
                        <p className="text-gray-700 text-xs font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setModuleData({ name: '', description: '', category: 'Phishing Detection', estimatedTime: '' })
                      setLessons([{ id: 1, title: '', sections: [emptySection(1)] }])
                      setQuestions([{ id: 1, question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }])
                      setSubmitted(false)
                      setError('')
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                    Add Another
                  </button>
                  <button onClick={() => navigate('/admin/training')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
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
