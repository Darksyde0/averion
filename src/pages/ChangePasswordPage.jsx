import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useTranslation } from '../hooks/useTranslation'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) setIsRecovery(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setIsRecovery(true); setSessionReady(true) }
      if (event === 'SIGNED_IN' && session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) { setError(t('changePassword.tooShort')); return }
    if (newPassword !== confirmPassword) { setError(t('changePassword.mismatch')); return }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) { setError('Failed to update password. Please try again.'); setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('users').update({ first_login: false }).eq('id', user.id)

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard')

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const eyeOpen = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const eyeOff = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  function getStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '' }
    if (pwd.length < 4) return { score: 1, label: t('changePassword.tooShort'), color: 'bg-red-500' }
    if (pwd.length < 6) return { score: 2, label: t('changePassword.weak'), color: 'bg-orange-500' }
    if (pwd.length < 8) return { score: 3, label: t('changePassword.fair'), color: 'bg-yellow-500' }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { score: 4, label: t('changePassword.strong'), color: 'bg-green-500' }
    return { score: 3, label: t('changePassword.good'), color: 'bg-blue-500' }
  }

  const strength = getStrength(newPassword)
  const passwordsMatch = confirmPassword && confirmPassword === newPassword

  const tips = [
    { text: t('changePassword.tip1'), ok: newPassword.length >= 8 },
    { text: t('changePassword.tip2'), ok: /[A-Z]/.test(newPassword) },
    { text: t('changePassword.tip3'), ok: /[0-9]/.test(newPassword) },
    { text: t('changePassword.tip4'), ok: /[^A-Za-z0-9]/.test(newPassword) },
  ]

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.3),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">
              {isRecovery ? t('changePassword.badgeReset') : t('changePassword.badgeFirstLogin')}
            </span>
          </div>

          <h2 className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            {isRecovery ? t('changePassword.resetHeading') : t('changePassword.welcomeHeading')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {isRecovery ? t('changePassword.headingReset').split(' ').pop() + '.' : 'Averion.'}
            </span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-10">
            {isRecovery
              ? "Enter a new password below. Make sure it's strong and something only you know."
              : 'Your account was created by your administrator. Before you get started, please set a personal password that only you know.'}
          </p>

          {/* Password tips */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white text-xs font-semibold uppercase tracking-wide mb-4">
              {t('changePassword.tips')}
            </p>
            <div className="flex flex-col gap-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${tip.ok ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className={`h-3 w-3 transition-colors duration-300 ${tip.ok ? 'text-green-400' : 'text-gray-600'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className={`text-xs transition-colors duration-300 ${tip.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-blue-400 text-xs font-semibold">Your password is private</p>
          </div>
          <p className="text-gray-400 text-sm">{t('changePassword.adminNote')}</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[#04080f] lg:bg-transparent" />

        <div className="relative z-10 w-full max-w-md">

          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 mb-4 lg:hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">
                {isRecovery ? t('changePassword.badgeReset') : t('changePassword.badgeFirstLogin')}
              </span>
            </div>
            <h1 className="text-white text-3xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isRecovery ? t('changePassword.headingReset') : t('changePassword.headingFirstLogin')}
            </h1>
            <p className="text-gray-500 text-sm">
              {isRecovery ? t('changePassword.subtextReset') : t('changePassword.subtextFirstLogin')}
            </p>
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
                {t('changePassword.newPassword')}
              </label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={inputClass} required />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showNew ? eyeOff : eyeOpen}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${strength.score >= i ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                {t('changePassword.confirmPassword')}
              </label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`${inputClass} ${confirmPassword && !passwordsMatch
                    ? 'border-red-500/50 focus:ring-red-500'
                    : passwordsMatch ? 'border-green-500/50 focus:ring-green-500' : ''}`}
                  required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showConfirm ? eyeOff : eyeOpen}
                </button>
                {passwordsMatch && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-400 text-xs mt-1.5">{t('changePassword.mismatch')}</p>
              )}
            </div>

            {/* Mobile tips */}
            <div className="lg:hidden bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
                {t('changePassword.tips')}
              </p>
              <div className="flex flex-col gap-2">
                {tips.slice(0, 3).map((tip, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${tip.ok ? 'bg-green-500/20' : 'bg-white/5'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-2.5 w-2.5 ${tip.ok ? 'text-green-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className={`text-xs ${tip.ok ? 'text-gray-300' : 'text-gray-600'}`}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={!newPassword || !confirmPassword || loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 mt-1
                ${!newPassword || !confirmPassword || loading
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  {isRecovery ? t('changePassword.resetting') : t('changePassword.settingUp')}
                </>
              ) : (
                <>
                  {isRecovery ? t('changePassword.reset') : t('changePassword.continue')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

          </form>

          <div className="flex items-center gap-2 mt-6 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-gray-600 text-xs">{t('changePassword.privateNote')}</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage