const mongoose = require('mongoose')

const WeightEntrySchema = new mongoose.Schema({
  date:   { type: Date, default: Date.now },
  weight: { type: Number, required: true },
})

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  height:        { type: Number, min: 50, max: 300 },
  weight:        { type: Number, min: 10, max: 500 },
  age:           { type: Number, min: 1, max: 120 },
  gender:        { type: String, enum: ['male', 'female'] },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'moderate' },
  dailyCalorieGoal: { type: Number, default: 2000 },
  weightHistory: [WeightEntrySchema],
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
