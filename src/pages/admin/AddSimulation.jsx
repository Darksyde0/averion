import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
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

function AddSimulation() {
  const navigate = useNavigate()
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
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (correctOption === null) {
      alert('Please select the correct answer.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('simulation-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          setError('Failed to upload image: ' + uploadError.message)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from('simulation-images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      // Insert simulation into Supabase
      const { error: simError } = await supabase
        .from('simulations')
        .insert({
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
        })

      if (simError) {
        setError('Failed to save simulation: ' + simError.message)
        setLoading(false)
        return
      }

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
    setAiInput('')
    setAiLoading(true)

    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setAiMessages(prev => [...prev, { role: 'ai', text: '⏳ Generating your simulations...', loading: true }])

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: generateSimulationsPrompt(userMessage) }]
        })
      })

      const data = await response.json()
      const rawText = data.content[0].text.trim()
      const parsed = JSON.parse(rawText)

      setGeneratedSims(parsed)
      setShowGenerated(true)

      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Done! I generated **${parsed.length} simulation${parsed.length > 1 ? 's' : ''}** for you!\n\nScroll down to review them. You can:\n• ✏️ Edit any simulation\n• 🗑️ Delete ones you don't want\n• 🔄 Regenerate specific ones\n• 💾 Save all to your list`
      }])

    } catch (err) {
      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, { role: 'ai', text: '❌ Sorry, something went wrong. Please try again.' }])
    }

    setAiLoading(false)
  }

  function handleDeleteGenerated(index) {
    setGeneratedSims(prev => prev.filter((_, i) => i !== index))
  }

  function handleEditGenerated(index, field, value) {
    setGeneratedSims(prev => prev.map((sim, i) =>
      i === index ? { ...sim, [field]: value } : sim
    ))
  }

  function handleLoadToForm(sim) {
    setFormData({
      scenarioName: sim.scenarioName,
      question: sim.question,
      category: sim.category,
      difficulty: sim.difficulty,
      options: sim.options,
      explanation: sim.explanation,
    })
    setCorrectOption(sim.correctIndex)
    setAiPanelOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleRegenerateOne(index) {
    const sim = generatedSims[index]
    setAiLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: generateSimulationsPrompt(`1 ${sim.category} simulation, different from: "${sim.scenarioName}"`)
          }]
        })
      })

      const data = await response.json()
      const parsed = JSON.parse(data.content[0].text.trim())
      const newSim = Array.isArray(parsed) ? parsed[0] : parsed
      setGeneratedSims(prev => prev.map((s, i) => i === index ? newSim : s))
    } catch (err) {
      alert('Failed to regenerate. Please try again.')
    }

    setAiLoading(false)
  }

  // ── Save all generated simulations to Supabase ──
  async function handleSaveAll() {
    setLoading(true)
    setError('')

    try {
      const rows = generatedSims.map(sim => ({
        scenario_name: sim.scenarioName,
        question: sim.question,
        category: sim.category,
        difficulty: sim.difficulty,
        type: 'text',
        image_url: null,
        options: sim.options,
        correct_index: sim.correctIndex,
        explanation: sim.explanation,
        hidden: false,
      }))

      const { error: simError } = await supabase
        .from('simulations')
        .insert(rows)

      if (simError) {
        setError('Failed to save simulations: ' + simError.message)
        setLoading(false)
        return
      }

      setGeneratedSims([])
      setShowGenerated(false)
      alert(`${rows.length} simulations saved successfully!`)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getDifficultyColor(difficulty) {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

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

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — form */}
          <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${aiPanelOpen ? 'mr-96' : ''}`}>

            {!submitted ? (
              <div className="max-w-4xl">

                {/* Page heading */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-gray-800 text-3xl font-bold">Question Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage simulation questions</p>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    {/* AI Assist button */}
                    <button
                      onClick={() => setAiPanelOpen(!aiPanelOpen)}
                      className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition
                        ${aiPanelOpen ? 'bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      AI Assist
                    </button>

                    {/* Upload Image button */}
                    <div className="flex flex-col items-end gap-1">
                      <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl cursor-pointer transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <p className="text-gray-400 text-xs">Optional — skip if text only</p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-6">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Image preview */}
                {imagePreview && (
                  <div className="mb-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <img src={imagePreview} alt="Uploaded scenario" className="w-full max-h-64 object-contain p-4" />
                    <div className="px-4 pb-3 flex justify-between items-center">
                      <p className="text-gray-500 text-xs">Uploaded scenario image</p>
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }} className="text-red-400 hover:text-red-600 text-xs font-semibold transition">Remove</button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-gray-800 text-lg font-bold">Add New Question</h2>
                      <p className="text-gray-500 text-sm">Select the radio button to mark the correct answer</p>
                    </div>

                    {/* Scenario Name */}
                    <div className="mb-5">
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Scenario Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="scenarioName"
                        value={formData.scenarioName}
                        onChange={handleChange}
                        placeholder="Enter a name for this scenario e.g. Phishing Email Attack..."
                        className="w-full bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>

                    {/* Question Text */}
                    <div className="mb-5">
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Question Text <span className="text-red-500">*</span></label>
                      <textarea
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="Enter the question text...."
                        rows={3}
                        className="w-full bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                    </div>

                    {/* Category + Difficulty */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-gray-700 text-sm font-semibold mb-2 block">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                          <option>Password Security</option>
                          <option>Phishing Detection</option>
                          <option>Social Engineering</option>
                          <option>Data Privacy</option>
                          <option>Network Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-semibold mb-2 block">Difficulty</label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                          required
                        >
                          <option value="">Select Difficulty</option>
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Answer options */}
                    <div className="mb-5">
                      <label className="text-gray-700 text-sm font-semibold mb-3 block">Answer Options <span className="text-red-500">*</span></label>
                      <div className="flex flex-col gap-3">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setCorrectOption(index)}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                                ${correctOption === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-gray-100 hover:border-blue-400'}`}
                            >
                              {correctOption === index && <div className="w-3 h-3 rounded-full bg-white" />}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Explanation <span className="text-red-500">*</span></label>
                      <textarea
                        name="explanation"
                        value={formData.explanation}
                        onChange={handleChange}
                        placeholder="Explain why this is the correct answer..."
                        rows={3}
                        className="w-full bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                    </div>

                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between pb-8">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/simulations')}
                      className="px-8 py-3 rounded-xl text-sm font-bold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-10 py-3 rounded-xl text-sm font-bold transition
                        ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {loading ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>

                </form>

                {/* Generated Simulations Review */}
                {showGenerated && generatedSims.length > 0 && (
                  <div className="mt-8 pb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-gray-800 text-xl font-bold">
                        ✅ {generatedSims.length} Simulations Generated
                      </h2>
                      <button
                        onClick={handleSaveAll}
                        disabled={loading}
                        className={`font-bold text-sm px-6 py-2 rounded-xl transition
                          ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {loading ? 'Saving...' : `Save All ${generatedSims.length}`}
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {generatedSims.map((sim, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">#{index + 1}</span>
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{sim.category}</span>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(sim.difficulty)}`}>{sim.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLoadToForm(sim)} className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                Load to Form
                              </button>
                              <button onClick={() => handleRegenerateOne(index)} disabled={aiLoading} className="text-xs font-semibold px-3 py-1 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                                🔄 Regenerate
                              </button>
                              <button onClick={() => handleDeleteGenerated(index)} className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-800 font-bold text-base mb-2">{sim.scenarioName}</p>
                          <p className="text-gray-600 text-sm mb-4">{sim.question}</p>

                          <div className="flex flex-col gap-2 mb-4">
                            {sim.options.map((opt, i) => (
                              <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm border
                                ${i === sim.correctIndex ? 'bg-green-50 border-green-300 text-green-800 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                {i === sim.correctIndex && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                                {opt}
                              </div>
                            ))}
                          </div>

                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-blue-700 text-xs leading-relaxed"><span className="font-bold">Explanation: </span>{sim.explanation}</p>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (

              // Success view
              <div className="max-w-lg mx-auto mt-20 text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-gray-800 text-2xl font-bold mb-2">Question Saved!</h2>
                  <p className="text-gray-500 text-sm mb-8">The simulation question has been created successfully.</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left mb-8">
                    <p className="text-gray-700 text-sm font-bold mb-3">Question Summary</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">Scenario Name</p>
                        <p className="text-gray-800 text-xs font-semibold">{formData.scenarioName}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">Type</p>
                        <p className="text-gray-800 text-xs font-semibold">{imagePreview ? 'Image + Text' : 'Text Only'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">Category</p>
                        <p className="text-gray-800 text-xs font-semibold">{formData.category}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">Difficulty</p>
                        <p className="text-gray-800 text-xs font-semibold">{formData.difficulty}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">Correct Answer</p>
                        <p className="text-gray-800 text-xs font-semibold">Option {correctOption + 1}: {formData.options[correctOption]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setFormData({ scenarioName: '', question: '', category: 'Password Security', difficulty: '', options: ['', '', '', ''], explanation: '' })
                        setCorrectOption(null)
                        setImagePreview(null)
                        setImageFile(null)
                        setSubmitted(false)
                        setError('')
                      }}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                      Add Another
                    </button>
                    <button
                      onClick={() => navigate('/admin/simulations')}
                      className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      View Simulations
                    </button>
                  </div>
                </div>
              </div>

            )}
          </div>

          {/* Right — AI Chat Panel */}
          {aiPanelOpen && (
            <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col z-40">

              <div className="bg-purple-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">AI Assist</p>
                    <p className="text-purple-200 text-xs">Simulation Generator</p>
                  </div>
                </div>
                <button onClick={() => setAiPanelOpen(false)} className="text-white hover:text-purple-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="e.g. 3 phishing, 4 password..."
                    className="flex-1 bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={aiLoading || !aiInput.trim()}
                    className={`px-4 py-3 rounded-xl transition flex-shrink-0
                      ${aiLoading || !aiInput.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">Press Enter or click send</p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AddSimulation