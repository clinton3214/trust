'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Headphones, ShieldCheck, CheckCheck } from 'lucide-react'
import { listenToDatabaseChanges, addMessage, Message } from '@/lib/firebase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text || sending) return

    setSending(true)
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    try {
      await addMessage({
        sender: 'User',
        text,
        time
      })
      setInputText('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[480px] bg-[#f5f7fb] shadow-[0_0_60px_rgba(31,41,55,0.08)] flex flex-col pb-24">
        
        {/* Header */}
        <Header title="Customer Care" showBack backHref="/" />

        {/* Support Representative Info Banner */}
        <div className="mx-5 mb-3 rounded-2xl bg-[#152238] p-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative grid size-10 place-items-center rounded-xl bg-white/10 text-[#47d8c7]">
              <Headphones size={20} />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#152238]" />
            </div>
            <div>
              <p className="text-xs font-bold">Priority Banker Support</p>
              <p className="text-[11px] text-[#9ca3af]">Typical response time: Instant</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[#7fe0d4] px-2.5 py-1 rounded-full">
            Online
          </span>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-[#635bdf] shadow-sm mb-3">
                <ShieldCheck size={24} />
              </div>
              <p className="text-sm font-bold text-[#111827]">Encrypted Support Channel</p>
              <p className="mt-1 text-xs text-[#748096] max-w-xs mx-auto">
                How can we assist you today? Inquire about transfers, account limits, or reporting lost cards.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.sender === 'User'
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[22px] px-4 py-3 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#152238] text-white rounded-br-sm'
                        : 'bg-white text-[#111827] rounded-bl-sm border border-[#eef1f5]'
                    }`}
                  >
                    {!isUser && (
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#635bdf] mb-1">
                        TrustBank Support
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        isUser ? 'text-white/60' : 'text-[#9ca3af]'
                      }`}
                    >
                      <span>{m.time}</span>
                      {isUser && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="sticky bottom-[80px] px-5 py-2">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 rounded-full border border-white/80 bg-white/95 p-1.5 shadow-[0_5px_20px_rgba(54,71,102,0.1)] backdrop-blur-xl"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or explain an issue..."
              className="flex-1 bg-transparent px-4 text-sm font-medium text-[#111827] outline-none placeholder:text-[#9ca3af]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="grid size-10 place-items-center rounded-full bg-[#152238] text-white transition active:scale-95 hover:bg-[#20314f] disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
