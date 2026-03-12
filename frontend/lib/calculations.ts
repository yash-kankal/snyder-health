export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:   'Sedentary (desk job, no exercise)',
  light:       'Lightly Active (1-3 days/week)',
  moderate:    'Moderately Active (3-5 days/week)',
  active:      'Very Active (6-7 days/week)',
  very_active: 'Extra Active (athlete / physical job)',
}

export function calculateBMR(w: number, h: number, age: number, gender: Gender) {
  const base = 10 * w + 6.25 * h - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}
export function calculateTDEE(bmr: number, level: ActivityLevel) {
  return bmr * ACTIVITY_MULTIPLIERS[level]
}
export function calculateBMI(w: number, h: number) {
  const hm = h / 100; return w / (hm * hm)
}
export function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6', description: 'Below healthy range' }
  if (bmi < 25)   return { category: 'Normal',      color: '#22c55e', description: 'Healthy weight range' }
  if (bmi < 30)   return { category: 'Overweight',  color: '#f97316', description: 'Above healthy range' }
  return           { category: 'Obese',             color: '#ef4444', description: 'Well above healthy range' }
}
export function calculateIBW(h: number, gender: Gender) {
  const hi = h / 2.54; return (gender === 'male' ? 50 : 45.5) + 2.3 * (hi - 60)
}
export function computeHealthStats(w: number, h: number, age: number, gender: Gender, level: ActivityLevel) {
  const bmr  = calculateBMR(w, h, age, gender)
  const tdee = calculateTDEE(bmr, level)
  const bmi  = calculateBMI(w, h)
  const ibw  = calculateIBW(h, gender)
  const bmiCategory = getBMICategory(bmi)
  const bodyFatEstimate = gender === 'male'
    ? 1.2 * bmi + 0.23 * age - 16.2
    : 1.2 * bmi + 0.23 * age - 5.4
  const calorieGoals = {
    maintain: Math.round(tdee),
    mildLoss: Math.round(tdee - 250),
    loss:     Math.round(tdee - 500),
    mildGain: Math.round(tdee + 250),
    gain:     Math.round(tdee + 500),
  }
  return {
    bmr: Math.round(bmr), tdee: Math.round(tdee),
    bmi: Math.round(bmi * 10) / 10, bmiCategory,
    ibw: Math.round(ibw * 10) / 10,
    bodyFatEstimate: Math.round(bodyFatEstimate * 10) / 10,
    calorieGoals,
  }
}
