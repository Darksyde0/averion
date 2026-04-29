import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

const modules = [
  {
    id: 1,
    title: 'Social Engineering Awareness',
    description: 'Understand manipulation techniques used by attackers to gain unauthorized access.',
    status: 'in-progress',
    color: 'from-red-800 to-red-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Phishing Detection Fundamentals',
    description: 'Learn to identify and respond to phishing attempts through email and messaging platforms.',
    status: 'new',
    color: 'from-blue-700 to-blue-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Password Security Best Practices',
    description: 'Create strong passwords, use password managers, and enable multi-factor authentication.',
    status: 'completed',
    color: 'from-green-700 to-green-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
]

function TrainingPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')

  const filteredModules = filter === 'all'
    ? modules
    : modules.filter(m => m.status === filter)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">John Doe</p>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">USER</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-3xl font-bold mb-1">Training Modules</h1>
          <p className="text-gray-500 text-sm mb-6">Expand your cybersecurity knowledge</p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Total Modules</p>
              <p className="text-blue-600 text-xl font-bold">38% Complete</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Completed</p>
              <p className="text-gray-800 text-2xl font-bold">3</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">In Progress</p>
              <p className="text-gray-800 text-2xl font-bold">3</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Total Points</p>
              <p className="text-gray-800 text-2xl font-bold">450</p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
            <p className="text-gray-700 text-sm font-semibold mb-3">Filter by Category</p>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'in-progress' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Module cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                className={`bg-gradient-to-br ${mod.color} rounded-2xl p-6 flex flex-col justify-between min-h-[240px] shadow-lg`}
              >
                {/* Top — icon + badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                    {mod.icon}
                  </div>
                  {mod.status === 'new' && (
                    <span className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-lg">NEW</span>
                  )}
                  {mod.status === 'in-progress' && (
                    <span className="bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg">IN PROGRESS</span>
                  )}
                  {mod.status === 'completed' && (
                    <span className="bg-green-400 text-white text-xs font-bold px-2 py-1 rounded-lg">COMPLETED</span>
                  )}
                </div>

                {/* Title + description */}
                <div className="flex-1">
                  <h2 className="text-white text-lg font-bold mb-2 leading-snug">
                    {mod.title}
                  </h2>
                  <p className="text-white text-xs leading-relaxed opacity-90 line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                {/* Button changes based on status */}
                {mod.status === 'completed' ? (
                  <button className="mt-4 w-full bg-white text-green-600 font-semibold text-sm py-2 rounded-xl cursor-default" disabled>
                    Completed ✓
                  </button>
                ) : mod.status === 'in-progress' ? (
                  <button onClick={() => navigate(`/training/${mod.id}`)} className="mt-4 w-full bg-white text-orange-500 font-semibold text-sm py-2 rounded-xl hover:bg-gray-100 transition">
                    Continue Module &gt;
                  </button>
                ) : (
                  <button onClick={() => navigate(`/training/${mod.id}`)} className="mt-4 w-full bg-white text-blue-600 font-semibold text-sm py-2 rounded-xl hover:bg-gray-100 transition">
                    Start Module &gt;
                  </button>
                )}

              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  )
}

export default TrainingPage