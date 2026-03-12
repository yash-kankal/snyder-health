'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props { protein: number; carbs: number; fat: number }
const COLORS = ['#22c55e', '#3b82f6', '#f97316']
const R = Math.PI / 180

const Label = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const i = payload[0]
  return <div className="bg-bg-card border border-border rounded-xl p-3 shadow-card text-sm"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: i.payload.fill }} /><span className="text-slate-400">{i.name}:</span><span className="text-slate-100 font-medium">{i.value}g</span></div></div>
}

export default function MacroChart({ protein, carbs, fat }: Props) {
  if (protein + carbs + fat === 0) return <div className="h-44 flex items-center justify-center text-slate-500 text-sm">No macro data yet</div>
  const data = [{ name: 'Protein', value: Math.round(protein), fill: COLORS[0] }, { name: 'Carbs', value: Math.round(carbs), fill: COLORS[1] }, { name: 'Fat', value: Math.round(fat), fill: COLORS[2] }]
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" labelLine={false} label={Label}>
          {data.map((e, i) => <Cell key={i} fill={e.fill} stroke="transparent" />)}
        </Pie>
        <Tooltip content={<Tip />} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
