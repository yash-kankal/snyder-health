'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import WeightChart from '@/components/charts/WeightChart'
import { api } from '@/lib/api'
import { ACTIVITY_LABELS } from '@/lib/calculations'
import type { ActivityLevel, Gender } from '@/lib/calculations'
import { User, Save, Loader2, Scale, Activity, Flame, Zap, Target, TrendingUp, CheckCircle2, Info } from 'lucide-react'

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary',   label: 'Sedentary',        desc: 'Desk job, no exercise' },
  { value: 'light',       label: 'Lightly Active',   desc: 'Light exercise 1-3×/week' },
  { value: 'moderate',    label: 'Moderately Active', desc: 'Exercise 3-5×/week' },
  { value: 'active',      label: 'Very Active',       desc: 'Hard exercise 6-7×/week' },
  { value: 'very_active', label: 'Extra Active',      desc: 'Athlete / physical job' },
]

function MetricCard({ icon: Icon, label, value, unit, color, desc }: any) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-100">{value}{unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}</p>
      {desc && <p className="text-xs mt-1" style={{ color }}>{desc}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', height: '', weight: '', age: '', gender: 'male' as Gender, activityLevel: 'moderate' as ActivityLevel, dailyCalorieGoal: '' })
  const [stats, setStats] = useState<any>(null)
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/user').then(({ user, stats: s }) => {
      if (user) {
        setForm({ name: user.name || '', height: user.height?.toString() || '', weight: user.weight?.toString() || '', age: user.age?.toString() || '', gender: user.gender || 'male', activityLevel: user.activityLevel || 'moderate', dailyCalorieGoal: user.dailyCalorieGoal?.toString() || '' })
        setWeightHistory((user.weightHistory || []).slice(-30).map((w: any) => ({ date: new Date(w.date).toISOString().split('T')[0], weight: w.weight })))
        setStats(s)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaved(false)
    try {
      const { user: u, stats: s } = await api.put('/api/user', {
        name: form.name,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender, activityLevel: form.activityLevel,
        dailyCalorieGoal: form.dailyCalorieGoal ? parseInt(form.dailyCalorieGoal) : undefined,
      })
      setStats(s)
      if (form.weight) {
        const today = new Date().toISOString().split('T')[0]
        setWeightHistory(prev => [...prev.filter(w => w.date !== today), { date: today, weight: parseFloat(form.weight) }].slice(-30))
      }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { console.error(e) } finally { setSaving(false) }
  }

  const inputCls = "w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-accent-green/50 focus:outline-none transition-colors"

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-accent-green animate-spin" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Profile & Stats</h1>
          <p className="text-slate-400 text-sm mt-0.5">Update your details to get accurate health calculations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border"><User className="w-4 h-4 text-accent-green" /><h2 className="font-semibold text-slate-100">Personal Information</h2></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name',     key: 'name',             type: 'text',   placeholder: 'Your name' },
                  { label: 'Age (years)',   key: 'age',              type: 'number', placeholder: '25' },
                  { label: 'Height (cm)',   key: 'height',           type: 'number', placeholder: '170' },
                  { label: 'Weight (kg)',   key: 'weight',           type: 'number', placeholder: '70',   step: '0.1' },
                  { label: 'Calorie Goal', key: 'dailyCalorieGoal', type: 'number', placeholder: stats ? String(stats.calorieGoals?.maintain) : '2000' },
                ].map(({ label, key, type, placeholder, step }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[key]} step={step} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))} className={inputCls}>
                    <option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button type="button" key={opt.value} onClick={() => setForm(f => ({ ...f, activityLevel: opt.value }))}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${form.activityLevel === opt.value ? 'border-accent-green/50 bg-accent-green/10 text-slate-100' : 'border-border text-slate-400 hover:border-border-light'}`}>
                      <span className="font-medium block">{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {stats && (
                <div className="p-3 bg-accent-green/5 border border-accent-green/20 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    Suggested: <span className="text-accent-green">Maintain {stats.calorieGoals?.maintain} kcal</span> &nbsp;·&nbsp; <span className="text-blue-400">Lose weight {stats.calorieGoals?.loss} kcal</span> &nbsp;·&nbsp; <span className="text-orange-400">Gain weight {stats.calorieGoals?.gain} kcal</span>
                  </p>
                </div>
              )}

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-accent-green hover:bg-accent-green-dim text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {stats ? (
              <>
                <MetricCard icon={Scale}      label="BMI"               value={stats.bmi}                   unit=""     color={stats.bmiCategory?.color}   desc={`${stats.bmiCategory?.category} — ${stats.bmiCategory?.description}`} />
                <MetricCard icon={Flame}      label="BMR"               value={stats.bmr?.toLocaleString()}  unit="kcal" color="#f97316" />
                <MetricCard icon={Zap}        label="TDEE"              value={stats.tdee?.toLocaleString()} unit="kcal" color="#3b82f6" />
                <MetricCard icon={Target}     label="Ideal Body Weight" value={stats.ibw}                   unit="kg"   color="#a855f7" />
                <MetricCard icon={Activity}   label="Est. Body Fat"     value={stats.bodyFatEstimate}        unit="%"    color="#f97316" />
              </>
            ) : (
              <div className="bg-bg-card border border-border rounded-xl p-5 text-center text-slate-500 text-sm"><Activity className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Fill in your details to see health metrics</p></div>
            )}
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-slate-100 mb-1">Weight Progress</h2>
          <p className="text-xs text-slate-400 mb-4">Each save logs your weight — track trends over time</p>
          <WeightChart data={weightHistory} idealWeight={stats?.ibw} />
        </div>
      </div>
    </DashboardLayout>
  )
}
