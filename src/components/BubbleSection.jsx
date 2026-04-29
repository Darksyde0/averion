function BubbleSection() {
  return (
    // Full width, no max-width container, light background
    <section className="bg-[#f0f2f5] w-full overflow-hidden">
      <div className="flex flex-row items-stretch min-h-[400px]">

        {/* Left side — title + bubbles */}
        <div className="flex-1 flex flex-col justify-center px-12 py-12">
          <h1 className="text-black text-4xl font-bold mb-10">
            Reduce risk where it starts:
          </h1>

          {/* Bubbles in a row, growing in size left to right */}
          <div className="flex flex-row items-center gap-4">

            {/* Small bubble */}
<div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold text-center leading-snug shadow-lg flex-shrink-0">
  Recognize<br />Risks
</div>

{/* Medium bubble */}
<div className="w-48 h-48 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-bold text-center leading-snug shadow-lg flex-shrink-0">
  Avoid<br />Mistakes
</div>

{/* Large bubble */}
<div className="w-64 h-64 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold text-center leading-snug shadow-xl flex-shrink-0">
  Make Smart<br />Decisions
</div>
          </div>
        </div>

        {/* Right side — image fills full height, no rounding, edge to edge */}
        <div className="flex-1">
          <img
            src="/images/woman-laptop.jpg"
            alt="Professional working on a laptop"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/800x400/d1d5db/6b7280?text=Image'
            }}
          />
        </div>

      </div>
    </section>
  )
}

export default BubbleSection