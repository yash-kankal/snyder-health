'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props { data: { date: string; calories: number; goal: number }[] }

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 shadow-card text-sm">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-400 capitalize">{e.name}:</span>
          <span className="text-slate-100 font-medium">{Math.round(e.value)} kcal</span>
        </div>
      ))}
    </div>
  )
}

export default function CalorieChart({ data }: Props) {
  const d = data.map(x => ({ ...x, label: format(parseISO(x.date), 'MMM d') }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey="goal" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#gg)" name="goal" />
        <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} fill="url(#cg)" name="consumed"
          dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#080810' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
