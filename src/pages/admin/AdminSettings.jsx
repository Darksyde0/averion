import { useState } from 'react'
import AdminSidebar from '../../components/Admin/AdminSidebar'

function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '983-626-4352',
    jobTitle: 'System Administrator',
    employeeId: 'ADM-2024-0001',
  })

  // Organization form
  const [orgData, setOrgData] = useState({
    companyName: 'Averion Corp',
    industry: 'Technology',
    companyEmail: 'info@averion.com',
    companyPhone: '+1 234 567 8900',
    address: '123 Business Street, Tech City',
    website: 'www.averion.com',
  })

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    simulationsEnabled: true,
    trainingEnabled: true,
    achievementsEnabled: true,
    leaderboardEnabled: true,
    emailNotificationsEnabled: true,
    forcePasswordChange: true,
  })

  function handleProfileChange(e) {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  function handleOrgChange(e) {
    setOrgData({ ...orgData, [e.target.name]: e.target.value })
  }

  function handlePlatformToggle(key) {
    setPlatformSettings({ ...platformSettings, [key]: !platformSettings[key] })
  }

  function handleSave(e) {
    e.preventDefault()
    alert('Settings saved! Backend coming soon.')
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
      id: 'organization',
      label: 'Organization',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      id: 'platform',
      label: 'Platform',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-full pl-1 pr-5 py-1">
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-white font-bold text-sm leading-tight">John Doe</p>
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">
                  ADMIN
                </span>
              </div>
            </div>
            <button className="relative text-white hover:text-blue-400 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1117]" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">Manage your account and platform preferences</p>

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
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Profile Information</h2>
                  <p className="text-gray-500 text-sm mb-5">Update your personal details</p>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-xl bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
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
                        <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Last Name *</label>
                        <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Email Address *</label>
                        <input type="email" name="email" value={profileData.email} onChange={handleProfileChange}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Phone Number</label>
                        <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Job Title</label>
                        <input type="text" name="jobTitle" value={profileData.jobTitle} onChange={handleProfileChange}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Employee ID</label>
                        <input type="text" value={profileData.employeeId} disabled
                          className="w-full bg-gray-100 text-gray-400 rounded-xl px-4 py-3 text-sm cursor-not-allowed" />
                        <p className="text-gray-400 text-xs mt-1">Employee ID cannot be changed</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm">
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
                  <p className="text-gray-500 text-sm mb-6">Manage your password and security preferences</p>

                  <div className="border border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-5">Change Password</h3>
                    <form className="flex flex-col gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Current Password</label>
                        <input type="password" placeholder="Enter current password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">New Password</label>
                        <input type="password" placeholder="Enter new password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Confirm New Password</label>
                        <input type="password" placeholder="Confirm new password"
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-gray-700 text-sm font-semibold mb-2">Password requirements:</p>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li className="flex items-center gap-2"><span>•</span> At least 12 characters long</li>
                          <li className="flex items-center gap-2"><span>•</span> Contains uppercase and lowercase letters</li>
                          <li className="flex items-center gap-2"><span>•</span> Contains numbers and special characters</li>
                        </ul>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm">
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm font-semibold mb-1">Enable 2FA</p>
                        <p className="text-gray-500 text-xs mb-3">Add an extra layer of security to your account</p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          Two-factor authentication adds an additional layer of protection beyond your password.
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition text-sm flex-shrink-0">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ORGANIZATION TAB */}
              {activeTab === 'organization' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Organization Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">Manage your company information</p>

                  {/* Company logo */}
                  <div className="border border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-4">Company Logo</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Upload Logo
                          <input type="file" accept="image/*" className="hidden" />
                        </label>
                        <p className="text-gray-400 text-xs mt-2">PNG or SVG recommended — max 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Company details */}
                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-5">Company Details</h3>
                    <form onSubmit={handleSave}>
                      <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Company Name *</label>
                          <input type="text" name="companyName" value={orgData.companyName} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Industry</label>
                          <select name="industry" value={orgData.industry} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                            <option>Government</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Company Email</label>
                          <input type="email" name="companyEmail" value={orgData.companyEmail} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Company Phone</label>
                          <input type="text" name="companyPhone" value={orgData.companyPhone} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Address</label>
                          <input type="text" name="address" value={orgData.address} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Website</label>
                          <input type="text" name="website" value={orgData.website} onChange={handleOrgChange}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* PLATFORM TAB */}
              {activeTab === 'platform' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Platform Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">Enable or disable platform features for all users</p>

                  <div className="flex flex-col gap-4">

                    {/* Feature toggles */}
                    <div className="border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-gray-800 text-lg font-bold mb-4">Features</h3>
                      <div className="flex flex-col gap-4">
                        {[
                          { key: 'simulationsEnabled', label: 'Simulations', desc: 'Allow users to access simulation exercises' },
                          { key: 'trainingEnabled', label: 'Training Modules', desc: 'Allow users to access training content' },
                          { key: 'achievementsEnabled', label: 'Achievements', desc: 'Show achievements and badges to users' },
                          { key: 'leaderboardEnabled', label: 'Leaderboard', desc: 'Show company leaderboard to users' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                              <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={platformSettings[item.key]}
                                onChange={() => handlePlatformToggle(item.key)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security toggles */}
                    <div className="border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-gray-800 text-lg font-bold mb-4">Security Policies</h3>
                      <div className="flex flex-col gap-4">
                        {[
                          { key: 'forcePasswordChange', label: 'Force Password Change on First Login', desc: 'Users must change their password when they first log in' },
                          { key: 'emailNotificationsEnabled', label: 'Email Notifications', desc: 'Send email notifications to users about training and scores' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                              <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={platformSettings[item.key]}
                                onChange={() => handlePlatformToggle(item.key)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
                    >
                      Save Platform Settings
                    </button>
                  </div>
                </div>
              )}

              {/* NOTIFICATION TAB */}
              {activeTab === 'notification' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Notifications</h2>
                  <p className="text-gray-500 text-sm mb-6">Choose what notifications you want to receive</p>

                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'New user registrations', desc: 'Get notified when a new user is added' },
                      { label: 'User completes simulation', desc: 'Get notified when a user completes a simulation' },
                      { label: 'High risk user detected', desc: 'Get alerted when a user scores below 50%' },
                      { label: 'System announcements', desc: 'Important platform announcements' },
                      { label: 'Weekly progress report', desc: 'Receive a weekly summary of all user progress' },
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

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings