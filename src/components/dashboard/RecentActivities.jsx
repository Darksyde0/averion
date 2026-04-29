function RecentActivities() {
  const activities = [
    {
      id: 1,
      title: 'Phishing Detection Quiz',
      score: 'Completed with 88% score',
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'Social Engineering Module',
      score: 'Completed with 88% score',
      time: 'Yesterday',
    },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-gray-800 text-lg font-bold mb-4">Recent Activities</h2>

      <div className="flex flex-col gap-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-[#1a2744] rounded-xl px-4 py-4 flex items-center gap-4"
          >
            {/* Green checkmark icon */}
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Activity info */}
            <div>
              <p className="text-white font-semibold text-sm">{activity.title}</p>
              <p className="text-gray-300 text-xs">{activity.score}</p>
              <p className="text-green-400 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivities