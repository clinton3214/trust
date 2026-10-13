'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Headphones, History, ShieldCheck, Send } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Transfer', href: '/transfer', icon: Send },
    { label: 'History', href: '/history', icon: History },
    { label: 'Service', href: '/chat', icon: Headphones },
    { label: 'Profile', href: '/profile', icon: ShieldCheck },
  ]

  return (
    <nav 
      className="fixed bottom-4 left-1/2 z-40 flex h-[72px] w-[calc(100%-32px)] max-w-[448px] -translate-x-1/2 items-center justify-around rounded-full border border-white/80 bg-[#eef2fa]/95 px-2 shadow-[0_16px_35px_rgba(43,55,82,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl" 
      aria-label="Primary navigation"
    >
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            className={`group flex min-w-[54px] flex-col items-center gap-1 rounded-full px-2 py-2 text-[10px] font-bold transition-all ${
              isActive 
                ? 'bg-white text-[#252f45] shadow-[0_5px_12px_rgba(73,88,120,0.14)] scale-105' 
                : 'text-[#7f899c] hover:text-[#39445a]'
            }`}
            aria-label={label}
          >
            <Icon size={20} strokeWidth={isActive ? 2.3 : 1.7} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
