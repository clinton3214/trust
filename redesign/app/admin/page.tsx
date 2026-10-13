'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShieldAlert, 
  Wallet, 
  Gavel, 
  UserCog, 
  KeyRound, 
  Hash, 
  MessageSquare, 
  Trash2, 
  Check, 
  X, 
  LogOut,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react'
import { 
  getFinancials, 
  updateFinancials, 
  getProfile, 
  setProfile, 
  getPasswords, 
  updateSecurityCredentials, 
  getTransactions, 
  updateTransactionStatus, 
  clearTransactions, 
  clearMessages,
  listenToDatabaseChanges,
  formatCurrency, 
  UserProfile, 
  Transaction,
  defaultProfile 
} from '@/lib/firebase'

export default function AdminPage() {
  const router = useRouter()
  
  // Financials
  const [balanceInput, setBalanceInput] = useState('')
  const [limitInput, setLimitInput] = useState('')
  
  // Profile
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile)
  
  // Credentials
  const [userEmail, setUserEmail] = useState('@trustbank25')
  const [userPass, setUserPass] = useState('222653')
  const [adminEmail, setAdminEmail] = useState('admin@com')
  const [adminPass, setAdminPass] = useState('00000')
  const [transferPin, setTransferPin] = useState('4476')
  
  // Pending transactions
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([])
  
  // Status message
  const [statusMsg, setStatusMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const showNotification = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 4000)
  }

  const loadAllData = async () => {
    const fin = await getFinancials()
    setBalanceInput(String(fin.balance.toFixed(2)))
    setLimitInput(String(fin.limit.toFixed(2)))

    const prof = await getProfile()
    setProfileState(prof)

    const passes = await getPasswords()
    setUserEmail(passes.userEmail)
    setUserPass(passes.userPass)
    setAdminEmail(passes.adminEmail)
    setAdminPass(passes.adminPass)
    setTransferPin(passes.transferPin)

    const allTx = await getTransactions()
    setPendingTxs(allTx.filter((t) => t.status === 'Pending'))
    setLoading(false)
  }

  useEffect(() => {
    loadAllData()

    const unsubscribe = listenToDatabaseChanges((data) => {
      if (data) {
        if (data.tb_transactions) {
          const txs: Transaction[] = data.tb_transactions
          setPendingTxs(txs.filter((t) => t.status === 'Pending'))
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // Save financial modifications
  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault()
    const b = parseFloat(balanceInput)
    const l = parseFloat(limitInput)
    if (isNaN(b) || isNaN(l)) {
      showNotification('Please enter valid numeric amounts.')
      return
    }
    await updateFinancials(b, l)
    showNotification('Balance and transaction limits updated successfully!')
  }

  // Save profile modifications
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await setProfile(profile)
    showNotification('User profile details updated successfully!')
  }

  // Save security credentials (passwords + 4-digit PIN)
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (transferPin.length !== 4 || !/^\d{4}$/.test(transferPin)) {
      showNotification('Security PIN must be exactly 4 digits.')
      return
    }
    await updateSecurityCredentials({
      userEmail,
      userPass,
      adminEmail,
      adminPass,
      transferPin
    })
    showNotification('All passwords and 4-digit PIN updated successfully!')
  }

  // Transaction decisions
  const handleApprove = async (id: string) => {
    if (confirm('Approve this transfer and deduct amount from user balance?')) {
      await updateTransactionStatus(id, 'Approved')
      showNotification('Transfer approved and balance updated!')
    }
  }

  const handleBlock = async (id: string) => {
    const reason = prompt('Enter a reason or note for blocking this transfer (optional):', 'Security verification required')
    if (reason !== null) {
      await updateTransactionStatus(id, 'Blocked', reason)
      showNotification('Transfer blocked.')
    }
  }

  const handleClearTransactions = async () => {
    if (confirm('Are you sure you want to permanently delete all transactions?')) {
      await clearTransactions()
      showNotification('All transactions wiped.')
    }
  }

  const handleClearChat = async () => {
    if (confirm('Are you sure you want to permanently clear all support messages?')) {
      await clearMessages()
      showNotification('All chat messages wiped.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('tb_auth_role')
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827] py-6 px-4">
      <div className="mx-auto max-w-[800px] space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between rounded-[28px] bg-[#152238] p-6 text-white shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-red-600/90 text-white shadow-md">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TrustBank Admin Control</h1>
              <p className="text-xs text-[#a0afc4]">Master Management & Liquidity Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/chat"
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Support Inbox</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {statusMsg && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
            {statusMsg}
          </div>
        )}

        {/* Financial Balances Section */}
        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef1f5]">
            <div className="grid size-9 place-items-center rounded-xl bg-[#eeeaff] text-[#635bdf]">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Financial Controls</h2>
              <p className="text-xs text-[#748096]">Modify the user liquid balance and single-transaction limit.</p>
            </div>
          </div>

          <form onSubmit={handleSaveFinancials} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                User Liquid Balance (USD)
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#635bdf]">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-9 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-[#635bdf]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                Max Transfer Cap Limit (USD)
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-600">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-9 pr-4 text-sm font-bold text-[#111827] outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-[#152238] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#20314f] transition"
              >
                Update Financials
              </button>
            </div>
          </form>
        </div>

        {/* Security Credentials & 4-Digit PIN Section */}
        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef1f5]">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Security Credentials & Transfer PIN</h2>
              <p className="text-xs text-[#748096]">
                Configure user login credentials, admin master password, and the 4-digit transfer PIN.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                User Username / Email
              </label>
              <input
                type="text"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none focus:border-[#635bdf]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                User Login Password
              </label>
              <input
                type="text"
                required
                value={userPass}
                onChange={(e) => setUserPass(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none focus:border-[#635bdf]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                Admin Email (default: admin@com)
              </label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none focus:border-[#635bdf]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">
                Admin Master Password (default: 00000)
              </label>
              <input
                type="text"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none focus:border-[#635bdf]"
              />
            </div>

            {/* 4-Digit Security PIN (HIGHLIGHTED) */}
            <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-[#635bdf]/40 bg-[#eeeaff]/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={18} className="text-[#635bdf]" />
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#635bdf]">
                  4-Digit Transfer Authorization PIN
                </label>
              </div>
              <p className="text-xs text-[#748096] mb-3">
                This PIN is required whenever the user sends money. You can change it anytime.
              </p>
              <input
                type="text"
                maxLength={4}
                required
                value={transferPin}
                onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4476"
                className="w-48 rounded-2xl border border-[#635bdf] bg-white py-3 px-4 text-center text-lg font-bold tracking-widest text-[#111827] outline-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-[#635bdf] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#524ac9] transition"
              >
                Save Credentials & Security PIN
              </button>
            </div>
          </form>
        </div>

        {/* User Profile Editor */}
        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef1f5]">
            <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <UserCog size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">User Profile Editor</h2>
              <p className="text-xs text-[#748096]">Modify the user personal identity and account strings.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfileState({ ...profile, name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Date of Birth</label>
              <input
                type="text"
                value={profile.dob}
                onChange={(e) => setProfileState({ ...profile, dob: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Profile Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfileState({ ...profile, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfileState({ ...profile, phone: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfileState({ ...profile, address: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-medium text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Checking Account #</label>
              <input
                type="text"
                value={profile.checking}
                onChange={(e) => setProfileState({ ...profile, checking: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-mono text-[#111827] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8c98aa]">Savings Account #</label>
              <input
                type="text"
                value={profile.savings}
                onChange={(e) => setProfileState({ ...profile, savings: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 px-4 text-sm font-mono text-[#111827] outline-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-[#152238] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#20314f] transition"
              >
                Save Profile Information
              </button>
            </div>
          </form>
        </div>

        {/* Pending Transfers Review List */}
        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#eef1f5]">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111827]">Pending Transfers ({pendingTxs.length})</h2>
                <p className="text-xs text-[#748096]">Transfers initiated by the user awaiting administrative review.</p>
              </div>
            </div>

            <button
              onClick={loadAllData}
              className="rounded-xl p-2 text-[#748096] hover:bg-gray-100 transition"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {pendingTxs.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8c98aa] italic">
                No transfers currently pending approval.
              </p>
            ) : (
              pendingTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      {tx.payee} {tx.bank ? `• ${tx.bank}` : ''}
                    </p>
                    <p className="text-xs text-[#748096] mt-0.5">
                      Account: {tx.account || 'N/A'} • Ref: {tx.id} • {tx.date}
                    </p>
                    <p className="text-base font-extrabold text-[#111827] mt-1.5">
                      {formatCurrency(Math.abs(Number(tx.amount)))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(tx.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleBlock(tx.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                    >
                      <X size={16} /> Block
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="rounded-[28px] bg-white p-6 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">Database Maintenance</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClearTransactions}
              className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
            >
              <Trash2 size={16} /> Clear All Transactions
            </button>

            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
            >
              <Trash2 size={16} /> Clear All Chat Messages
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-[#111827] hover:bg-gray-100 transition ml-auto"
            >
              <span>View User App</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
