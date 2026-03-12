'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { LayoutDashboard, MessageCircle, UtensilsCrossed, User, Leaf, LogOut, Menu, X, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/chat',      icon: MessageCircle,   label: 'AI Chat'   },
  { href: '/meals',     icon: UtensilsCrossed, label: 'Meals'     },
]

export default function Sidebar() {
  const path = usePathname()
  const { logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 bg-bg-card border border-border rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={clsx(
        'fixed left-0 top-0 z-40 h-screen w-60 bg-bg-secondary border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 bg-accent-green/20 rounded-lg flex items-center justify-center border border-accent-green/30">
            <Leaf className="w-4 h-4 text-accent-green" />
          </div>
          <span className="text-lg font-bold text-white">SnyderHealth</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-accent-green/15 text-accent-green border border-accent-green/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-bg-hover'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-green" />}
              </Link>
            )
          })}
        </nav>

        {/* Account section */}
        <div className="px-3 pb-4 border-t border-border pt-3">
          {/* Account popup */}
          {accountOpen && (
            <div className="mb-2 bg-bg-hover border border-border-light rounded-xl overflow-hidden">
              <Link
                href="/profile"
                onClick={() => { setAccountOpen(false); setOpen(false) }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-slate-100 hover:bg-bg-card transition-colors"
              >
                <User className="w-4 h-4 text-accent-green flex-shrink-0" />
                View Profile
              </Link>
              <div className="h-px bg-border mx-3" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          )}

          {/* Account trigger button */}
          <button
            onClick={() => setAccountOpen(v => !v)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all',
              accountOpen
                ? 'bg-bg-hover border-border-light'
                : 'border-border hover:bg-bg-hover hover:border-border-light'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-accent-green/20 border border-accent-green/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-accent-green">{initials}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Account'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>
            <ChevronUp className={clsx('w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200', accountOpen ? 'rotate-0' : 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  )
}
