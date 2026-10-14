'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Headphones,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wallet,
  X
} from 'lucide-react'
import { getFinancials, formatCurrency } from '@/lib/firebase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const depositMethods = [
  {
    id: 'ach',
    title: 'Bank Transfer (ACH / Wire)',
    desc: 'Deposit directly from an external bank account',
    icon: Building2,
    badge: '1-2 Days',
    badgeTone: 'blue',
  },
  {
    id: 'card',
    title: 'Debit or Credit Card',
    desc: 'Instant funding via Visa, Mastercard, or Amex',
    icon: CreditCard,
    badge: 'Instant',
    badgeTone: 'mint',
  },
  {
    id: 'check',
    title: 'Mobile Check Deposit',
    desc: 'Snap a photo of the front and back of your check',
    icon: Smartphone,
    badge: 'Same Day',
    badgeTone: 'violet',
  },
  {
    id: 'wallet',
    title: 'Apple Pay / Digital Wallet',
    desc: 'Quick deposit using your connected digital wallet',
    icon: Wallet,
    badge: 'Instant',
    badgeTone: 'peach',
  },
  {
    id: 'atm',
    title: 'Cash Deposit at Partner ATM',
    desc: 'Find over 55,000 surcharge-free Allpoint ATMs',
    icon: QrCode,
    badge: 'Fee Free',
    badgeTone: 'gold',
  },
]

const presetAmounts = [100, 250, 500, 1000, 2500]

export default function AddMoneyPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number>(24850.40)
  const [amount, setAmount] = useState<string>('500')
  const [selectedMethod, setSelectedMethod] = useState<string>('card')
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false)

  useEffect(() => {
    getFinancials().then((f) => {
      if (f && f.balance !== undefined) {
        setBalance(f.balance)
      }
    })
  }, [])

  const triggerError = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault()
    setShowErrorModal(true)
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] pb-28">
        
        {/* Header */}
        <Header title="Add Money" showBack backHref="/" />

        {/* Current Account Summary Card */}
        <section className="px-5 pb-5">
          <div className="rounded-[24px] bg-[#152238] p-5 text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#b5c1d4]">Everyday Checking Balance</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(balance)}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#47d8c7]">
                <ShieldCheck size={13} /> FDIC Insured
              </span>
            </div>
          </div>
        </section>

        {/* Enter Amount Section */}
        <section className="px-5 pb-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
              Deposit Amount
            </p>

            <div className="relative mt-2 flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-[#111827]">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onClick={() => triggerError()}
                placeholder="0.00"
                className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-10 pr-4 text-2xl font-bold text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white"
              />
            </div>

            {/* Preset chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => triggerError()}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    amount === String(amt)
                      ? 'bg-[#152238] text-white'
                      : 'border border-[#e5e7eb] bg-[#f9fafb] text-[#536074] hover:bg-white'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Funding Methods */}
        <section className="px-5 pb-5">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-[#252f45]">Select Deposit Method</h3>
            <span className="text-[11px] font-semibold text-[#635bdf]">Secure Gateway</span>
          </div>

          <div className="space-y-2.5">
            {depositMethods.map((m) => {
              const Icon = m.icon
              const isSelected = selectedMethod === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => triggerError()}
                  className={`w-full flex items-center justify-between p-4 rounded-[22px] border transition-all text-left active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#635bdf] bg-white shadow-[0_8px_20px_rgba(99,91,223,0.08)]'
                      : 'border-white/80 bg-white shadow-[0_4px_16px_rgba(54,71,102,0.04)] hover:border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`grid size-11 place-items-center rounded-2xl ${
                        m.badgeTone === 'mint'
                          ? 'bg-[#dff9f1] text-[#16a88e]'
                          : m.badgeTone === 'violet'
                            ? 'bg-[#eeeaff] text-[#6559e8]'
                            : m.badgeTone === 'blue'
                              ? 'bg-[#e8f1ff] text-[#4774dc]'
                              : m.badgeTone === 'peach'
                                ? 'bg-[#fff0e7] text-[#ed8759]'
                                : 'bg-[#fff4dc] text-[#c38722]'
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#111827]">{m.title}</p>
                      <p className="text-xs text-[#8c98aa] mt-0.5">{m.desc}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f1f4f9] px-2.5 py-1 text-[#64748b]">
                    {m.badge}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Action Button */}
        <section className="px-5 pt-2">
          <button
            type="button"
            onClick={() => triggerError()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#152238] py-4 text-sm font-bold text-white shadow-lg shadow-[#152238]/20 transition-all hover:bg-[#20314f] active:scale-[0.98]"
          >
            <span>Add Funds to Account</span>
            <ArrowRight size={18} />
          </button>
        </section>

        {/* Error Modal: Contact Customer Service */}
        {showErrorModal && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowErrorModal(false)}
            />

            <div
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-[420px] -translate-y-1/2 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] animate-in fade-in zoom-in-95 duration-200"
              role="alertdialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
                  <AlertTriangle size={24} />
                </div>

                <button
                  onClick={() => setShowErrorModal(false)}
                  className="grid size-8 place-items-center rounded-full bg-[#f1f4f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#111827] transition"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-[#111827] tracking-tight">
                  Deposit Service Unavailable
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                  Automated self-service deposits are currently restricted on your profile for security verification. Please contact <strong className="text-[#111827]">TrustBank Customer Service</strong> to complete your deposit or activate external transfer links.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/chat"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#152238] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#20314f] transition active:scale-[0.98]"
                >
                  <Headphones size={16} />
                  <span>Contact Customer Service</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="w-full rounded-2xl border border-[#e2e8f0] bg-white py-3 text-xs font-bold text-[#64748b] hover:bg-[#f8fafc] transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </>
        )}

        {/* Global Bottom Navigation */}
        <BottomNav />
      </div>
    </main>
  )
}
