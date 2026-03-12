const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary (desk job, no exercise)',
  light: 'Lightly Active (1-3 days/week)',
  moderate: 'Moderately Active (3-5 days/week)',
  active: 'Very Active (6-7 days/week)',
  very_active: 'Extra Active (athlete / physical job)',
}

function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

function calculateTDEE(bmr, activityLevel) {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55)
}

function calculateBMI(weight, height) {
  const hm = height / 100
  return weight / (hm * hm)
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6', description: 'Below healthy range' }
  if (bmi < 25)   return { category: 'Normal',      color: '#22c55e', description: 'Healthy weight range' }
  if (bmi < 30)   return { category: 'Overweight',  color: '#f97316', description: 'Above healthy range'  }
  return           { category: 'Obese',             color: '#ef4444', description: 'Well above healthy range' }
}

function calculateIBW(height, gender) {
  const heightInches = height / 2.54
  const base = gender === 'male' ? 50 : 45.5
  return base + 2.3 * (heightInches - 60)
}

function estimateBodyFat(bmi, age, gender) {
  return gender === 'male'
    ? 1.2 * bmi + 0.23 * age - 16.2
    : 1.2 * bmi + 0.23 * age - 5.4
}

function getCalorieGoalSuggestions(tdee) {
  return {
    maintain:       Math.round(tdee),
    mildLoss:       Math.round(tdee - 250),
    loss:           Math.round(tdee - 500),
    aggressiveLoss: Math.round(tdee - 750),
    mildGain:       Math.round(tdee + 250),
    gain:           Math.round(tdee + 500),
  }
}

function computeHealthStats(weight, height, age, gender, activityLevel) {
  const bmr = calculateBMR(weight, height, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)
  const bmi = calculateBMI(weight, height)
  return {
    bmr:              Math.round(bmr),
    tdee:             Math.round(tdee),
    bmi:              Math.round(bmi * 10) / 10,
    bmiCategory:      getBMICategory(bmi),
    ibw:              Math.round(calculateIBW(height, gender) * 10) / 10,
    bodyFatEstimate:  Math.round(estimateBodyFat(bmi, age, gender) * 10) / 10,
    calorieGoals:     getCalorieGoalSuggestions(tdee),
    activityLabel:    ACTIVITY_LABELS[activityLevel] || activityLevel,
  }
}

module.exports = { computeHealthStats, calculateBMR, calculateTDEE, calculateBMI, getBMICategory, calculateIBW }
