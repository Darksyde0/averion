import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const all = upper + lower + numbers + special
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)]
  for (let i = 4; i < 12; i++) password += all[Math.floor(Math.random() * all.length)]
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

function AddUser() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    department: '', jobTitle: '', employeeId: '',
    password: generatePassword(),
  })

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleRegeneratePassword() {
    setFormData({ ...formData, password: generatePassword() })
    setCopied(false)
  }

  function handleCopyPassword() {
    navigator.clipboard.writeText(formData.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!profile?.id) {
      setError('Admin profile not loaded. Please try again.')
      setLoading(false)
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            department: formData.department,
            jobTitle: formData.jobTitle.trim(),
            employeeId: formData.employeeId.trim() || null,
          }),
        }
      )
      const result = await response.json()
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to create user. Please try again.')
        setLoading(false)
        return
      }
      setSubmitted(true)
    } catch (err) {
      console.error('AddUser error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddAnother() {
    setFormData({
      firstName: '', lastName: '', email: '',
      department: '', jobTitle: '', employeeId: '',
      password: generatePassword(),
    })
    setSubmitted(false)
    setCopied(false)
    setError('')
  }

  const inputClass = "w-full bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-300"
  const labelClass = "text-gray-500 text-xs font-medium mb-1.5 block"

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">
          {!submitted ? (
            <div className="max-w-full">

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-gray-900 text-lg font-semibold">Add User</h1>
                <p className="text-gray-400 text-xs mt-0.5">Create a new user account for your organisation</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-5">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Personal */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-gray-700 text-sm font-semibold mb-4">Personal Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name <span className="text-red-400">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName}
                        onChange={handleChange} placeholder="First name" required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name <span className="text-red-400">*</span></label>
                      <input type="text" name="lastName" value={formData.lastName}
                        onChange={handleChange} placeholder="Last name" required className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Email Address <span className="text-red-400">*</span></label>
                      <input type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="user@company.com" required className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Work */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-gray-700 text-sm font-semibold mb-4">Work Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Department <span className="text-red-400">*</span></label>
                      <select name="department" value={formData.department}
                        onChange={handleChange} required
                        className={inputClass}>
                        <option value="">Select department</option>
                        {['Engineering','Human Resources','Finance','Marketing','Operations','Sales','Management'].map(d => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
                      <input type="text" name="jobTitle" value={formData.jobTitle}
                        onChange={handleChange} placeholder="e.g. Software Engineer" required className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-gray-500 text-xs font-medium">Employee ID</label>
                        <span className="text-gray-300 text-xs">Optional</span>
                      </div>
                      <input type="text" name="employeeId" value={formData.employeeId}
                        onChange={handleChange} placeholder="e.g. EMP-1234"
                        className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-700 text-sm font-semibold">Generated Password</p>
                    <span className="text-gray-400 text-xs">Share with the user before saving</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-4">The user will be asked to change this on first login.</p>

                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-3 font-mono">
                    <p className="text-gray-800 text-sm tracking-widest">
                      {showPassword ? formData.password : '•'.repeat(formData.password.length)}
                    </p>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition ml-3 flex-shrink-0">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={handleCopyPassword}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition
                        ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {copied ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                          Copy Password
                        </>
                      )}
                    </button>
                    <button type="button" onClick={handleRegeneratePassword}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Note */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Share the generated password with the user before creating the account. They will be prompted to set a new password on first login.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 pb-6">
                  <button type="button" onClick={() => navigate('/admin/users')}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition
                      ${loading ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                    {loading ? 'Creating...' : 'Create User'}
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
                <p className="text-gray-800 text-base font-semibold mb-1">User created</p>
                <p className="text-gray-400 text-xs mb-5">
                  <span className="font-medium text-gray-600">{formData.firstName} {formData.lastName}</span> has been added to Averion.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-left mb-5 border border-gray-100">
                  <p className="text-gray-500 text-xs font-medium mb-3">Login Credentials</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Email', value: formData.email },
                      { label: 'Password', value: formData.password, mono: true },
                      { label: 'Department', value: formData.department },
                      ...(formData.employeeId ? [{ label: 'Employee ID', value: formData.employeeId }] : []),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <p className="text-gray-400 text-xs">{item.label}</p>
                        <p className={`text-gray-700 text-xs font-medium truncate ${item.mono ? 'font-mono' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleAddAnother}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                    Add Another
                  </button>
                  <button onClick={() => navigate('/admin/users')}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition">
                    View Users
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

export default AddUser