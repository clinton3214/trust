'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  History as HistoryIcon,
  Menu,
  MoreHorizontal,
  Plus,
  Send,
  Settings2,
  Sparkles,
} from 'lucide-react'
import { 
  initializeState, 
  listenToDatabaseChanges, 
  formatCurrency, 
  UserProfile, 
  Transaction,
  defaultProfile 
} from '@/lib/firebase'
import BottomNav from '@/components/BottomNav'

const quickActions = [
  { label: 'Send money', icon: Send, tone: 'violet', href: '/transfer' },
  { label: 'Add money', icon: Plus, tone: 'mint', href: '/chat' },
  { label: 'History', icon: HistoryIcon, tone: 'peach', href: '/history' },
  { label: 'More', icon: MoreHorizontal, tone: 'blue', href: '/profile' },
]

export default function HomePage() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [balance, setBalance] = useState<number>(24850.40)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [todayString, setTodayString] = useState('')

  useEffect(() => {
    // Format current date
    const now = new Date()
    setTodayString(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))

    // Load hideBalance preference
    const savedHide = localStorage.getItem('hideBalance')
    if (savedHide === 'true') {
      setBalanceVisible(false)
    }

    // Initialize database if needed and subscribe
    initializeState().then(() => {
      const unsubscribe = listenToDatabaseChanges((data) => {
        if (data) {
          if (data.tb_balance !== undefined) setBalance(parseFloat(data.tb_balance) || 0)
          if (data.tb_profile) setProfile({ ...defaultProfile, ...data.tb_profile })
          if (data.tb_transactions) setTransactions(data.tb_transactions)
        }
        setLoading(false)
      })
      return () => unsubscribe()
    })
  }, [])

  const toggleBalance = () => {
    const newState = !balanceVisible
    setBalanceVisible(newState)
    localStorage.setItem('hideBalance', String(!newState))
  }

  const firstName = (profile?.name || 'User').split(' ')[0]
  const lastFourChecking = (profile?.checking || '4820').replace(/\s+/g, '').slice(-4)
  const lastFourSavings = (profile?.savings || '9104').replace(/\s+/g, '').slice(-4)

  const cards = [
    { 
      name: 'Everyday debit', 
      number: `•••• ${lastFourChecking}`, 
      type: 'VISA', 
      gradient: 'from-[#17243b] via-[#263e66] to-[#4b63d8]',
      holder: profile.name || 'Account Holder'
    },
    { 
      name: 'Virtual savings', 
      number: `•••• ${lastFourSavings}`, 
      type: 'VISA', 
      gradient: 'from-[#168f91] via-[#1aa9b3] to-[#70d8bf]',
      holder: profile.name || 'Account Holder'
    },
  ]

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] pb-28">
        
        {/* Top Header */}
        <header className="px-6 pb-5 pt-7">
          <div className="flex items-center justify-between">
            <Link 
              href="/profile" 
              className="grid size-11 place-items-center rounded-2xl bg-white text-[#111827] shadow-sm transition-transform active:scale-95" 
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={2.2} />
            </Link>
            
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-[#152238] text-sm font-extrabold text-white">TB</div>
              <span className="text-[15px] font-bold tracking-[-0.02em]">TrustBank</span>
            </div>
            
            <Link 
              href="/chat"
              className="relative grid size-11 place-items-center rounded-2xl bg-white text-[#111827] shadow-sm transition-transform active:scale-95" 
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              <span className="absolute right-2.5 top-2 size-2 rounded-full bg-[#ff6b5f] ring-2 ring-white" />
            </Link>
          </div>
        </header>

        {/* User Greeting Section */}
        <section className="px-5 pb-5 pt-1">
          <p className="text-sm font-semibold text-[#8c98aa]">{todayString || 'Welcome back'}</p>
          <h1 className="mt-1 text-[29px] font-bold tracking-[-0.055em] text-[#111827]">
            Hello, {firstName} <span className="text-[#635bdf]">!</span>
          </h1>
          <p className="mt-1 text-sm text-[#748096]">Here&apos;s your financial snapshot for today.</p>
        </section>

        {/* Available Balance Hero Card */}
        <section className="px-5">
          <div className="relative overflow-hidden rounded-[28px] bg-[#152238] p-6 text-white shadow-[0_18px_36px_rgba(21,34,56,0.22)]">
            <div className="absolute -right-20 -top-24 size-64 rounded-full bg-[#7e8cff] opacity-30 blur-2xl" />
            <div className="absolute -bottom-28 left-16 size-56 rounded-full bg-[#47d8c7] opacity-20 blur-3xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#b5c1d4]">Available balance</p>
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-[35px] font-semibold tracking-[-0.055em]">
                      {loading ? '...' : balanceVisible ? formatCurrency(balance) : '$••••••'}
                    </p>
                    <button 
                      onClick={toggleBalance} 
                      className="rounded-lg p-1 text-[#b5c1d4] hover:text-white transition-colors" 
                      aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                    >
                      {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                <Link 
                  href="/profile"
                  className="grid size-11 place-items-center rounded-full bg-white/10 text-lg font-bold hover:bg-white/20 transition-colors"
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    firstName.charAt(0) || 'U'
                  )}
                </Link>
              </div>

              <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-[#9eacc2]">Checking account</p>
                  <p className="mt-1 text-sm font-semibold tracking-wide">•••• {lastFourChecking}</p>
                </div>
                <Link 
                  href="/profile"
                  className="flex items-center gap-1 text-sm font-semibold text-[#7fe0d4] hover:underline"
                >
                  Details <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-5 pt-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8c98aa]">Quick actions</p>
              <h2 className="mt-1 text-[24px] font-bold tracking-[-0.04em]">What do you need?</h2>
            </div>
            <Link 
              href="/admin" 
              className="grid size-10 place-items-center rounded-xl bg-white text-[#6571ff] shadow-sm hover:bg-gray-50 transition" 
              title="Admin Panel"
            >
              <Settings2 size={18} />
            </Link>
          </div>
          
          <div className="mt-4 grid grid-cols-4 gap-3">
            {quickActions.map(({ label, icon: Icon, tone, href }) => (
              <Link 
                key={label} 
                href={href}
                className="flex min-w-0 flex-col items-center gap-2.5 rounded-2xl bg-white px-2 py-4 shadow-[0_5px_20px_rgba(54,71,102,0.06)] transition-transform active:scale-95"
              >
                <span className={`grid size-11 place-items-center rounded-[15px] ${
                  tone === 'violet' ? 'bg-[#eeeaff] text-[#6559e8]' : 
                  tone === 'mint' ? 'bg-[#dff9f1] text-[#16a88e]' : 
                  tone === 'peach' ? 'bg-[#fff0e7] text-[#ed8759]' : 
                  'bg-[#e8f1ff] text-[#4774dc]'
                }`}>
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className="text-center text-[11px] font-semibold text-[#536074] truncate w-full">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Your Cards Section */}
        <section className="px-5 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8c98aa]">Your cards</p>
              <h2 className="mt-1 text-[24px] font-bold tracking-[-0.04em]">Manage your cards</h2>
            </div>
            <Link href="/profile" className="text-sm font-bold text-[#635bdf] hover:underline">See all</Link>
          </div>
          
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cards.map((card) => (
              <div 
                key={card.name} 
                className={`relative min-w-[235px] snap-start overflow-hidden rounded-[22px] bg-gradient-to-br ${card.gradient} p-5 text-left text-white shadow-[0_12px_24px_rgba(54,71,102,0.15)]`}
              >
                <div className="absolute -right-8 -top-10 size-28 rounded-full bg-white/10" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/75">TrustBank</p>
                    <p className="mt-5 text-base font-bold">{card.name}</p>
                  </div>
                  <span className="text-sm font-black italic tracking-wide">{card.type}</span>
                </div>
                <p className="relative mt-5 text-base tracking-[0.18em] text-white/90">{card.number}</p>
                <div className="relative mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
                  <span>{card.holder}</span>
                  <span>Debit</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions Activity Section */}
        <section className="px-5 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8c98aa]">Your activity</p>
              <h2 className="mt-1 text-[24px] font-bold tracking-[-0.04em]">Recent transactions</h2>
            </div>
            <Link href="/history" className="text-sm font-bold text-[#635bdf] hover:underline">View all</Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] bg-white px-4 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
            {transactions.length === 0 ? (
              <p className="text-sm text-[#748096] py-6 text-center">No transactions recorded yet.</p>
            ) : (
              transactions.slice(0, 5).map((tx, index) => {
                const isNegative = Number(tx.amount) < 0
                const formattedAmount = formatCurrency(Math.abs(Number(tx.amount)))
                const initial = (tx.payee || 'T').charAt(0).toUpperCase()

                return (
                  <div 
                    key={tx.id || index} 
                    className={`flex items-center gap-3 py-4 ${index < Math.min(transactions.length, 5) - 1 ? 'border-b border-[#eef1f5]' : ''}`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${
                      tx.status === 'Pending' ? 'bg-[#fff4dc] text-[#c38722]' :
                      isNegative ? 'bg-[#edf0f5] text-[#202b3d]' : 'bg-[#dff9f1] text-[#149b84]'
                    }`}>
                      {initial}
                    </span>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">{tx.payee}</p>
                        {tx.status === 'Pending' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded-full">Pending</span>
                        )}
                        {tx.status === 'Blocked' && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-1.5 py-0.5 rounded-full">Blocked</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#98a2b3]">{tx.date}</p>
                      {tx.status === 'Approved' && isNegative && (
                        <Link href={`/receipt?id=${tx.id}`} className="text-[11px] text-[#635bdf] font-semibold hover:underline block mt-0.5">
                          Receipt
                        </Link>
                      )}
                    </div>

                    <p className={`text-sm font-bold ${isNegative ? 'text-[#253044]' : 'text-[#129b7e]'}`}>
                      {isNegative ? '-' : '+'}{formattedAmount}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e6eaf1] bg-[#fafbff] p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e6eaff] text-[#625be8]">
              <Sparkles size={18} />
            </span>
            <p className="text-xs leading-5 text-[#596579]">
              Account security and real-time fraud monitoring are <strong className="text-[#152238]">Active</strong>.
            </p>
          </div>
        </section>

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </main>
  )
}
