const mongoose = require("mongoose")

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  answers: [{ type: Number }], // student ke answers (option index)
  score: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  attemptedAt: { type: Date, default: Date.now },
  timeTaken: { type: Number }, // seconds mein
})

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema)