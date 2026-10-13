'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ArrowDownLeft, ArrowUpRight, FileText, ChevronRight } from 'lucide-react'
import { listenToDatabaseChanges, formatCurrency, Transaction } from '@/lib/firebase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'outgoing' | 'incoming'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsubscribe = listenToDatabaseChanges((data) => {
      if (data && data.tb_transactions) {
        setTransactions(data.tb_transactions)
      }
    })
    return () => unsubscribe()
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by type
    if (filter === 'outgoing' && Number(tx.amount) >= 0) return false
    if (filter === 'incoming' && Number(tx.amount) < 0) return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchPayee = (tx.payee || '').toLowerCase().includes(q)
      const matchCategory = (tx.category || '').toLowerCase().includes(q)
      const matchAccount = (tx.account || '').toLowerCase().includes(q)
      return matchPayee || matchCategory || matchAccount
    }

    return true
  })

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] pb-28">
        
        {/* Header */}
        <Header title="Transaction History" showBack backHref="/" />

        {/* Search Bar */}
        <section className="px-5 pb-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payees, categories..."
              className="w-full rounded-2xl border border-[#e5e7eb] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#111827] outline-none shadow-sm focus:border-[#635bdf]"
            />
          </div>
        </section>

        {/* Filter Pills */}
        <section className="px-5 pb-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'outgoing', label: 'Outgoing' },
              { id: 'incoming', label: 'Incoming' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id as any)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === id
                    ? 'bg-[#152238] text-white shadow-sm'
                    : 'bg-white text-[#748096] hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Transaction Rows List */}
        <section className="px-5">
          <div className="overflow-hidden rounded-[28px] bg-white px-5 py-2 shadow-[0_5px_20px_rgba(54,71,102,0.05)]">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#748096]">
                No transactions matching your criteria.
              </div>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const isNegative = Number(tx.amount) < 0
                const formattedAmount = formatCurrency(Math.abs(Number(tx.amount)))

                return (
                  <div
                    key={tx.id || idx}
                    className={`flex items-center gap-3.5 py-4 ${
                      idx < filteredTransactions.length - 1 ? 'border-b border-[#eef1f5]' : ''
                    }`}
                  >
                    <div
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                        tx.status === 'Pending' ? 'bg-[#fff4dc] text-[#c38722]' :
                        tx.status === 'Blocked' ? 'bg-red-50 text-red-600' :
                        isNegative ? 'bg-[#edf0f5] text-[#202b3d]' : 'bg-[#dff9f1] text-[#149b84]'
                      }`}
                    >
                      {isNegative ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-[#111827]">{tx.payee}</p>
                        {tx.status === 'Pending' && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Pending
                          </span>
                        )}
                        {tx.status === 'Blocked' && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                            Blocked
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-0.5 text-xs text-[#98a2b3]">
                        {tx.date} {tx.category && `• ${tx.category}`}
                      </p>

                      {tx.note && (
                        <p className="mt-1 text-xs text-red-600 font-medium bg-red-50 p-1.5 rounded-lg inline-block">
                          Note: {tx.note}
                        </p>
                      )}

                      {tx.status === 'Approved' && isNegative && (
                        <Link
                          href={`/receipt?id=${tx.id}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#635bdf] hover:underline"
                        >
                          <FileText size={12} />
                          <span>View Official Receipt</span>
                        </Link>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold ${isNegative ? 'text-[#253044]' : 'text-[#129b7e]'}`}>
                        {isNegative ? '-' : '+'}{formattedAmount}
                      </p>
                      <p className="text-[11px] text-[#9ca3af]">
                        {tx.status === 'Approved' ? 'Completed' : tx.status}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  )
}
