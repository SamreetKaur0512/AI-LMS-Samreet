const axios = require("axios")
const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const Course = require("../models/Course")
const User = require("../models/User")

// ─── Generate Quiz using Gemini AI ───────────────────────────────────────────

exports.generateQuiz = async (req, res) => {
  const { courseId } = req.body
  const userId = req.user.id

  try {
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    const user = await User.findById(userId)
    const isEnrolled = user?.courses?.some(
      (courseRef) => courseRef.toString() === courseId.toString()
    )

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to generate its quiz",
      })
    }

    // Generate questions using Gemini
    const questions = await generateQuestionsFromGemini(
      course.courseName,
      course.courseDescription,
      course.tag
    )

    if (!questions) {
      return res.status(500).json({ success: false, message: "Could not generate questions" })
    }

    // Deactivate any previous active quizzes for this course
    await Quiz.updateMany({ courseId }, { isActive: false })

    // Save quiz to database. Manual generation is available immediately for enrolled users.
    const quiz = await Quiz.create({
      courseId,
      courseName: course.courseName,
      weekNumber: getWeekNumber(),
      questions,
      scheduledFor: new Date(),
      isActive: true,
    })

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      data: quiz,
    })
  } catch (error) {
    console.log("Generate Quiz Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Get Quiz for Student ─────────────────────────────────────────────────────

exports.getQuizForStudent = async (req, res) => {
  const { courseId } = req.params
  const userId = req.user.id

  try {
    // Check if student is enrolled
    const user = await User.findById(userId)
    const isEnrolled = user.courses.some(
      (c) => c.toString() === courseId
    )

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      })
    }

    // Get latest active quiz for this course
    const quiz = await Quiz.findOne({
      courseId,
      isActive: true,
    }).sort({ generatedAt: -1 })

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No quiz available for this course yet",
      })
    }

    // Check if student already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      userId,
    })

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        alreadyAttempted: true,
        attempt: existingAttempt,
        message: "You have already attempted this quiz",
      })
    }

    // Return quiz WITHOUT correct answers
    const quizData = {
      _id: quiz._id,
      courseName: quiz.courseName,
      weekNumber: quiz.weekNumber,
      scheduledFor: quiz.scheduledFor,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        // correctAnswer NOT sent to frontend
      })),
    }

    return res.status(200).json({
      success: true,
      alreadyAttempted: false,
      data: quizData,
    })
  } catch (error) {
    console.log("Get Quiz Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Submit Quiz ──────────────────────────────────────────────────────────────

exports.submitQuiz = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body
  const userId = req.user.id

  try {
    // Check already attempted
    const existingAttempt = await QuizAttempt.findOne({ quizId, userId })
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this quiz",
      })
    }

    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" })
    }

    // Calculate score
    let score = 0
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer
      if (isCorrect) score++
      return {
        question: q.question,
        options: q.options,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
      }
    })

    const percentage = Math.round((score / quiz.questions.length) * 100)

    // Save attempt
    const attempt = await QuizAttempt.create({
      quizId,
      userId,
      courseId: quiz.courseId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTaken: timeTaken || 0,
    })

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        totalQuestions: quiz.questions.length,
        percentage,
        results,
        attemptId: attempt._id,
      },
    })
  } catch (error) {
    console.log("Submit Quiz Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Get Student Quiz History ─────────────────────────────────────────────────

exports.getQuizHistory = async (req, res) => {
  const userId = req.user.id

  try {
    const attempts = await QuizAttempt.find({ userId })
      .populate("quizId", "courseName weekNumber")
      .sort({ attemptedAt: -1 })

    return res.status(200).json({
      success: true,
      data: attempts,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Get All Quizzes for Student's Enrolled Courses ──────────────────────────

exports.getStudentQuizzes = async (req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findById(userId).populate("courses", "courseName")
    const enrolledCourseIds = user.courses.map((c) => c._id)

    const quizzes = await Quiz.find({
      courseId: { $in: enrolledCourseIds },
      isActive: true,
    }).sort({ generatedAt: -1 })

    // Check attempt status for each quiz
    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempt = await QuizAttempt.findOne({
          quizId: quiz._id,
          userId,
        })
        return {
          _id: quiz._id,
          courseName: quiz.courseName,
          courseId: quiz.courseId,
          weekNumber: quiz.weekNumber,
          scheduledFor: quiz.scheduledFor,
          totalQuestions: quiz.questions.length,
          attempted: !!attempt,
          score: attempt ? attempt.percentage : null,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: quizzesWithStatus,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Helper: Generate Questions from Gemini ──────────────────────────────────

async function generateQuestionsFromGemini(courseName, description, tags) {
  try {
    const prompt = `Generate 5 multiple choice questions for a course called "${courseName}".
Course description: ${description}
Topics: ${tags?.join(", ") || courseName}

Return ONLY a valid JSON array with exactly this format, no extra text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct"
  }
]

Rules:
- correctAnswer is the INDEX (0, 1, 2, or 3) of the correct option
- Make questions educational and relevant to the course
- Each question should have exactly 4 options
- Return exactly 5 questions`

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.5 },
      },
      { headers: { "Content-Type": "application/json" } }
    )

    let text = response.data.candidates[0].content.parts[0].text
    
    // Clean response — remove markdown if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim()
    
    const questions = JSON.parse(text)
    return questions
  } catch (error) {
    console.log("Gemini Question Generation Error:", error?.response?.data || error.message)
    return null
  }
}

// ─── Helper: Get Next Sunday ──────────────────────────────────────────────────

function getNextSunday() {
  const today = new Date()
  const day = today.getDay()
  const daysUntilSunday = day === 0 ? 7 : 7 - day
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + daysUntilSunday)
  nextSunday.setHours(9, 0, 0, 0) // 9 AM
  return nextSunday
}

function getWeekNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now - start
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}
