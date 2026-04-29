function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* Training Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Training Progress</p>
        <p className="text-blue-600 text-2xl font-bold mb-2">38% Complete</p>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '38%' }} />
        </div>
      </div>

      {/* Latest Score */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Latest Score</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">Phishing Detection Quiz</p>
        <p className="text-green-500 text-2xl font-bold">88%</p>
      </div>

      {/* Pending Training */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Pending Training</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">Modules to complete</p>
        <p className="text-red-500 text-2xl font-bold">6</p>
      </div>

      {/* Threat Awareness */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Threat Awareness</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">Top 10% in company</p>
        <p className="text-purple-600 text-2xl font-bold">High</p>
      </div>

    </div>
  )
}

export default StatsCards