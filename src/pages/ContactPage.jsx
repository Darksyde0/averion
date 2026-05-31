import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useTranslation } from '../hooks/useTranslation'

function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const contactInfo = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      label: 'Email',
      value: 'email@averion.com',
      href: 'mailto:email@averion.com',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      label: 'Phone',
      value: '+351 912 345 678',
      href: 'tel:+351912345678',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      label: 'Location',
      value: 'Aveiro, Portugal',
      href: '#',
    },
  ]

  const socials = [
    {
      label: 'Facebook',
      href: '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      label: 'X',
      href: '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.2),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
              {t('contact.badge')}
            </span>
          </div>
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-5"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            {t('contact.heading')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('contact.subtext')}
            </span>
          </h1>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left — contact info ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Contact cards */}
            <div className="bg-[#04080f] border border-white/5 rounded-2xl p-6">
              <p className="text-white text-sm font-semibold mb-5">Contact Information</p>
              <div className="flex flex-col gap-4">
                {contactInfo.map((info, i) => (
                  <a key={i} href={info.href} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors duration-200">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{info.label}</p>
                      <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors duration-200">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="bg-[#04080f] border border-white/5 rounded-2xl p-6">
              <p className="text-white text-sm font-semibold mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
                {socials.map((s, i) => (
                  <a key={i} href={s.href}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/20 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-200">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Form not yet active */}
            <div className="bg-gradient-to-br from-red-600/10 to-red-900/10 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <p className="text-red-400 text-xs font-semibold">Form not yet active</p>
              </div>
              <p className="text-white text-3xl font-bold">Soon</p>
              <p className="text-gray-400 text-xs mt-1">We're working on it</p>
            </div>

          </div>

          {/* ── Right — form ── */}
          <div className="lg:col-span-3">
            <div className="bg-[#04080f] border border-white/5 rounded-2xl p-8">

              {!submitted ? (
                <>
                  <h2 className="text-white font-bold text-lg mb-6">{t('contact.send')}</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                          {t('contact.name')} <span className="text-red-400">*</span>
                        </label>
                        <input type="text" name="fullName" value={formData.fullName}
                          onChange={handleChange} placeholder="John Doe"
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                          {t('contact.email')} <span className="text-red-400">*</span>
                        </label>
                        <input type="email" name="email" value={formData.email}
                          onChange={handleChange} placeholder="john@company.com"
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                        {t('contact.subject')}
                        <span className="text-gray-600 font-normal normal-case ml-1">({t('common.optional')})</span>
                      </label>
                      <input type="text" name="company" value={formData.company}
                        onChange={handleChange} placeholder="Your company name"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                        {t('contact.message')} <span className="text-red-400">*</span>
                      </label>
                      <textarea name="message" value={formData.message}
                        onChange={handleChange} placeholder="Tell us how we can help..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                        required />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-gray-600 text-xs">
                        We'll never share your information with anyone.
                      </p>
                      <button type="submit" disabled={loading}
                        className={`flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200
                          ${loading
                            ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            {t('contact.send')}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{t('contact.successTitle')}</h3>
                  <p className="text-gray-400 text-sm mb-8 max-w-xs">{t('contact.successText')}</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ fullName: '', email: '', company: '', message: '' }) }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200">
                    {t('contact.send')} →
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage