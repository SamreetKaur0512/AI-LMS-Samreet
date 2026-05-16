const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index 0-3
  explanation: { type: String },
})

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  courseName: { type: String },
  weekNumber: { type: Number },
  questions: [questionSchema],
  generatedAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date }, // Sunday date
  isActive: { type: Boolean, default: true },
})

module.exports = mongoose.model("Quiz", quizSchema)
