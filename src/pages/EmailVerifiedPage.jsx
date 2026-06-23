import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function EmailVerifiedPage() {
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    async function handleVerification() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          setStatus('error')
          return
        }
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    handleVerification()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#020408' }}>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.2),transparent)]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-md text-center">

        <img src="/images/logo.svg" alt="Averion" className="h-8 w-auto mx-auto mb-10" />

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div>
              <h1 className="text-white text-3xl font-bold mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                Email Verified
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your account has been successfully verified. You can now sign in to Averion and access your dashboard.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full text-left">
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">What happens next</p>
              <div className="flex flex-col gap-3">
                {[
                  { n: '01', text: 'Sign in with your email and password' },
                  { n: '02', text: 'Set up your first simulation with ARIA' },
                  { n: '03', text: 'Add your team members and start training' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <span className="text-blue-400 text-xs font-bold">{item.n}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/login"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2563eb' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}>
              Sign in to your account
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link to="/" className="text-gray-500 text-xs hover:text-gray-300 transition">
              Back to home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <div>
              <h1 className="text-white text-3xl font-bold mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                Verification Failed
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                This verification link is invalid or has expired. Please register again or contact support.
              </p>
            </div>

            <Link to="/register"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2563eb' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}>
              Back to Register
            </Link>

            <Link to="/" className="text-gray-500 text-xs hover:text-gray-300 transition">
              Back to home
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

export default EmailVerifiedPage