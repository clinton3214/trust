'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  FileText 
} from 'lucide-react'
import { getTransaction, formatCurrency, Transaction } from '@/lib/firebase'

function ReceiptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const txId = searchParams.get('id')
  
  const [tx, setTx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTx = async () => {
    if (!txId) return
    const result = await getTransaction(txId)
    setTx(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchTx()
    const interval = setInterval(() => {
      fetchTx()
    }, 2500)
    return () => clearInterval(interval)
  }, [txId])

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-[#748096]">
        Loading transaction receipt...
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-red-600">Transaction not found.</p>
        <Link href="/" className="inline-block rounded-2xl bg-[#152238] px-5 py-2.5 text-xs font-bold text-white">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const isPending = tx.status === 'Pending'
  const isApproved = tx.status === 'Approved'
  const isBlocked = tx.status === 'Blocked' || tx.status === 'Declined'
  const absAmount = formatCurrency(Math.abs(Number(tx.amount)))

  return (
    <div className="mx-auto max-w-[440px] p-5">
      
      {/* Action Header */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#635bdf] hover:underline"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#111827] shadow-sm hover:bg-gray-50 border border-gray-200"
        >
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      {/* Physical Receipt Card */}
      <div className="overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_15px_40px_rgba(21,34,56,0.08)] border border-[#eef1f5]">
        
        {/* Top Logo */}
        <div className="text-center pb-6 border-b border-dashed border-[#e5e7eb]">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#152238] text-sm font-extrabold text-white mb-2">
            TB
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#111827]">TRUST BANK</h1>
          <p className="text-xs text-[#8c98aa]">Official Electronic Transaction Receipt</p>
        </div>

        {/* Status Banner */}
        <div className="py-6 text-center">
          {isPending && (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Clock size={16} className="animate-spin" />
              <span>AWAITING APPROVAL</span>
            </div>
          )}
          {isApproved && (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={16} />
              <span>TRANSACTION SUCCESSFUL</span>
            </div>
          )}
          {isBlocked && (
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700">
              <XCircle size={16} />
              <span>TRANSACTION BLOCKED</span>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs text-[#8c98aa] uppercase font-bold tracking-wider">Amount Sent</p>
            <p className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">{absAmount}</p>
          </div>
        </div>

        {/* Receipt Details Breakdown */}
        <div className="space-y-3.5 border-t border-b border-dashed border-[#e5e7eb] py-5 text-xs font-medium">
          <div className="flex justify-between">
            <span className="text-[#8c98aa]">Reference ID</span>
            <span className="font-mono font-bold text-[#111827]">{tx.id.toUpperCase()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8c98aa]">Date & Time</span>
            <span className="text-[#111827] font-semibold">{tx.date}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8c98aa]">Recipient</span>
            <span className="text-[#111827] font-semibold">{tx.payee}</span>
          </div>

          {tx.bank && (
            <div className="flex justify-between">
              <span className="text-[#8c98aa]">Bank</span>
              <span className="text-[#111827] font-semibold">{tx.bank}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-[#8c98aa]">Account Number</span>
            <span className="font-mono text-[#111827] font-semibold">{tx.account || '•••• 4820'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8c98aa]">Payment Rail</span>
            <span className="text-[#111827] font-semibold">Faster Payments / ACH</span>
          </div>
        </div>

        {/* Note if any */}
        {tx.note && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium">
            <strong>Security Notice:</strong> {tx.note}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-[11px] text-[#8c98aa] space-y-1">
          <p>Thank you for banking with Trust Bank.</p>
          <p>This is a computer-generated transaction record.</p>
        </div>

      </div>

      {isBlocked && (
        <div className="mt-4 text-center print:hidden">
          <Link href="/chat" className="text-xs font-bold text-red-600 underline">
            Need assistance? Contact Customer Care →
          </Link>
        </div>
      )}

    </div>
  )
}

export default function ReceiptPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827] py-6">
      <Suspense fallback={<div className="py-20 text-center text-sm font-semibold">Loading receipt...</div>}>
        <ReceiptContent />
      </Suspense>
    </main>
  )
}
