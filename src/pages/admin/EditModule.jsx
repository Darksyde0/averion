import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'

function EditModule() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [moduleData, setModuleData] = useState({
    name: '', description: '', category: 'Phishing Detection', estimatedTime: '',
  })
  const [lessons, setLessons] = useState([])
  const [questions, setQuestions] = useState([])

  useEffect(() => { fetchModule() }, [id])

  async function fetchModule() {
    setFetching(true)
    const { data: mod, error: modError } = await supabase.from('modules').select('*').eq('id', id).single()
    if (modError || !mod) { setError('Module not found.'); setFetching(false); return }

    setModuleData({ name: mod.name, description: mod.description, category: mod.category, estimatedTime: mod.estimated_time })

    const { data: lessonsData } = await supabase
      .from('lessons').select('*, lesson_sections(*)')
      .eq('module_id', id).order('order_index', { ascending: true })

    if (lessonsData) {
      const mapped = lessonsData.map(l => ({
        id: l.id, title: l.title,
        sections: l.lesson_sections.sort((a, b) => a.order_index - b.order_index).map(s => ({
          id: s.id, heading: s.heading || '', body: s.body || '',
          bulletLabel: s.bullet_label || 'It usually comes in the form of:',
          bullets: s.bullets?.length ? s.bullets : [''],
        }))
      }))
      setLessons(mapped.length > 0 ? mapped : [{
        id: Date.now(), title: '',
        sections: [{ id: Date.now() + 1, heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }]
      }])
    }

    const { data: quizData } = await supabase.from('quiz_questions').select('*').eq('module_id', id)
    if (quizData) {
      const mappedQ = quizData.map(q => ({
        id: q.id, question: q.question, options: q.options, correctIndex: q.correct_index, explanation: q.explanation,
      }))
      setQuestions(mappedQ.length > 0 ? mappedQ : [
        { id: Date.now(), question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }
      ])
    }
    setFetching(false)
  }

  function handleModuleChange(e) { setModuleData({ ...moduleData, [e.target.name]: e.target.value }) }

  // ── Lesson handlers ──
  function addLesson() {
    setLessons([...lessons, { id: Date.now(), title: '', sections: [{ id: Date.now() + 1, heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }] }])
  }
  function deleteLesson(lessonId) { if (lessons.length === 1) return; setLessons(lessons.filter(l => l.id !== lessonId)) }
  function updateLessonTitle(lessonId, value) { setLessons(lessons.map(l => l.id === lessonId ? { ...l, title: value } : l)) }

  // ── Section handlers ──
  function addSection(lessonId) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : { ...l, sections: [...l.sections, { id: Date.now(), heading: '', body: '', bulletLabel: 'It usually comes in the form of:', bullets: [''] }] }))
  }
  function deleteSection(lessonId, sectionId) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : l.sections.length === 1 ? l : { ...l, sections: l.sections.filter(s => s.id !== sectionId) }))
  }
  function updateSection(lessonId, sectionId, field, value) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : { ...l, sections: l.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s) }))
  }

  // ── Bullet handlers ──
  function updateBullet(lessonId, sectionId, bulletIndex, value) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : {
      ...l, sections: l.sections.map(s => {
        if (s.id !== sectionId) return s
        const newBullets = [...s.bullets]; newBullets[bulletIndex] = value; return { ...s, bullets: newBullets }
      })
    }))
  }
  function addBullet(lessonId, sectionId) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : { ...l, sections: l.sections.map(s => s.id === sectionId ? { ...s, bullets: [...s.bullets, ''] } : s) }))
  }
  function deleteBullet(lessonId, sectionId, bulletIndex) {
    setLessons(lessons.map(l => l.id !== lessonId ? l : {
      ...l, sections: l.sections.map(s => {
        if (s.id !== sectionId || s.bullets.length === 1) return s
        return { ...s, bullets: s.bullets.filter((_, i) => i !== bulletIndex) }
      })
    }))
  }

  // ── Quiz handlers ──
  function addQuestion() { setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }]) }
  function deleteQuestion(qid) { if (questions.length === 1) return; setQuestions(questions.filter(q => q.id !== qid)) }
  function updateQuestion(qid, field, value) { setQuestions(questions.map(q => q.id === qid ? { ...q, [field]: value } : q)) }
  function updateOption(qid, index, value) {
    setQuestions(questions.map(q => { if (q.id !== qid) return q; const o = [...q.options]; o[index] = value; return { ...q, options: o } }))
  }
  function setCorrect(qid, index) { setQuestions(questions.map(q => q.id === qid ? { ...q, correctIndex: index } : q)) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (moduleData.description.length < 50) { alert('Brief description must be at least 50 characters.'); return }
    for (const q of questions) { if (q.correctIndex === null) { alert('Please mark the correct answer for all quiz questions.'); return } }

    setLoading(true); setError('')

    try {
      const { error: moduleError } = await supabase.from('modules').update({
        name: moduleData.name, description: moduleData.description,
        category: moduleData.category, estimated_time: parseInt(moduleData.estimatedTime),
      }).eq('id', id)

      if (moduleError) { setError('Failed to update module: ' + moduleError.message); setLoading(false); return }

      await supabase.from('lessons').delete().eq('module_id', id)
      await supabase.from('quiz_questions').delete().eq('module_id', id)

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]
        const { data: lessonRow, error: lessonError } = await supabase.from('lessons')
          .insert({ module_id: id, title: lesson.title, order_index: i }).select().single()
        if (lessonError) { setError('Failed to save lesson: ' + lessonError.message); setLoading(false); return }

        for (let j = 0; j < lesson.sections.length; j++) {
          const section = lesson.sections[j]
          const { error: sectionError } = await supabase.from('lesson_sections').insert({
            lesson_id: lessonRow.id, heading: section.heading, body: section.body,
            bullet_label: section.bulletLabel, bullets: section.bullets.filter(b => b !== ''), order_index: j,
          })
          if (sectionError) { setError('Failed to save section: ' + sectionError.message); setLoading(false); return }
        }
      }

      for (const q of questions) {
        const { error: quizError } = await supabase.from('quiz_questions').insert({
          module_id: id, question: q.question, options: q.options,
          correct_index: q.correctIndex, explanation: q.explanation,
        })
        if (quizError) { setError('Failed to save quiz question: ' + quizError.message); setLoading(false); return }
      }

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const descLen = moduleData.description.length

  // ── Loading state ──
  if (fetching) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar isOpen={true} />
        <div className="flex-1 flex flex-col ml-48">
          <AdminTopBar onMenuClick={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading module...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {!submitted ? (

            <div className="w-full max-w-4xl">

              {/* Header */}
              <div className="mb-8">
                <button onClick={() => navigate('/admin/training')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-3 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Modules
                </button>
                <h1 className="text-gray-900 text-2xl font-bold">Edit Training Module</h1>
                <p className="text-gray-400 text-sm mt-0.5">Update the module details, lessons and quiz questions</p>
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
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Module Name <span className="text-red-400">*</span></label>
                      <input type="text" name="name" value={moduleData.name} onChange={handleModuleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Brief Description <span className="text-red-400">*</span></label>
                      <textarea name="description" value={moduleData.description} onChange={handleModuleChange}
                        rows={4} maxLength={200}
                        className={`w-full bg-gray-50 border text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none transition
                          ${descLen > 0 && descLen < 50 ? 'border-red-400 focus:ring-red-400' : descLen >= 50 ? 'border-green-400 focus:ring-green-400' : 'border-gray-200 focus:ring-blue-500'}`} />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs font-semibold ${descLen === 0 ? 'text-gray-400' : descLen < 50 ? 'text-red-500' : 'text-green-600'}`}>
                          {descLen === 0 ? 'Minimum 50 characters required' : descLen < 50 ? `${50 - descLen} more characters needed` : '✓ Good description!'}
                        </p>
                        <span className={`text-xs font-bold ${descLen >= 180 ? 'text-red-500' : descLen >= 50 ? 'text-green-600' : 'text-gray-400'}`}>{descLen} / 200</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Category <span className="text-red-400">*</span></label>
                      <select name="category" value={moduleData.category} onChange={handleModuleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option>Phishing Detection</option>
                        <option>Password Security</option>
                        <option>Social Engineering</option>
                        <option>Data Privacy</option>
                        <option>Network Security</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Estimated Time <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input type="number" name="estimatedTime" value={moduleData.estimatedTime} onChange={handleModuleChange}
                          placeholder="e.g. 30" min="1"
                          className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Lessons ── */}
                <div className="flex flex-col gap-5">
                  {lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                      <div className="flex items-center justify-between px-6 py-3.5 bg-[#0d1117]">
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
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Lesson Title <span className="text-red-400">*</span></label>
                          <input type="text" value={lesson.title} onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
                            placeholder="e.g. Introduction to Phishing"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Sections</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <div className="flex flex-col gap-4">
                          {lesson.sections.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-100 rounded-2xl overflow-hidden">

                              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                  <span className="text-gray-600 text-xs font-semibold">Section {sectionIndex + 1}</span>
                                </div>
                                {lesson.sections.length > 1 && (
                                  <button type="button" onClick={() => deleteSection(lesson.id, section.id)}
                                    className="text-red-400 hover:text-red-600 text-xs font-semibold transition">Remove</button>
                                )}
                              </div>

                              <div className="p-4 flex flex-col gap-4">

                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Heading <span className="text-gray-400 font-normal normal-case">(optional)</span>
                                  </label>
                                  <input type="text" value={section.heading}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'heading', e.target.value)}
                                    placeholder="e.g. What is Phishing?"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>

                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Body Text <span className="text-red-400">*</span></label>
                                  <textarea value={section.body}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'body', e.target.value)}
                                    placeholder="Explain this section in detail..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" required />
                                </div>

                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Bullet Label <span className="text-gray-400 font-normal normal-case">(optional)</span>
                                  </label>
                                  <input type="text" value={section.bulletLabel}
                                    onChange={(e) => updateSection(lesson.id, section.id, 'bulletLabel', e.target.value)}
                                    placeholder="e.g. It usually comes in the form of:"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>

                                <div>
                                  <label className="text-gray-600 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                                    Bullet Points <span className="text-gray-400 font-normal normal-case">(optional)</span>
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

                                {(section.heading || section.body || section.bullets.some(b => b)) && (
                                  <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Preview</p>
                                    <div className="bg-[#1a2744] rounded-xl p-4">
                                      {section.heading && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-1 h-4 bg-blue-400 rounded-full flex-shrink-0" />
                                          <p className="text-blue-300 font-bold text-sm">{section.heading}</p>
                                        </div>
                                      )}
                                      {section.body && <p className="text-gray-300 text-xs leading-relaxed mb-3 ml-3">{section.body}</p>}
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
                          <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Question {qIndex + 1}</span>
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
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Question <span className="text-red-400">*</span></label>
                          <textarea value={q.question} onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                            placeholder="Enter your question here..." rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" required />
                        </div>

                        <div className="mb-4">
                          <label className="text-gray-700 text-xs font-semibold mb-2 block uppercase tracking-wide">
                            Answer Options <span className="text-red-400">*</span>
                            <span className="text-gray-400 font-normal ml-1 normal-case text-xs">— click circle to mark correct</span>
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
                                    ${q.correctIndex === i ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`} required />
                                {q.correctIndex === i && <span className="text-green-600 text-xs font-bold flex-shrink-0">✓</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Explanation <span className="text-red-400">*</span></label>
                          <textarea value={q.explanation} onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                            placeholder="Explain why the correct answer is right..." rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" required />
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
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </div>

          ) : (

            // ── SUCCESS ──
            <div className="max-w-md mx-auto mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-gray-800 text-xl font-bold mb-1">Module Updated!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  <span className="font-semibold text-gray-600">{moduleData.name}</span> has been updated successfully.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/admin/training')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                    Back to Modules
                  </button>
                  <button onClick={() => { setSubmitted(false); setError('') }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                    Edit Again
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

export default EditModule
