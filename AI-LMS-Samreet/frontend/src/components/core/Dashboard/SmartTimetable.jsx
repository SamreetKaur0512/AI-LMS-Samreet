import React, { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { TIMETABLE_ENDPOINTS } from "../../../services/apis"
import {
  FaBrain, FaCalendarAlt, FaCheckCircle,
  FaExclamationTriangle, FaRocket, FaEdit, FaTrash, FaTimes, FaSave, FaTrophy,
} from "react-icons/fa"

// ── Status badge config (only used for IN-PROGRESS courses) ──────────────────
const STATUS_CONFIG = {
  ahead:           { label: "Ahead of Schedule 🚀", color: "text-green-400",  bg: "bg-green-900/30",  border: "border-green-500",  icon: <FaRocket /> },
  on_track:        { label: "On Track ✅",           color: "text-blue-400",   bg: "bg-blue-900/30",   border: "border-blue-500",   icon: <FaCheckCircle /> },
  behind:          { label: "Falling Behind ⚠️",     color: "text-red-400",    bg: "bg-red-900/30",    border: "border-red-500",    icon: <FaExclamationTriangle /> },
  deadline_passed: { label: "Deadline Passed ⏰",    color: "text-orange-400", bg: "bg-orange-900/30", border: "border-orange-500", icon: null },
}

// ── Circular progress ring ───────────────────────────────────────────────────
const ProgressRing = ({ percent, size = 80, stroke = 7, color = "#facc15" }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#374151" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize={size * 0.2} fontWeight="bold"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {percent}%
      </text>
    </svg>
  )
}

// ── Plan Edit Modal ──────────────────────────────────────────────────────────
const PlanModal = ({ course, existingPlan, onSave, onClose }) => {
  const today = new Date()
  today.setDate(today.getDate() + 1)
  const minDate = today.toISOString().split("T")[0]

  const [targetDate, setTargetDate] = useState(
    existingPlan?.targetCompletionDate
      ? new Date(existingPlan.targetCompletionDate).toISOString().split("T")[0]
      : ""
  )
  const [hours, setHours] = useState(existingPlan?.plannedHoursPerDay || 2)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!targetDate) return setError("Please pick a target date.")
    if (hours < 0.5 || hours > 16) return setError("Hours must be between 0.5 and 16.")
    setSaving(true)
    setError("")
    await onSave(course.courseId, targetDate, hours)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-richblack-800 border border-richblack-600 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-richblack-5">Set Study Plan</h2>
            <p className="text-xs text-richblack-400 mt-0.5 truncate max-w-[280px]">{course.courseName}</p>
          </div>
          <button onClick={onClose} className="text-richblack-400 hover:text-white transition-all">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-richblack-300 mb-1.5 block font-medium">
              🎯 Target Completion Date
            </label>
            <input
              type="date" min={minDate} value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl bg-richblack-700 border border-richblack-600 px-4 py-2.5 text-white text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-richblack-300 mb-1.5 block font-medium">
              ⏱️ Planned Hours Per Day: <span className="text-yellow-400 font-bold">{hours}h</span>
            </label>
            <input
              type="range" min={0.5} max={12} step={0.5} value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-richblack-500 mt-1">
              <span>0.5h</span><span>6h</span><span>12h</span>
            </div>
          </div>

          {targetDate && (
            <div className="rounded-xl bg-richblack-700 px-4 py-3 text-sm">
              <p className="text-richblack-300">
                📅 <span className="text-white font-medium">{Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))}</span> days remaining
              </p>
              <p className="text-richblack-300 mt-1">
                📚 Total planned study time:{" "}
                <span className="text-yellow-400 font-medium">
                  {Math.round(Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)) * hours)}h
                </span>
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-xs bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 font-semibold text-richblack-900 hover:bg-yellow-300 disabled:opacity-60 transition-all">
            {saving ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" /> Saving...</>
            ) : (
              <><FaSave size={14} /> Save Study Plan</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Completed Course Card ────────────────────────────────────────────────────
const CompletedCourseCard = ({ course }) => {
  const completedOn = course.plan?.targetCompletionDate
    ? new Date(course.plan.targetCompletionDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null

  return (
    <div className="rounded-2xl bg-richblack-800 border-2 border-green-500 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        {/* Thumbnail + Ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <img
            src={course.thumbnail}
            alt={course.courseName}
            className="w-24 h-16 object-cover rounded-lg"
          />
          <ProgressRing percent={100} size={72} stroke={6} color="#4ade80" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-richblack-5 text-lg leading-tight mb-2">
            {course.courseName}
          </h2>

          {/* Completed badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-green-900/40 border border-green-500 px-3 py-1 text-sm font-semibold text-green-400 mb-3">
            <FaTrophy className="text-yellow-400" />
            Target Completed! 🎉
          </div>

          {/* Summary info */}
          <div className="flex flex-wrap gap-3 text-xs text-richblack-400">
            <span>✅ {course.totalLessons} / {course.totalLessons} lessons done</span>
            {completedOn && <span>📅 Target was: {completedOn}</span>}
            {course.plan?.plannedHoursPerDay && (
              <span>⏱️ {course.plan.plannedHoursPerDay}h/day was your plan</span>
            )}
          </div>
        </div>
      </div>

      {/* Congratulations footer */}
      <div className="border-t border-green-800 bg-green-900/20 px-5 py-3 flex items-center gap-3">
        <FaTrophy className="text-yellow-400 flex-shrink-0" size={16} />
        <p className="text-sm text-green-300 font-medium">
          Congratulations! You have successfully completed this course. Keep it up! 🚀
        </p>
      </div>
    </div>
  )
}

// ── Main SmartTimetable Component ────────────────────────────────────────────
const SmartTimetable = () => {
  const { token } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCourse, setModalCourse] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState("")

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector("GET", TIMETABLE_ENDPOINTS.GET_DASHBOARD, null, {
        Authorization: `Bearer ${token}`,
      })
      if (res.data.success) setCourses(res.data.data)
    } catch (err) {
      console.log("Timetable fetch error", err)
    }
    setLoading(false)
  }, [token])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const handleSavePlan = async (courseId, targetCompletionDate, plannedHoursPerDay) => {
    try {
      const res = await apiConnector("POST", TIMETABLE_ENDPOINTS.SAVE_PLAN,
        { courseId, targetCompletionDate, plannedHoursPerDay },
        { Authorization: `Bearer ${token}` }
      )
      if (res.data.success) {
        showToast("✅ Study plan saved!")
        setModalCourse(null)
        fetchDashboard()
      }
    } catch (err) {
      showToast("❌ Failed to save plan. Try again.")
    }
  }

  const handleDeletePlan = async (courseId) => {
    setDeletingId(courseId)
    try {
      await apiConnector("DELETE", `${TIMETABLE_ENDPOINTS.DELETE_PLAN}/${courseId}`, null, {
        Authorization: `Bearer ${token}`,
      })
      showToast("🗑️ Study plan removed.")
      fetchDashboard()
    } catch (err) {
      showToast("❌ Failed to remove plan.")
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        <p className="text-richblack-400 text-sm">Loading your timetable...</p>
      </div>
    )
  }

  // Separate completed vs in-progress courses
  const completedCourses = courses.filter((c) => c.progressPercent === 100)
  const inProgressCourses = courses.filter((c) => c.progressPercent < 100)

  return (
    <div className="text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-richblack-700 border border-richblack-500 px-5 py-3 text-sm shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
          <FaBrain size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Smart Timetable</h1>
          <p className="text-sm text-richblack-400">AI-powered study planning for your enrolled courses</p>
        </div>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-12 text-center">
          <FaBrain size={48} className="mx-auto mb-4 text-yellow-400 opacity-40" />
          <p className="text-xl font-semibold text-richblack-200">No Enrolled Courses</p>
          <p className="text-richblack-400 text-sm mt-2">Enroll in courses to start planning your study schedule.</p>
        </div>
      )}

      {/* ── Completed Courses Section ───────────────── */}
      {completedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" /> Completed Courses
          </h2>
          <div className="flex flex-col gap-4">
            {completedCourses.map((course) => (
              <CompletedCourseCard key={course.courseId} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* ── In-Progress Courses Section ────────────── */}
      {inProgressCourses.length > 0 && (
        <>
          {completedCourses.length > 0 && (
            <h2 className="text-sm font-semibold text-richblack-300 uppercase tracking-wider mb-3">
              In Progress
            </h2>
          )}
          <div className="flex flex-col gap-6">
            {inProgressCourses.map((course) => {
              const cfg = course.stats ? STATUS_CONFIG[course.stats.status] : null
              const ringColor =
                cfg?.border === "border-green-500" ? "#4ade80"
                : cfg?.border === "border-blue-500" ? "#60a5fa"
                : cfg?.border === "border-red-500" ? "#f87171"
                : "#fb923c"

              return (
                <div
                  key={course.courseId}
                  className={`rounded-2xl bg-richblack-800 border ${cfg ? cfg.border : "border-richblack-600"} overflow-hidden`}
                >
                  {/* Card Top */}
                  <div className="flex flex-col md:flex-row gap-5 p-6">

                    {/* Thumbnail + Progress ring */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <img src={course.thumbnail} alt={course.courseName}
                        className="w-24 h-16 object-cover rounded-lg" />
                      <ProgressRing percent={course.progressPercent} size={72} stroke={6} color={ringColor} />
                    </div>

                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-richblack-5 text-lg leading-tight mb-1">{course.courseName}</h2>

                      <div className="flex flex-wrap gap-3 text-xs text-richblack-400 mb-3">
                        <span>✅ {course.completedLessons} / {course.totalLessons} lessons</span>
                        {course.plan && (
                          <>
                            <span>📅 Target: {new Date(course.plan.targetCompletionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span>⏱️ {course.plan.plannedHoursPerDay}h/day planned</span>
                          </>
                        )}
                      </div>

                      {/* Status Badge */}
                      {cfg && (
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg} mb-3`}>
                          {cfg.icon} {cfg.label}
                        </div>
                      )}

                      {/* Stats row (only for in-progress courses with a plan) */}
                      {course.stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {[
                            { label: "Days Left", value: course.stats.remainingDays },
                            { label: "Lessons Left", value: course.stats.remainingLessons },
                            { label: "Hours Needed", value: `${course.stats.hoursNeeded}h` },
                            { label: "Hours Planned", value: `${course.stats.totalPlannedHours}h` },
                          ].map(({ label, value }) => (
                            <div key={label} className="rounded-lg bg-richblack-700 px-3 py-2 text-center">
                              <p className="text-yellow-400 font-bold text-sm">{value}</p>
                              <p className="text-richblack-400 text-[10px]">{label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Extra hours warning */}
                      {course.stats?.status === "behind" && course.stats.extraHoursNeeded > 0 && (
                        <div className="mt-3 rounded-lg bg-red-900/20 border border-red-800 px-3 py-2 text-xs text-red-300">
                          ⚠️ You need <strong>{course.stats.extraHoursNeeded} extra hours/day</strong> on top of your planned schedule to catch up.
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => setModalCourse(course)}
                        className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-richblack-900 hover:bg-yellow-300 transition-all">
                        <FaEdit size={11} />
                        {course.plan ? "Edit Plan" : "Set Plan"}
                      </button>
                      {course.plan && (
                        <button onClick={() => handleDeletePlan(course.courseId)}
                          disabled={deletingId === course.courseId}
                          className="flex items-center gap-1.5 rounded-lg border border-red-700 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-50">
                          {deletingId === course.courseId ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <FaEdit size={11} />
                          )}
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Feedback Panel — only for in-progress */}
                  {course.aiMessage && (
                    <div className="border-t border-richblack-700 bg-richblack-750 px-6 py-4 flex gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-richblack-900 mt-0.5">
                        <FaBrain size={14} />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-400 font-semibold mb-1">AI Study Assistant</p>
                        <p className="text-sm text-richblack-200 leading-relaxed">{course.aiMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* No plan prompt */}
                  {!course.plan && (
                    <div className="border-t border-richblack-700 px-6 py-3 flex items-center gap-2 bg-richblack-750">
                      <FaCalendarAlt className="text-richblack-500" size={12} />
                      <p className="text-xs text-richblack-400">
                        No study plan set.{" "}
                        <button onClick={() => setModalCourse(course)}
                          className="text-yellow-400 hover:underline font-medium">
                          Set target date & hours
                        </button>{" "}
                        to get AI-powered feedback.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Plan Modal */}
      {modalCourse && (
        <PlanModal
          course={modalCourse}
          existingPlan={modalCourse.plan}
          onSave={handleSavePlan}
          onClose={() => setModalCourse(null)}
        />
      )}
    </div>
  )
}

export default SmartTimetable
