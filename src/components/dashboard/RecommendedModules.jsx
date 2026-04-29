function RecommendedModules() {
  const modules = [
    {
      id: 1,
      title: 'Social Engineering Awareness',
      description: 'Understand manipulation techniques',
    },
    {
      id: 2,
      title: 'Phishing Detection Fundamentals',
      description: 'Identify phishing emails',
    },
    {
      id: 3,
      title: 'Password Security Best Practices',
      description: 'Create strong passwords',
    },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-gray-800 text-lg font-bold mb-4 text-center">
        Recommended for You
      </h2>

      <div className="flex flex-col gap-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-[#1a2744] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            {/* Blue dot + text */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">{mod.title}</p>
                <p className="text-gray-400 text-xs">{mod.description}</p>
                <button className="text-blue-400 text-xs mt-1 hover:underline">
                  Start Module &gt;
                </button>
              </div>
            </div>

            {/* NEW badge */}
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">
              NEW
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendedModules