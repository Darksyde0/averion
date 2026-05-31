import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useTranslation } from '../hooks/useTranslation'

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/change-password`,
    })

    if (resetError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden">

      {/* ── Left panel ── */}
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
            {t('common.back')}
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
              {t('forgotPassword.badge')}
            </span>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            {t('forgotPassword.heading1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('forgotPassword.heading2')}
            </span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            {t('forgotPassword.subtext')}
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-4 mt-10">
            {[
              { n: '01', title: t('forgotPassword.step1') },
              { n: '02', title: t('forgotPassword.step2') },
              { n: '03', title: t('forgotPassword.step3') },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">{s.n}</span>
                </div>
                <p className="text-gray-400 text-sm">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom security note */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-green-400 text-xs font-semibold">{t('forgotPassword.secureReset')}</p>
          </div>
          <p className="text-gray-400 text-sm">{t('forgotPassword.secureNote')}</p>
        </div>
      </div>

      {/* ── Right panel ── */}
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
            {t('common.back')}
          </Link>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-white text-3xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {t('forgotPassword.heading1')} {t('forgotPassword.heading2')}
                </h1>
                <p className="text-gray-500 text-sm">{t('forgotPassword.subtext')}</p>
              </div>

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
                    {t('forgotPassword.email')}
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required />
                </div>

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${loading ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                      {t('forgotPassword.sending')}
                    </>
                  ) : (
                    <>
                      {t('forgotPassword.sendLink')}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-gray-600 text-xs text-center">
                  {t('forgotPassword.rememberPassword')}{' '}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
                    {t('forgotPassword.backToSignIn')}
                  </Link>
                </p>
              </form>
            </>

          ) : (
            <div className="flex flex-col items-center text-center">

              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>

              <h1 className="text-white text-3xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {t('forgotPassword.successTitle')}
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                {t('forgotPassword.successText1')}
              </p>
              <p className="text-blue-400 font-semibold text-sm mb-8">{email}</p>

              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left">
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '📬', text: t('forgotPassword.spamNote') },
                    { icon: '⏱', text: t('forgotPassword.expiresNote') },
                    { icon: '🔒', text: t('forgotPassword.onceNote') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <p className="text-gray-400 text-xs">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { setSubmitted(false); setEmail('') }}
                className="text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200 mb-4">
                {t('forgotPassword.didntReceive')}
              </button>

              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {t('forgotPassword.backToSignIn')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage