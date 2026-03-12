'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Eye, EyeOff, Leaf, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left gradient panel */}
      <div
        className="hidden lg:flex lg:w-[65%] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 20%, #15803d 45%, #22c55e 75%, #4ade80 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-60"
            style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-50"
            style={{ background: 'radial-gradient(circle, #14532d 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">SnyderHealth</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-2">Track Your Health Journey</h2>
          <p className="text-white/70 text-lg">AI-powered nutrition, meal tracking, and health insights.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-bg-primary flex items-center justify-center px-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-accent-green/20 rounded-xl flex items-center justify-center border border-accent-green/30">
              <Leaf className="w-5 h-5 text-accent-green" />
            </div>
            <span className="text-2xl font-bold text-white">SnyderHealth</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-100 mb-8">Welcome back</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-accent-green/50 focus:outline-none transition-colors"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 pr-10 text-slate-100 placeholder-slate-500 focus:border-accent-green/50 focus:outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Log in'}
            </button>
          </form>

          <p className="mt-5 text-center text-slate-400 text-sm">
            New to SnyderHealth?{' '}
            <Link href="/signup" className="text-accent-green hover:underline font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
