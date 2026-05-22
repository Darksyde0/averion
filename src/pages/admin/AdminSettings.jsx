import { useState, useEffect, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth, mediaHeight
  )
}

function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const profile = useProfile()

  // ── AVATAR ──
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarRemoving, setAvatarRemoving] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  // ── PROFILE ──
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', jobTitle: '', employeeId: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── SECURITY ──
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // ── ORGANIZATION ──
  const [orgData, setOrgData] = useState({
    companyName: '', industry: '', companyEmail: '', companyPhone: '', address: '', website: '',
  })
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgSaveSuccess, setOrgSaveSuccess] = useState(false)

  // ── PLATFORM ──
  const [platformSettings, setPlatformSettings] = useState({
    simulationsEnabled: true, trainingEnabled: true,
    achievementsEnabled: true, leaderboardEnabled: true,
    emailNotificationsEnabled: true, forcePasswordChange: true,
  })
  const [platformSaving, setPlatformSaving] = useState(false)
  const [platformSuccess, setPlatformSuccess] = useState(false)

  // ── NOTIFICATION ──
  const [notifications, setNotifications] = useState({
    newUsers: true, simulationComplete: true,
    highRisk: true, announcements: true, weeklyReport: true,
  })
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)

  // ── POPULATE FORMS ──
  useEffect(() => {
    if (profile) {
      const nameParts = profile.full_name?.split(' ') || []
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || '',
        employeeId: profile.employee_id || '',
      })
      setOrgData({
        companyName: profile.company_name || '',
        industry: profile.industry || '',
        companyEmail: profile.company_email || '',
        companyPhone: profile.company_phone || '',
        address: profile.address || '',
        website: profile.website || '',
      })
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
      if (profile.notification_preferences) {
        setNotifications(prev => ({ ...prev, ...profile.notification_preferences }))
      }
    }
  }, [profile])

  // ── AVATAR ──
  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB.'); return }
    const reader = new FileReader()
    reader.addEventListener('load', () => { setImgSrc(reader.result?.toString() || ''); setCropModalOpen(true) })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function onImageLoad(e) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  async function handleCropAndUpload() {
    if (!completedCrop || !imgRef.current || !canvasRef.current || !profile) return
    setAvatarUploading(true)
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, 400, 400)
    canvas.toBlob(async (blob) => {
      if (!blob) { setAvatarUploading(false); return }
      const fileName = `${profile.id}.jpg`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) { alert('Upload failed: ' + uploadError.message); setAvatarUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const urlWithCache = `${publicUrl.split('?')[0]}?t=${Date.now()}`
      const { error: updateError } = await supabase.from('users').update({ avatar_url: urlWithCache }).eq('id', profile.id)
      if (!updateError) setAvatarUrl(urlWithCache)
      setAvatarUploading(false)
      setCropModalOpen(false)
      setImgSrc('')
    }, 'image/jpeg', 0.9)
  }

  async function handleRemoveAvatar() {
    if (!profile) return
    setAvatarRemoving(true)
    for (const ext of ['jpg', 'jpeg', 'png', 'gif', 'webp']) {
      await supabase.storage.from('avatars').remove([`${profile.id}.${ext}`])
    }
    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', profile.id)
    if (!error) setAvatarUrl(null)
    setAvatarRemoving(false)
  }

  // ── PROFILE SAVE ──
  async function handleSave(e) {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    setSaveSuccess(false)
    const { error } = await supabase.from('users').update({
      full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.email,
      phone: profileData.phone,
      job_title: profileData.jobTitle,
    }).eq('id', profile.id)
    setSaving(false)
    if (!error) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000) }
  }

  // ── PASSWORD SAVE ──
  async function handlePasswordSave(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (!passwordData.currentPassword) { setPasswordError('Please enter your current password.'); return }
    if (passwordData.newPassword.length < 8) { setPasswordError('New password must be at least 8 characters.'); return }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError('New passwords do not match.'); return }
    setPasswordSaving(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: profile.email, password: passwordData.currentPassword })
    if (signInError) { setPasswordError('Current password is incorrect.'); setPasswordSaving(false); return }
    const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.newPassword })
    setPasswordSaving(false)
    if (updateError) { setPasswordError(updateError.message) }
    else { setPasswordSuccess(true); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setTimeout(() => setPasswordSuccess(false), 3000) }
  }

  // ── ORG SAVE ──
  async function handleOrgSave(e) {
    e.preventDefault()
    setOrgSaving(true)
    setOrgSaveSuccess(false)
    const { error } = await supabase.from('users').update({
      company_name: orgData.companyName,
      industry: orgData.industry,
      company_email: orgData.companyEmail,
      company_phone: orgData.companyPhone,
      address: orgData.address,
      website: orgData.website,
    }).eq('id', profile.id)
    setOrgSaving(false)
    if (!error) { setOrgSaveSuccess(true); setTimeout(() => setOrgSaveSuccess(false), 3000) }
  }

  // ── PLATFORM SAVE ──
  async function handlePlatformSave() {
    setPlatformSaving(true)
    setPlatformSuccess(false)
    const { error } = await supabase.from('users').update({ platform_settings: platformSettings }).eq('id', profile.id)
    setPlatformSaving(false)
    if (!error) { setPlatformSuccess(true); setTimeout(() => setPlatformSuccess(false), 3000) }
  }

  // ── NOTIFICATION SAVE ──
  async function handleNotifSave() {
    setNotifSaving(true)
    setNotifSuccess(false)
    const { error } = await supabase.from('users').update({ notification_preferences: notifications }).eq('id', profile.id)
    setNotifSaving(false)
    if (!error) { setNotifSuccess(true); setTimeout(() => setNotifSuccess(false), 3000) }
  }

  function EyeIcon({ show }) {
    return show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
    { id: 'security', label: 'Security', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> },
    { id: 'organization', label: 'Organization', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> },
    { id: 'platform', label: 'Platform', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'notification', label: 'Notification', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg> },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      {/* ── CROP MODAL ── */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-gray-800 text-lg font-bold">Crop Photo</h3>
                <p className="text-gray-400 text-xs mt-0.5">Drag to reposition. Resize the box to crop.</p>
              </div>
              <button onClick={() => { setCropModalOpen(false); setImgSrc('') }} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-gray-900 min-h-[300px]">
              {imgSrc && (
                <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50} minHeight={50}>
                  <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} style={{ maxHeight: '400px', maxWidth: '100%' }} />
                </ReactCrop>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <canvas ref={canvasRef} className="hidden" />
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">Preview</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setCropModalOpen(false); setImgSrc('') }} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
                <button onClick={handleCropAndUpload} disabled={avatarUploading || !completedCrop}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition ${avatarUploading || !completedCrop ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {avatarUploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">
          <h1 className="text-gray-800 text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">Manage your account and platform preferences</p>

          <div className="flex gap-6 items-start">

            {/* Left — tabs */}
            <div className="w-52 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex-shrink-0">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition mb-1
                    ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* Right — content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Profile Information</h2>
                  <p className="text-gray-500 text-sm mb-5">Update your personal details</p>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" onError={() => setAvatarUrl(null)} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Change Photo
                      </button>
                      {avatarUrl && (
                        <button type="button" onClick={handleRemoveAvatar} disabled={avatarRemoving}
                          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition
                            ${avatarRemoving ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          {avatarRemoving ? 'Removing...' : 'Remove Photo'}
                        </button>
                      )}
                      <p className="text-gray-400 text-xs">JPG, PNG or GIF — max 10MB</p>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-5">
                      <p className="text-green-600 text-sm font-semibold">✓ Changes saved successfully!</p>
                    </div>
                  )}

                  <form onSubmit={handleSave}>
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">First Name *</label>
                        <input type="text" name="firstName" value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Last Name *</label>
                        <input type="text" name="lastName" value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Email Address *</label>
                        <input type="email" name="email" value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Phone Number</label>
                        <input type="text" name="phone" value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Job Title</label>
                        <input type="text" name="jobTitle" value={profileData.jobTitle}
                          onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
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
                      <button type="submit" disabled={saving}
                        className={`font-semibold px-8 py-3 rounded-xl transition text-sm ${saving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold mb-1">Security Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">Manage your password and security preferences</p>

                  <div className="border border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-5">Change Password</h3>
                    {passwordError && (
                      <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-4">
                        <p className="text-red-600 text-sm font-semibold">✗ {passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-4">
                        <p className="text-green-600 text-sm font-semibold">✓ Password updated successfully!</p>
                      </div>
                    )}
                    <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Current Password</label>
                        <div className="relative">
                          <input type={showCurrent ? 'text' : 'password'} value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon show={showCurrent} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">New Password</label>
                        <div className="relative">
                          <input type={showNew ? 'text' : 'password'} value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon show={showNew} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1 block">Confirm New Password</label>
                        <div className="relative">
                          <input type={showConfirm ? 'text' : 'password'} value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon show={showConfirm} />
                          </button>
                        </div>
                      </div>
                      {passwordData.newPassword && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 text-xs font-semibold mb-2">Password strength:</p>
                          <div className="flex flex-col gap-1">
                            {[
                              { label: 'At least 8 characters', met: passwordData.newPassword.length >= 8 },
                              { label: 'Contains uppercase letter', met: /[A-Z]/.test(passwordData.newPassword) },
                              { label: 'Contains lowercase letter', met: /[a-z]/.test(passwordData.newPassword) },
                              { label: 'Contains a number', met: /[0-9]/.test(passwordData.newPassword) },
                              { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(passwordData.newPassword) },
                            ].map((req, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${req.met ? 'text-green-500' : 'text-gray-400'}`}>{req.met ? '✓' : '○'}</span>
                                <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button type="submit" disabled={passwordSaving}
                          className={`font-semibold px-8 py-3 rounded-xl transition text-sm ${passwordSaving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                          {passwordSaving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm font-semibold mb-1">Enable 2FA</p>
                        <p className="text-gray-500 text-xs leading-relaxed">Two-factor authentication adds an additional layer of protection beyond your password.</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <button disabled className="bg-gray-200 text-gray-400 font-semibold px-5 py-2 rounded-lg text-sm cursor-not-allowed">Enable</button>
                        <span className="text-gray-400 text-xs">Coming soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ORGANIZATION TAB ── */}
              {activeTab === 'organization' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Organization Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">Manage your company information</p>

                  <div className="border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-gray-800 text-lg font-bold mb-5">Company Details</h3>
                    {orgSaveSuccess && (
                      <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-5">
                        <p className="text-green-600 text-sm font-semibold">✓ Organisation details saved!</p>
                      </div>
                    )}
                    <form onSubmit={handleOrgSave}>
                      <div className="grid grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Company Name *</label>
                          <input type="text" value={orgData.companyName}
                            onChange={(e) => setOrgData({ ...orgData, companyName: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Industry</label>
                          <select value={orgData.industry} onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Industry</option>
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
                          <input type="email" value={orgData.companyEmail}
                            onChange={(e) => setOrgData({ ...orgData, companyEmail: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Company Phone</label>
                          <input type="text" value={orgData.companyPhone}
                            onChange={(e) => setOrgData({ ...orgData, companyPhone: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Address</label>
                          <input type="text" value={orgData.address}
                            onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1 block">Website</label>
                          <input type="text" value={orgData.website}
                            onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                            className="w-full bg-gray-100 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" disabled={orgSaving}
                          className={`font-semibold px-8 py-3 rounded-xl transition text-sm ${orgSaving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                          {orgSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── PLATFORM TAB ── */}
              {activeTab === 'platform' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Platform Settings</h2>
                  <p className="text-gray-500 text-sm mb-6">Enable or disable platform features for all users</p>

                  {platformSuccess && (
                    <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-5">
                      <p className="text-green-600 text-sm font-semibold">✓ Platform settings saved!</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
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
                              <input type="checkbox" checked={platformSettings[item.key]} onChange={() => setPlatformSettings({ ...platformSettings, [item.key]: !platformSettings[item.key] })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

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
                              <input type="checkbox" checked={platformSettings[item.key]} onChange={() => setPlatformSettings({ ...platformSettings, [item.key]: !platformSettings[item.key] })} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handlePlatformSave} disabled={platformSaving}
                      className={`font-semibold px-8 py-3 rounded-xl transition text-sm ${platformSaving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {platformSaving ? 'Saving...' : 'Save Platform Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATION TAB ── */}
              {activeTab === 'notification' && (
                <div>
                  <h2 className="text-gray-800 text-xl font-bold mb-1">Notifications</h2>
                  <p className="text-gray-500 text-sm mb-6">Choose what notifications you want to receive</p>

                  {notifSuccess && (
                    <div className="bg-green-50 border border-green-300 rounded-xl px-4 py-3 mb-5">
                      <p className="text-green-600 text-sm font-semibold">✓ Notification preferences saved!</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {[
                      { key: 'newUsers', label: 'New user registrations', desc: 'Get notified when a new user is added' },
                      { key: 'simulationComplete', label: 'User completes simulation', desc: 'Get notified when a user completes a simulation' },
                      { key: 'highRisk', label: 'High risk user detected', desc: 'Get alerted when a user scores below 50%' },
                      { key: 'announcements', label: 'System announcements', desc: 'Important platform announcements' },
                      { key: 'weeklyReport', label: 'Weekly progress report', desc: 'Receive a weekly summary of all user progress' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notifications[item.key]}
                            onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleNotifSave} disabled={notifSaving}
                      className={`font-semibold px-8 py-3 rounded-xl transition text-sm ${notifSaving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {notifSaving ? 'Saving...' : 'Save Preferences'}
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