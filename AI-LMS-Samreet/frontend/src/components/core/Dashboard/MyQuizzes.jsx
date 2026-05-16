import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { apiConnector } from "../../../services/apiconnector"
import { QUIZ_ENDPOINTS, profileEndpoints } from "../../../services/apis"
import { FaBrain, FaCheckCircle, FaClock, FaTrophy, FaMagic, FaTimes } from "react-icons/fa"

const MyQuizzes = () => {
  const { token } = useSelector((state) => state.auth)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  // Generate quiz modal state
  const [showModal, setShowModal] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedCourseName, setSelectedCourseName] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")
  const [generateSuccess, setGenerateSuccess] = useState("")

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const res = await apiConnector("GET", QUIZ_ENDPOINTS.GET_STUDENT_QUIZZES, null, {
        Authorization: `Bearer ${token}`,
      })
      if (res.data.success) setQuizzes(res.data.data)
    } catch (error) {
      console.log("Fetch quizzes error:", error)
    }
    setLoading(false)
  }

  useEffect(() => { fetchQuizzes() }, [token])

  // Open modal and load enrolled courses
  const handleOpenModal = async () => {
    setShowModal(true)
    setGenerateError("")
    setGenerateSuccess("")
    setSelectedCourseId("")
    setSelectedCourseName("")
    setCoursesLoading(true)
    try {
      const res = await apiConnector(
        "GET",
        profileEndpoints.GET_USER_ENROLLED_COURSES_API,
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (res.data.success) {
        setEnrolledCourses(res.data.data || [])
      }
    } catch (err) {
      setEnrolledCourses([])
    }
    setCoursesLoading(false)
  }

  const handleGenerate = async () => {
    if (!selectedCourseId) {
      setGenerateError("Please select a course first.")
      return
    }
    setGenerating(true)
    setGenerateError("")
    setGenerateSuccess("")
    try {
      const res = await apiConnector(
        "POST",
        QUIZ_ENDPOINTS.GENERATE_QUIZ,
        { courseId: selectedCourseId },
        { Authorization: `Bearer ${token}` }
      )
      if (res.data.success) {
        setGenerateSuccess(`✅ Quiz generated for "${selectedCourseName}"! It now appears below.`)
        await fetchQuizzes()
        setTimeout(() => {
          setShowModal(false)
          setGenerateSuccess("")
        }, 2000)
      } else {
        setGenerateError(res.data.message || "Could not generate quiz. Try again.")
      }
    } catch (err) {
      setGenerateError(
        err?.response?.data?.message || "Failed to generate quiz. Please try again."
      )
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="text-white">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
            <FaBrain size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-richblack-5">My Quizzes</h1>
            <p className="text-sm text-richblack-400">
              AI-generated quizzes for your enrolled courses
            </p>
          </div>
        </div>

        {/* Generate Quiz Button */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-richblack-900 hover:bg-yellow-300 transition-all duration-200 text-sm"
        >
          <FaMagic size={14} />
          Generate Quiz with AI
        </button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="rounded-xl bg-richblack-800 p-10 text-center border border-richblack-700">
          <FaBrain size={48} className="mx-auto mb-4 text-yellow-400 opacity-50" />
          <p className="text-xl font-semibold text-richblack-200">No Quizzes Yet</p>
          <p className="mt-2 text-richblack-400">
            Click <span className="text-yellow-400 font-semibold">"Generate Quiz with AI"</span> above to create a quiz for any of your enrolled courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="rounded-xl bg-richblack-800 border border-richblack-700 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-richblack-5 text-lg">{quiz.courseName}</h2>
                  <p className="text-xs text-richblack-400 mt-1">Week {quiz.weekNumber} Quiz</p>
                </div>
                {quiz.attempted ? (
                  <div className="flex items-center gap-1 rounded-full bg-green-900 px-3 py-1 text-xs text-green-400">
                    <FaCheckCircle size={10} />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-full bg-yellow-900 px-3 py-1 text-xs text-yellow-400">
                    <FaClock size={10} />
                    <span>Pending</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-sm text-richblack-400">
                <span>❓ {quiz.totalQuestions} Questions</span>
                <span>🤖 AI Generated</span>
              </div>

              {quiz.attempted && quiz.score !== null && (
                <div className="flex items-center gap-2 rounded-lg bg-richblack-700 px-4 py-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-richblack-200 text-sm">Your Score:</span>
                  <span
                    className={`font-bold text-lg ${
                      quiz.score >= 70
                        ? "text-green-400"
                        : quiz.score >= 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {quiz.score}%
                  </span>
                </div>
              )}

              {!quiz.attempted ? (
                <Link
                  to={`/dashboard/quiz/${quiz._id}`}
                  className="mt-auto rounded-lg bg-yellow-400 py-2 text-center font-semibold text-richblack-900 hover:bg-yellow-300 transition-all"
                >
                  Start Quiz
                </Link>
              ) : (
                <Link
                  to={`/dashboard/quiz/${quiz._id}`}
                  className="mt-auto rounded-lg border border-richblack-600 py-2 text-center text-richblack-300 hover:border-yellow-400 hover:text-yellow-400 transition-all"
                >
                  View Result
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-richblack-800 border border-richblack-600 p-6 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
                  <FaMagic size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-richblack-5">Generate AI Quiz</h2>
                  <p className="text-xs text-richblack-400">Pick an enrolled course</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-richblack-400 hover:text-richblack-5 transition-all"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Course Selector */}
            {coursesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="rounded-xl bg-richblack-700 p-5 text-center">
                <p className="text-richblack-300 text-sm">
                  You are not enrolled in any courses yet.
                </p>
                <Link
                  to="/catalog/computer-science-&-programming"
                  className="mt-3 inline-block text-yellow-400 text-sm hover:underline"
                  onClick={() => setShowModal(false)}
                >
                  Browse Courses →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {enrolledCourses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => {
                      setSelectedCourseId(course._id)
                      setSelectedCourseName(course.courseName)
                      setGenerateError("")
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all border ${
                      selectedCourseId === course._id
                        ? "bg-yellow-400/10 border-yellow-400 text-richblack-5"
                        : "bg-richblack-700 border-richblack-600 text-richblack-200 hover:border-richblack-400"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                        selectedCourseId === course._id
                          ? "border-yellow-400 bg-yellow-400"
                          : "border-richblack-400"
                      }`}
                    />
                    <span className="font-medium">{course.courseName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Error / Success */}
            {generateError && (
              <p className="mt-3 text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">
                {generateError}
              </p>
            )}
            {generateSuccess && (
              <p className="mt-3 text-sm text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
                {generateSuccess}
              </p>
            )}

            {/* Generate Button */}
            {enrolledCourses.length > 0 && (
              <button
                onClick={handleGenerate}
                disabled={!selectedCourseId || generating}
                className="mt-5 w-full rounded-lg bg-yellow-400 py-3 font-semibold text-richblack-900 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <FaMagic size={14} />
                    Generate Quiz for "{selectedCourseName || "selected course"}"
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default MyQuizzes