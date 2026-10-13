'use client'

import Link from 'next/link'
import { Bell, ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ title, showBack = false, backHref = '/' }: HeaderProps) {
  return (
    <header className="px-6 pb-5 pt-7">
      <div className="flex items-center justify-between">
        {showBack ? (
          <Link 
            href={backHref}
            className="grid size-11 place-items-center rounded-2xl bg-white text-[#111827] shadow-sm transition-transform active:scale-95" 
            aria-label="Back"
          >
            <ArrowLeft size={22} strokeWidth={2.2} />
          </Link>
        ) : (
          <Link 
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-[#152238] text-sm font-extrabold text-white">TB</div>
            <span className="text-[15px] font-bold tracking-[-0.02em]">TrustBank</span>
          </Link>
        )}

        {title && (
          <h2 className="text-base font-bold text-[#111827] truncate max-w-[200px]">{title}</h2>
        )}

        <div className="flex items-center gap-2">
          <Link 
            href="/chat"
            className="relative grid size-11 place-items-center rounded-2xl bg-white text-[#111827] shadow-sm transition-transform active:scale-95" 
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute right-2.5 top-2 size-2 rounded-full bg-[#ff6b5f] ring-2 ring-white" />
          </Link>
        </div>
      </div>
    </header>
  )
}
