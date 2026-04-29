import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'

// Hardcoded simulations data
// When backend is ready this will come from MongoDB using the ID
const simulationsData = {
  1: {
    id: 1,
    scenarioName: 'Phishing Email 1',
    question: 'You are working on your computer when you receive the following email. What should you do in this situation?',
    category: 'Phishing Detection',
    difficulty: 'Medium',
    type: 'image',
    imageUrl: '/images/phishing-email.png',
    options: [
      'Click the link and enter your details immediately',
      'Verify the request by contacting IT through official channels',
      'Reply to the email asking if it is real',
      'Ignore the email completely',
    ],
    correctIndex: 1,
    explanation: 'This is likely a social engineering attack. Red flags include urgent tone, request for sensitive information, and a suspicious link that is not the official company domain.',
  },
  2: {
    id: 2,
    scenarioName: 'Password Security Check',
    question: 'Your manager sends you a WhatsApp message asking for your login password urgently because the system is down. What should you do?',
    category: 'Password Security',
    difficulty: 'Easy',
    type: 'text',
    imageUrl: '',
    options: [
      'Send the password immediately since it is your manager',
      'Ignore the message completely',
      'Verify the request through official company channels before doing anything',
      'Change your password and then send the new one',
    ],
    correctIndex: 2,
    explanation: 'Legitimate managers and IT teams will never ask for your password through WhatsApp or any messaging app.',
  },
}

function EditSimulation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get the simulation data based on ID
  const existing = simulationsData[id]

  // If simulation not found
  if (!existing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl p-10 text-center shadow">
          <p className="text-gray-500 text-sm mb-4">Simulation not found.</p>
          <button
            onClick={() => navigate('/admin/simulations')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Back to Simulations
          </button>
        </div>
      </div>
    )
  }

  const [imagePreview, setImagePreview] = useState(existing.imageUrl || null)
  const [correctOption, setCorrectOption] = useState(existing.correctIndex)
  const [formData, setFormData] = useState({
    scenarioName: existing.scenarioName,
    question: existing.question,
    category: existing.category,
    difficulty: existing.difficulty,
    options: [...existing.options],
    explanation: existing.explanation,
  })

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
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (correctOption === null) {
      alert('Please select the correct answer.')
      return
    }
    // Backend will save the updated simulation
    setSubmitted(true)
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
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">
                  ADMIN
                </span>
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

            <div className="max-w-4xl">

              {/* Page heading */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <button
                    onClick={() => navigate('/admin/simulations')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-3 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Simulations
                  </button>
                  <h1 className="text-gray-800 text-3xl font-bold">Edit Simulation</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Update the details for <span className="font-semibold text-gray-700">{existing.scenarioName}</span>
                  </p>
                </div>

                {/* Upload Image button */}
                <div className="flex flex-col items-end gap-1">
                  <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl cursor-pointer transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {imagePreview ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-gray-400 text-xs">Optional — skip if text only</p>
                </div>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="mb-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Scenario"
                    className="w-full max-h-64 object-contain p-4"
                  />
                  <div className="px-4 pb-3 flex justify-between items-center">
                    <p className="text-gray-500 text-xs">Scenario image</p>
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="text-red-400 hover:text-red-600 text-xs font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-gray-800 text-lg font-bold">Edit Question</h2>
                    <p className="text-gray-500 text-sm">
                      Select the radio button to mark the correct answer
                    </p>
                  </div>

                  {/* Scenario Name */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Scenario Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="scenarioName"
                      value={formData.scenarioName}
                      onChange={handleChange}
                      className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>

                  {/* Question Text */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Answer options */}
                  <div className="mb-5">
                    <label className="text-gray-700 text-sm font-semibold mb-3 block">
                      Answer Options <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCorrectOption(index)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                              ${correctOption === index
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 bg-gray-100 hover:border-blue-400'
                              }`}
                          >
                            {correctOption === index && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">
                      Explanation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="explanation"
                      value={formData.explanation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="px-10 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
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

                <h2 className="text-gray-800 text-2xl font-bold mb-2">
                  Simulation Updated!
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  <span className="font-semibold text-gray-700">{formData.scenarioName}</span> has been updated successfully.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/admin/simulations')}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    Back to Simulations
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