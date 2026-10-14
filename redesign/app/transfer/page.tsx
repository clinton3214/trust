'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  Building2, 
  User, 
  CreditCard, 
  Globe 
} from 'lucide-react'
import { 
  addTransaction, 
  getFinancials, 
  getTransferPin, 
  formatCurrency 
} from '@/lib/firebase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const countries = [
  // North & South America
  'United States',
  'Canada',
  'Mexico',
  'Argentina',
  'Brazil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Dominican Republic',
  'Ecuador',
  'Guatemala',
  'Jamaica',
  'Panama',
  'Paraguay',
  'Peru',
  'Puerto Rico',
  'Uruguay',
  // Europe
  'United Kingdom',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Switzerland',
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'Greece',
  'Hungary',
  'Iceland',
  'Ireland',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Monaco',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Sweden',
  // Global & Existing
  'Australia',
  'New Zealand',
  'Japan',
  'Singapore',
  'South Africa',
  'Nigeria',
  'United Arab Emirates',
]

export default function TransferPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number>(24850.40)
  const [limit, setLimit] = useState<number>(5000.00)
  const [payee, setPayee] = useState('')
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [country, setCountry] = useState('United States')
  const [amount, setAmount] = useState('')
  
  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinDigits, setPinDigits] = useState<string[]>([])
  const [realPin, setRealPin] = useState('4476')
  const [pinError, setPinError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getFinancials().then((f) => {
      setBalance(f.balance)
      setLimit(f.limit)
    })
    getTransferPin().then((p) => {
      if (p) setRealPin(p)
    })
  }, [])

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount.')
      return
    }

    if (numAmount > balance) {
      setErrorMessage(`Insufficient funds. Your available balance is ${formatCurrency(balance)}.`)
      return
    }

    if (numAmount > limit) {
      setErrorMessage(`Transfer exceeds your daily limit of ${formatCurrency(limit)}.`)
      return
    }

    setPinDigits([])
    setPinError(false)
    setShowPinModal(true)
  }

  // Handle PIN input
  const handleDigitPress = (digit: string) => {
    if (pinDigits.length < 4) {
      const next = [...pinDigits, digit]
      setPinDigits(next)
      setPinError(false)
      if (next.length === 4) {
        verifyPinAndSend(next.join(''))
      }
    }
  }

  const handleBackspace = () => {
    if (pinDigits.length > 0) {
      setPinDigits(pinDigits.slice(0, -1))
      setPinError(false)
    }
  }

  const verifyPinAndSend = async (enteredPin: string) => {
    if (enteredPin !== realPin) {
      setPinError(true)
      setTimeout(() => {
        setPinDigits([])
      }, 500)
      return
    }

    setIsSubmitting(true)
    try {
      const txId = await addTransaction({
        payee: payee.trim(),
        bank: bank.trim(),
        account: account.trim(),
        amount: -Math.abs(parseFloat(amount)),
        type: 'outgoing',
        status: 'Pending',
        category: 'Manual Transfer'
      })

      if (txId) {
        setTimeout(() => {
          router.push(`/receipt?id=${txId}`)
        }, 600)
      } else {
        setPinError(true)
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      setPinError(true)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] pb-28">
        
        {/* Header */}
        <Header title="Send Money" showBack backHref="/" />

        {/* Balance Snapshot Card */}
        <section className="px-5 pb-5">
          <div className="rounded-[24px] bg-[#152238] p-5 text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#b5c1d4]">From Everyday Checking</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(balance)}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#47d8c7]">
                <ShieldCheck size={13} /> Limit: {formatCurrency(limit)}
              </span>
            </div>
          </div>
        </section>

        {/* Transfer Form */}
        <section className="px-5">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
            <h2 className="text-lg font-bold text-[#111827]">Transfer Details</h2>
            <p className="text-xs text-[#748096] mt-0.5">Instant secure transfer to any domestic or global bank.</p>

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleInitiateTransfer} className="mt-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                  Recipient Name
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="Full recipient name"
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                  Bank Name
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <Building2 size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    placeholder="e.g. JPMorgan Chase, Barclays"
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                  Account / IBAN Number
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <CreditCard size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="e.g. 0923 8491 4820"
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                  Recipient Country
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <Globe size={18} />
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white appearance-none"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                  Transfer Amount (USD)
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#635bdf]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3.5 pl-11 pr-4 text-lg font-bold text-[#111827] outline-none transition focus:border-[#635bdf] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#152238] py-4 text-sm font-bold text-white shadow-lg shadow-[#152238]/20 transition-all hover:bg-[#20314f] active:scale-[0.98]"
              >
                <Send size={18} />
                <span>Continue to Authorization</span>
              </button>
            </form>
          </div>
        </section>

        {/* 4-Digit Security PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[360px] rounded-[32px] bg-white p-7 text-center shadow-2xl">
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Security check</span>
                <button 
                  onClick={() => setShowPinModal(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mx-auto mt-2 grid size-12 place-items-center rounded-2xl bg-[#eeeaff] text-[#635bdf]">
                <Lock size={22} strokeWidth={2.2} />
              </div>

              <h3 className="mt-3 text-lg font-bold text-[#111827]">Enter Security PIN</h3>
              <p className="mt-1 text-xs text-[#748096]">
                Authorizing <strong className="text-[#111827]">{formatCurrency(amount)}</strong> to {payee}
              </p>

              {/* 4-Digit Slots */}
              <div className="mt-6 flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pinDigits.length > idx
                  return (
                    <div
                      key={idx}
                      className={`grid size-12 place-items-center rounded-2xl border-2 text-xl font-bold transition-all ${
                        pinError ? 'border-red-500 bg-red-50 text-red-600' :
                        isFilled ? 'border-[#635bdf] bg-[#eeeaff] text-[#635bdf]' :
                        'border-[#e5e7eb] bg-[#f9fafb]'
                      }`}
                    >
                      {isFilled ? '•' : ''}
                    </div>
                  )
                })}
              </div>

              {pinError && (
                <p className="mt-3 text-xs font-semibold text-red-600">Incorrect PIN. Please try again.</p>
              )}

              {/* Numeric Keypad */}
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((keyVal, idx) => {
                  if (keyVal === '') return <div key={idx} />
                  if (keyVal === 'back') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={handleBackspace}
                        className="grid size-14 place-items-center rounded-2xl bg-[#f5f7fb] text-sm font-semibold text-[#536074] transition active:scale-95 mx-auto"
                      >
                        ←
                      </button>
                    )
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDigitPress(keyVal)}
                      disabled={isSubmitting}
                      className="grid size-14 place-items-center rounded-2xl bg-[#f5f7fb] text-lg font-bold text-[#111827] shadow-sm transition active:scale-95 hover:bg-[#ebf0f8] mx-auto disabled:opacity-50"
                    >
                      {keyVal}
                    </button>
                  )
                })}
              </div>

              {isSubmitting && (
                <p className="mt-4 text-xs font-semibold text-[#635bdf] animate-pulse">
                  Verifying PIN & dispatching transfer...
                </p>
              )}
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </main>
  )
}
