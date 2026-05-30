import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AboutPage() {
  const values = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      title: 'Simplicity First',
      desc: 'We make complex security concepts accessible to everyone, regardless of technical background.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: 'People Focused',
      desc: 'Our platform is built around how humans actually learn, through stories, scenarios, and real examples.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Proven Results',
      desc: 'Organizations using Averion report measurable improvements in threat detection and safer team behavior.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: 'Continuous Learning',
      desc: 'Security threats evolve daily. Our content stays current so your team is always prepared.',
    },
  ]

  const stats = [
  { value: 'No', label: 'Technical Background Needed' },
  { value: 'Real', label: 'World Scenarios' },
  { value: 'Live', label: 'Progress Tracking' },
  { value: '3', label: 'Languages Supported' },
]
 
  return (
    <div className="flex flex-col min-h-screen bg-[#020408]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">

        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.2),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Our Story</span>
              </div>

              <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                Built to protect<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  the human layer.
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Averion is a web-based cybersecurity awareness platform designed for everyday professionals, not just security experts.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                Most cyber incidents don't happen because systems are weak. They happen because people are targeted. We built Averion to close that gap, turning your team from your biggest vulnerability into your strongest line of defense.
              </p>
            </div>

            {/* Right — image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#020408] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
              <img src="/images/about-hero.jpg" alt="Cybersecurity awareness"
                className="w-full h-[500px] object-cover rounded-2xl"
                onError={e => { e.target.src = 'https://placehold.co/700x500/0d1117/1d4ed8?text=Averion' }} />

              {/* Floating badge */}
              <div className="absolute top-6 right-6 z-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-white text-2xl font-bold">2026</p>
                <p className="text-gray-400 text-xs mt-0.5">Founded</p>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-blue-500/50" />
          <div className="w-1 h-1 rounded-full bg-blue-500/50" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#04080f] border-y border-white/5 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-4xl font-bold mb-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Purpose ── */}
      <section className="bg-[#020408] py-28 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(29,78,216,0.08),transparent)]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-3xl blur-xl" />
              <img src="/images/about-team.jpg" alt="Team collaborating"
                className="relative w-full h-[420px] object-cover rounded-2xl border border-white/5"
                onError={e => { e.target.src = 'https://placehold.co/700x420/0d1117/1d4ed8?text=Our+Team' }} />

              {/* Floating card */}
              <div className="absolute -bottom-5 -right-5 bg-[#04080f] border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-green-400 text-xs font-semibold">Now Available</p>
                </div>
                <p className="text-white text-xl font-bold">Early</p>
                <p className="text-gray-500 text-xs">Access Open</p>
              </div>
            </div>

            {/* Right — text */}
            <div className="order-1 lg:order-2">
              <p className="text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3">Our Purpose</p>
              <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                Security starts<br />
                <span className="text-gray-500">with your people.</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-5">
                Our goal is to help organizations build stronger cybersecurity awareness by focusing on the people behind the systems.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                We believe that with the right knowledge and guidance, anyone can learn to recognize common threats and make safer decisions online, no technical background required.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  'Designed for non-technical employees',
                  'Real-world scenarios and simulations',
                  'Measurable improvement in security posture',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[#04080f] py-28 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {values.map((v, i) => (
              <div key={i} className="bg-[#04080f] hover:bg-blue-950/20 p-8 transition-colors duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:bg-blue-500/20 transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* ── CTA ── */}
      <section className="bg-[#04080f] border-t border-white/5 py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-5"
            style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
            Ready to protect<br />your organization?
          </h2>
          <p className="text-gray-500 text-base mb-8">
            Join hundreds of organizations already using Averion to build a security-aware culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200">
              Get Started Free
            </a>
            <a href="/contact"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutPage