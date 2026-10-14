'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  Eye, 
  EyeOff, 
  LogOut, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard
} from 'lucide-react'
import { getProfile, setProfile, UserProfile, defaultProfile } from '@/lib/firebase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile)
  const [revealChecking, setRevealChecking] = useState(false)
  const [revealSavings, setRevealSavings] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getProfile().then(setProfileState)
  }, [])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const MAX_SIZE = 250
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        const updated = { ...profile, avatar: dataUrl }
        setProfileState(updated)
        await setProfile(updated)
        setUploading(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('tb_auth_role')
    localStorage.removeItem('tb_auth_role')
    document.cookie = 'tb_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  const maskNumber = (num: string) => {
    const clean = (num || '').replace(/\s+/g, '')
    return `•••• •••• ${clean.slice(-4)}`
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] pb-28">
        
        {/* Header */}
        <Header title="Your Profile" showBack backHref="/" />

        {/* Profile Card Header */}
        <section className="px-5 pb-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)] text-center relative">
            <div className="relative mx-auto size-24">
              <div className="size-24 rounded-full overflow-hidden bg-[#152238] text-white flex items-center justify-center text-3xl font-bold shadow-md">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0) || 'U'
                )}
              </div>
              <label 
                htmlFor="avatar-input"
                className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-[#635bdf] text-white shadow-md cursor-pointer hover:bg-[#524ac9] transition"
                title="Change Photo"
              >
                <Camera size={16} />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h1 className="mt-4 text-xl font-bold text-[#111827]">{profile.name}</h1>
            <p className="text-xs font-semibold text-[#8c98aa] mt-0.5">Verified Primary Account Holder</p>
            {uploading && <p className="text-xs text-[#635bdf] mt-1">Uploading photo...</p>}
          </div>
        </section>

        {/* Banking Numbers Card */}
        <section className="px-5 pb-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c98aa]">Account Details</h2>
            
            {/* Checking */}
            <div className="flex items-center justify-between border-b border-[#eef1f5] pb-3">
              <div>
                <p className="text-xs text-[#748096]">Everyday Checking</p>
                <p className="text-sm font-bold text-[#111827] font-mono mt-0.5">
                  {revealChecking ? profile.checking : maskNumber(profile.checking)}
                </p>
              </div>
              <button
                onClick={() => setRevealChecking(!revealChecking)}
                className="rounded-xl bg-[#f5f7fb] p-2 text-[#635bdf] hover:bg-[#eeeaff] transition"
              >
                {revealChecking ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Savings */}
            <div className="flex items-center justify-between border-b border-[#eef1f5] pb-3">
              <div>
                <p className="text-xs text-[#748096]">High-Yield Savings</p>
                <p className="text-sm font-bold text-[#111827] font-mono mt-0.5">
                  {revealSavings ? profile.savings : maskNumber(profile.savings)}
                </p>
              </div>
              <button
                onClick={() => setRevealSavings(!revealSavings)}
                className="rounded-xl bg-[#f5f7fb] p-2 text-[#635bdf] hover:bg-[#eeeaff] transition"
              >
                {revealSavings ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Routing */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#748096]">Routing Number (ABA)</p>
                <p className="text-sm font-bold text-[#111827] font-mono mt-0.5">
                  {profile.routing}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#8c98aa]">Direct Deposit</span>
            </div>
          </div>
        </section>

        {/* Personal Details Card */}
        <section className="px-5 pb-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c98aa]">Contact & Personal Info</h2>
            
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#f5f7fb] text-[#635bdf]">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#748096]">Email Address</p>
                <p className="truncate text-sm font-bold text-[#111827]">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#f5f7fb] text-[#635bdf]">
                <Phone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#748096]">Phone Number</p>
                <p className="truncate text-sm font-bold text-[#111827]">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#f5f7fb] text-[#635bdf]">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#748096]">Date of Birth</p>
                <p className="truncate text-sm font-bold text-[#111827]">{profile.dob}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#f5f7fb] text-[#635bdf] mt-0.5">
                <MapPin size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#748096]">Residential Address</p>
                <p className="text-sm font-bold text-[#111827]">{profile.address}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="px-5 space-y-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 border border-red-200 py-3.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </section>

        <BottomNav />
      </div>
    </main>
  )
}
