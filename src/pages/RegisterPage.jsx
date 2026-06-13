import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useTranslation } from '../hooks/useTranslation'

const DEPARTMENTS = [
  'C-Suite / Executive',
  'Engineering',
  'Information Technology',
  'Cybersecurity',
  'Human Resources',
  'Finance',
  'Accounting',
  'Marketing',
  'Sales',
  'Operations',
  'Legal & Compliance',
  'Customer Success',
  'Product Management',
  'Design',
  'Data & Analytics',
  'Research & Development',
  'Procurement',
  'Administration',
  'Management',
  'Other',
]

function DepartmentSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-white/5 border border-white/10 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition flex items-center justify-between"
        style={{ color: value ? '#fff' : '#4b5563' }}>
        <span>{value || 'Select department'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden"
          style={{
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            maxHeight: '220px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => { onChange(dept); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                color: value === dept ? '#60a5fa' : 'rgba(255,255,255,0.75)',
                backgroundColor: value === dept ? 'rgba(59,130,246,0.1)' : 'transparent',
              }}
              onMouseEnter={e => { if (value !== dept) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (value !== dept) e.currentTarget.style.backgroundColor = 'transparent' }}>
              {dept}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [registered, setRegistered] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    department: '',
    jobTitle: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleNextStep(e) {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.fullName.trim()) { setError('Full name is required.'); return }
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!formData.companyName.trim()) { setError('Company name is required.'); return }
    if (!formData.department) { setError('Please select a department.'); return }
    if (!formData.jobTitle.trim()) { setError('Job title is required.'); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to create an account.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'))
      return
    }
    if (formData.password.length < 8) {
      setError(t('register.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            company_name: formData.companyName.trim(),
            department: formData.department,
            job_title: formData.jobTitle.trim(),
            employee_id: formData.employeeId.trim() || null,
            role: 'admin',
          }
        }
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('rate limit') ||
          authError.message.toLowerCase().includes('email')) {
          setError('Too many attempts. Please wait a few minutes and try again.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (!data?.user?.id) {
        setError('Registration failed. Please try again with a different email.')
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        job_title: formData.jobTitle.trim(),
        employee_id: formData.employeeId.trim() || null,
        company_name: formData.companyName.trim(),
        role: 'admin',
        first_login: false,
        organization_id: data.user.id,
      })

      if (profileError) {
        console.error('Profile error:', profileError)
        await supabase.auth.signOut()
        if (profileError.message.includes('duplicate key') ||
          profileError.message.includes('users_email_key')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError('Account setup failed. Please try again.')
        }
        setLoading(false)
        return
      }

      setRegistered(true)
      setLoading(false)

    } catch (err) {
      console.error('Registration error:', err)
      await supabase.auth.signOut()
      setError('Something went wrong. Please try again.')
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

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "text-gray-300 text-xs font-semibold uppercase tracking-wide mb-2 block"

  if (registered) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.2),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center max-w-md w-full">
          <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto mx-auto mb-10" />

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>

          <h1 className="text-white text-3xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Registration Successful!
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            Your account has been created. We sent a verification link to:
          </p>
          <p className="text-blue-400 font-semibold text-sm mb-8">{formData.email}</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Next Steps</p>
            <div className="flex flex-col gap-4">
              {[
                { step: '01', text: 'Check your inbox for the verification email' },
                { step: '02', text: 'Click the verification link to activate your account' },
                { step: '03', text: 'Return here and sign in to your dashboard' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-xs font-bold">{item.step}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-xs mb-8">
            Don't see the email? Check your spam or junk folder.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link to="/login"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 text-center">
              Go to Sign In
            </Link>
            <button
              onClick={() => {
                setRegistered(false)
                setStep(1)
                setAgreedToTerms(false)
                setFormData({ fullName: '', email: '', companyName: '', department: '', jobTitle: '', employeeId: '', password: '', confirmPassword: '' })
              }}
              className="text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200">
              Register a different account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden">

      {/* Left panel */}
      <div aria-hidden="true" className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.3),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-medium transition-colors duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('common.back')}
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Admin Registration</span>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            Protect your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              entire organization.
            </span>
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            Set up your admin account to start training your team, running simulations, and tracking security awareness.
          </p>

          <div className="flex flex-col gap-4 mt-10">
            {[
              { n: '01', title: 'Create your admin account' },
              { n: '02', title: 'Add your team members' },
              { n: '03', title: 'Assign training & simulations' },
              { n: '04', title: 'Track progress & reduce risk' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">{s.n}</span>
                </div>
                <p className="text-gray-300 text-sm">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-yellow-400 text-xs font-semibold">Beta Version</p>
          </div>
          <p className="text-gray-300 text-sm">Averion is currently in beta. Features may change as we continue building and improving the platform.</p>
        </div>
      </div>

      {/* Right panel */}
      <main id="main-content" className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div aria-hidden="true" className="absolute inset-0 bg-[#04080f] lg:bg-transparent" />

        <div className="relative z-10 w-full max-w-md">

          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/images/logo.svg" alt="Averion" className="h-9 w-auto" />
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-xs font-medium transition-colors duration-200 mb-6 group lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('common.back')}
          </Link>

          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t('register.title')}
            </h1>
            <p className="text-gray-300 text-sm">{t('register.subtext')}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300
                  ${step >= s ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                  {step > s
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    : s}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                    {s === 1 ? t('register.step1') : t('register.step2')}
                  </p>
                </div>
                {s === 1 && <div className={`w-8 h-px ${step >= 2 ? 'bg-blue-600' : 'bg-white/10'} flex-shrink-0`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="flex flex-col gap-5">
              <div>
                <label htmlFor="reg-fullName" className={labelClass}>{t('register.fullName')}</label>
                <input
                  type="text" id="reg-fullName" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="John Doe" required className={inputClass} />
              </div>

              <div>
                <label htmlFor="reg-email" className={labelClass}>{t('register.email')}</label>
                <input
                  type="email" id="reg-email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@company.com" required className={inputClass} />
              </div>

              <div>
                <label htmlFor="reg-companyName" className={labelClass}>{t('register.companyName')}</label>
                <input
                  type="text" id="reg-companyName" name="companyName" value={formData.companyName}
                  onChange={handleChange} placeholder="e.g. Acme Corporation" required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* ── Department custom dropdown ── */}
                <div>
                  <label className={labelClass}>{t('register.department')}</label>
                  <DepartmentSelect
                    value={formData.department}
                    onChange={val => setFormData(prev => ({ ...prev, department: val }))}
                  />
                </div>
                <div>
                  <label htmlFor="reg-jobTitle" className={labelClass}>{t('register.jobTitle')}</label>
                  <input
                    type="text" id="reg-jobTitle" name="jobTitle" value={formData.jobTitle}
                    onChange={handleChange} placeholder="IT Manager" required className={inputClass} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="reg-employeeId" className={labelClass} style={{ marginBottom: 0 }}>
                    {t('register.employeeId')}
                  </label>
                  <span className="text-gray-300 text-xs">{t('common.optional')}</span>
                </div>
                <input
                  type="text" id="reg-employeeId" name="employeeId" value={formData.employeeId}
                  onChange={handleChange} placeholder="e.g. EMP-1234" className={inputClass} />
                <p className="text-gray-300 text-xs mt-1.5">{t('register.employeeIdHint')}</p>
              </div>

              <button type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1">
                {t('register.continue')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="reg-password" className={labelClass}>{t('register.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? eyeOff : eyeOpen}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${formData.password.length >= i * 2
                            ? i <= 2 ? 'bg-red-500' : i === 3 ? 'bg-yellow-500' : 'bg-green-500'
                            : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {formData.password.length < 4 ? t('changePassword.tooShort') :
                        formData.password.length < 6 ? t('changePassword.weak') :
                          formData.password.length < 8 ? t('changePassword.fair') : t('changePassword.strong')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirmPassword" className={labelClass}>{t('register.confirmPassword')}</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="reg-confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    className={`${inputClass} ${formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? 'border-red-500/50 focus:ring-red-500'
                      : formData.confirmPassword && formData.confirmPassword === formData.password
                        ? 'border-green-500/50 focus:ring-green-500'
                        : ''}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showConfirm ? eyeOff : eyeOpen}
                  </button>
                  {formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Account summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  {t('register.accountSummary')}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: t('register.fullName'), value: formData.fullName },
                    { label: t('register.email'), value: formData.email },
                    { label: t('register.companyName'), value: formData.companyName },
                    { label: 'Role', value: t('register.role') },
                    ...(formData.employeeId ? [{ label: t('register.employeeId'), value: formData.employeeId }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <p className="text-gray-300 text-xs font-medium truncate max-w-[180px]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* T&C Checkbox */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      className="sr-only peer"
                      required
                      aria-required="true"
                      aria-describedby="terms-desc" />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                      ${agreedToTerms
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-transparent border-white/30 group-hover:border-blue-500'}`}>
                      {agreedToTerms && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span id="terms-desc" className="text-gray-300 text-xs leading-relaxed">
                    I have read and agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                      Terms & Conditions
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                      Privacy Policy
                    </a>
                    . I understand that Averion will process my data in accordance with these policies.
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all duration-200">
                  {t('common.back')}
                </button>
                <button type="submit" disabled={loading}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${loading ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                      {t('register.creating')}
                    </>
                  ) : t('register.createAccount')}
                </button>
              </div>
            </form>
          )}

          <p className="text-gray-400 text-xs text-center mt-6">
            {t('register.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
              {t('login.signIn')}
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}

export default RegisterPage