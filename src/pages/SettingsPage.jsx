import { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'

function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@work.com',
    phone: '983-626-4352',
    department: 'Engineering',
    jobTitle: 'Senior Developer',
    employeeId: 'EMP-2024-0156',
  })

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSave(e) {
    e.preventDefault()
    alert('Changes saved! Backend coming soon.')
  }

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ),
    },
  ]

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
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">John Doe</p>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                USER
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">Manage your account preferences</p>

          <div className="flex gap-6 items-start">

            {/* Left — tab menu */}
            <div className="w-52 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition mb-1
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right — content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">
                    Profile Information
                  </h2>
                  <p className="text-gray-500 text-sm mb-5">
                    Update your personal and professional details
                  </p>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-xl bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Change Photo
                    </button>
                  </div>

                  <form onSubmit={handleSave}>
                    <div className="grid grid-cols-2 gap-5 mb-5">

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Engineering</option>
                          <option>Human Resources</option>
                          <option>Finance</option>
                          <option>Marketing</option>
                          <option>Operations</option>
                          <option>Management</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Job Title</label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          className="w-full bg-gray-100 text-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                    </div>

                    <div className="mb-8">
                      <label className="text-gray-700 text-sm font-medium mb-1 block">Employee ID</label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        disabled
                        className="w-full bg-gray-100 text-gray-400 rounded-lg px-4 py-3 text-sm cursor-not-allowed"
                      />
                      <p className="text-gray-400 text-xs mt-1">Employee ID cannot be changed</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold mb-1">Security Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Manage your password and security preferences
                  </p>

                  {/* Change Password card */}
                  <div className="border border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-5">Change Password</h3>

                    <form className="flex flex-col gap-4">

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Password requirements */}
                      <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-gray-700 text-sm font-semibold mb-2">
                          Password requirements:
                        </p>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li className="flex items-center gap-2">
                            <span>•</span> At least 12 characters long
                          </li>
                          <li className="flex items-center gap-2">
                            <span>•</span> Contains uppercase and lowercase letters
                          </li>
                          <li className="flex items-center gap-2">
                            <span>•</span> Contains numbers and special characters
                          </li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
                        >
                          Update Password
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* Two-Factor Authentication card */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm font-semibold mb-1">Enable 2FA</p>
                        <p className="text-gray-500 text-xs mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          Two-factor authentication adds an additional layer of protection
                          beyond your password. You'll need your phone to complete sign-in.
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition text-sm flex-shrink-0">
                        Enable
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* NOTIFICATION TAB */}
              {activeTab === 'notification' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Notifications</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Choose what notifications you want to receive
                  </p>

                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'New training modules available', desc: 'Get notified when new modules are added' },
                      { label: 'Quiz reminders', desc: 'Receive reminders for pending quizzes' },
                      { label: 'Score updates', desc: 'Get notified when your score changes' },
                      { label: 'System announcements', desc: 'Important platform announcements' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Privacy</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Control your privacy and data settings
                  </p>

                  <div className="flex flex-col gap-4">

                    {/* First item — locked ON + greyed out */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-50">
                      <div>
                        <p className="text-gray-800 text-sm font-semibold">
                          Show my progress to admin
                        </p>
                        <p className="text-gray-400 text-xs">
                          Allow your admin to view your training progress
                        </p>
                      </div>
                      {/* Locked toggle — grey */}
                      <div className="cursor-not-allowed">
                        <div className="w-11 h-6 bg-gray-400 rounded-full relative">
                          <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {/* Remaining items — normal toggles */}
                    {[
                      { label: 'Show my score on leaderboard', desc: 'Display your score on the company leaderboard' },
                      { label: 'Allow data for improvement', desc: 'Help improve Averion by sharing anonymous usage data' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>
                    ))}

                  </div>

                  <div className="flex justify-end mt-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm">
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage