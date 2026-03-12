'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import MacroChart from '@/components/charts/MacroChart'
import WeightChart from '@/components/charts/WeightChart'
import { api } from '@/lib/api'
import { Flame, Target, TrendingUp, Activity, Scale, Zap, Brain, Apple, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, unit, color, sub }: any) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 hover:border-border-light transition-colors">
      <div className="mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [calData, setCalData] = useState<any[]>([])
  const [todayMeals, setTodayMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const [uRes, cRes, mRes] = await Promise.all([
          api.get('/api/user'),
          api.get('/api/calories?days=7'),
          api.get(`/api/meals?date=${today}`),
        ])
        setUser(uRes.user)
        setStats(uRes.stats)
        setCalData(cRes.summary || [])
        setTodayMeals(mRes.meals || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-accent-green animate-spin" /></div></DashboardLayout>

  const todayStr = new Date().toISOString().split('T')[0]
  const today = calData.find(d => d.date === todayStr) || { calories: 0, goal: user?.dailyCalorieGoal || 2000, protein: 0, carbs: 0, fat: 0 }
  const calorieProgress = Math.min((today.calories / today.goal) * 100, 100)
  const remaining = Math.max(today.goal - today.calories, 0)

  const weightHistory = (user?.weightHistory || []).slice(-30).map((w: any) => ({
    date: new Date(w.date).toISOString().split('T')[0],
    weight: w.weight,
  }))

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          {!user?.height && (
            <Link href="/profile" className="flex items-center gap-2 text-sm text-accent-green border border-accent-green/30 bg-accent-green/10 px-4 py-2 rounded-lg hover:bg-accent-green/20 transition-colors">
              Complete Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Today's Calories — full width, larger */}
        <div className="bg-bg-card border border-border rounded-xl p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Today&apos;s Calories</h2>
              <p className="text-sm text-slate-400">Goal: {today.goal.toLocaleString()} kcal</p>
            </div>
            <span className="text-sm font-medium text-slate-300 bg-bg-secondary px-3 py-1 rounded-lg">{Math.round(calorieProgress)}%</span>
          </div>
          <div className="h-4 bg-bg-secondary rounded-full overflow-hidden mb-6">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${calorieProgress}%`, background: calorieProgress > 100 ? '#ef4444' : calorieProgress > 80 ? '#f97316' : '#22c55e' }} />
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-slate-100">{today.calories.toLocaleString()}</p>
              <p className="text-sm text-slate-400 mt-1">Consumed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent-green">{remaining.toLocaleString()}</p>
              <p className="text-sm text-slate-400 mt-1">Remaining</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-100">{today.goal.toLocaleString()}</p>
              <p className="text-sm text-slate-400 mt-1">Goal</p>
            </div>
          </div>
        </div>

        {/* 4 stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Flame} label="BMR (Base Metabolic)" value={stats ? stats.bmr.toLocaleString() : '—'} unit="kcal" color="#f97316" />
          <StatCard icon={Zap} label="TDEE (Daily Burn)" value={stats ? stats.tdee.toLocaleString() : '—'} unit="kcal" color="#3b82f6" />
          <StatCard icon={Scale} label="BMI" value={stats ? stats.bmi : '—'} unit="" color={stats?.bmiCategory?.color || '#94a3b8'} sub={stats?.bmiCategory?.category} />
          <StatCard icon={TrendingUp} label="Ideal Body Weight" value={stats ? stats.ibw : '—'} unit="kg" color="#a855f7" />
        </div>

        {/* Today's Macros */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-slate-100 mb-1">Today&apos;s Macros</h2>
          <p className="text-xs text-slate-400 mb-4">Protein / Carbs / Fat</p>
          <MacroChart protein={today.protein} carbs={today.carbs} fat={today.fat} />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[{ label: 'Protein', value: today.protein, color: '#22c55e' }, { label: 'Carbs', value: today.carbs, color: '#3b82f6' }, { label: 'Fat', value: today.fat, color: '#f97316' }].map(m => (
              <div key={m.label} className="text-center">
                <p className="text-sm font-semibold text-slate-100">{Math.round(m.value)}g</p>
                <p className="text-xs" style={{ color: m.color }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-slate-100 mb-1">Weight History</h2>
            <p className="text-xs text-slate-400 mb-4">Last 30 entries</p>
            <WeightChart data={weightHistory} idealWeight={stats?.ibw} />
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="font-semibold text-slate-100">Today&apos;s Meals</h2><p className="text-xs text-slate-400">{todayMeals.length} entries</p></div>
              <Link href="/meals" className="text-xs text-accent-green hover:underline">View all</Link>
            </div>
            {todayMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                <Apple className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No meals logged yet today</p>
                <Link href="/meals" className="text-xs text-accent-green hover:underline mt-1">Log your first meal</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeals.slice(0, 5).map((m: any) => (
                  <div key={m._id} className="flex items-center justify-between p-2.5 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                      <span className="text-sm text-slate-200 truncate max-w-[140px]">{m.name}</span>
                      <span className="text-xs text-slate-500 capitalize">{m.mealType}</span>
                    </div>
                    <span className="text-sm font-medium text-accent-green">{m.calories} kcal</span>
                  </div>
                ))}
                {todayMeals.length > 5 && <p className="text-xs text-slate-500 text-center pt-1">+{todayMeals.length - 5} more</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/chat',    icon: Brain,    label: 'Chat with SnyderHealth',  desc: 'Get recipes & health tips',   color: '#22c55e' },
            { href: '/meals',   icon: Apple,    label: 'Log a Meal',         desc: 'Track calories with AI',       color: '#3b82f6' },
            { href: '/profile', icon: Activity, label: 'Update Stats',       desc: 'Recalculate your metrics',     color: '#a855f7' },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href} className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-light hover:bg-bg-hover transition-all group flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div><p className="text-sm font-medium text-slate-100">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
