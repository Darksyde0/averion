import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { supabase } from '../../supabaseClient'

function EditSimulation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [correctOption, setCorrectOption] = useState(null)
  const [scenarioName, setScenarioName] = useState('')

  const [formData, setFormData] = useState({
    scenarioName: '',
    question: '',
    category: '',
    difficulty: '',
    options: ['', '', '', ''],
    explanation: '',
  })

  useEffect(() => {
    fetchSimulation()
  }, [id])

  async function fetchSimulation() {
    setFetching(true)
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) { setFetching(false); return }

    setFormData({
      scenarioName: data.scenario_name,
      question: data.question,
      category: data.category,
      difficulty: data.difficulty,
      options: data.options,
      explanation: data.explanation,
    })
    setCorrectOption(data.correct_index)
    setScenarioName(data.scenario_name)
    if (data.image_url) setImagePreview(data.image_url)
    setFetching(false)
  }

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
    if (correctOption === null) { alert('Please select the correct answer.'); return }

    setLoading(true)
    setError('')

    try {
      let imageUrl = imagePreview

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('simulation-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          setError('Failed to upload image: ' + uploadError.message)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('simulation-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      if (!imagePreview) imageUrl = null

      const { error: updateError } = await supabase
        .from('simulations')
        .update({
          scenario_name: formData.scenarioName,
          question: formData.question,
          category: formData.category,
          difficulty: formData.difficulty,
          type: imageUrl ? 'image' : 'text',
          image_url: imageUrl,
          options: formData.options,
          correct_index: correctOption,
          explanation: formData.explanation,
        })
        .eq('id', id)

      if (updateError) {
        setError('Failed to update simulation: ' + updateError.message)
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
              <p className="text-gray-400 text-sm">Loading simulation...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Not found state ──
  if (!formData.scenarioName && !fetching) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar isOpen={true} />
        <div className="flex-1 flex flex-col ml-48">
          <AdminTopBar onMenuClick={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm mb-4">Simulation not found.</p>
              <button onClick={() => navigate('/admin/simulations')}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                Back to Simulations
              </button>
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

            <div className="max-w-3xl">

              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <button onClick={() => navigate('/admin/simulations')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-3 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                  <h1 className="text-gray-900 text-2xl font-bold">Edit Simulation</h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Updating <span className="font-semibold text-gray-600">{scenarioName}</span>
                  </p>
                </div>

                <label className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl cursor-pointer transition shadow-sm flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {imagePreview ? 'Replace Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Image preview */}
              {imagePreview && (
                <div className="mb-5 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Scenario" className="w-full max-h-56 object-contain p-4" />
                  <div className="px-4 pb-3 flex justify-between items-center border-t border-gray-50">
                    <p className="text-gray-400 text-xs">Scenario image</p>
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                      className="text-red-400 hover:text-red-600 text-xs font-semibold transition">
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-5">

                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-800 font-bold">Question Details</h2>
                    <p className="text-gray-400 text-xs">Click the circle to mark the correct answer</p>
                  </div>

                  {/* Scenario Name */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Scenario Name <span className="text-red-400">*</span></label>
                    <input type="text" name="scenarioName" value={formData.scenarioName} onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required />
                  </div>

                  {/* Question */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Question <span className="text-red-400">*</span></label>
                    <textarea name="question" value={formData.question} onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required />
                  </div>

                  {/* Category + Difficulty */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option>Password Security</option>
                        <option>Phishing Detection</option>
                        <option>Social Engineering</option>
                        <option>Data Privacy</option>
                        <option>Network Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Difficulty</label>
                      <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-xs font-semibold mb-3 block uppercase tracking-wide">Answer Options <span className="text-red-400">*</span></label>
                    <div className="flex flex-col gap-2.5">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <button type="button" onClick={() => setCorrectOption(index)}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                              ${correctOption === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
                            {correctOption === index && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </button>
                          <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="text-gray-700 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Explanation <span className="text-red-400">*</span></label>
                    <textarea name="explanation" value={formData.explanation} onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required />
                  </div>

                </div>

                {/* Actions */}
                <div className="flex justify-between pb-8">
                  <button type="button" onClick={() => navigate('/admin/simulations')}
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

            // ── Success ──
            <div className="max-w-md mx-auto mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-gray-800 text-xl font-bold mb-1">Simulation Updated!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  <span className="font-semibold text-gray-600">{formData.scenarioName}</span> has been updated successfully.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/admin/simulations')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                    Back to Simulations
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

export default EditSimulation