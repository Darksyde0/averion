import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function CookieDeclaration() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://consent.cookiebot.com/b25de5fe-3a30-48ea-8969-b431819ea233/cd.js'
    script.async = true
    document.getElementById('cookie-declaration').appendChild(script)
    return () => {
      const el = document.getElementById('cookie-declaration')
      if (el) el.innerHTML = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Cookie Declaration</h1>
        <p className="text-gray-500 text-sm mb-8">
          This page describes how Averion uses cookies and similar technologies.
        </p>
        <div id="cookie-declaration" />
      </div>
      <Footer />
    </div>
  )
}

export default CookieDeclaration