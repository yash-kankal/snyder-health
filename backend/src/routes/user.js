const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')
const { computeHealthStats } = require('../lib/calculations')

const router = express.Router()

// ── GET /api/user ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const stats = (user.weight && user.height && user.age && user.gender && user.activityLevel)
      ? computeHealthStats(user.weight, user.height, user.age, user.gender, user.activityLevel)
      : null

    res.json({ user, stats })
  } catch (err) {
    console.error('GET /user:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/user ─────────────────────────────────────────────────────────
router.put('/', auth, async (req, res) => {
  try {
    const allowed = ['name', 'height', 'weight', 'age', 'gender', 'activityLevel', 'dailyCalorieGoal']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    // Push weight to history when updating
    if (req.body.weight) {
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          weightHistory: {
            $each: [{ date: new Date(), weight: req.body.weight }],
            $slice: -90,
          },
        },
      })
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    const stats = (user.weight && user.height && user.age && user.gender && user.activityLevel)
      ? computeHealthStats(user.weight, user.height, user.age, user.gender, user.activityLevel)
      : null

    res.json({ user, stats })
  } catch (err) {
    console.error('PUT /user:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
