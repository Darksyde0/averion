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
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in. Check your inbox.')
        } else {
          setError('Invalid email or password. Please try again.')
        }
        setLoading(false)
        return
      }

      // ── Small delay to let session propagate to RLS ──
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: profile, error: profileError } = await supabase
        .from('users').select('*').eq('id', data.user.id).single()

      if (profileError || !profile) {
        setError('Account not found. Please contact your administrator.')
        setLoading(false)
        return
      }

      if (profile.role !== role) {
        setError(`This account is not registered as ${role === 'admin' ? 'an Admin' : 'a User'}.`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (profile.first_login) { navigate('/change-password'); return }
      navigate(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard')

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.3),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        {/* Logo + back */}
        <div className="relative z-10 flex items-center justify-between">
          <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Secure Platform</span>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            Train smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Stay protected.
            </span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Averion helps your team recognize threats and make safer decisions through real-world cybersecurity training.
          </p>

          <div className="flex flex-col gap-3 mt-8">
            {[
              'Real-world phishing simulations',
              'Adaptive training modules',
              'Live risk analytics dashboard',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400 text-sm leading-relaxed italic mb-3">
            "The weakest link in cybersecurity is always the human element. Training is the fix."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">A</div>
            <p className="text-gray-500 text-xs">Averion Security Team</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[#04080f] lg:bg-transparent" />

        <div className="relative z-10 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
          </div>

          {/* Back to home — mobile */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200 mb-6 group lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>

          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-1"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">Sign in to your Averion account</p>
          </div>

          {/* Role switcher */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            {['user', 'admin'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize
                  ${role === r ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                {r === 'admin' ? 'Administrator' : 'User'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-blue-400 text-xs hover:text-blue-300 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                ${loading ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

          </form>

          <p className="text-gray-600 text-xs text-center mt-6">
            Admin?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition font-medium">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default LoginPage