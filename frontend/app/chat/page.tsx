'use client'
import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'
import { Send, Loader2, Leaf, User, Sparkles, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }

const SUGGESTIONS = [
  '🥗 Give me a healthy 500-calorie lunch recipe',
  '💪 What foods are high in protein?',
  '🏃 Tips for improving metabolism',
  '🌙 Best foods to eat before bed',
  '🍳 Quick 10-minute breakfast ideas',
  '🧘 How to reduce bloating naturally',
]

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', isUser ? 'bg-accent-green/20 border border-accent-green/30' : 'bg-bg-hover border border-border-light')}>
        {isUser ? <User className="w-4 h-4 text-accent-green" /> : <Leaf className="w-4 h-4 text-accent-green" />}
      </div>
      <div className={clsx('max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed', isUser ? 'chat-user text-white rounded-tr-sm' : 'chat-ai text-slate-200 rounded-tl-sm')}>
        {msg.content.split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}
        <p className={clsx('text-xs mt-1.5 opacity-50', isUser ? 'text-right' : 'text-left')}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-bg-hover border border-border-light flex items-center justify-center"><Leaf className="w-4 h-4 text-accent-green" /></div>
      <div className="chat-ai rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">{[0, 0.2, 0.4].map((d, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}s` }} />)}</div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hey! I'm SnyderHealth, your personal health and nutrition assistant 🌿\n\nI can help you with healthy recipes, meal planning, nutrition advice, and understanding your health metrics. What would you like to explore today?",
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function resize() {
    const ta = taRef.current; if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }

  async function send(content: string) {
    if (!content.trim() || loading) return
    setInput(''); if (taRef.current) taRef.current.style.height = 'auto'
    const userMsg: Message = { role: 'user', content: content.trim(), timestamp: new Date() }
    const updated = [...messages, userMsg]
    setMessages(updated); setLoading(true)
    try {
      const data = await api.post('/api/chat', { messages: updated.map(m => ({ role: m.role, content: m.content })) })
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${e.message}`, timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-green/20 rounded-xl border border-accent-green/30 flex items-center justify-center"><Leaf className="w-5 h-5 text-accent-green" /></div>
            <div>
              <h1 className="font-bold text-slate-100">SnyderHealth Chat</h1>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" /><span className="text-xs text-slate-400">Powered by GPT-4o mini</span></div>
            </div>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared! How can I help? 🌿', timestamp: new Date() }])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-bg-hover border border-transparent hover:border-border transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && !loading && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="text-xs bg-bg-card border border-border hover:border-border-light text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-full transition-all">{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-bg-card border border-border rounded-2xl p-3 flex items-end gap-3">
          <textarea ref={taRef} value={input} onChange={e => { setInput(e.target.value); resize() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about recipes, nutrition, health tips…" rows={1}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-36" />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-accent-green hover:bg-accent-green-dim flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">SnyderHealth can make mistakes. Consult a healthcare professional for medical advice.</p>
      </div>
    </DashboardLayout>
  )
}
