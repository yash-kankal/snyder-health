'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props { data: { date: string; weight: number }[]; idealWeight?: number }

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return <div className="bg-bg-card border border-border rounded-xl p-3 shadow-card"><p className="text-xs text-slate-400 mb-1">{label}</p><p className="text-sm text-slate-100 font-medium">{payload[0]?.value} kg</p></div>
}

export default function WeightChart({ data, idealWeight }: Props) {
  if (!data.length) return <div className="h-44 flex items-center justify-center text-slate-500 text-sm">Update your weight in Profile to track progress</div>
  const d = data.map(x => ({ ...x, label: format(parseISO(x.date), 'MMM d') }))
  const ws = data.map(x => x.weight)
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[Math.min(...ws) - 2, Math.max(...ws) + 2]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        {idealWeight && <ReferenceLine y={idealWeight} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Ideal', fill: '#3b82f6', fontSize: 10, position: 'right' }} />}
        <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#080810' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
