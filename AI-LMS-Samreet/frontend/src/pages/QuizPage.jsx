import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { apiConnector } from "../services/apiconnector"
import { QUIZ_ENDPOINTS } from "../services/apis"
import { FaBrain, FaCheckCircle, FaTimesCircle, FaTrophy } from "react-icons/fa"

const QuizPage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [startTime] = useState(Date.now())
  const [alreadyAttempted, setAlreadyAttempted] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true)
      try {
        // Get quiz by quizId — need courseId from quiz
        // First get student quizzes to find courseId
        const quizzesRes = await apiConnector(
          "GET",
          QUIZ_ENDPOINTS.GET_STUDENT_QUIZZES,
          null,
          { Authorization: `Bearer ${token}` }
        )

        if (quizzesRes.data.success) {
          const quizInfo = quizzesRes.data.data.find(
            (q) => q._id === quizId
          )

          if (quizInfo) {
            if (quizInfo.attempted) {
              setAlreadyAttempted(true)
              setSubmitted(true)
              setLoading(false)
              return
            }

            // Fetch full quiz
            const res = await apiConnector(
              "GET",
              `${QUIZ_ENDPOINTS.GET_QUIZ_BY_COURSE}/${quizInfo.courseId}`,
              null,
              { Authorization: `Bearer ${token}` }
            )

            if (res.data.success && !res.data.alreadyAttempted) {
              setQuiz(res.data.data)
            }
          }
        }
      } catch (error) {
        console.log("Fetch quiz error:", error)
      }
      setLoading(false)
    }

    fetchQuiz()
  }, [quizId, token])

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    if (submitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting!")
      return
    }

    const answers = quiz.questions.map((_, i) => selectedAnswers[i])
    const timeTaken = Math.round((Date.now() - startTime) / 1000)

    try {
      const res = await apiConnector(
        "POST",
        QUIZ_ENDPOINTS.SUBMIT_QUIZ,
        { quizId: quiz._id, answers, timeTaken },
        { Authorization: `Bearer ${token}` }
      )

      if (res.data.success) {
        setResult(res.data.data)
        setSubmitted(true)
      }
    } catch (error) {
      console.log("Submit error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    )
  }

  // Already attempted — show message
  if (alreadyAttempted) {
    return (
      <div className="text-white text-center py-20">
        <FaCheckCircle size={60} className="mx-auto mb-4 text-green-400" />
        <h2 className="text-2xl font-bold">Already Attempted!</h2>
        <p className="text-richblack-400 mt-2">
          You have already completed this quiz.
        </p>
        <button
          onClick={() => navigate("/dashboard/my-quizzes")}
          className="mt-6 rounded-lg bg-yellow-400 px-6 py-2 font-semibold text-richblack-900"
        >
          Back to My Quizzes
        </button>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-xl">Quiz not found or not available yet.</p>
        <button
          onClick={() => navigate("/dashboard/my-quizzes")}
          className="mt-4 rounded-lg bg-yellow-400 px-6 py-2 font-semibold text-richblack-900"
        >
          Back to My Quizzes
        </button>
      </div>
    )
  }

  // Result screen
  if (submitted && result) {
    return (
      <div className="text-white max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="rounded-2xl bg-richblack-800 p-8 text-center mb-8 border border-richblack-700">
          <FaTrophy size={60} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold text-richblack-5">Quiz Completed!</h2>
          <p className="text-richblack-400 mt-2">{quiz.courseName}</p>
          <div
            className={`mt-6 text-6xl font-bold ${
              result.percentage >= 70
                ? "text-green-400"
                : result.percentage >= 40
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {result.percentage}%
          </div>
          <p className="text-richblack-300 mt-2">
            {result.score} / {result.totalQuestions} correct
          </p>
          <p className="mt-4 text-sm text-richblack-400">
            {result.percentage >= 70
              ? "🎉 Excellent! Great understanding of the topic!"
              : result.percentage >= 40
              ? "👍 Good effort! Review the explanations below."
              : "📚 Keep studying! Check the explanations to improve."}
          </p>
        </div>

        {/* Detailed Results */}
        <h3 className="text-xl font-bold mb-4 text-richblack-5">Detailed Results</h3>
        <div className="space-y-4">
          {result.results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border ${
                r.isCorrect
                  ? "bg-green-900/20 border-green-700"
                  : "bg-red-900/20 border-red-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {r.isCorrect ? (
                  <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-richblack-5">
                    Q{i + 1}. {r.question}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {r.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          j === r.correctAnswer
                            ? "bg-green-800 text-green-200"
                            : j === r.selectedAnswer && !r.isCorrect
                            ? "bg-red-800 text-red-200"
                            : "bg-richblack-700 text-richblack-300"
                        }`}
                      >
                        {j === r.correctAnswer && "✓ "}
                        {j === r.selectedAnswer && !r.isCorrect && "✗ "}
                        {opt}
                      </div>
                    ))}
                  </div>
                  {r.explanation && (
                    <p className="mt-2 text-xs text-richblack-400 bg-richblack-700 rounded-lg p-2">
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard/my-quizzes")}
          className="mt-8 w-full rounded-lg bg-yellow-400 py-3 font-semibold text-richblack-900 hover:bg-yellow-300"
        >
          Back to My Quizzes
        </button>
      </div>
    )
  }

  // Quiz attempt screen
  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length
  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div className="text-white max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-richblack-5">{quiz.courseName}</h2>
          <p className="text-sm text-richblack-400">Week {quiz.weekNumber} — AI Generated Quiz</p>
        </div>
        <div className="text-sm text-richblack-400">
          {answeredCount}/{totalQuestions} answered
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 rounded-full bg-richblack-700">
        <div
          className="h-2 rounded-full bg-yellow-400 transition-all"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl bg-richblack-800 p-6 border border-richblack-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-richblack-900 font-bold text-sm">
            {currentQuestion + 1}
          </div>
          <span className="text-xs text-richblack-400">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>

        <p className="text-lg font-medium text-richblack-5 mb-6">{question.question}</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelectAnswer(currentQuestion, i)}
              className={`w-full rounded-xl px-5 py-3 text-left text-sm transition-all ${
                selectedAnswers[currentQuestion] === i
                  ? "bg-yellow-400 text-richblack-900 font-semibold"
                  : "bg-richblack-700 text-richblack-200 hover:bg-richblack-600"
              }`}
            >
              <span className="mr-3 font-bold">
                {["A", "B", "C", "D"][i]}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
          disabled={currentQuestion === 0}
          className="rounded-lg border border-richblack-600 px-6 py-2 text-richblack-300 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-2">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`h-3 w-3 rounded-full transition-all ${
                i === currentQuestion
                  ? "bg-yellow-400"
                  : selectedAnswers[i] !== undefined
                  ? "bg-green-400"
                  : "bg-richblack-600"
              }`}
            />
          ))}
        </div>

        {currentQuestion < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestion((p) => p + 1)}
            className="rounded-lg bg-yellow-400 px-6 py-2 font-semibold text-richblack-900 hover:bg-yellow-300"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions}
            className="rounded-lg bg-green-500 px-6 py-2 font-semibold text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz ✓
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizPage
