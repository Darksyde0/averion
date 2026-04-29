function FeatureSection() {
  return (
    <section className="bg-black py-20 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">

        {/* Left — bigger image */}
        <div className="flex-1 flex justify-center">
          <img
            src="/images/team-photo.jpg"
            alt="Team discussing cybersecurity"
            className="rounded-2xl w-full max-w-lg object-cover shadow-lg"
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Team+Photo'
            }}
          />
        </div>

        {/* Right — bigger heading and text */}
        <div className="flex-1 max-w-lg">
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 leading-snug">
            Protect Your Organization<br />from Human Error
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            Most cyber incidents don't break systems, they exploit people. Averion helps your team build awareness through continuous
            training and real-world scenarios.
          </p>
        </div>

      </div>
    </section>
  )
}

export default FeatureSection