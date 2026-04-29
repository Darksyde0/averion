import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">

      {/* Background image fills the entire section */}
      <img
        src="/images/hero-face.png"
        alt="Wireframe face visual"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Content sits on top of the background image */}
      <div className="relative z-10 flex items-center h-screen px-12 max-w-7xl mx-auto">
        <div className="max-w-xl">
          <h3 className="text-white text-5xl font-bold leading-tight mb-5">
            Everything you need to<br />reduce human errors.
          </h3>
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            Interactive training and assessments that help teams<br />
            recognize threats and make safer decisions.
          </p>
          <div className="flex gap-4">
            <Link
              to="/about"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded transition uppercase tracking-wide"
            >
              LEARN MORE
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded transition uppercase tracking-wide"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}

export default HeroSection