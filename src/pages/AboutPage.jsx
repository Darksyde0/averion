import Navbar from '../components/Navbar'

function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative min-h-[580px] flex items-center overflow-hidden pt-16"
        style={{
          background: 'linear-gradient(to right, #0d9488, #0f2d6b, #0a1a4a)',
        }}
      >
        {/* Diagonal decorative lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute top-0 right-0 w-full h-full"
            viewBox="0 0 1080 580"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line x1="460" y1="0" x2="700" y2="580" stroke="rgba(100,160,255,0.25)" strokeWidth="1" />
            <line x1="560" y1="0" x2="820" y2="580" stroke="rgba(100,160,255,0.2)" strokeWidth="1" />
            <line x1="660" y1="0" x2="1000" y2="580" stroke="rgba(200,200,100,0.2)" strokeWidth="1" />
            <line x1="780" y1="0" x2="1080" y2="460" stroke="rgba(100,160,255,0.15)" strokeWidth="1" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-16 py-20 max-w-2xl">
          <h1 className="text-white text-7xl font-bold mb-8">About Averion</h1>
          <p className="text-white text-base leading-relaxed mb-4">
            Averion is a web-based cybersecurity awareness platform designed for
            everyday professionals, not cybersecurity experts.
          </p>
          <p className="text-white text-base leading-relaxed">
            In today's digital world, many cyber incidents don't happen because
            systems are weak, but because simple threats are often overlooked.
            Employees may unknowingly click on suspicious links, trust fake
            messages, or miss warning signs that seem harmless at first. Averion
            was created to address this gap.
          </p>
        </div>

        {/* Circle image — right side */}
        <div className="absolute right-24 top-1/2 -translate-y-1/2 z-10">
          <img
            src="/images/about-hero.jpg"
            alt="Averion cybersecurity awareness platform logo representing professional digital security training"
            className="w-96 h-96 rounded-full object-cover border-4 border-white/20"
          />
        </div>
      </section>

      {/* PURPOSE SECTION */}
      <section className="flex-1 bg-white py-20 px-16">
        <div className="max-w-5xl mx-auto flex items-center gap-16">

          {/* Left — rectangle image with rounded corners */}
          <div className="flex-shrink-0 w-[480px]">
            <img
              src="/images/about-team.jpg"
              alt="Two professionals collaborating at a computer workstation, representing teamwork in building cybersecurity awareness"
              className="w-full h-80 rounded-2xl object-cover"
            />
          </div>

          {/* Right — text */}
          <div className="flex-1 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-wide">
              OUR PURPOSE
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed">
              Our goal is to help organizations build stronger cybersecurity
              awareness by focusing on the people behind the systems. We believe
              that with the right knowledge and guidance, anyone can learn to
              recognize common threats and make safer decisions online.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-6 text-center">
        <p className="text-white text-sm">© 2026 Averion. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default AboutPage