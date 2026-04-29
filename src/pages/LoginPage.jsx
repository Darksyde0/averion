import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
})


      if (authError) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        setError('Account not found. Please contact your administrator.')
        setLoading(false)
        return
      }

      // Check role matches selected tab
      if (profile.role !== role) {
        setError(`This account is not registered as ${role === 'admin' ? 'an Admin' : 'a User'}.`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // First login — force password change
      if (profile.first_login) {
        navigate('/change-password')
        return
      }

      // Navigate based on role
      if (profile.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/images/logo.svg" alt="Averion" className="h-10 w-auto" />
        </div>

        {/* Card */}
        <div className="bg-[#1a2744] rounded-2xl p-8 shadow-2xl">

          <h1 className="text-white text-2xl font-bold mb-1 text-center">Welcome back</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Sign in to your Averion account</p>

          {/* Role switcher */}
          <div className="flex bg-[#0d1117] rounded-xl p-1 mb-6">
            <button
              onClick={() => setRole('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                ${role === 'user' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              User
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                ${role === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-300 text-sm font-semibold mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0d1117] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-blue-400 text-xs hover:text-blue-300 transition">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition
                ${loading
                  ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Register link */}
        <p className="text-gray-500 text-xs text-center mt-6">
          Admin?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage