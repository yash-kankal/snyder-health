const mongoose = require('mongoose')

const MealSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true, trim: true },
  calories: { type: Number, required: true, min: 0 },
  protein:  { type: Number, min: 0 },
  carbs:    { type: Number, min: 0 },
  fat:      { type: Number, min: 0 },
  fiber:    { type: Number, min: 0 },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  date:     { type: Date, default: Date.now },
  notes:    { type: String, trim: true },
}, { timestamps: true })

MealSchema.index({ userId: 1, date: -1 })

module.exports = mongoose.model('Meal', MealSchema)
