'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { getPasswords, initializeState } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await initializeState()
      const creds = await getPasswords()

      const inputId = identifier.trim()
      const inputPass = password.trim()

      if (inputId.toLowerCase() === (creds.adminEmail || '').toLowerCase() && inputPass === creds.adminPass) {
        sessionStorage.setItem('tb_auth_role', 'admin')
        localStorage.setItem('tb_auth_role', 'admin')
        document.cookie = 'tb_auth_role=admin; path=/; max-age=86400; SameSite=Lax'
        router.push('/admin')
      } else if (
        (inputId.toLowerCase() === (creds.userEmail || '').toLowerCase() || inputId.toLowerCase() === 'user@com') &&
        inputPass === creds.userPass
      ) {
        sessionStorage.setItem('tb_auth_role', 'user')
        localStorage.setItem('tb_auth_role', 'user')
        document.cookie = 'tb_auth_role=user; path=/; max-age=86400; SameSite=Lax'
        router.push('/')
      } else {
        setError('Invalid username or password. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to verify credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white shadow-[0_15px_40px_rgba(21,34,56,0.08)]">
        
        {/* Card Header */}
        <div className="relative overflow-hidden bg-[#152238] px-8 py-9 text-white">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#7e8cff] opacity-25 blur-2xl" />
          <div className="absolute -bottom-16 left-8 size-40 rounded-full bg-[#47d8c7] opacity-20 blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/10 p-2 backdrop-blur-md">
                <img src="/logo-icon.png" alt="TrustBank" className="size-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">TrustBank</span>
                <p className="text-xs text-[#a0afc4]">Secure Personal Portal</p>
              </div>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#47d8c7]">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="relative mt-7">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-xs text-[#a0afc4]">Sign in to access your accounts and cards.</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-7">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                Username / Email
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. @trustbank25 or admin@com"
                  className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white focus:ring-2 focus:ring-[#635bdf]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                Password
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white focus:ring-2 focus:ring-[#635bdf]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#152238] py-4 text-sm font-bold text-white shadow-lg shadow-[#152238]/20 transition-all hover:bg-[#20314f] active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8c98aa]">
              <ShieldCheck size={15} className="text-[#10b981]" />
              <span>Protected by 256-bit Bank Grade Encryption</span>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
