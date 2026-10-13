'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Trash2, ShieldAlert, CheckCheck } from 'lucide-react'
import { listenToDatabaseChanges, addMessage, clearMessages, Message } from '@/lib/firebase'

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = listenToDatabaseChanges((data) => {
      if (data && data.tb_messages) {
        setMessages(data.tb_messages)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = replyText.trim()
    if (!text || sending) return

    setSending(true)
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    try {
      await addMessage({
        sender: 'Admin',
        text,
        time
      })
      setReplyText('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleClear = async () => {
    if (confirm('Clear all conversation messages?')) {
      await clearMessages()
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827] flex flex-col">
      <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col p-4 sm:p-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between rounded-[24px] bg-[#152238] p-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="grid size-10 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base font-bold">Admin: Support Desk</h1>
              <p className="text-xs text-[#a0afc4]">Live Customer Care Inbox</p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-xl bg-red-600/30 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-600/50 transition"
          >
            <Trash2 size={14} /> Clear Thread
          </button>
        </div>

        {/* Message Thread */}
        <div className="my-4 flex-1 overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_5px_20px_rgba(54,71,102,0.05)] space-y-3 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#8c98aa] italic">
              No chat messages in inbox yet.
            </div>
          ) : (
            messages.map((m, idx) => {
              const isAdmin = m.sender === 'Admin'
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isAdmin
                        ? 'bg-[#152238] text-white rounded-br-sm'
                        : 'bg-[#f5f7fb] text-[#111827] rounded-bl-sm border border-[#e5e7eb]'
                    }`}
                  >
                    <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                      isAdmin ? 'text-[#7fe0d4]' : 'text-[#635bdf]'
                    }`}>
                      {m.sender}
                    </p>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        isAdmin ? 'text-white/60' : 'text-[#9ca3af]'
                      }`}
                    >
                      <span>{m.time}</span>
                      {isAdmin && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Reply Box */}
        <form
          onSubmit={handleSendReply}
          className="flex items-center gap-2 rounded-2xl border border-[#e5e7eb] bg-white p-2 shadow-sm"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a response to the customer..."
            className="flex-1 px-3 py-2 text-sm font-medium text-[#111827] outline-none"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || sending}
            className="flex items-center gap-1.5 rounded-xl bg-[#152238] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#20314f] active:scale-95 disabled:opacity-40"
          >
            <Send size={15} />
            <span>Reply</span>
          </button>
        </form>

      </div>
    </main>
  )
}
