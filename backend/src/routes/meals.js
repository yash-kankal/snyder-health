const express = require('express')
const OpenAI = require('openai')
const auth = require('../middleware/auth')
const Meal = require('../models/Meal')

const router = express.Router()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── GET /api/meals ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { date, range } = req.query
    let startDate, endDate

    if (range === 'week') {
      endDate = new Date(); endDate.setHours(23, 59, 59, 999)
      startDate = new Date(); startDate.setDate(startDate.getDate() - 7)
    } else if (range === 'month') {
      endDate = new Date(); endDate.setHours(23, 59, 59, 999)
      startDate = new Date(); startDate.setDate(startDate.getDate() - 30)
    } else {
      const d = date ? new Date(date) : new Date()
      startDate = new Date(d); startDate.setHours(0, 0, 0, 0)
      endDate   = new Date(d); endDate.setHours(23, 59, 59, 999)
    }

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 })

    res.json({ meals })
  } catch (err) {
    console.error('GET /meals:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/meals ───────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { name, mealType, date, useAI, calories, protein, carbs, fat, fiber, notes } = req.body

    if (!name || !mealType)
      return res.status(400).json({ error: 'Meal name and type are required' })

    let mealCalories = calories
    let mealProtein = protein
    let mealCarbs = carbs
    let mealFat = fat
    let mealFiber = fiber

    // AI nutrition estimation using OpenAI
    if (useAI || !calories) {
      try {
        const prompt = `Analyze this meal and provide nutritional information. Meal: "${name}", Portion: typical serving. Return ONLY valid JSON with no markdown, no explanation, just the JSON object: {"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number}`

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 120,
          temperature: 0.1,
        })

        const text = response.choices[0]?.message?.content || ''
        const jsonMatch = text.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          const nutrition = JSON.parse(jsonMatch[0])
          mealCalories = mealCalories ?? nutrition.calories
          mealProtein  = mealProtein  ?? nutrition.protein
          mealCarbs    = mealCarbs    ?? nutrition.carbs
          mealFat      = mealFat      ?? nutrition.fat
          mealFiber    = mealFiber    ?? nutrition.fiber
        }
      } catch (aiErr) {
        console.warn('AI nutrition estimation failed:', aiErr.message)
      }
    }

    const meal = await Meal.create({
      userId: req.userId,
      name: name.trim(),
      calories: mealCalories || 0,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      fiber: mealFiber,
      mealType,
      date: date ? new Date(date) : new Date(),
      notes,
    })

    res.status(201).json({ meal })
  } catch (err) {
    console.error('POST /meals:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── DELETE /api/meals/:id ─────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!meal) return res.status(404).json({ error: 'Meal not found' })
    res.json({ message: 'Meal deleted' })
  } catch (err) {
    console.error('DELETE /meals/:id:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/meals/:id ────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const allowed = ['name', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'mealType', 'date', 'notes']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    )
    if (!meal) return res.status(404).json({ error: 'Meal not found' })
    res.json({ meal })
  } catch (err) {
    console.error('PUT /meals/:id:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
