import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/Admin/AdminSidebar'
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

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

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
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    department: '',
    jobTitle: '',
    password: generatePassword(),
  })

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

    // Guard — need admin profile to get organization_id
    if (!profile?.id) {
      setError('Admin profile not loaded. Please try again.')
      setLoading(false)
      return
    }

    try {
      const employeeId = 'EMP-' + Math.floor(1000 + Math.random() * 9000)
      const fullName = `${formData.firstName} ${formData.lastName}`

      // Step 1 — Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Step 2 — Insert into users table with organization_id = admin's id
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: formData.email,
          department: formData.department,
          job_title: formData.jobTitle,
          employee_id: employeeId,
          role: 'user',
          first_login: true,
          organization_id: profile.id, // ← links user to this admin
        })

      if (profileError) {
        setError('User created but profile setup failed: ' + profileError.message)
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

  function handleAddAnother() {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      department: '',
      jobTitle: '',
      password: generatePassword(),
    })
    setSubmitted(false)
    setCopied(false)
    setError('')
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
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col items-start">
                <p className="text-white font-bold text-sm leading-tight">
                  {profile?.full_name || 'Loading...'}
                </p>
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

            <div className="max-w-full">

              <h1 className="text-gray-800 text-3xl font-bold mb-1">Add New User</h1>
              <p className="text-gray-500 text-sm mb-8">
                Create a new user account. A strong password will be generated automatically.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Personal Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-gray-800 text-lg font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        placeholder="Enter First Name" required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        placeholder="Enter Last Name" required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="Enter Email Address" required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Username <span className="text-red-500">*</span></label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange}
                        placeholder="Enter Username" required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-blue-600 text-lg font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </div>
                    Work Information
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Department <span className="text-red-500">*</span></label>
                      <select name="department" value={formData.department} onChange={handleChange} required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option value="">Select Department</option>
                        <option>Engineering</option>
                        <option>Human Resources</option>
                        <option>Finance</option>
                        <option>Marketing</option>
                        <option>Operations</option>
                        <option>Sales</option>
                        <option>Management</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-semibold mb-2 block">Job Title <span className="text-red-500">*</span></label>
                      <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                        placeholder="Enter job title" required
                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Generated Password */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-green-600 text-lg font-bold mb-1 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    Generated Password
                  </h2>
                  <p className="text-gray-400 text-xs mb-5 ml-11">
                    This password has been auto-generated. Share it with the user so they can log in.
                  </p>

                  <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4">
                    <p className="text-gray-800 font-mono text-sm tracking-widest">
                      {showPassword ? formData.password : '••••••••••••'}
                    </p>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-700 transition">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={handleCopyPassword}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition
                        ${copied ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy Password'}
                    </button>
                    <button type="button" onClick={handleRegeneratePassword}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Important note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-bold mb-1">Important</p>
                    <p className="text-yellow-700 text-xs leading-relaxed">
                      Make sure to share the generated password with the user before saving.
                      The user will be asked to change their password on first login.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between pb-8">
                  <button type="button" onClick={() => navigate('/admin/users')}
                    className="px-8 py-3 rounded-xl text-sm font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className={`px-10 py-3 rounded-xl text-sm font-bold transition
                      ${loading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {loading ? 'Creating User...' : 'Create User'}
                  </button>
                </div>

              </form>
            </div>

          ) : (

            // ── SUCCESS VIEW ──
            <div className="max-w-lg mx-auto mt-20 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">

                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>

                <h2 className="text-gray-800 text-2xl font-bold mb-2">User Created Successfully!</h2>
                <p className="text-gray-500 text-sm mb-2">
                  <span className="font-semibold text-gray-700">{formData.firstName} {formData.lastName}</span> has been added to Averion.
                </p>
                <p className="text-gray-400 text-xs mb-8">
                  They can now log in using their email and the generated password. They will be prompted to change their password on first login.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 text-left mb-8">
                  <p className="text-gray-700 text-sm font-bold mb-3">Login Credentials</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="text-gray-800 text-xs font-semibold">{formData.email}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Username</p>
                      <p className="text-gray-800 text-xs font-semibold">{formData.username}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Password</p>
                      <p className="text-gray-800 text-xs font-mono font-semibold">{formData.password}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-500 text-xs">Department</p>
                      <p className="text-gray-800 text-xs font-semibold">{formData.department}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleAddAnother}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                    Add Another User
                  </button>
                  <button onClick={() => navigate('/admin/users')}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                    View All Users
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