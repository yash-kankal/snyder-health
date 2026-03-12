'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import MacroChart from '@/components/charts/MacroChart'
import CalorieChart from '@/components/charts/CalorieChart'
import { api } from '@/lib/api'
import { Plus, Trash2, Loader2, Apple, Coffee, Sun, Moon, Target, Sparkles, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import clsx from 'clsx'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
const ICONS: Record<MealType, any>   = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Apple }
const COLORS: Record<MealType, string> = { breakfast: '#f97316', lunch: '#eab308', dinner: '#3b82f6', snack: '#a855f7' }

export default function MealsPage() {
  const [date, setDate]           = useState(new Date())
  const [meals, setMeals]         = useState<any[]>([])
  const [weekData, setWeekData]   = useState<any[]>([])
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [loading, setLoading]     = useState(true)
  const [addOpen, setAddOpen]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', mealType: 'lunch' as MealType, calories: '', protein: '', carbs: '', fat: '', notes: '', useAI: true })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const [mRes, wRes] = await Promise.all([api.get(`/api/meals?date=${dateStr}`), api.get('/api/calories?days=7')])
      setMeals(mRes.meals || [])
      setWeekData(wRes.summary || [])
      setDailyGoal(wRes.dailyGoal || 2000)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [date])

  useEffect(() => { load() }, [load])

  async function addMeal(e: React.FormEvent) {
    e.preventDefault(); setAiLoading(true)
    try {
      await api.post('/api/meals', { name: form.name, mealType: form.mealType, date: date.toISOString(), useAI: form.useAI, calories: form.calories ? parseInt(form.calories) : undefined, protein: form.protein ? parseFloat(form.protein) : undefined, carbs: form.carbs ? parseFloat(form.carbs) : undefined, fat: form.fat ? parseFloat(form.fat) : undefined, notes: form.notes || undefined })
      setForm({ name: '', mealType: 'lunch', calories: '', protein: '', carbs: '', fat: '', notes: '', useAI: true })
      setAddOpen(false); load()
    } catch (e: any) { console.error(e) } finally { setAiLoading(false) }
  }

  async function deleteMeal(id: string) {
    setDeletingId(id)
    try { await api.delete(`/api/meals/${id}`); setMeals(p => p.filter(m => m._id !== id)); load() }
    catch (e) { console.error(e) } finally { setDeletingId(null) }
  }

  const totalCals    = meals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0)
  const totalCarbs   = meals.reduce((s, m) => s + (m.carbs   || 0), 0)
  const totalFat     = meals.reduce((s, m) => s + (m.fat     || 0), 0)
  const progress     = Math.min((totalCals / dailyGoal) * 100, 100)
  const byType = (t: MealType) => meals.filter(m => m.mealType === t)

  const inputCls = "w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-accent-green/50 focus:outline-none transition-colors text-sm"

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div><h1 className="text-2xl font-bold text-slate-100">Meal Tracker</h1><p className="text-slate-400 text-sm mt-0.5">Log meals and track your daily nutrition</p></div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-accent-green hover:bg-accent-green-dim text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"><Plus className="w-4 h-4" /> Log Meal</button>
        </div>

        {/* Date Nav */}
        <div className="flex items-center gap-3">
          <button onClick={() => setDate(d => subDays(d, 1))} className="w-8 h-8 rounded-lg border border-border bg-bg-card hover:bg-bg-hover flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex-1 text-center">
            <p className="font-semibold text-slate-100">{isToday(date) ? 'Today' : format(date, 'EEEE')}</p>
            <p className="text-xs text-slate-400">{format(date, 'MMMM d, yyyy')}</p>
          </div>
          <button onClick={() => setDate(d => addDays(d, 1))} disabled={isToday(date)} className="w-8 h-8 rounded-lg border border-border bg-bg-card hover:bg-bg-hover flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-slate-100">Daily Progress</h2><div className="flex items-center gap-1 text-xs text-slate-400"><Target className="w-3.5 h-3.5" />{dailyGoal.toLocaleString()} kcal</div></div>
            <div className="h-2 bg-bg-secondary rounded-full mb-3"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: progress > 100 ? '#ef4444' : progress > 85 ? '#f97316' : '#22c55e' }} /></div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-lg font-bold text-slate-100">{totalCals.toLocaleString()}</p><p className="text-xs text-slate-400">Consumed</p></div>
              <div><p className="text-lg font-bold text-accent-green">{Math.max(dailyGoal - totalCals, 0).toLocaleString()}</p><p className="text-xs text-slate-400">Remaining</p></div>
              <div><p className="text-lg font-bold text-slate-100">{Math.round(progress)}%</p><p className="text-xs text-slate-400">Of goal</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
              {[{ label: 'Protein', val: totalProtein, color: '#22c55e' }, { label: 'Carbs', val: totalCarbs, color: '#3b82f6' }, { label: 'Fat', val: totalFat, color: '#f97316' }].map(m => (
                <div key={m.label} className="text-center"><p className="text-sm font-semibold text-slate-100">{Math.round(m.val)}g</p><p className="text-xs" style={{ color: m.color }}>{m.label}</p></div>
              ))}
            </div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-slate-100 mb-1">Macro Split</h2><MacroChart protein={totalProtein} carbs={totalCarbs} fat={totalFat} /></div>
        </div>

        {/* Meals by type */}
        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-accent-green animate-spin" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => {
              const Icon = ICONS[type]; const color = COLORS[type]; const tm = byType(type)
              return (
                <div key={type} className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}><Icon className="w-3.5 h-3.5" style={{ color }} /></div><span className="font-medium text-slate-100 capitalize">{type}</span></div>
                    <span className="text-sm font-semibold" style={{ color }}>{tm.reduce((s: number, m: any) => s + m.calories, 0)} kcal</span>
                  </div>
                  {tm.length === 0 ? (
                    <div className="text-center py-4"><p className="text-xs text-slate-500">No {type} logged</p><button onClick={() => { setForm(f => ({ ...f, mealType: type })); setAddOpen(true) }} className="text-xs text-accent-green hover:underline mt-1">+ Add</button></div>
                  ) : (
                    <div className="space-y-2">
                      {tm.map((meal: any) => (
                        <div key={meal._id} className="flex items-center justify-between p-2 bg-bg-secondary rounded-lg group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{meal.name}</p>
                            <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                              {meal.protein != null && <span>{Math.round(meal.protein)}g P</span>}
                              {meal.carbs   != null && <span>{Math.round(meal.carbs)}g C</span>}
                              {meal.fat     != null && <span>{Math.round(meal.fat)}g F</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-sm font-medium text-slate-300">{meal.calories} kcal</span>
                            <button onClick={() => deleteMeal(meal._id)} disabled={deletingId === meal._id} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                              {deletingId === meal._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-slate-100 mb-1">7-Day Trend</h2><p className="text-xs text-slate-400 mb-4">Consumed vs daily goal</p><CalorieChart data={weekData} /></div>

        {/* Modal */}
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <div className="relative bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-card animate-slide-up">
              <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-accent-green" /> Log a Meal</h2>
              <form onSubmit={addMeal} className="space-y-4">
                <div><label className="block text-xs font-medium text-slate-400 mb-1">Meal Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grilled chicken salad" required className={inputCls} /></div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Meal Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(t => {
                      const IC = ICONS[t]
                      return <button type="button" key={t} onClick={() => setForm(f => ({ ...f, mealType: t }))} className={clsx('flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-all', form.mealType === t ? 'border-accent-green/50 bg-accent-green/10 text-accent-green' : 'border-border text-slate-400 hover:border-border-light')}><IC className="w-3.5 h-3.5" /><span className="capitalize">{t}</span></button>
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-border">
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-green" /><div><p className="text-sm text-slate-200">AI Calorie Estimation</p><p className="text-xs text-slate-500">Auto-calculate nutrition from name</p></div></div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, useAI: !f.useAI }))} className={clsx('w-10 h-5 rounded-full transition-colors relative', form.useAI ? 'bg-accent-green' : 'bg-bg-hover')}>
                    <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow', form.useAI ? 'left-5' : 'left-0.5')} />
                  </button>
                </div>
                {!form.useAI && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-slate-400 mb-1">Calories *</label><input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="kcal" min={0} required className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1">Protein (g)</label><input type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="g" min={0} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1">Carbs (g)</label><input type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} placeholder="g" min={0} className={inputCls} /></div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1">Fat (g)</label><input type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} placeholder="g" min={0} className={inputCls} /></div>
                  </div>
                )}
                <div><label className="block text-xs font-medium text-slate-400 mb-1">Notes (optional)</label><input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. 200g portion" className={inputCls} /></div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-slate-400 hover:text-slate-200 hover:border-border-light transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={aiLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-green hover:bg-accent-green-dim text-white font-medium transition-colors text-sm disabled:opacity-60">
                    {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{form.useAI ? ' Analysing…' : ' Saving…'}</> : <><Plus className="w-4 h-4" /> Add Meal</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
