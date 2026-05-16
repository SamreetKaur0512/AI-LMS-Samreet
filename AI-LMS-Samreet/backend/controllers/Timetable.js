const axios = require("axios")
const User = require("../models/User")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const StudyPlan = require("../models/StudyPlan")
const AIUsageLog = require("../models/AIUsageLog")

// ─── Helper: count all subsections (lessons) in a course ────────────────────
async function getTotalLessons(courseId) {
  const course = await Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  })
  if (!course) return 0
  let total = 0
  for (const section of course.courseContent) {
    total += section.subSection?.length || 0
  }
  return total
}

// ─── Helper: count completed lessons for a student in a course ──────────────
async function getCompletedLessons(userId, courseId) {
  const progress = await CourseProgress.findOne({
    courseID: courseId,
    userId: userId,
  })
  return progress?.completedVideos?.length || 0
}

// ─── Helper: calculate schedule status ─────────────────────────────────────
function calculateStatus(totalLessons, completedLessons, targetDate, plannedHoursPerDay) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const remainingDays = Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))
  const remainingLessons = totalLessons - completedLessons
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Estimate: avg lesson = 15 min = 0.25 hrs
  const avgLessonHours = 0.25
  const hoursNeeded = remainingLessons * avgLessonHours
  const totalPlannedHours = remainingDays * plannedHoursPerDay

  // Expected progress: how many lessons should be done by today?
  const totalDays = Math.ceil((target - new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24))
  const daysPassed = Math.max(0, totalDays - remainingDays)
  const expectedCompleted = Math.round((daysPassed / Math.max(totalDays, 1)) * totalLessons)
  const gap = completedLessons - expectedCompleted // positive = ahead, negative = behind

  let status, extraHoursNeeded = 0
  if (remainingDays === 0 && remainingLessons > 0) {
    status = "deadline_passed"
  } else if (totalPlannedHours >= hoursNeeded * 1.15) {
    status = "ahead"
  } else if (totalPlannedHours >= hoursNeeded * 0.85) {
    status = "on_track"
  } else {
    status = "behind"
    extraHoursNeeded = Math.ceil((hoursNeeded - totalPlannedHours) / Math.max(remainingDays, 1))
  }

  return {
    status,
    progressPercent,
    completedLessons,
    totalLessons,
    remainingLessons,
    remainingDays,
    hoursNeeded: Math.round(hoursNeeded * 10) / 10,
    totalPlannedHours: Math.round(totalPlannedHours * 10) / 10,
    extraHoursNeeded,
    gap,
  }
}

// ─── Helper: call Gemini for AI feedback message ────────────────────────────
async function getAIFeedback(studentName, courseName, stats, plannedHoursPerDay) {
  const { status, progressPercent, remainingDays, remainingLessons, extraHoursNeeded } = stats

  let situationPrompt = ""
  if (status === "ahead") {
    situationPrompt = `ahead of schedule. ${progressPercent}% done, ${remainingLessons} lessons left in ${remainingDays} days.`
  } else if (status === "on_track") {
    situationPrompt = `on track. ${progressPercent}% done, ${remainingLessons} lessons left in ${remainingDays} days at ${plannedHoursPerDay}h/day.`
  } else if (status === "behind") {
    situationPrompt = `falling behind. Only ${progressPercent}% done, ${remainingLessons} lessons left in ${remainingDays} days. Needs ${extraHoursNeeded} extra hours/day to catch up.`
  } else {
    situationPrompt = `deadline has passed with ${progressPercent}% completed. Encourage them to set a new date.`
  }

  const prompt = `Write a complete 2-sentence motivational message for a student named ${studentName} studying "${courseName}". They are ${situationPrompt} Start directly with their name. Give one specific actionable tip. End with encouragement. Must be a complete, finished sentence under 60 words total.`

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      },
      { headers: { "Content-Type": "application/json" } }
    )
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const tokensUsed = response.data?.usageMetadata?.totalTokenCount || Math.ceil(prompt.length / 4)

    // Log for AI analytics
    try {
      await AIUsageLog.create({
        user: null,
        message: `Timetable feedback: ${courseName}`,
        tokensUsed,
        topic: "Study Planning",
        feature: "timetable",
      })
    } catch (e) { /* non-critical */ }

    const trimmed = text.trim()
    const lastChar = trimmed[trimmed.length - 1]
    if (!trimmed || ![".", "!", "?"].includes(lastChar)) {
      return getFallbackMessage(studentName, courseName, status, extraHoursNeeded, progressPercent)
    }
    return trimmed
  } catch (err) {
    console.log("Gemini error in timetable:", err.message)
    return getFallbackMessage(studentName, courseName, status, extraHoursNeeded, progressPercent)
  }
}

function getFallbackMessage(studentName, courseName, status, extraHoursNeeded, progressPercent) {
  if (status === "ahead")
    return `Great work, ${studentName}! You're ahead of schedule on "${courseName}" — keep this momentum going and you'll finish early!`
  if (status === "on_track")
    return `You're right on track, ${studentName}! Keep up your daily study habit for "${courseName}" and you'll reach your goal on time.`
  if (status === "behind")
    return `Don't give up, ${studentName}! Try adding ${extraHoursNeeded} extra hour(s) per day to your "${courseName}" sessions — even 30 focused minutes can make a big difference!`
  return `You've completed ${progressPercent}% of "${courseName}", ${studentName}! Set a new target date and keep going — progress is progress, no matter the pace.`
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: GET /timetable/dashboard
// Returns smart timetable data for all enrolled courses
// ═══════════════════════════════════════════════════════════════════════════
exports.getTimetableDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
      .populate({
        path: "courses",
        select: "courseName thumbnail courseContent",
        populate: { path: "courseContent", populate: { path: "subSection", select: "_id" } },
      })
      .select("firstName lastName courses")

    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const plans = await StudyPlan.find({ student: userId })
    const planMap = {}
    plans.forEach((p) => { planMap[p.course.toString()] = p })

    const results = []
    for (const course of user.courses) {
      const totalLessons = course.courseContent?.reduce(
        (acc, sec) => acc + (sec.subSection?.length || 0), 0
      ) || 0
      const completedLessons = await getCompletedLessons(userId, course._id)
      const plan = planMap[course._id.toString()]

      let stats = null
      let aiMessage = null

      if (plan) {
        stats = calculateStatus(
          totalLessons,
          completedLessons,
          plan.targetCompletionDate,
          plan.plannedHoursPerDay
        )
        aiMessage = await getAIFeedback(
          user.firstName,
          course.courseName,
          stats,
          plan.plannedHoursPerDay
        )
      }

      results.push({
        courseId: course._id,
        courseName: course.courseName,
        thumbnail: course.thumbnail,
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        plan: plan
          ? {
              targetCompletionDate: plan.targetCompletionDate,
              plannedHoursPerDay: plan.plannedHoursPerDay,
            }
          : null,
        stats,
        aiMessage,
      })
    }

    return res.status(200).json({ success: true, data: results })
  } catch (err) {
    console.log("Timetable dashboard error:", err)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: POST /timetable/plan
// Save or update a study plan for one course
// ═══════════════════════════════════════════════════════════════════════════
exports.saveStudyPlan = async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId, targetCompletionDate, plannedHoursPerDay } = req.body

    if (!courseId || !targetCompletionDate || !plannedHoursPerDay) {
      return res.status(400).json({ success: false, message: "All fields required" })
    }

    const target = new Date(targetCompletionDate)
    if (target <= new Date()) {
      return res.status(400).json({ success: false, message: "Target date must be in the future" })
    }

    const plan = await StudyPlan.findOneAndUpdate(
      { student: userId, course: courseId },
      { targetCompletionDate: target, plannedHoursPerDay: Number(plannedHoursPerDay) },
      { upsert: true, new: true }
    )

    return res.status(200).json({ success: true, message: "Study plan saved!", data: plan })
  } catch (err) {
    console.log("Save plan error:", err)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: DELETE /timetable/plan/:courseId
// Remove a study plan
// ═══════════════════════════════════════════════════════════════════════════
exports.deleteStudyPlan = async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId } = req.params
    await StudyPlan.findOneAndDelete({ student: userId, course: courseId })
    return res.status(200).json({ success: true, message: "Study plan removed" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
