import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function ContactPage() {
  // Track form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    message: '',
    notRobot: false,
  })

  // Update form fields as user types
  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // Handle form submission (no backend yet)
  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.notRobot) {
      alert('Please confirm you are not a robot.')
      return
    }
    alert('Message sent! We will get back to you soon.')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Main content — pushed down below fixed navbar */}
      <main className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-16 items-start">

          {/* ── LEFT SIDE ── */}
          <div className="flex-1">

            {/* Small label */}
            <p className="text-black font-bold text-sm tracking-widest uppercase mb-3">
              Contact Us
            </p>

            {/* Big blue heading */}
            <h1 className="text-blue-600 text-6xl font-bold leading-tight mb-5">
              Get in touch<br />today
            </h1>

            {/* Subtext */}
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              We love questions and feedback – and we're always happy to
              help! Here are some ways to contact us.
            </p>

            {/* Email box */}
            <div className="flex items-center gap-4 bg-gray-300 rounded-lg px-6 py-4 mb-4 max-w-sm">
              {/* Email icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-black font-medium text-base">email@averion.com</span>
            </div>

            {/* Phone box */}
            <div className="flex items-center gap-4 bg-gray-300 rounded-lg px-6 py-4 mb-8 max-w-sm">
              {/* Phone icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-black font-medium text-base">912345678463</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              {/* Facebook */}
              <a href="#" className="text-blue-600 hover:text-blue-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="text-blue-600 hover:text-blue-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-blue-600 hover:text-blue-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── RIGHT SIDE — Blue form card ── */}
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Full Name */}
              <div>
                <label className="text-white text-sm font-medium mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-white text-sm font-medium mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              {/* Company (Optional) */}
              <div>
                <label className="text-white text-sm font-medium mb-1 block">
                  Company <span className="italic font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-white text-sm font-medium mb-1 block">
                  Leave us a message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here...."
                  rows={5}
                  className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white resize-none"
                  required
                />
              </div>

              {/* I'm not a robot checkbox */}
              <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="notRobot"
                  checked={formData.notRobot}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-gray-700 text-sm">I'm not a robot</span>
              </div>

              {/* Send button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  Send Message
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage