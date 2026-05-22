import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function generateSimulationsPrompt(userMessage) {
  return `You are an AI assistant that helps cybersecurity administrators create simulation questions for a cybersecurity awareness training platform called Averion.

The admin has requested: "${userMessage}"

Generate cybersecurity simulation questions based on the request. Each simulation must be UNIQUE and different from the others.

Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Just the raw JSON array.

Each simulation object must have exactly these fields:
{
  "scenarioName": "string - unique scenario name",
  "question": "string - the question text",
  "category": "string - one of: Phishing Detection, Password Security, Social Engineering, Data Privacy, Network Security",
  "difficulty": "string - one of: Easy, Medium, Hard",
  "options": ["option1", "option2", "option3", "option4"],
  "correctIndex": number between 0-3,
  "explanation": "string - why the correct answer is correct"
}

Rules:
- Make each scenario UNIQUE with different settings, characters, attack methods
- Use realistic workplace scenarios
- Mix different difficulty levels
- Make wrong answers plausible but clearly incorrect to security experts
- Keep questions clear and concise`
}

async function callAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return JSON.parse(data.choices[0].message.content.trim())
}

function shuffleSim(sim) {
  const correct = sim.options[sim.correctIndex]
  const shuffled = [...sim.options].sort(() => Math.random() - 0.5)
  return { ...sim, options: shuffled, correctIndex: shuffled.indexOf(correct) }
}

function AddSimulation() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [correctOption, setCorrectOption] = useState(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: `Hi! I'm your AI Assist 🤖\n\nI can generate cybersecurity simulations for you automatically!\n\nJust tell me what you need, for example:\n"3 phishing, 4 password security and 2 social engineering"\n\nOr describe a specific scenario you have in mind!`
    }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedSims, setGeneratedSims] = useState([])
  const [showGenerated, setShowGenerated] = useState(false)
  const chatEndRef = useRef(null)

  const [formData, setFormData] = useState({
    scenarioName: '',
    question: '',
    category: 'Password Security',
    difficulty: '',
    options: ['', '', '', ''],
    explanation: '',
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleOptionChange(index, value) {
    const updatedOptions = [...formData.options]
    updatedOptions[index] = value
    setFormData({ ...formData, options: updatedOptions })
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (correctOption === null) { alert('Please select the correct answer.'); return }
    if (!profile?.id) return

    setLoading(true); setError('')

    try {
      let imageUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('simulation-images').upload(fileName, imageFile)
        if (uploadError) { setError('Failed to upload image: ' + uploadError.message); setLoading(false); return }
        const { data: urlData } = supabase.storage.from('simulation-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const { error: simError } = await supabase.from('simulations').insert({
        scenario_name: formData.scenarioName,
        question: formData.question,
        category: formData.category,
        difficulty: formData.difficulty,
        type: imageFile ? 'image' : 'text',
        image_url: imageUrl,
        options: formData.options,
        correct_index: correctOption,
        explanation: formData.explanation,
        hidden: false,
        organization_id: profile.id,
      })

      if (simError) { setError('Failed to save simulation: ' + simError.message); setLoading(false); return }
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAiSend() {
    if (!aiInput.trim() || aiLoading) return
    const userMessage = aiInput.trim()
    setAiInput(''); setAiLoading(true)
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setAiMessages(prev => [...prev, { role: 'ai', text: 'Generating...', loading: true }])

    try {
      const parsed = await callAI(generateSimulationsPrompt(userMessage))
      const sims = (Array.isArray(parsed) ? parsed : [parsed]).map(shuffleSim)
      setGeneratedSims(sims); setShowGenerated(true)
      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: `✓ ${sims.length} simulation${sims.length > 1 ? 's' : ''} generated — scroll down to review.`
      }])
    } catch (err) {
      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || 'Something went wrong.'}` }])
    }
    setAiLoading(false)
  }

  function handleDeleteGenerated(index) { setGeneratedSims(prev => prev.filter((_, i) => i !== index)) }

  function handleLoadToForm(sim) {
    setFormData({ scenarioName: sim.scenarioName, question: sim.question, category: sim.category, difficulty: sim.difficulty, options: sim.options, explanation: sim.explanation })
    setCorrectOption(sim.correctIndex); setAiPanelOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleRegenerateOne(index) {
    const sim = generatedSims[index]; setAiLoading(true)
    try {
      const prompt = generateSimulationsPrompt(`1 ${sim.category} simulation, different from: "${sim.scenarioName}"`)
      const parsed = await callAI(prompt)
      const raw = Array.isArray(parsed) ? parsed[0] : parsed
      const newSim = shuffleSim(raw)
      setGeneratedSims(prev => prev.map((s, i) => i === index ? newSim : s))
    } catch (err) {
      alert('Failed to regenerate: ' + (err.message || 'Please try again.'))
    }
    setAiLoading(false)
  }

  async function handleSaveAll() {
    if (!profile?.id) return
    setLoading(true); setError('')
    try {
      const rows = generatedSims.map(sim => ({
        scenario_name: sim.scenarioName, question: sim.question, category: sim.category,
        difficulty: sim.difficulty, type: 'text', image_url: null, options: sim.options,
        correct_index: sim.correctIndex, explanation: sim.explanation, hidden: false, organization_id: profile.id,
      }))
      const { error: simError } = await supabase.from('simulations').insert(rows)
      if (simError) { setError('Failed to save simulations: ' + simError.message); setLoading(false); return }
      setGeneratedSims([]); setShowGenerated(false)
      alert(`${rows.length} simulations saved successfully!`)
    } catch (err) { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  function getDifficultyColor(difficulty) {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">

            {!submitted ? (
              <div className="w-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-gray-900 text-2xl font-bold">Add Simulation</h1>
                    <p className="text-gray-400 text-sm mt-1">Create a new cybersecurity simulation question</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setAiPanelOpen(!aiPanelOpen)}
                      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition
                        ${aiPanelOpen ? 'bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      AI Assist
                    </button>
                    <label className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {imagePreview && (
                  <div className="mb-6 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <img src={imagePreview} alt="Uploaded scenario" className="w-full max-h-64 object-contain p-6" />
                    <div className="px-5 pb-4 flex justify-between items-center border-t border-gray-50">
                      <p className="text-gray-400 text-xs">Scenario image uploaded</p>
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                        className="text-red-400 hover:text-red-600 text-xs font-semibold transition">Remove</button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Scenario Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" name="scenarioName" value={formData.scenarioName} onChange={handleChange}
                      placeholder="e.g. Phishing Email from IT Department"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Question <span className="text-red-400">*</span>
                    </label>
                    <textarea name="question" value={formData.question} onChange={handleChange}
                      placeholder="Describe the scenario and ask what the user should do..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                      required />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* ── Category: free text + suggestions ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g. Phishing Detection"
                        list="category-options"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <datalist id="category-options">
                        <option value="Password Security" />
                        <option value="Phishing Detection" />
                        <option value="Social Engineering" />
                        <option value="Data Privacy" />
                        <option value="Network Security" />
                      </datalist>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                        Difficulty <span className="text-red-400">*</span>
                      </label>
                      <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required>
                        <option value="">Select level</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                        Answer Options <span className="text-red-400">*</span>
                      </label>
                      <p className="text-gray-400 text-xs">Click a row to mark the correct answer</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {formData.options.map((option, index) => (
                        <div key={index}
                          onClick={() => setCorrectOption(index)}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition cursor-pointer
                            ${correctOption === index ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                            ${correctOption === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                            {correctOption === index
                              ? <div className="w-3 h-3 rounded-full bg-white" />
                              : <span className="text-gray-400 text-xs font-bold">{optionLabels[index]}</span>
                            }
                          </div>
                          <input type="text" value={option}
                            onChange={(e) => { e.stopPropagation(); handleOptionChange(index, e.target.value) }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={`Option ${optionLabels[index]} — enter answer here`}
                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none"
                            required />
                          {correctOption === index && (
                            <span className="text-blue-600 text-xs font-bold flex-shrink-0">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Explanation <span className="text-red-400">*</span>
                    </label>
                    <textarea name="explanation" value={formData.explanation} onChange={handleChange}
                      placeholder="Explain why the correct answer is right and what makes the others wrong..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                      required />
                  </div>

                  <div className="flex justify-between pt-2 pb-10">
                    <button type="button" onClick={() => navigate('/admin/simulations')}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className={`px-10 py-2.5 rounded-xl text-sm font-bold transition
                        ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {loading ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>

                </form>

                {/* Generated Simulations */}
                {showGenerated && generatedSims.length > 0 && (
                  <div className="pb-10">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-gray-800 font-bold">{generatedSims.length} Simulation{generatedSims.length > 1 ? 's' : ''} Generated</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Review, edit or delete before saving</p>
                      </div>
                      <button onClick={handleSaveAll} disabled={loading}
                        className={`font-bold text-sm px-5 py-2.5 rounded-xl transition
                          ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {loading ? 'Saving...' : `Save All ${generatedSims.length}`}
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {generatedSims.map((sim, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-300 text-xs font-bold">#{index + 1}</span>
                              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-lg">{sim.category}</span>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(sim.difficulty)}`}>{sim.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleLoadToForm(sim)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">Load</button>
                              <button onClick={() => handleRegenerateOne(index)} disabled={aiLoading} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">Redo</button>
                              <button onClick={() => handleDeleteGenerated(index)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">Delete</button>
                            </div>
                          </div>

                          <p className="text-gray-800 font-bold text-sm mb-1">{sim.scenarioName}</p>
                          <p className="text-gray-500 text-sm mb-5 leading-relaxed">{sim.question}</p>

                          <div className="flex flex-col gap-2 mb-4">
                            {sim.options.map((opt, i) => (
                              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border
                                ${i === sim.correctIndex ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                                  ${i === sim.correctIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                  {optionLabels[i]}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>

                          <div className="bg-blue-50 rounded-xl px-4 py-3">
                            <p className="text-blue-600 text-xs leading-relaxed"><span className="font-bold">Why: </span>{sim.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (

              <div className="max-w-md mx-auto mt-24 text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-gray-800 text-xl font-bold mb-2">Question Saved!</h2>
                  <p className="text-gray-400 text-sm mb-8">The simulation question has been created successfully.</p>

                  <div className="bg-gray-50 rounded-xl p-5 text-left mb-8">
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Scenario', value: formData.scenarioName },
                        { label: 'Type', value: imagePreview ? 'Image + Text' : 'Text Only' },
                        { label: 'Category', value: formData.category },
                        { label: 'Difficulty', value: formData.difficulty },
                        { label: 'Correct Answer', value: `Option ${optionLabels[correctOption]}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <p className="text-gray-400 text-xs">{item.label}</p>
                          <p className="text-gray-700 text-xs font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => {
                      setFormData({ scenarioName: '', question: '', category: 'Password Security', difficulty: '', options: ['', '', '', ''], explanation: '' })
                      setCorrectOption(null); setImagePreview(null); setImageFile(null); setSubmitted(false); setError('')
                    }} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                      Add Another
                    </button>
                    <button onClick={() => navigate('/admin/simulations')}
                      className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                      View All
                    </button>
                  </div>
                </div>
              </div>

            )}
          </div>

          {/* ── Sleek AI Chat Panel — sits below topbar ── */}
          {aiPanelOpen && (
            <div className="fixed right-0 top-[49px] h-[calc(100vh-49px)] w-80 bg-[#0d1117] border-l border-white border-opacity-5 flex flex-col z-30">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white border-opacity-5 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">AI Assist</p>
                    <p className="text-gray-500 text-xs">GPT-4o</p>
                  </div>
                </div>
                <button onClick={() => setAiPanelOpen(false)}
                  className="text-gray-600 hover:text-gray-300 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 hide-scrollbar">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[200px] px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap
                      ${msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : msg.loading
                          ? 'bg-white bg-opacity-5 text-gray-500'
                          : 'bg-white bg-opacity-5 text-gray-300 rounded-bl-sm'
                      }`}>
                      {msg.loading ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-white border-opacity-5 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white bg-opacity-5 rounded-xl px-3 py-2.5">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="e.g. 3 phishing simulations..."
                    className="flex-1 bg-transparent text-gray-300 placeholder-gray-600 text-xs outline-none"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={aiLoading || !aiInput.trim()}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition
                      ${aiLoading || !aiInput.trim()
                        ? 'bg-white bg-opacity-5 text-gray-600 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                      }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700 text-xs text-center mt-2">Press Enter to send</p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AddSimulation