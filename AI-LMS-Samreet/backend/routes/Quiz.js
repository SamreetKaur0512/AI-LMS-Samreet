const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const {
  generateQuiz,
  getQuizForStudent,
  submitQuiz,
  getQuizHistory,
  getStudentQuizzes,
} = require("../controllers/Quiz")

// Generate quiz for a course (can be called manually or by scheduler)
router.post("/generate", auth, generateQuiz)

// Get all quizzes for student's enrolled courses
router.get("/my-quizzes", auth, getStudentQuizzes)

// Get quiz for a specific course
router.get("/course/:courseId", auth, getQuizForStudent)

// Submit quiz answers
router.post("/submit", auth, submitQuiz)

// Get student's quiz history
router.get("/history", auth, getQuizHistory)

module.exports = router
