const express = require('express')
const auth = require('../middleware/auth')
const Meal = require('../models/Meal')
const User = require('../models/User')

const router = express.Router()

// ── GET /api/calories?days=7 ──────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7')

    const endDate = new Date(); endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    const user = await User.findById(req.userId).select('dailyCalorieGoal')
    const dailyGoal = user?.dailyCalorieGoal || 2000

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    })

    // Build day-by-day map
    const summaryMap = {}
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      const key = d.toISOString().split('T')[0]
      summaryMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    for (const meal of meals) {
      const key = new Date(meal.date).toISOString().split('T')[0]
      if (summaryMap[key]) {
        summaryMap[key].calories += meal.calories
        summaryMap[key].protein  += meal.protein || 0
        summaryMap[key].carbs    += meal.carbs   || 0
        summaryMap[key].fat      += meal.fat     || 0
      }
    }

    const summary = Object.entries(summaryMap).map(([date, data]) => ({
      date, ...data, goal: dailyGoal,
    }))

    res.json({ summary, dailyGoal })
  } catch (err) {
    console.error('GET /calories:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
