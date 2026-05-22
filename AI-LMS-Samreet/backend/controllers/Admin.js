const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")
const AIUsageLog = require("../models/AIUsageLog")
const RatingAndReview = require("../models/RatingAndReview")
const mongoose = require("mongoose")

// ════════════════════════════════════════════════════════
// SYSTEM OVERVIEW  –  GET /admin/overview
// ════════════════════════════════════════════════════════
exports.getOverview = async (req, res) => {
  try {
    const [totalStudents, totalInstructors, totalAdmins, totalCourses,
      publishedCourses, draftCourses, allCourses, allProgress] = await Promise.all([
      User.countDocuments({ accountType: "Student" }),
      User.countDocuments({ accountType: "Instructor" }),
      User.countDocuments({ accountType: "Admin" }),
      Course.countDocuments(),
      Course.countDocuments({ status: "Published" }),
      Course.countDocuments({ status: "Draft" }),
      Course.find({ status: "Published" }).select("price studentsEnrolled courseName createdAt"),
      CourseProgress.find().select("completedVideos courseID userId"),
    ])

    // Revenue = sum of (price × enrollments)
    let totalRevenue = 0
    let totalEnrollments = 0
    const revenueByMonth = {}
    const enrollmentByMonth = {}

    allCourses.forEach(c => {
      const enrolled = c.studentsEnrolled?.length || 0
      totalEnrollments += enrolled
      totalRevenue += (c.price || 0) * enrolled
      const month = new Date(c.createdAt).toLocaleString("default", { month: "short", year: "2-digit" })
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (c.price || 0) * enrolled
      enrollmentByMonth[month] = (enrollmentByMonth[month] || 0) + enrolled
    })

    // Course completion rates
    const courseCompletionData = []
    for (const course of allCourses.slice(0, 8)) {
      const progressDocs = allProgress.filter(p => p.courseID?.toString() === course._id.toString())
      const avgCompletion = progressDocs.length > 0
        ? Math.round(progressDocs.reduce((acc, p) => acc + (p.completedVideos?.length || 0), 0) / progressDocs.length)
        : 0
      courseCompletionData.push({ name: course.courseName?.slice(0, 20), completion: avgCompletion, enrolled: course.studentsEnrolled?.length || 0 })
    }

    // Active users (logged in within 7 days — approximated by updatedAt)
    const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: since7Days } })

    // Monthly chart data (last 6 months)
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      months.push(d.toLocaleString("default", { month: "short", year: "2-digit" }))
    }
    const chartData = months.map(m => ({
      month: m,
      revenue: revenueByMonth[m] || 0,
      enrollments: enrollmentByMonth[m] || 0,
    }))

    return res.json({
      success: true,
      data: {
        stats: { totalStudents, totalInstructors, totalAdmins, totalCourses, publishedCourses, draftCourses, totalEnrollments, totalRevenue, activeUsers },
        chartData,
        courseCompletionData,
      }
    })
  } catch (err) {
    console.error("Admin overview error:", err)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// USER MANAGEMENT  –  GET /admin/users
// ════════════════════════════════════════════════════════
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query
    const filter = {}
    if (role && role !== "All") filter.accountType = role
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ]

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .populate("additionalDetails")
      .populate({ path: "courses", select: "courseName thumbnail price status studentsEnrolled" })
      .select("-password -token")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // Mark recently-active users (updatedAt within 15 min)
    const since15Min = new Date(Date.now() - 15 * 60 * 1000)
    const usersWithActivity = users.map(u => ({
      ...u.toObject(),
      isOnline: u.updatedAt >= since15Min,
    }))

    return res.json({ success: true, data: usersWithActivity, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// GET SINGLE USER  –  GET /admin/users/:id
// ════════════════════════════════════════════════════════
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("additionalDetails")
      .populate({ path: "courses", select: "courseName thumbnail price status studentsEnrolled createdAt" })
      .populate({ path: "courseProgress", populate: { path: "courseID", select: "courseName" } })
      .select("-password -token")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    return res.json({ success: true, data: user })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// UPDATE USER  –  PUT /admin/users/:id
// ════════════════════════════════════════════════════════
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, accountType } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(email && { email }), ...(accountType && { accountType }) },
      { new: true }
    ).select("-password -token")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    return res.json({ success: true, message: "User updated", data: user })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// SUSPEND / UNSUSPEND  –  PUT /admin/users/:id/suspend
// ════════════════════════════════════════════════════════
exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    if (user.accountType === "Admin") return res.status(403).json({ success: false, message: "Cannot suspend an admin" })
    user.active = !user.active
    await user.save()
    return res.json({ success: true, message: user.active ? "Account activated" : "Account suspended", active: user.active })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// DELETE USER  –  DELETE /admin/users/:id
// ════════════════════════════════════════════════════════
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    if (user.accountType === "Admin") return res.status(403).json({ success: false, message: "Cannot delete an admin" })
    await Profile.findByIdAndDelete(user.additionalDetails)
    const userReviews = await RatingAndReview.find({ user: user._id }).select("_id")
    const reviewIds = userReviews.map((review) => review._id)
    if (reviewIds.length > 0) {
      await Course.updateMany(
        { ratingAndReviews: { $in: reviewIds } },
        { $pull: { ratingAndReviews: { $in: reviewIds } } }
      )
      await RatingAndReview.deleteMany({ _id: { $in: reviewIds } })
    }
    // Remove from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(courseId, { $pull: { studentsEnrolled: user._id } })
    }
    await CourseProgress.deleteMany({ userId: user._id })
    await User.findByIdAndDelete(user._id)
    return res.json({ success: true, message: "User deleted successfully" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// DELETE PROFILE PHOTO  –  DELETE /admin/users/:id/photo
// ════════════════════════════════════════════════════════
exports.deleteUserPhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { image: "" }, { new: true }).select("-password")
    return res.json({ success: true, message: "Profile photo removed", data: user })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// DELETE BIO/ABOUT  –  DELETE /admin/users/:id/bio
// ════════════════════════════════════════════════════════
exports.deleteUserBio = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("additionalDetails")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    await Profile.findByIdAndUpdate(user.additionalDetails._id, { about: "" })
    return res.json({ success: true, message: "Bio removed" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// REMOVE ENROLLED COURSE  –  DELETE /admin/users/:id/courses/:courseId
// ════════════════════════════════════════════════════════
exports.removeEnrolledCourse = async (req, res) => {
  try {
    const { id, courseId } = req.params
    await User.findByIdAndUpdate(id, { $pull: { courses: courseId } })
    await Course.findByIdAndUpdate(courseId, { $pull: { studentsEnrolled: id } })
    await CourseProgress.findOneAndDelete({ userId: id, courseID: courseId })
    return res.json({ success: true, message: "Course removed from user" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// AI ANALYTICS  –  GET /admin/ai-analytics
// ════════════════════════════════════════════════════════
exports.getAIAnalytics = async (req, res) => {
  try {
    const logs = await AIUsageLog.find().sort({ createdAt: -1 }).limit(1000)

    const totalQuestions = logs.length
    const totalTokens = logs.reduce((acc, l) => acc + (l.tokensUsed || 0), 0)

    // Questions per day (last 14 days)
    const dailyMap = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      dailyMap[d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })] = 0
    }
    logs.forEach(l => {
      const key = new Date(l.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      if (dailyMap[key] !== undefined) dailyMap[key]++
    })
    const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Top topics
    const topicMap = {}
    logs.forEach(l => { if (l.topic) topicMap[l.topic] = (topicMap[l.topic] || 0) + 1 })
    const topTopics = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([topic, count]) => ({ topic, count }))

    // Feature breakdown
    const featureMap = {}
    logs.forEach(l => { featureMap[l.feature] = (featureMap[l.feature] || 0) + 1 })
    const featureBreakdown = Object.entries(featureMap).map(([name, value]) => ({ name, value }))

    // Avg tokens per question
    const avgTokens = totalQuestions > 0 ? Math.round(totalTokens / totalQuestions) : 0

    return res.json({
      success: true,
      data: { totalQuestions, totalTokens, avgTokens, dailyData, topTopics, featureBreakdown }
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

// ════════════════════════════════════════════════════════
// SEED ADMIN ACCOUNT  –  POST /admin/seed  (one-time setup)
// ════════════════════════════════════════════════════════
exports.seedAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ email: "admin@eduai.com" })
    if (existing) return res.json({ success: true, message: "Admin already exists" })

    const hashedPassword = await bcrypt.hash("Edu@2003", 10)
    const profileDetails = await Profile.create({ gender: null, dateOfBirth: null, about: "EduAI Platform Administrator", contactNumber: null })
    await User.create({
      firstName: "admin",
      lastName: "EduAI",
      email: "admin@eduai.com",
      password: hashedPassword,
      accountType: "Admin",
      active: true,
      approved: true,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=admin`,
    })
    return res.json({ success: true, message: "Admin created: admin@eduai.com / Edu@2003" })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
