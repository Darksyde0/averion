import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function generateSimulationsPrompt(userMessage) {
  return `You are ARIA — Averion Risk Intelligence Assistant. You help cybersecurity administrators create simulation questions for a cybersecurity awareness training platform called Averion.

The admin has requested: "${userMessage}"

Generate cybersecurity simulation questions based on the request.

Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Just the raw JSON array.

Each simulation object must have exactly these fields:
{
  "scenarioName": "string - unique scenario name",
  "question": "string - a rich, detailed, multi-sentence real-world scenario. Paint a vivid picture with context, urgency, emotions, or time pressure. The user must pause and think carefully before answering. Minimum 3-4 sentences.",
  "category": "string - derive the most accurate category from the scenario. Use common cybersecurity categories like: Phishing Detection, Password Security, Social Engineering, Data Privacy, Network Security, Ransomware, USB & Physical Security, Insider Threat, Email Security, Mobile Security, Cloud Security, Zero-Day Awareness — or create a new accurate category if none fit",
  "difficulty": "string - one of: Easy, Medium, Hard",
  "threatLevel": "string - one of: Low, Medium, High, Critical — how dangerous this attack would be in real life if the user fell for it",
  "attackTechnique": "string - the specific attack method e.g. Spear Phishing, Pretexting, Credential Harvesting, Vishing, Smishing, Baiting, Tailgating, Watering Hole, Ransomware Delivery, Business Email Compromise, MFA Fatigue, Quid Pro Quo",
  "learningObjective": "string - one clear sentence: what the user should take away from this scenario",
  "options": ["option1", "option2", "option3", "option4"],
  "correctIndex": number between 0-3,
  "explanation": "string - detailed explanation of why the correct answer is right, what red flags were present in the scenario, and why each wrong answer is incorrect"
}

Rules:
- RANDOMIZE the order of simulations — do NOT group by category. If the admin requests 3 phishing and 4 password, shuffle them so they appear in random mixed order
- Each scenario must be UNIQUE — different settings, attack vectors, and emotional triggers
- VARY the perspective — do NOT always use a named character. Mix these naturally, never the same style twice in a row:
    * "You" perspective: "You receive an email..."
    * Named character: "Sarah from accounting notices..."
    * Role-based: "A new employee on your team..."
    * Team context: "Your IT department sends a message..."
- Create real tension — use urgency, authority, fear, or curiosity
- Mix difficulty levels naturally
- Wrong answers must be plausible — a distracted user could realistically pick them
- NEVER force a category — always derive it accurately from the content
- Respect the admin's requested types and quantities exactly
- The explanation must be educational — explain specific red flags, not just "A is correct"
- threatLevel reflects real-world danger, not question difficulty
- attackTechnique should be specific and accurate to the scenario`
}

async function callAI(prompt) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-simulations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    }
  )
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return Array.isArray(data) ? data : [data]
}

function shuffleSim(sim) {
  const correct = sim.options[sim.correctIndex]
  const shuffled = [...sim.options].sort(() => Math.random() - 0.5)
  return { ...sim, options: shuffled, correctIndex: shuffled.indexOf(correct) }
}

function generateBatchId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function ThreatBadge({ level }) {
  const styles = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
  }
  const dots = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500',
  }
  if (!level) return null
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${styles[level] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[level] || 'bg-gray-400'}`} />
      {level} Threat
    </span>
  )
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
  const [expiryDate, setExpiryDate] = useState('')
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: `Hello 👋 I'm ARIA — Averion's Risk Intelligence Assistant.\n\nDescribe what you need and I'll generate professional, realistic simulations instantly.\n\nExamples:\n· "3 phishing and 4 password security"\n· "5 social engineering, hard difficulty"\n· "2 USB drop attack simulations"\n· "Mix of 10 across any categories"\n\nNot limited to these — request any cybersecurity topic and I'll build it. Ransomware, deepfake scams, supply chain attacks, insider threats — anything.\n\nEach simulation includes a threat level, attack technique, and learning objective.`
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
      const batchId = generateBatchId()
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
        batch_id: batchId,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
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
        text: `✓ ${sims.length} simulation${sims.length > 1 ? 's' : ''} generated & randomized — scroll down to review.`
      }])
    } catch (err) {
      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || 'Something went wrong.'}` }])
    }
    setAiLoading(false)
  }

  function handleDeleteGenerated(index) {
    setGeneratedSims(prev => prev.filter((_, i) => i !== index))
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
    const sim = generatedSims[index]; setAiLoading(true)
    try {
      const prompt = generateSimulationsPrompt(`1 ${sim.category} simulation, completely different from: "${sim.scenarioName}". Use a different perspective, character, company, and attack method.`)
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
      const batchId = generateBatchId()
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
        organization_id: profile.id,
        batch_id: batchId,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
      }))
      const { error: simError } = await supabase.from('simulations').insert(rows)
      if (simError) { setError('Failed to save simulations: ' + simError.message); setLoading(false); return }
      setGeneratedSims([]); setShowGenerated(false)
      alert(`${rows.length} simulations saved successfully!`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getDifficultyColor(d) {
    if (d === 'Easy') return 'bg-green-100 text-green-700'
    if (d === 'Medium') return 'bg-yellow-100 text-yellow-700'
    if (d === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  function isExpiringSoon(dateStr) {
    if (!dateStr) return false
    return new Date(dateStr) < new Date(Date.now() + 86400000 * 2)
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

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-gray-900 text-2xl font-bold">Add Simulation</h1>
                    <p className="text-gray-400 text-sm mt-1">Create a new cybersecurity simulation question</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setAiPanelOpen(!aiPanelOpen)}
                      className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition
                        ${aiPanelOpen ? 'bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
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

                  {/* Scenario Name */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Scenario Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" name="scenarioName" value={formData.scenarioName} onChange={handleChange}
                      placeholder="e.g. Phishing Email from IT Department"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required />
                  </div>

                  {/* Scenario */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Scenario <span className="text-red-400">*</span>
                    </label>
                    <textarea name="question" value={formData.question} onChange={handleChange}
                      placeholder="Describe a realistic, detailed scenario. Include context, urgency, and a clear decision point for the user..."
                      rows={6}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                      required />
                    <p className="text-gray-400 text-xs mt-2">Tip: The richer and more realistic the scenario, the more effective the training.</p>
                  </div>

                  {/* Category + Difficulty */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">Category</label>
                      <input type="text" name="category" value={formData.category} onChange={handleChange}
                        placeholder="e.g. Phishing Detection" list="category-options"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                      <datalist id="category-options">
                        <option value="Password Security" />
                        <option value="Phishing Detection" />
                        <option value="Social Engineering" />
                        <option value="Data Privacy" />
                        <option value="Network Security" />
                        <option value="Ransomware" />
                        <option value="USB & Physical Security" />
                        <option value="Insider Threat" />
                        <option value="Email Security" />
                        <option value="Mobile Security" />
                        <option value="Cloud Security" />
                        <option value="Zero-Day Awareness" />
                      </datalist>
                      <p className="text-gray-400 text-xs mt-2">Type any category — not limited to the list</p>
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

                  {/* Expiry Date */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-3">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Expiry Date</label>
                      <span className="text-gray-400 text-xs">Optional</span>
                    </div>
                    <input type="datetime-local" value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    <div className="flex items-center gap-2 mt-2.5">
                      {expiryDate ? (
                        <>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isExpiringSoon(expiryDate) ? 'bg-red-400' : 'bg-green-400'}`} />
                          <p className={`text-xs ${isExpiringSoon(expiryDate) ? 'text-red-500' : 'text-gray-400'}`}>
                            {isExpiringSoon(expiryDate)
                              ? 'Expiring very soon — consider a later date'
                              : `Expires ${new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                          <button type="button" onClick={() => setExpiryDate('')}
                            className="ml-auto text-gray-400 hover:text-red-500 text-xs font-semibold transition">Clear</button>
                        </>
                      ) : (
                        <p className="text-gray-400 text-xs">Leave empty for no expiry — simulation stays active indefinitely</p>
                      )}
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                        Answer Options <span className="text-red-400">*</span>
                      </label>
                      <p className="text-gray-400 text-xs">Click a row to mark the correct answer</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {formData.options.map((option, index) => (
                        <div key={index} onClick={() => setCorrectOption(index)}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition cursor-pointer
                            ${correctOption === index ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                            ${correctOption === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                            {correctOption === index
                              ? <div className="w-3 h-3 rounded-full bg-white" />
                              : <span className="text-gray-400 text-xs font-bold">{optionLabels[index]}</span>}
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

                  {/* Explanation */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3 block">
                      Explanation <span className="text-red-400">*</span>
                    </label>
                    <textarea name="explanation" value={formData.explanation} onChange={handleChange}
                      placeholder="Explain why the correct answer is right, what red flags to look for, and why the other options are wrong..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                      required />
                  </div>

                  {/* Actions */}
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

                {/* ── Generated Simulations ── */}
                {showGenerated && generatedSims.length > 0 && (
                  <div className="pb-10">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-gray-800 font-bold">{generatedSims.length} Simulation{generatedSims.length > 1 ? 's' : ''} Generated</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Randomized order — review each before saving</p>
                      </div>
                      <button onClick={handleSaveAll} disabled={loading}
                        className={`font-bold text-sm px-5 py-2.5 rounded-xl transition
                          ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {loading ? 'Saving...' : `Save All ${generatedSims.length}`}
                      </button>
                    </div>

                    {expiryDate && (
                      <div className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-2 border
                        ${isExpiringSoon(expiryDate) ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 flex-shrink-0 ${isExpiringSoon(expiryDate) ? 'text-red-400' : 'text-amber-500'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-xs font-medium ${isExpiringSoon(expiryDate) ? 'text-red-600' : 'text-amber-700'}`}>
                          This batch will expire on {new Date(expiryDate).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <p className="text-violet-700 text-xs">All {generatedSims.length} simulations will be saved as a single batch — users will complete them together in this randomized order.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {generatedSims.map((sim, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-300 text-xs font-bold">#{index + 1}</span>
                              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-lg">{sim.category}</span>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(sim.difficulty)}`}>{sim.difficulty}</span>
                              {sim.threatLevel && <ThreatBadge level={sim.threatLevel} />}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => handleLoadToForm(sim)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">Load</button>
                              <button onClick={() => handleRegenerateOne(index)} disabled={aiLoading} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">Redo</button>
                              <button onClick={() => handleDeleteGenerated(index)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">Delete</button>
                            </div>
                          </div>

                          {sim.attackTechnique && (
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 w-fit mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                              </svg>
                              <span className="text-gray-600 text-xs font-semibold">{sim.attackTechnique}</span>
                            </div>
                          )}

                          <p className="text-gray-800 font-bold text-sm mb-3">{sim.scenarioName}</p>

                          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed">{sim.question}</p>
                          </div>

                          {sim.learningObjective && (
                            <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                              </svg>
                              <div>
                                <p className="text-indigo-600 text-xs font-bold mb-0.5">Learning Objective</p>
                                <p className="text-indigo-700 text-xs leading-relaxed">{sim.learningObjective}</p>
                              </div>
                            </div>
                          )}

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
                            <p className="text-blue-700 text-xs font-bold mb-1">Explanation</p>
                            <p className="text-blue-600 text-xs leading-relaxed">{sim.explanation}</p>
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
                        { label: 'Expires', value: expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never' },
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
                      setCorrectOption(null); setImagePreview(null); setImageFile(null)
                      setSubmitted(false); setError(''); setExpiryDate('')
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

          {/* ── ARIA Panel ── */}
          {aiPanelOpen && (
            <div
              className="fixed right-0 top-[49px] h-[calc(100vh-49px)] w-96 flex flex-col z-30 overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%)' }}>

              {/* Top accent line */}
              <div className="h-px w-full flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }} />

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                      style={{ borderColor: '#0a0a0f' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-bold tracking-wide">ARIA</p>
                      <span className="px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'rgba(109,40,217,0.3)', color: '#a78bfa', fontSize: '10px' }}>
                        GPT-4o
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Averion Risk Intelligence Assistant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAiPanelOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
                style={{ scrollbarWidth: 'none' }}>
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[240px] px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap
                        ${msg.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
                      style={msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', color: '#fff' }
                        : msg.loading
                          ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }
                          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.06)' }
                      }>
                      {msg.loading ? (
                        <span className="flex items-center gap-1.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: 'rgba(255,255,255,0.4)', animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: 'rgba(255,255,255,0.4)', animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: 'rgba(255,255,255,0.4)', animationDelay: '300ms' }} />
                        </span>
                      ) : msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* ── Input ── */}
              <div className="px-5 py-4 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-end gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <textarea
                    value={aiInput}
                    onChange={e => {
                      setAiInput(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiSend() }
                    }}
                    placeholder="Describe the simulations you need..."
                    rows={1}
                    disabled={aiLoading}
                    className="flex-1 bg-transparent text-sm outline-none resize-none"
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      caretColor: '#7c3aed',
                      minHeight: '20px',
                      maxHeight: '96px',
                      scrollbarWidth: 'none',
                    }}
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={aiLoading || !aiInput.trim()}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={aiLoading || !aiInput.trim()
                      ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                      : { background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', color: '#fff', boxShadow: '0 0 16px rgba(109,40,217,0.4)' }
                    }>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Enter to send · Shift+Enter for new line
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Secure</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AddSimulation