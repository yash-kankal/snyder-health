const express = require('express')
const OpenAI = require('openai')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const User = require('../models/User')
const { computeHealthStats } = require('../lib/calculations')

const router = express.Router()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many chat messages, slow down a bit!' },
})

// ── POST /api/chat ────────────────────────────────────────────────────────
router.post('/', auth, chatLimiter, async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: 'messages array required' })

    const user = await User.findById(req.userId).select('-password')

    let userContext = `The user's name is ${user?.name || 'there'}.`
    if (user?.weight && user?.height && user?.age && user?.gender && user?.activityLevel) {
      const stats = computeHealthStats(user.weight, user.height, user.age, user.gender, user.activityLevel)
      userContext += ` Their stats: Height ${user.height}cm, Weight ${user.weight}kg, Age ${user.age}, Gender ${user.gender}. BMR: ${stats.bmr} kcal/day, TDEE: ${stats.tdee} kcal/day, BMI: ${stats.bmi} (${stats.bmiCategory.category}). Daily calorie goal: ${user.dailyCalorieGoal || stats.calorieGoals.maintain} kcal.`
    }

    const systemPrompt = `You are SnyderHealth, a friendly and knowledgeable health and nutrition assistant.
${userContext}

Your expertise includes:
- Healthy recipes tailored to the user's calorie goals and preferences
- Nutrition advice and meal planning
- Health tips for weight management, fitness, and wellness
- Understanding macronutrients (protein, carbs, fats) and micronutrients
- Interpreting health metrics like BMI, BMR, and TDEE

Guidelines:
- Be warm, encouraging, and supportive
- Give practical, actionable advice
- When suggesting recipes, include approximate calorie counts and macros
- Always remind users to consult healthcare professionals for medical advice
- Keep responses concise but informative
- Use emojis sparingly but effectively to make responses engaging`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20),
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || 'I could not generate a response.'
    res.json({ message: reply })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: err.message || 'Chat service error' })
  }
})

module.exports = router
