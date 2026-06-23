import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

function AdminSettings() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const profile = useProfile()

  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarRemoving, setAvatarRemoving] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [avatarError, setAvatarError] = useState('')
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', employeeId: '' })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [orgData, setOrgData] = useState({ companyName: '', industry: '', companyEmail: '', companyPhone: '', address: '', website: '' })
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgSaveSuccess, setOrgSaveSuccess] = useState(false)
  const [orgSaveError, setOrgSaveError] = useState('')

  const [platformSettings, setPlatformSettings] = useState({ simulationsEnabled: true, trainingEnabled: true, achievementsEnabled: true, leaderboardEnabled: true, emailNotificationsEnabled: true, forcePasswordChange: true })
  const [platformSaving, setPlatformSaving] = useState(false)
  const [platformSuccess, setPlatformSuccess] = useState(false)
  const [platformError, setPlatformError] = useState('')

  const [notifications, setNotifications] = useState({ newUsers: true, simulationComplete: true, highRisk: true, announcements: true, weeklyReport: true })
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)
  const [notifError, setNotifError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (profile) {
      const nameParts = profile.full_name?.split(' ') || []
      setProfileData({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: profile.email || '', phone: profile.phone || '', jobTitle: profile.job_title || '', employeeId: profile.employee_id || '' })
      setOrgData({ companyName: profile.company_name || '', industry: profile.industry || '', companyEmail: profile.company_email || '', companyPhone: profile.company_phone || '', address: profile.address || '', website: profile.website || '' })
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
      if (profile.notification_preferences) setNotifications(prev => ({ ...prev, ...profile.notification_preferences }))
    }
  }, [profile])

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setAvatarError('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setAvatarError('Image must be under 10MB.'); return }
    setAvatarError('')
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
    if (!completedCrop || !imgRef.current || !canvasRef.current || !profile?.id) return
    setAvatarUploading(true)
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = 400; canvas.height = 400
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, 400, 400)
    canvas.toBlob(async (blob) => {
      if (!blob) { setAvatarUploading(false); return }
      const fileName = `${profile.id}.jpg`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) { setAvatarError('Upload failed: ' + uploadError.message); setAvatarUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const urlWithCache = `${publicUrl.split('?')[0]}?t=${Date.now()}`
      const { error: updateError } = await supabase.from('users').update({ avatar_url: urlWithCache }).eq('id', profile.id)
      if (!updateError) setAvatarUrl(urlWithCache)
      setAvatarUploading(false); setCropModalOpen(false); setImgSrc('')
    }, 'image/jpeg', 0.9)
  }

  async function handleRemoveAvatar() {
    if (!profile?.id) return
    setAvatarRemoving(true)
    for (const ext of ['jpg', 'jpeg', 'png', 'gif', 'webp']) await supabase.storage.from('avatars').remove([`${profile.id}.${ext}`])
    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', profile.id)
    if (!error) setAvatarUrl(null)
    setAvatarRemoving(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true); setSaveSuccess(false); setSaveError('')
    const { error } = await supabase.from('users').update({ full_name: `${profileData.firstName} ${profileData.lastName}`.trim(), phone: profileData.phone, job_title: profileData.jobTitle }).eq('id', profile.id)
    setSaving(false)
    if (error) { setSaveError('Failed to save changes.'); return }
    setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    if (!profile?.email) return
    setPasswordError(''); setPasswordSuccess(false)
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

  async function handleOrgSave(e) {
    e.preventDefault()
    if (!profile?.id) return
    setOrgSaving(true); setOrgSaveSuccess(false); setOrgSaveError('')
    const { error } = await supabase.from('users').update({ company_name: orgData.companyName, industry: orgData.industry, company_email: orgData.companyEmail, company_phone: orgData.companyPhone, address: orgData.address, website: orgData.website }).eq('id', profile.id)
    setOrgSaving(false)
    if (error) { setOrgSaveError('Failed to save organisation details.'); return }
    setOrgSaveSuccess(true); setTimeout(() => setOrgSaveSuccess(false), 3000)
  }

  async function handlePlatformSave() {
    if (!profile?.id) return
    setPlatformSaving(true); setPlatformSuccess(false); setPlatformError('')
    const { error } = await supabase.from('users').update({ platform_settings: platformSettings }).eq('id', profile.id)
    setPlatformSaving(false)
    if (error) { setPlatformError('Failed to save platform settings.'); return }
    setPlatformSuccess(true); setTimeout(() => setPlatformSuccess(false), 3000)
  }

  async function handleNotifSave() {
    if (!profile?.id) return
    setNotifSaving(true); setNotifSuccess(false); setNotifError('')
    const { error } = await supabase.from('users').update({ notification_preferences: notifications }).eq('id', profile.id)
    setNotifSaving(false)
    if (error) { setNotifError('Failed to save notification preferences.'); return }
    setNotifSuccess(true); setTimeout(() => setNotifSuccess(false), 3000)
  }

  function EyeIcon({ show }) {
    return show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-300"
  const labelClass = "text-gray-500 text-xs font-medium mb-1.5 block"

  function SuccessBanner({ msg }) {
    return <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 mb-4"><p className="text-emerald-600 text-xs font-medium">✓ {msg}</p></div>
  }
  function ErrorBanner({ msg }) {
    return <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4"><p className="text-red-500 text-xs">{msg}</p></div>
  }

  function Toggle({ checked, onChange }) {
    return (
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
      </label>
    )
  }

  function SaveButton({ loading, label, loadingLabel, onClick, type = 'button' }) {
    return (
      <button type={type} onClick={onClick} disabled={loading}
        className={`px-5 py-2.5 rounded-lg text-xs font-medium transition ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
        {loading ? loadingLabel : label}
      </button>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'organization', label: 'Organization' },
    { id: 'platform', label: 'Platform' },
    { id: 'notification', label: 'Notifications' },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-sm font-semibold">Crop Photo</p>
                <p className="text-gray-400 text-xs mt-0.5">Drag to reposition, resize to crop</p>
              </div>
              <button onClick={() => { setCropModalOpen(false); setImgSrc('') }} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-900 min-h-[280px]">
              {imgSrc && (
                <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50} minHeight={50}>
                  <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} style={{ maxHeight: '360px', maxWidth: '100%' }} />
                </ReactCrop>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <canvas ref={canvasRef} className="hidden" />
              <p className="text-gray-400 text-xs">Preview will be circular</p>
              <div className="flex gap-2">
                <button onClick={() => { setCropModalOpen(false); setImgSrc('') }}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">Cancel</button>
                <button onClick={handleCropAndUpload} disabled={avatarUploading || !completedCrop}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition ${avatarUploading || !completedCrop ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                  {avatarUploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">Settings</h1>
            <p className="text-gray-400 text-xs mt-0.5">Manage your account and platform preferences</p>
          </div>

          <div className="flex gap-5 items-start">

            {/* Tab sidebar */}
            <div className="w-44 bg-white border border-gray-100 rounded-xl p-2 flex-shrink-0">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition mb-0.5
                    ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-6">

              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div>
                  <p className="text-gray-800 text-sm font-semibold mb-1">Profile Information</p>
                  <p className="text-gray-400 text-xs mb-5">Update your personal details</p>

                  {avatarError && <ErrorBanner msg={avatarError} />}

                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" onError={() => setAvatarUrl(null)} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Change Photo
                      </button>
                      {avatarUrl && (
                        <button type="button" onClick={handleRemoveAvatar} disabled={avatarRemoving}
                          className={`text-xs font-medium px-3 py-2 rounded-lg transition ${avatarRemoving ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}>
                          {avatarRemoving ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                      <p className="text-gray-300 text-xs">JPG, PNG or GIF · max 10MB</p>
                    </div>
                  </div>

                  {saveSuccess && <SuccessBanner msg="Changes saved successfully" />}
                  {saveError && <ErrorBanner msg={saveError} />}

                  <form onSubmit={handleSave}>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className={labelClass}>First Name <span className="text-red-400">*</span></label>
                        <input type="text" value={profileData.firstName} onChange={e => setProfileData({ ...profileData, firstName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name <span className="text-red-400">*</span></label>
                        <input type="text" value={profileData.lastName} onChange={e => setProfileData({ ...profileData, lastName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" value={profileData.email} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                        <p className="text-gray-300 text-xs mt-1">Cannot be changed here</p>
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input type="text" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Job Title</label>
                        <input type="text" value={profileData.jobTitle} onChange={e => setProfileData({ ...profileData, jobTitle: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Employee ID</label>
                        <input type="text" value={profileData.employeeId} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                        <p className="text-gray-300 text-xs mt-1">Cannot be changed</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <SaveButton type="submit" loading={saving} label="Save Changes" loadingLabel="Saving..." />
                    </div>
                  </form>
                </div>
              )}

              {/* SECURITY */}
              {activeTab === 'security' && (
                <div>
                  <p className="text-gray-800 text-sm font-semibold mb-1">Security Settings</p>
                  <p className="text-gray-400 text-xs mb-5">Manage your password and security preferences</p>

                  <div className="border border-gray-100 rounded-xl p-5 mb-4">
                    <p className="text-gray-700 text-sm font-medium mb-4">Change Password</p>
                    {passwordError && <ErrorBanner msg={passwordError} />}
                    {passwordSuccess && <SuccessBanner msg="Password updated successfully" />}
                    <form onSubmit={handlePasswordSave} className="flex flex-col gap-3">
                      {[
                        { label: 'Current Password', value: passwordData.currentPassword, key: 'currentPassword', show: showCurrent, setShow: setShowCurrent },
                        { label: 'New Password', value: passwordData.newPassword, key: 'newPassword', show: showNew, setShow: setShowNew },
                        { label: 'Confirm New Password', value: passwordData.confirmPassword, key: 'confirmPassword', show: showConfirm, setShow: setShowConfirm },
                      ].map(field => (
                        <div key={field.key}>
                          <label className={labelClass}>{field.label}</label>
                          <div className="relative">
                            <input type={field.show ? 'text' : 'password'} value={field.value}
                              onChange={e => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className={`${inputClass} pr-10`} />
                            <button type="button" onClick={() => field.setShow(!field.show)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                              <EyeIcon show={field.show} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {passwordData.newPassword && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-gray-500 text-xs font-medium mb-2">Password strength</p>
                          <div className="flex flex-col gap-1">
                            {[
                              { label: 'At least 8 characters', met: passwordData.newPassword.length >= 8 },
                              { label: 'Contains uppercase', met: /[A-Z]/.test(passwordData.newPassword) },
                              { label: 'Contains lowercase', met: /[a-z]/.test(passwordData.newPassword) },
                              { label: 'Contains a number', met: /[0-9]/.test(passwordData.newPassword) },
                              { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(passwordData.newPassword) },
                            ].map((req, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className={`text-xs ${req.met ? 'text-emerald-500' : 'text-gray-300'}`}>{req.met ? '✓' : '○'}</span>
                                <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-gray-400'}`}>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <SaveButton type="submit" loading={passwordSaving} label="Update Password" loadingLabel="Updating..." />
                      </div>
                    </form>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-5">
                    <p className="text-gray-700 text-sm font-medium mb-1">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-xs mb-4">Adds an extra layer of protection beyond your password.</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Coming soon</p>
                      <button disabled className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-300 cursor-not-allowed">Enable</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ORGANIZATION */}
              {activeTab === 'organization' && (
                <div>
                  <p className="text-gray-800 text-sm font-semibold mb-1">Organization Settings</p>
                  <p className="text-gray-400 text-xs mb-5">Manage your company information</p>
                  {orgSaveSuccess && <SuccessBanner msg="Organisation details saved" />}
                  {orgSaveError && <ErrorBanner msg={orgSaveError} />}
                  <form onSubmit={handleOrgSave}>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className={labelClass}>Company Name <span className="text-red-400">*</span></label>
                        <input type="text" value={orgData.companyName} onChange={e => setOrgData({ ...orgData, companyName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Industry</label>
                        <select value={orgData.industry} onChange={e => setOrgData({ ...orgData, industry: e.target.value })} className={inputClass}>
                          <option value="">Select industry</option>
                          {['Technology','Finance','Healthcare','Education','Government','Manufacturing','Other'].map(i => <option key={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Company Email</label>
                        <input type="email" value={orgData.companyEmail} onChange={e => setOrgData({ ...orgData, companyEmail: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Company Phone</label>
                        <input type="text" value={orgData.companyPhone} onChange={e => setOrgData({ ...orgData, companyPhone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Address</label>
                        <input type="text" value={orgData.address} onChange={e => setOrgData({ ...orgData, address: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Website</label>
                        <input type="text" value={orgData.website} onChange={e => setOrgData({ ...orgData, website: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <SaveButton type="submit" loading={orgSaving} label="Save Changes" loadingLabel="Saving..." />
                    </div>
                  </form>
                </div>
              )}

              {/* PLATFORM */}
              {activeTab === 'platform' && (
                <div>
                  <p className="text-gray-800 text-sm font-semibold mb-1">Platform Settings</p>
                  <p className="text-gray-400 text-xs mb-5">Enable or disable features for all users</p>
                  {platformSuccess && <SuccessBanner msg="Platform settings saved" />}
                  {platformError && <ErrorBanner msg={platformError} />}

                  <div className="border border-gray-100 rounded-xl p-5 mb-4">
                    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-3">Features</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { key: 'simulationsEnabled', label: 'Simulations', desc: 'Allow users to access simulation exercises' },
                        { key: 'trainingEnabled', label: 'Training Modules', desc: 'Allow users to access training content' },
                        { key: 'achievementsEnabled', label: 'Achievements', desc: 'Show achievements and badges to users' },
                        { key: 'leaderboardEnabled', label: 'Leaderboard', desc: 'Show company leaderboard to users' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-gray-700 text-xs font-medium">{item.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                          </div>
                          <Toggle checked={platformSettings[item.key]} onChange={() => setPlatformSettings({ ...platformSettings, [item.key]: !platformSettings[item.key] })} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-5 mb-5">
                    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-3">Security Policies</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { key: 'forcePasswordChange', label: 'Force Password Change on First Login', desc: 'Users must change password when they first log in' },
                        { key: 'emailNotificationsEnabled', label: 'Email Notifications', desc: 'Send email notifications to users about training and scores' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-gray-700 text-xs font-medium">{item.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                          </div>
                          <Toggle checked={platformSettings[item.key]} onChange={() => setPlatformSettings({ ...platformSettings, [item.key]: !platformSettings[item.key] })} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <SaveButton loading={platformSaving} label="Save Settings" loadingLabel="Saving..." onClick={handlePlatformSave} />
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notification' && (
                <div>
                  <p className="text-gray-800 text-sm font-semibold mb-1">Notifications</p>
                  <p className="text-gray-400 text-xs mb-5">Choose what notifications you want to receive</p>
                  {notifSuccess && <SuccessBanner msg="Notification preferences saved" />}
                  {notifError && <ErrorBanner msg={notifError} />}

                  <div className="border border-gray-100 rounded-xl p-5 mb-5">
                    <div className="flex flex-col gap-3">
                      {[
                        { key: 'newUsers', label: 'New user registrations', desc: 'Get notified when a new user is added' },
                        { key: 'simulationComplete', label: 'Simulation completed', desc: 'Get notified when a user completes a simulation' },
                        { key: 'highRisk', label: 'High risk user detected', desc: 'Get alerted when a user scores below 50%' },
                        { key: 'announcements', label: 'System announcements', desc: 'Important platform announcements' },
                        { key: 'weeklyReport', label: 'Weekly progress report', desc: 'Receive a weekly summary of all user progress' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-gray-700 text-xs font-medium">{item.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                          </div>
                          <Toggle checked={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <SaveButton loading={notifSaving} label="Save Preferences" loadingLabel="Saving..." onClick={handleNotifSave} />
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