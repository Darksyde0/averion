import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function EditModule() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const [moduleData, setModuleData] = useState({ name: '', description: '', category: 'Phishing Detection', estimatedTime: '' })
  const [lessons, setLessons] = useState([])
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => { if (id) fetchModule() }, [id])

  async function fetchModule() {
    setFetching(true)
    try {
      let query = supabase.from('modules').select('*').eq('id', id)
      if (profile?.id) query = query.eq('organization_id', profile.id)
      const { data: mod, error: modError } = await query.single()
      if (modError || !mod) { setNotFound(true); setFetching(false); return }
      setModuleData({ name: mod.name, description: mod.description, category: mod.category, estimatedTime: mod.estimated_time })

      const { data: lessonsData } = await supabase.from('lessons').select('*, lesson_sections(*)')
        .eq('module_id', id).order('order_index', { ascending: true })
      if (lessonsData) {
        const mapped = lessonsData.map(l => ({
          id: l.id, title: l.title,
          sections: l.lesson_sections.sort((a, b) => a.order_index - b.order_index).map(s => ({
            id: s.id, heading: s.heading || '', body: s.body || '', bulletLabel: s.bullet_label || '',
            bullets: s.bullets?.length ? s.bullets : [''],
          }))
        }))
        setLessons(mapped.length > 0 ? mapped : [{ id: Date.now(), title: '', sections: [{ id: Date.now() + 1, heading: '', body: '', bulletLabel: '', bullets: [''] }] }])
      }

      const { data: quizData } = await supabase.from('quiz_questions').select('*').eq('module_id', id)
      if (quizData) {
        const mappedQ = quizData.map(q => ({ id: q.id, question: q.question, options: q.options, correctIndex: q.correct_index, explanation: q.explanation }))
        setQuestions(mappedQ.length > 0 ? mappedQ : [{ id: Date.now(), question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }])
      }
    } catch (err) {
      setNotFound(true)
    } finally {
      setFetching(false)
    }
  }

  function handleModuleChange(e) { setModuleData({ ...moduleData, [e.target.name]: e.target.value }) }

  function addLesson() { setLessons([...lessons, { id: Date.now(), title: '', sections: [{ id: Date.now() + 1, heading: '', body: '', bulletLabel: '', bullets: [''] }] }]) }
  function deleteLesson(id) { if (lessons.length > 1) setLessons(lessons.filter(l => l.id !== id)) }
  function updateLessonTitle(id, v) { setLessons(lessons.map(l => l.id === id ? { ...l, title: v } : l)) }

  function addSection(lid) { setLessons(lessons.map(l => l.id !== lid ? l : { ...l, sections: [...l.sections, { id: Date.now(), heading: '', body: '', bulletLabel: '', bullets: [''] }] })) }
  function deleteSection(lid, sid) { setLessons(lessons.map(l => l.id !== lid ? l : l.sections.length === 1 ? l : { ...l, sections: l.sections.filter(s => s.id !== sid) })) }
  function updateSection(lid, sid, field, v) { setLessons(lessons.map(l => l.id !== lid ? l : { ...l, sections: l.sections.map(s => s.id === sid ? { ...s, [field]: v } : s) })) }

  function updateBullet(lid, sid, bi, v) { setLessons(lessons.map(l => l.id !== lid ? l : { ...l, sections: l.sections.map(s => { if (s.id !== sid) return s; const b = [...s.bullets]; b[bi] = v; return { ...s, bullets: b } }) })) }
  function addBullet(lid, sid) { setLessons(lessons.map(l => l.id !== lid ? l : { ...l, sections: l.sections.map(s => s.id === sid ? { ...s, bullets: [...s.bullets, ''] } : s) })) }
  function deleteBullet(lid, sid, bi) { setLessons(lessons.map(l => l.id !== lid ? l : { ...l, sections: l.sections.map(s => { if (s.id !== sid || s.bullets.length === 1) return s; return { ...s, bullets: s.bullets.filter((_, i) => i !== bi) } }) })) }

  function addQuestion() { setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' }]) }
  function deleteQuestion(qid) { if (questions.length > 1) setQuestions(questions.filter(q => q.id !== qid)) }
  function updateQuestion(qid, field, v) { setQuestions(questions.map(q => q.id === qid ? { ...q, [field]: v } : q)) }
  function updateOption(qid, i, v) { setQuestions(questions.map(q => { if (q.id !== qid) return q; const o = [...q.options]; o[i] = v; return { ...q, options: o } })) }
  function setCorrect(qid, i) { setQuestions(questions.map(q => q.id === qid ? { ...q, correctIndex: i } : q)) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (moduleData.description.trim().length < 50) { setError('Description must be at least 50 characters.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    for (const q of questions) {
      if (q.correctIndex === null) { setError('Please mark the correct answer for all quiz questions.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    }
    const estimatedTime = parseInt(moduleData.estimatedTime)
    if (!estimatedTime || estimatedTime < 1) { setError('Please enter a valid estimated time.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    setLoading(true); setError('')
    try {
      const { error: moduleError } = await supabase.from('modules').update({
        name: moduleData.name.trim(), description: moduleData.description.trim(),
        category: moduleData.category.trim(), estimated_time: estimatedTime,
      }).eq('id', id)
      if (moduleError) { setError('Failed to update module: ' + moduleError.message); setLoading(false); return }

      await supabase.from('lessons').delete().eq('module_id', id)
      await supabase.from('quiz_questions').delete().eq('module_id', id)

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]
        const { data: lessonRow, error: lessonError } = await supabase.from('lessons')
          .insert({ module_id: id, title: lesson.title.trim(), order_index: i }).select().single()
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
          module_id: id, question: q.question.trim(), options: q.options,
          correct_index: q.correctIndex, explanation: q.explanation.trim(),
        })
        if (quizError) { setError('Failed to save quiz: ' + quizError.message); setLoading(false); return }
      }

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const descLen = moduleData.description.length
  const inputClass = "w-full bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-300"
  const labelClass = "text-gray-500 text-xs font-medium mb-1.5 block"

  if (fetching) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <AdminSidebar isOpen={true} />
        <div className="flex-1 flex flex-col ml-48">
          <AdminTopBar onMenuClick={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <AdminSidebar isOpen={true} />
        <div className="flex-1 flex flex-col ml-48">
          <AdminTopBar onMenuClick={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500 text-sm mb-4">Module not found or access denied.</p>
              <button onClick={() => navigate('/admin/training')}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium">
                Back to Modules
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">
          {!submitted ? (
            <div className="max-w-full">

              <div className="mb-6">
                <button onClick={() => navigate('/admin/training')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs mb-2 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Modules
                </button>
                <h1 className="text-gray-900 text-lg font-semibold">Edit Training Module</h1>
                <p className="text-gray-400 text-xs mt-0.5">Update module details, lessons and quiz questions</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Module Info */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-gray-700 text-sm font-semibold mb-4">Module Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>Module Name <span className="text-red-400">*</span></label>
                      <input type="text" name="name" value={moduleData.name} onChange={handleModuleChange} className={inputClass} required />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                      <textarea name="description" value={moduleData.description} onChange={handleModuleChange}
                        rows={3} maxLength={200}
                        className={`${inputClass} resize-none ${descLen > 0 && descLen < 50 ? 'border-red-300 focus:ring-red-400' : descLen >= 50 ? 'border-emerald-300 focus:ring-emerald-400' : ''}`} />
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${descLen === 0 ? 'text-gray-300' : descLen < 50 ? 'text-red-400' : 'text-emerald-500'}`}>
                          {descLen === 0 ? 'Min 50 characters' : descLen < 50 ? `${50 - descLen} more needed` : '✓ Good'}
                        </p>
                        <span className={`text-xs ${descLen >= 180 ? 'text-red-400' : 'text-gray-300'}`}>{descLen}/200</span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                      <input type="text" name="category" value={moduleData.category} onChange={handleModuleChange}
                        list="edit-module-category-options" className={inputClass} required />
                      <datalist id="edit-module-category-options">
                        {['Phishing Detection','Password Security','Social Engineering','Data Privacy','Network Security','Ransomware','USB & Physical Security','Insider Threat','Email Security','Mobile Security','Cloud Security','Zero-Day Awareness'].map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelClass}>Estimated Time <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input type="number" name="estimatedTime" value={moduleData.estimatedTime} onChange={handleModuleChange}
                          placeholder="e.g. 30" min="1" className={`${inputClass} pr-12`} required />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs">mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="flex flex-col gap-3">
                  {lessons.map((lesson, li) => (
                    <div key={lesson.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/70">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 bg-gray-900 text-white rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0">{li + 1}</span>
                          <p className="text-gray-700 text-sm font-semibold">Lesson {li + 1}</p>
                        </div>
                        {lessons.length > 1 && (
                          <button type="button" onClick={() => deleteLesson(lesson.id)}
                            className="text-red-400 hover:text-red-500 text-xs font-medium transition">Remove</button>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="mb-4">
                          <label className={labelClass}>Lesson Title <span className="text-red-400">*</span></label>
                          <input type="text" value={lesson.title} onChange={e => updateLessonTitle(lesson.id, e.target.value)}
                            placeholder="e.g. Introduction to Phishing" className={inputClass} required />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-gray-400 text-xs">Sections</span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <div className="flex flex-col gap-3">
                          {lesson.sections.map((section, si) => (
                            <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-3.5 bg-blue-400 rounded-full" />
                                  <p className="text-gray-500 text-xs font-medium">Section {si + 1}</p>
                                </div>
                                {lesson.sections.length > 1 && (
                                  <button type="button" onClick={() => deleteSection(lesson.id, section.id)}
                                    className="text-red-400 hover:text-red-500 text-xs transition">Remove</button>
                                )}
                              </div>
                              <div className="p-4 flex flex-col gap-3">
                                <div>
                                  <label className={labelClass}>Heading <span className="text-gray-300 text-xs font-normal ml-1">(optional)</span></label>
                                  <input type="text" value={section.heading} onChange={e => updateSection(lesson.id, section.id, 'heading', e.target.value)}
                                    placeholder="e.g. What is Phishing?" className={inputClass} />
                                </div>
                                <div>
                                  <label className={labelClass}>Body Text <span className="text-red-400">*</span></label>
                                  <textarea value={section.body} onChange={e => updateSection(lesson.id, section.id, 'body', e.target.value)}
                                    placeholder="Explain this section..." rows={3} className={`${inputClass} resize-none`} required />
                                </div>
                                <div>
                                  <label className={labelClass}>Bullet Label <span className="text-gray-300 text-xs font-normal ml-1">(optional)</span></label>
                                  <input type="text" value={section.bulletLabel} onChange={e => updateSection(lesson.id, section.id, 'bulletLabel', e.target.value)}
                                    placeholder="e.g. Common examples include:" className={inputClass} />
                                </div>
                                <div>
                                  <label className={labelClass}>Bullet Points <span className="text-gray-300 text-xs font-normal ml-1">(optional)</span></label>
                                  <div className="flex flex-col gap-2">
                                    {section.bullets.map((bullet, bi) => (
                                      <div key={bi} className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                        <input type="text" value={bullet} onChange={e => updateBullet(lesson.id, section.id, bi, e.target.value)}
                                          placeholder={`Bullet ${bi + 1}`} className={inputClass} />
                                        {section.bullets.length > 1 && (
                                          <button type="button" onClick={() => deleteBullet(lesson.id, section.id, bi)}
                                            className="text-gray-300 hover:text-red-400 transition flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addBullet(lesson.id, section.id)}
                                      className="flex items-center gap-1 text-gray-400 hover:text-blue-500 text-xs font-medium transition mt-0.5 ml-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                      Add bullet
                                    </button>
                                  </div>
                                </div>

                                {(section.heading || section.body || section.bullets.some(b => b)) && (
                                  <div>
                                    <p className="text-gray-400 text-xs mb-2">Preview</p>
                                    <div className="bg-[#1a2744] rounded-lg p-4">
                                      {section.heading && <div className="flex items-center gap-2 mb-2"><div className="w-0.5 h-4 bg-blue-400 rounded-full flex-shrink-0" /><p className="text-blue-300 font-semibold text-sm">{section.heading}</p></div>}
                                      {section.body && <p className="text-gray-300 text-xs leading-relaxed mb-2 ml-2.5">{section.body}</p>}
                                      {section.bullets.some(b => b) && (
                                        <div className="ml-2.5 bg-[#243860] rounded-lg p-3">
                                          {section.bulletLabel && <p className="text-blue-400 text-xs font-semibold mb-2">{section.bulletLabel}</p>}
                                          {section.bullets.filter(b => b).map((b, i) => (
                                            <div key={i} className="flex items-center gap-2 mb-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                              <p className="text-gray-200 text-xs">{b}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          <button type="button" onClick={() => addSection(lesson.id)}
                            className="flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 text-xs font-medium py-2.5 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Section
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={addLesson}
                    className="flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-gray-300 bg-white text-gray-400 hover:text-gray-600 text-xs font-medium py-3 rounded-xl transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Lesson
                  </button>
                </div>

                {/* Quiz */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-700 text-sm font-semibold">Quiz Questions</p>
                    <button type="button" onClick={addQuestion}
                      className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Question
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {questions.map((q, qi) => (
                      <div key={q.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-500 text-xs font-medium">Question {qi + 1}</span>
                          {questions.length > 1 && (
                            <button type="button" onClick={() => deleteQuestion(q.id)}
                              className="text-red-400 hover:text-red-500 text-xs transition">Remove</button>
                          )}
                        </div>
                        <div className="mb-3">
                          <label className={labelClass}>Question <span className="text-red-400">*</span></label>
                          <textarea value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                            placeholder="Enter your question..." rows={2} className={`${inputClass} resize-none`} required />
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-500 text-xs font-medium">Answer Options <span className="text-red-400">*</span></label>
                            <p className="text-gray-300 text-xs">Click to mark correct</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {q.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <button type="button" onClick={() => setCorrect(q.id, i)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                                    ${q.correctIndex === i ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200 bg-white hover:border-emerald-400'}`}>
                                  {q.correctIndex === i && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </button>
                                <input type="text" value={opt} onChange={e => updateOption(q.id, i, e.target.value)}
                                  placeholder={`Option ${i + 1}`}
                                  className={`${inputClass} flex-1 ${q.correctIndex === i ? 'border-emerald-200 bg-emerald-50' : ''}`} required />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Explanation <span className="text-red-400">*</span></label>
                          <textarea value={q.explanation} onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                            placeholder="Explain why the correct answer is right..." rows={2} className={`${inputClass} resize-none`} required />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addQuestion}
                    className="mt-3 flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 text-xs font-medium py-2.5 rounded-lg w-full transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Another Question
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 pb-6">
                  <button type="button" onClick={() => navigate('/admin/training')}
                    className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className={`px-6 py-2.5 rounded-lg text-xs font-medium transition
                      ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

          ) : (
            <div className="max-w-sm mx-auto mt-16">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-gray-800 text-base font-semibold mb-1">Module updated</p>
                <p className="text-gray-400 text-xs mb-5">{moduleData.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setSubmitted(false); setError('') }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                    Edit Again
                  </button>
                  <button onClick={() => navigate('/admin/training')}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition">
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

export default EditModule