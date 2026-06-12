import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'

function EditSimulation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [correctOption, setCorrectOption] = useState(null)
  const [scenarioName, setScenarioName] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [formData, setFormData] = useState({
    scenarioName: '', question: '', category: '', difficulty: '',
    options: ['', '', '', ''], explanation: '',
  })

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (id) fetchSimulation()
  }, [id])

  async function fetchSimulation() {
    setFetching(true)
    try {
      let query = supabase.from('simulations').select('*').eq('id', id)
      if (profile?.id) query = query.eq('organization_id', profile.id)
      const { data, error } = await query.single()
      if (error || !data) { setNotFound(true); setFetching(false); return }
      setFormData({ scenarioName: data.scenario_name, question: data.question, category: data.category, difficulty: data.difficulty, options: data.options, explanation: data.explanation })
      setCorrectOption(data.correct_index)
      setScenarioName(data.scenario_name)
      if (data.image_url) setImagePreview(data.image_url)
    } catch (err) {
      setNotFound(true)
    } finally {
      setFetching(false)
    }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }
  function handleOptionChange(index, value) { const o = [...formData.options]; o[index] = value; setFormData({ ...formData, options: o }) }
  function handleImageUpload(e) { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) } }

  async function handleSubmit(e) {
    e.preventDefault()
    if (correctOption === null) { setError('Please select the correct answer.'); return }
    setLoading(true); setError('')
    try {
      let imageUrl = imagePreview
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('simulation-images').upload(fileName, imageFile)
        if (uploadError) { setError('Failed to upload image: ' + uploadError.message); setLoading(false); return }
        const { data: urlData } = supabase.storage.from('simulation-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
      if (!imagePreview) imageUrl = null
      const { error: updateError } = await supabase.from('simulations').update({
        scenario_name: formData.scenarioName.trim(), question: formData.question.trim(),
        category: formData.category.trim(), difficulty: formData.difficulty,
        type: imageUrl ? 'image' : 'text', image_url: imageUrl,
        options: formData.options, correct_index: correctOption,
        explanation: formData.explanation.trim(),
      }).eq('id', id)
      if (updateError) { setError('Failed to update: ' + updateError.message); return }
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

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
              <p className="text-gray-500 text-sm mb-4">Simulation not found or access denied.</p>
              <button onClick={() => navigate('/admin/simulations')}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium">
                Back to Simulations
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

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <button onClick={() => navigate('/admin/simulations')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs mb-2 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                  <h1 className="text-gray-900 text-lg font-semibold">Edit Simulation</h1>
                  <p className="text-gray-400 text-xs mt-0.5">Updating <span className="text-gray-600 font-medium">{scenarioName}</span></p>
                </div>
                <label className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {imagePreview ? 'Replace Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {imagePreview && (
                <div className="mb-4 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Scenario" className="w-full max-h-48 object-contain p-4" />
                  <div className="px-4 pb-3 flex justify-between items-center border-t border-gray-50">
                    <p className="text-gray-400 text-xs">Scenario image attached</p>
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                      className="text-red-400 hover:text-red-500 text-xs font-medium transition">Remove</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Details */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-gray-700 text-sm font-semibold mb-4">Question Details</p>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={labelClass}>Scenario Name <span className="text-red-400">*</span></label>
                      <input type="text" name="scenarioName" value={formData.scenarioName}
                        onChange={handleChange} required className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>Question <span className="text-red-400">*</span></label>
                      <textarea name="question" value={formData.question} onChange={handleChange}
                        rows={4} required className={`${inputClass} resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Category</label>
                        <input type="text" name="category" value={formData.category}
                          onChange={handleChange} list="edit-category-options" className={inputClass} />
                        <datalist id="edit-category-options">
                          {['Password Security','Phishing Detection','Social Engineering','Data Privacy','Network Security','Ransomware','USB & Physical Security','Insider Threat','Email Security','Mobile Security','Cloud Security','Zero-Day Awareness'].map(c => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className={labelClass}>Difficulty</label>
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={inputClass}>
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-500 text-xs font-medium">Answer Options <span className="text-red-400">*</span></label>
                        <p className="text-gray-300 text-xs">Click to mark correct</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2.5">
                            <button type="button" onClick={() => setCorrectOption(index)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                                ${correctOption === index ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white hover:border-blue-400'}`}>
                              {correctOption === index && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                            <input type="text" value={option}
                              onChange={e => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`} required
                              className={`${inputClass} flex-1 ${correctOption === index ? 'border-blue-200 bg-blue-50' : ''}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Explanation <span className="text-red-400">*</span></label>
                      <textarea name="explanation" value={formData.explanation} onChange={handleChange}
                        rows={3} required className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 pb-6">
                  <button type="button" onClick={() => navigate('/admin/simulations')}
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
                <p className="text-gray-800 text-base font-semibold mb-1">Simulation updated</p>
                <p className="text-gray-400 text-xs mb-5 truncate px-4">{formData.scenarioName}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setSubmitted(false); setError('') }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                    Edit Again
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
    </div>
  )
}

export default EditSimulation