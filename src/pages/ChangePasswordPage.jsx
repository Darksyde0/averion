import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // Step 1 — Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setError('Failed to update password. Please try again.')
        setLoading(false)
        return
      }

      // Step 2 — Mark first_login as false in users table
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('users')
          .update({ first_login: false })
          .eq('id', user.id)
      }

      // Step 3 — Get role and redirect accordingly
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <nav className="bg-black flex items-center justify-between px-10 py-4">
        <img src="/images/logo.svg" alt="Averion Logo" className="h-9 w-auto" />
        <div className="flex items-center gap-8">
          <a href="/" className="text-white text-sm font-medium hover:text-blue-400 transition">Home</a>
          <a href="/about" className="text-white text-sm font-medium hover:text-blue-400 transition">About</a>
          <a href="/contact" className="text-white text-sm font-medium hover:text-blue-400 transition">Contact</a>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition">
            REGISTER
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-10">

        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl px-10 py-8 w-full max-w-md">

          <h1 className="text-white text-3xl font-extrabold text-center mb-2">
            Welcome to Averion
          </h1>
          <p className="text-yellow-400 text-sm font-semibold text-center mb-6">
            Before you continue, please set a new password
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* New Password */}
            <div>
              <label className="text-white text-sm font-semibold mb-2 block">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? (
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

            {/* Confirm Password */}
            <div>
              <label className="text-white text-sm font-semibold mb-2 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
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

            {/* Error message */}
            {error && (
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!newPassword || !confirmPassword || loading}
              className={`w-full font-semibold py-3 rounded-xl transition text-sm mt-2
                ${!newPassword || !confirmPassword || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </button>

          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-5 text-center">
        <p className="text-gray-400 text-sm">© 2026 CyberGuard. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default ChangePasswordPage