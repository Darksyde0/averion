import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    department: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
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

      // Step 2 — Generate employee ID
      const employeeId = 'EMP-' + Math.floor(1000 + Math.random() * 9000)

      // Step 3 — Insert into users table
      // organization_id = their own user id (admin is their own org owner)
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email,
          department: formData.department,
          job_title: formData.jobTitle,
          employee_id: employeeId,
          company_name: formData.companyName,
          role: 'admin',
          first_login: false,
          organization_id: data.user.id, // ← admin owns their own org
        })

      if (profileError) {
        setError('Account created but profile setup failed. Please contact support.')
        setLoading(false)
        return
      }

      // Step 4 — Navigate to admin dashboard
      navigate('/admin/dashboard')

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/images/logo.svg" alt="Averion" className="h-10 w-auto" />
        </div>

        {/* Card */}
        <div className="bg-[#1a2744] rounded-2xl p-8 shadow-2xl">

          <h1 className="text-white text-2xl font-bold mb-1 text-center">Create Admin Account</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Register as an Averion administrator</p>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder="John Doe" required
                className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@company.com" required
                className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                placeholder="e.g. Acme Corporation" required
                className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required
                className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">Select Department</option>
                <option>Engineering</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Operations</option>
                <option>Sales</option>
                <option>Management</option>
                <option>IT</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                placeholder="e.g. IT Manager" required
                className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 characters" required
                  className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
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
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Repeat your password" required
                  className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  {showConfirm ? (
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
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition mt-2
                ${loading ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">Sign in</Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage