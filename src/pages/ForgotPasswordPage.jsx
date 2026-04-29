import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  // When submitted, this switches to the success view
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Switch to success state
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showRegister />

      <main className="flex-1 flex items-center justify-center px-4 py-24">

        {/* Dark card */}
        <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl px-12 py-10 w-full max-w-md">

          {/* Show form OR success message based on submitted state */}
          {!submitted ? (

            // ── FORM VIEW ──
            <>
              <h1 className="text-white text-3xl font-bold text-center mb-6">
                Reset Password
              </h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div>
                  <label className="text-white text-sm mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 rounded-lg transition"
                >
                  Reset
                </button>

                <p className="text-gray-400 text-sm text-center">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Back to Login
                  </Link>
                </p>

              </form>
            </>

          ) : (

            // ── SUCCESS VIEW ──
            <div className="flex flex-col items-center justify-center py-6 gap-5">

              <h1 className="text-white text-3xl font-bold text-center">
                Reset Password
              </h1>

              <p className="text-gray-300 text-base text-center">
                A link has been sent to your email
              </p>

              {/* Blue mail icon with notification dot */}
              <div className="relative mt-2">
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full z-10" />

                {/* Mail icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>

              {/* Back to login */}
              <Link
                to="/login"
                className="text-blue-400 text-sm font-semibold hover:underline mt-2"
              >
                Back to Login
              </Link>

            </div>

          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ForgotPasswordPage