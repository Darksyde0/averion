import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function buildAriaSystemPrompt(adminName) {
  return `You are ARIA, Averion's Risk Intelligence Assistant. You are a sophisticated cybersecurity simulation designer with deep expertise in behavioral psychology, threat intelligence, and security awareness training.

You are having a conversation with ${adminName}, a cybersecurity administrator. Your role is twofold:
1. Have a natural, intelligent conversation to understand exactly what kind of simulations they need
2. Generate psychologically calibrated simulation questions that reveal behavioral vulnerabilities, not just knowledge gaps

CONVERSATION BEHAVIOR:
- Greet the admin warmly by their first name on first message
- Ask clarifying questions before generating, understand the context, department, and goal
- Be concise but intelligent, you are a professional AI not a chatbot
- When you have enough context, generate the simulations
- After generating, offer to refine, adjust difficulty, or generate more
- If the admin says something casual or unclear, ask a smart follow-up
- Never generate immediately without at least understanding the basic intent
- Do not use em dashes in your responses

KEY QUESTIONS TO UNDERSTAND BEFORE GENERATING:
- What department or user group is this for? (IT, HR, Finance, C-Suite, general staff?)
- What threat level are you targeting? (awareness, recognition, behavioral testing?)
- Should questions test: knowledge recognition, real-time decision making, or behavioral impulse?
- How cognitively challenging should the distractors be?

WHEN GENERATING SIMULATIONS, return ONLY a valid JSON array. No markdown, no backticks, no explanation outside the JSON.

Each simulation object must have exactly these fields:
{
  "scenarioName": "string",
  "question": "string - rich, detailed, multi-sentence real-world scenario with context, urgency, emotions, or time pressure. Minimum 3-4 sentences. Design it to trigger a specific cognitive or emotional response.",
  "category": "string - one of: Phishing Detection, Password Security, Social Engineering, Data Privacy, Network Security, Ransomware, USB & Physical Security, Insider Threat, Email Security, Mobile Security, Cloud Security, Zero-Day Awareness",
  "difficulty": "string - Easy, Medium, or Hard",
  "options": ["option1", "option2", "option3", "option4"],
  "correctIndex": number 0-3,
  "explanation": "string - educational explanation covering why the correct answer is right, what red flags were present, and why wrong answers are wrong",
  "threatLevel": "string - Low, Medium, High, or Critical",
  "attackTechnique": "string - specific attack method e.g. Spear Phishing, Pretexting, Credential Harvesting, Vishing, MFA Fatigue, Business Email Compromise",
  "learningObjective": "string - one clear sentence: what behavioral insight this question tests",
  "foresightMeta": {
    "cognitivePattern": "string - what cognitive vulnerability this tests e.g. Authority Bias, Urgency Response, Trust Exploitation, Fear Reaction, Curiosity Exploitation, Social Pressure",
    "behavioralIndicator": "string - what a wrong answer reveals about the user e.g. susceptible to authority figures, acts impulsively under time pressure, over-trusts internal senders",
    "riskVector": "string - the primary risk dimension e.g. Impulsive Decision Making, Lack of Verification Habit, Overconfidence, Social Compliance",
    "dataValue": "string - what Foresight can learn from this question's responses e.g. measures urgency susceptibility, tracks authority compliance rate"
  }
}

RULES:
- Randomize simulation order, never group by category
- Each scenario must be unique, different settings, attack vectors, emotional triggers
- Vary perspective, mix You, named characters, role-based, team context
- Create real tension, urgency, authority, fear, or curiosity
- Wrong answers must be plausible, not obviously wrong
- The foresightMeta is CRITICAL, fill it thoughtfully for every simulation
- Never skip foresightMeta fields`
}

function extractJSON(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return null
}

async function callARIA(messages, adminName, accessToken) {
  const systemPrompt = buildAriaSystemPrompt(adminName)
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-simulations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ messages, systemPrompt }),
    }
  )
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data.content || data.text || (typeof data === 'string' ? data : JSON.stringify(data))
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

function threatColor(level) {
  if (level === 'Low') return { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' }
  if (level === 'Medium') return { bg: '#fefce8', text: '#ca8a04', dot: '#eab308' }
  if (level === 'High') return { bg: '#fff7ed', text: '#ea580c', dot: '#f97316' }
  if (level === 'Critical') return { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' }
  return { bg: '#f9fafb', text: '#6b7280', dot: '#9ca3af' }
}

function difficultyColor(d) {
  if (d === 'Easy') return { bg: '#f0fdf4', text: '#16a34a' }
  if (d === 'Medium') return { bg: '#fefce8', text: '#ca8a04' }
  if (d === 'Hard') return { bg: '#fef2f2', text: '#dc2626' }
  return { bg: '#f9fafb', text: '#6b7280' }
}

function isExpiringSoon(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(Date.now() + 86400000 * 2)
}

const optionLabels = ['A', 'B', 'C', 'D']

function AddSimulation() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regenError, setRegenError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [correctOption, setCorrectOption] = useState(null)
  const [ariaOpen, setAriaOpen] = useState(false)
  const [ariaMinimized, setAriaMinimized] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedSims, setGeneratedSims] = useState([])
  const [showGenerated, setShowGenerated] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [ariaGreeted, setAriaGreeted] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const adminFirstName = profile?.full_name?.split(' ')[0] || 'there'

  const [formData, setFormData] = useState({
    scenarioName: '', question: '', category: 'Password Security',
    difficulty: '', options: ['', '', '', ''], explanation: '',
  })

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!ariaMinimized) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, ariaMinimized])

  useEffect(() => {
    if (ariaOpen && !ariaGreeted && profile) {
      const greeting = {
        role: 'ai',
        text: `Good to see you, ${adminFirstName}.\n\nI'm ARIA, your Risk Intelligence Assistant. I'm here to help you design cybersecurity simulations that go beyond basic awareness testing.\n\nBefore I generate anything, tell me what are you working on? Who is this simulation for, and what kind of behavior are you trying to test?`,
      }
      setAiMessages([greeting])
      setConversationHistory([{ role: 'assistant', content: greeting.text }])
      setAriaGreeted(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [ariaOpen, profile, ariaGreeted])

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }
  function handleOptionChange(index, value) { const u = [...formData.options]; u[index] = value; setFormData({ ...formData, options: u }) }
  function handleImageUpload(e) { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) } }

  async function handleSubmit(e) {
    e.preventDefault()
    if (correctOption === null) { setError('Please select the correct answer.'); return }
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
        scenario_name: formData.scenarioName.trim(), question: formData.question.trim(),
        category: formData.category.trim(), difficulty: formData.difficulty,
        type: imageFile ? 'image' : 'text', image_url: imageUrl,
        options: formData.options, correct_index: correctOption,
        explanation: formData.explanation.trim(), hidden: false,
        organization_id: profile.id, batch_id: batchId,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
      })
      if (simError) { setError('Failed to save: ' + simError.message); setLoading(false); return }
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAiSend() {
    if (!aiInput.trim() || aiLoading) return
    const userMessage = aiInput.trim()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setAiInput('')
    setAiLoading(true)
    if (ariaMinimized) setAriaMinimized(false)
    const newUserMsg = { role: 'user', text: userMessage }
    const updatedMessages = [...aiMessages, newUserMsg]
    setAiMessages([...updatedMessages, { role: 'ai', text: '', loading: true }])
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }]
    try {
      const responseText = await callARIA(newHistory, adminFirstName, session.access_token)
      const parsed = extractJSON(responseText)
      const finalHistory = [...newHistory, { role: 'assistant', content: responseText }]
      setConversationHistory(finalHistory)
      setAiMessages(prev => prev.filter(m => !m.loading))
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        const sims = parsed.map(shuffleSim)
        setGeneratedSims(sims); setShowGenerated(true)
        setAiMessages(prev => [...prev, {
          role: 'ai',
          text: `${sims.length} simulation${sims.length > 1 ? 's' : ''} generated and ready for review.\n\nEach question has been calibrated to test specific cognitive patterns. Review them below. I can refine, replace, or add more if needed.`,
        }])
      } else {
        setAiMessages(prev => [...prev, { role: 'ai', text: responseText }])
      }
    } catch (err) {
      setAiMessages(prev => prev.filter(m => !m.loading))
      setAiMessages(prev => [...prev, { role: 'ai', text: `Something went wrong: ${err.message || 'Please try again.'}` }])
    } finally {
      setAiLoading(false)
    }
  }

  function handleDeleteGenerated(index) { setGeneratedSims(prev => prev.filter((_, i) => i !== index)) }

  function handleLoadToForm(sim) {
    setFormData({ scenarioName: sim.scenarioName, question: sim.question, category: sim.category, difficulty: sim.difficulty, options: sim.options, explanation: sim.explanation })
    setCorrectOption(sim.correctIndex); setAriaOpen(false); setAriaMinimized(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleRegenerateOne(index) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const sim = generatedSims[index]
    setRegenError(''); setAiLoading(true)
    try {
      const regenHistory = [
        ...conversationHistory,
        { role: 'user', content: `Regenerate simulation #${index + 1} (${sim.scenarioName}) with a completely different scenario, same category: ${sim.category}. Return only a JSON array with 1 simulation.` }
      ]
      const responseText = await callARIA(regenHistory, adminFirstName, session.access_token)
      const parsed = extractJSON(responseText)
      if (parsed && Array.isArray(parsed) && parsed[0]) {
        setGeneratedSims(prev => prev.map((s, i) => i === index ? shuffleSim(parsed[0]) : s))
      }
    } catch (err) {
      setRegenError('Failed to regenerate: ' + (err.message || 'Please try again.'))
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSaveAll() {
    if (!profile?.id || generatedSims.length === 0) { setError('No simulations to save.'); return }
    setLoading(true); setError('')
    try {
      const batchId = generateBatchId()
      const rows = generatedSims.map(sim => ({
        scenario_name: sim.scenarioName, question: sim.question, category: sim.category,
        difficulty: sim.difficulty, type: 'text', image_url: null, options: sim.options,
        correct_index: sim.correctIndex, explanation: sim.explanation, hidden: false,
        organization_id: profile.id, batch_id: batchId,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        threat_level: sim.threatLevel || null,
        attack_technique: sim.attackTechnique || null,
        learning_objective: sim.learningObjective || null,
        foresight_meta: sim.foresightMeta || null,
      }))
      const { error: simError } = await supabase.from('simulations').insert(rows)
      if (simError) { setError('Failed to save: ' + simError.message); return }
      setGeneratedSims([]); setShowGenerated(false)
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: `${rows.length} simulation${rows.length > 1 ? 's' : ''} saved successfully, including all Foresight metadata.\n\nWant to generate another batch, adjust difficulty, or focus on a different department?`,
      }])
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-300"
  const labelClass = "text-gray-500 text-xs font-medium mb-1.5 block"

  const unreadCount = aiMessages.filter(m => m.role === 'ai' && !m.loading).length

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-y-auto p-6">
          {!submitted ? (
            <div className="max-w-full">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-gray-900 text-lg font-semibold">Add Simulation</h1>
                  <p className="text-gray-400 text-xs mt-0.5">Create a new cybersecurity simulation question</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAriaOpen(true); setAriaMinimized(false) }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Ask ARIA
                  </button>
                  <label className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4"><p className="text-red-500 text-sm">{error}</p></div>}
              {regenError && <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mb-4"><p className="text-orange-500 text-sm">{regenError}</p></div>}

              {imagePreview && (
                <div className="mb-4 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Uploaded" className="w-full max-h-52 object-contain p-4" />
                  <div className="px-4 pb-3 flex justify-between items-center border-t border-gray-50">
                    <p className="text-gray-400 text-xs">Scenario image attached</p>
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                      className="text-red-400 hover:text-red-500 text-xs font-medium transition">Remove</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <label className={labelClass}>Scenario Name <span className="text-red-400">*</span></label>
                  <input type="text" name="scenarioName" value={formData.scenarioName} onChange={handleChange}
                    placeholder="e.g. Phishing Email from IT Department" className={inputClass} required />
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <label className={labelClass}>Scenario <span className="text-red-400">*</span></label>
                  <textarea name="question" value={formData.question} onChange={handleChange}
                    placeholder="Describe a realistic, detailed scenario. Include context, urgency, and a clear decision point..."
                    rows={5} className={`${inputClass} resize-none`} required />
                  <p className="text-gray-300 text-xs mt-2">The richer the scenario, the more effective the training.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <label className={labelClass}>Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange}
                      placeholder="e.g. Phishing Detection" list="category-options" className={inputClass} />
                    <datalist id="category-options">
                      {['Password Security','Phishing Detection','Social Engineering','Data Privacy','Network Security','Ransomware','USB & Physical Security','Insider Threat','Email Security','Mobile Security','Cloud Security','Zero-Day Awareness'].map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <label className={labelClass}>Difficulty <span className="text-red-400">*</span></label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={inputClass} required>
                      <option value="">Select level</option>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-gray-500 text-xs font-medium">Expiry Date</label>
                    <span className="text-gray-300 text-xs">Optional</span>
                  </div>
                  <input type="datetime-local" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)} className={inputClass} />
                  {expiryDate && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isExpiringSoon(expiryDate) ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <p className={`text-xs flex-1 ${isExpiringSoon(expiryDate) ? 'text-red-400' : 'text-gray-400'}`}>
                        {isExpiringSoon(expiryDate) ? 'Expiring very soon' : `Expires ${new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                      </p>
                      <button type="button" onClick={() => setExpiryDate('')} className="text-gray-300 hover:text-red-400 text-xs transition">Clear</button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-gray-500 text-xs font-medium">Answer Options <span className="text-red-400">*</span></label>
                    <p className="text-gray-300 text-xs">Click a row to mark correct</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {formData.options.map((option, index) => (
                      <div key={index} onClick={() => setCorrectOption(index)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition cursor-pointer
                          ${correctOption === index ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition text-xs font-semibold
                          ${correctOption === index ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                          {correctOption === index
                            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            : optionLabels[index]}
                        </div>
                        <input type="text" value={option}
                          onChange={e => { e.stopPropagation(); handleOptionChange(index, e.target.value) }}
                          onClick={e => e.stopPropagation()}
                          placeholder={`Option ${optionLabels[index]}`}
                          className="flex-1 bg-transparent text-gray-700 placeholder-gray-300 text-sm outline-none" required />
                        {correctOption === index && <span className="text-blue-500 text-xs font-medium flex-shrink-0">Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <label className={labelClass}>Explanation <span className="text-red-400">*</span></label>
                  <textarea name="explanation" value={formData.explanation} onChange={handleChange}
                    placeholder="Explain why the correct answer is right and what red flags were present..."
                    rows={4} className={`${inputClass} resize-none`} required />
                </div>

                <div className="flex items-center justify-between pt-1 pb-6">
                  <button type="button" onClick={() => navigate('/admin/simulations')}
                    className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className={`px-6 py-2.5 rounded-lg text-xs font-medium transition
                      ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                    {loading ? 'Saving...' : 'Save Simulation'}
                  </button>
                </div>
              </form>

              {/* Generated Simulations */}
              {showGenerated && generatedSims.length > 0 && (
                <div className="pb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-800 text-sm font-semibold">{generatedSims.length} Simulation{generatedSims.length > 1 ? 's' : ''} Generated</p>
                      <p className="text-gray-400 text-xs mt-0.5">Review each before saving. Foresight metadata included.</p>
                    </div>
                    <button onClick={handleSaveAll} disabled={loading}
                      className={`text-xs font-medium px-4 py-2 rounded-lg transition
                        ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                      {loading ? 'Saving...' : `Save All ${generatedSims.length}`}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <p className="text-blue-600 text-xs">All {generatedSims.length} simulations will be saved as a single batch with Foresight metadata for future analysis.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {generatedSims.map((sim, index) => {
                      const tc = threatColor(sim.threatLevel)
                      const dc = difficultyColor(sim.difficulty)
                      return (
                        <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-300 text-xs font-mono">#{index + 1}</span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{sim.category}</span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: dc.bg, color: dc.text }}>{sim.difficulty}</span>
                              {sim.threatLevel && (
                                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: tc.bg, color: tc.text }}>
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tc.dot }} />
                                  {sim.threatLevel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => handleLoadToForm(sim)} className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Load</button>
                              <button onClick={() => handleRegenerateOne(index)} disabled={aiLoading} className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40">Redo</button>
                              <button onClick={() => handleDeleteGenerated(index)} className="text-xs font-medium px-2.5 py-1 rounded-md bg-red-50 text-red-400 hover:bg-red-100 transition">Delete</button>
                            </div>
                          </div>

                          {sim.attackTechnique && <p className="text-gray-400 text-xs mb-2 font-medium">{sim.attackTechnique}</p>}
                          <p className="text-gray-800 text-sm font-semibold mb-2">{sim.scenarioName}</p>

                          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-3">
                            <p className="text-gray-600 text-sm leading-relaxed">{sim.question}</p>
                          </div>

                          {sim.learningObjective && (
                            <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-lg border border-gray-100">
                              <p className="text-gray-400 text-xs"><span className="font-medium text-gray-600">Objective: </span>{sim.learningObjective}</p>
                            </div>
                          )}

                          {sim.foresightMeta && (
                            <div className="mb-3 px-3 py-2.5 rounded-lg border border-blue-100 bg-blue-50/50">
                              <p className="text-blue-600 text-xs font-medium mb-1.5">Foresight Intelligence</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {sim.foresightMeta.cognitivePattern && <p className="text-xs text-gray-500"><span className="text-gray-400">Pattern: </span>{sim.foresightMeta.cognitivePattern}</p>}
                                {sim.foresightMeta.riskVector && <p className="text-xs text-gray-500"><span className="text-gray-400">Risk: </span>{sim.foresightMeta.riskVector}</p>}
                                {sim.foresightMeta.behavioralIndicator && <p className="text-xs text-gray-500 col-span-2"><span className="text-gray-400">Indicator: </span>{sim.foresightMeta.behavioralIndicator}</p>}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5 mb-3">
                            {sim.options.map((opt, i) => (
                              <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs border
                                ${i === sim.correctIndex ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                                  ${i === sim.correctIndex ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                  {optionLabels[i]}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>

                          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                            <p className="text-gray-500 text-xs font-medium mb-1">Explanation</p>
                            <p className="text-gray-500 text-xs leading-relaxed">{sim.explanation}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="max-w-sm mx-auto mt-16">
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-gray-800 text-base font-semibold mb-1">Simulation saved</p>
                <p className="text-gray-400 text-xs mb-5">{formData.scenarioName}</p>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setFormData({ scenarioName: '', question: '', category: 'Password Security', difficulty: '', options: ['', '', '', ''], explanation: '' })
                    setCorrectOption(null); setImagePreview(null); setImageFile(null)
                    setSubmitted(false); setError(''); setRegenError(''); setExpiryDate('')
                  }} className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                    Add Another
                  </button>
                  <button onClick={() => navigate('/admin/simulations')}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition">
                    View All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ARIA Modal ── */}
      {ariaOpen && (
        <>
          {/* Backdrop - only show when not minimized */}
          {!ariaMinimized && (
            <div className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setAriaMinimized(true)} />
          )}

          {/* Modal / Minimized pill */}
          <div className={`fixed z-50 transition-all duration-300 ease-in-out`}
            style={ariaMinimized ? {
              bottom: '24px', right: '24px',
              width: 'auto',
            } : {
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '520px',
              padding: '16px',
            }}>

            {ariaMinimized ? (
              /* Minimized pill */
              <button onClick={() => setAriaMinimized(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{
                  background: 'linear-gradient(160deg, rgba(30,35,60,0.97) 0%, rgba(15,18,35,0.99) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(37,99,235,0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}>
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                    style={{ borderColor: '#0f1223' }} />
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-semibold">ARIA</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {aiLoading ? 'Thinking...' : 'Click to expand'}
                  </p>
                </div>
                {aiLoading && (
                  <div className="flex items-center gap-1 ml-1">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-1 h-1 rounded-full animate-bounce"
                        style={{ background: '#3b82f6', animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                )}
                <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button onClick={e => { e.stopPropagation(); setAriaOpen(false); setAriaMinimized(false) }}
                  className="flex-shrink-0 transition"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ) : (
              /* Full modal */
              <div className="w-full flex flex-col rounded-2xl overflow-hidden"
                style={{
                  height: '620px',
                  background: 'linear-gradient(160deg, rgba(30,35,60,0.97) 0%, rgba(15,18,35,0.99) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.65), 0 0 50px rgba(37,99,235,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}>

                {/* Top glow */}
                <div className="h-px w-full flex-shrink-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), rgba(99,102,241,0.5), transparent)' }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 20px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                        style={{ borderColor: '#0f1223' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold tracking-wide">ARIA</p>
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}>
                          GPT-4o
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          Foresight Ready
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Averion Risk Intelligence Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Minimize */}
                    <button onClick={() => setAriaMinimized(true)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                      style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      title="Minimize">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      </svg>
                    </button>
                    {/* Close */}
                    <button onClick={() => { setAriaOpen(false); setAriaMinimized(false) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                      style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      title="Close">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
                  {aiMessages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                      )}
                      <div className={`px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap
                        ${msg.role === 'user' ? 'rounded-2xl rounded-tr-sm max-w-[75%]' : 'rounded-2xl rounded-tl-sm max-w-[85%]'}`}
                        style={msg.role === 'user'
                          ? { background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', boxShadow: '0 4px 15px rgba(59,130,246,0.25)' }
                          : msg.loading
                            ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }
                            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }
                        }>
                        {msg.loading ? (
                          <span className="flex items-center gap-1.5 py-0.5">
                            {[0, 150, 300].map(delay => (
                              <span key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce"
                                style={{ background: 'rgba(255,255,255,0.4)', animationDelay: `${delay}ms` }} />
                            ))}
                          </span>
                        ) : msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested prompts */}
                {aiMessages.length <= 1 && (
                  <div className="px-5 pb-3 flex flex-col gap-1.5 flex-shrink-0">
                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Quick starts</p>
                    {[
                      '5 phishing simulations for the finance team, hard difficulty',
                      'Mix of social engineering and insider threat for HR',
                      'Test urgency response and authority bias for all staff',
                    ].map((suggestion, i) => (
                      <button key={i} onClick={() => setAiInput(suggestion)}
                        className="text-left px-3 py-2 rounded-lg text-xs transition w-full"
                        style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
                        → {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-5 py-4 flex-shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-end gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                    <textarea ref={inputRef} value={aiInput}
                      onChange={e => { setAiInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px' }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiSend() } }}
                      placeholder="Tell ARIA what you need..."
                      rows={1} disabled={aiLoading}
                      className="flex-1 bg-transparent text-sm outline-none resize-none"
                      style={{ color: 'rgba(255,255,255,0.85)', caretColor: '#3b82f6', minHeight: '20px', maxHeight: '96px', scrollbarWidth: 'none' }} />
                    <button onClick={handleAiSend} disabled={aiLoading || !aiInput.trim()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={aiLoading || !aiInput.trim()
                        ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                        : { background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', boxShadow: '0 0 20px rgba(59,130,246,0.45)' }}>
                      {aiLoading
                        ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
                      }
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>Enter to send · Shift+Enter for newline</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>Foresight metadata enabled</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}

export default AddSimulation