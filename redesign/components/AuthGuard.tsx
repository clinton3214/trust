'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const role =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('tb_auth_role') || localStorage.getItem('tb_auth_role')
        : null

    if (pathname === '/login') {
      if (role === 'admin') {
        router.replace('/admin')
      } else if (role === 'user') {
        router.replace('/')
      } else {
        setIsAuthorized(true)
      }
      return
    }

    if (!role) {
      setIsAuthorized(false)
      router.replace('/login')
      return
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      setIsAuthorized(false)
      router.replace('/login')
      return
    }

    setIsAuthorized(true)
  }, [pathname, router])

  // While mounting or redirecting unauthenticated users away from protected routes, show clean loader
  if (!mounted || !isAuthorized) {
    if (pathname === '/login') {
      return <>{children}</>
    }
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#152238] text-base font-extrabold text-white shadow-md animate-pulse">
            TB
          </div>
          <div className="size-6 animate-spin rounded-full border-2 border-[#152238] border-t-transparent" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
