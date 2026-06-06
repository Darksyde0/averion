import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useTranslation } from '../hooks/useTranslation'

function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
          setError(t('login.emailNotConfirmed'))
        } else {
          setError(t('login.invalidCredentials'))
        }
        setLoading(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: profile, error: profileError } = await supabase
        .from('users').select('*').eq('id', data.user.id).single()

      if (profileError || !profile) {
        setError(t('login.accountNotFound'))
        setLoading(false)
        return
      }

      if (profile.role !== role) {
        setError(`${t('login.wrongRole')} ${role === 'admin' ? 'an Admin' : 'a User'}.`)
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

      {/* ── Left panel — decorative ── */}
      <div
        aria-hidden="true"
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.3),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        {/* Logo + back */}
        <div className="relative z-10 flex items-center justify-between">
          <img src="/images/logo.svg" alt="" className="h-9 w-auto" />
          <Link to="/" tabIndex={-1}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('common.back')}
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
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            Averion helps your team recognize threats and make safer decisions through real-world cybersecurity training.
          </p>

          <ul className="flex flex-col gap-3 mt-8 list-none">
            {[
              t('hero.stat1Label'),
              t('hero.stat2Label'),
              t('hero.stat3Label'),
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <blockquote className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-gray-300 text-sm leading-relaxed italic mb-3">
            "The weakest link in cybersecurity is always the human element. Training is the fix."
          </p>
          <footer className="flex items-center gap-2">
            <div aria-hidden="true" className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">A</div>
            <cite className="text-gray-300 text-xs not-italic">Averion Security Team</cite>
          </footer>
        </blockquote>
      </div>

      {/* ── Right panel — main login form ── */}
      <main
        id="main-content"
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div aria-hidden="true" className="absolute inset-0 bg-[#04080f] lg:bg-transparent" />

        <div className="relative z-10 w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" aria-label="Averion — go to homepage">
              <img src="/images/logo.svg" alt="Averion logo" className="h-9 w-auto" />
            </Link>
          </div>

          {/* Back to home — mobile */}
          <Link to="/"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-xs font-medium transition-colors duration-200 mb-6 group lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('common.back')}
          </Link>

          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-1"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t('login.welcome')}
            </h1>
            <p className="text-gray-300 text-sm">{t('login.subtext')}</p>
          </div>

          {/* ── Role switcher — FIXED: admin turns red ── */}
          <div
            role="group"
            aria-label="Select account type"
            className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('user')}
              aria-pressed={role === 'user'}
              aria-label="Sign in as User"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}>
              {t('login.userTab')}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              aria-pressed={role === 'admin'}
              aria-label="Sign in as Administrator"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                ${role === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}>
              Administrator
            </button>
          </div>

          {/* ── Error message ── */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Login form ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Sign in form"
            className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="text-gray-300 text-xs font-semibold uppercase tracking-wide mb-2 block">
                {t('login.email')}
                <span className="sr-only"> (required)</span>
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                aria-required="true"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                  {t('login.password')}
                  <span className="sr-only"> (required)</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-blue-400 text-xs hover:text-blue-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-describedby="password-toggle-hint"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="login-password"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <span id="password-toggle-hint" className="sr-only">
                  Use the button to the right to show or hide your password
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                ${loading ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              {loading ? (
                <>
                  <div aria-hidden="true" className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : t('login.signIn')}
            </button>

          </form>

          <p className="text-gray-300 text-xs text-center mt-6">
            {t('login.noAccount')}{' '}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
              {t('login.createAccount')}
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}

export default LoginPage