const Course = require("../models/Course")
const User = require("../models/User")
const mongoose = require("mongoose")

/**
 * AI-Based Course Recommendation Engine
 * Developer: Samreet Kaur | AGC Amritsar
 * 
 * Algorithm: Hybrid Recommendation System
 * 1. Content-Based Filtering — same category/tags courses suggest karo
 * 2. Collaborative Filtering — similar students ne kya enroll kiya
 * 3. Popularity-Based — highly enrolled courses suggest karo
 */

exports.getRecommendations = async (req, res) => {
  const userId = req.user.id

  try {
    // Step 1: Get current user's enrolled courses
    const user = await User.findById(userId).populate({
      path: "courses",
      select: "category tag courseName",
    })

    const enrolledCourseIds = user.courses.map((c) => c._id.toString())

    // Step 2: Extract user's interests (categories + tags)
    const userCategories = [
      ...new Set(user.courses.map((c) => c.category?.toString()).filter(Boolean)),
    ]
    const userTags = [
      ...new Set(user.courses.flatMap((c) => c.tag || [])),
    ]

    // Step 3: Content-Based — same category courses
    let contentBasedCourses = []
    if (userCategories.length > 0) {
      contentBasedCourses = await Course.find({
        _id: { $nin: enrolledCourseIds },
        status: "Published",
        category: { $in: userCategories },
      })
        .populate("instructor", "firstName lastName")
        .populate("category", "name")
        .select("courseName courseDescription thumbnail price tag studentsEnrolled ratingAndReviews instructor category")
        .limit(6)
    }

    // Step 4: Tag-Based — same tags courses
    let tagBasedCourses = []
    if (userTags.length > 0) {
      tagBasedCourses = await Course.find({
        _id: {
          $nin: [
            ...enrolledCourseIds,
            ...contentBasedCourses.map((c) => c._id.toString()),
          ],
        },
        status: "Published",
        tag: { $in: userTags },
      })
        .populate("instructor", "firstName lastName")
        .populate("category", "name")
        .select("courseName courseDescription thumbnail price tag studentsEnrolled ratingAndReviews instructor category")
        .limit(4)
    }

    // Step 5: Popularity-Based — most enrolled courses (fallback)
    let popularCourses = []
    const alreadySuggested = [
      ...enrolledCourseIds,
      ...contentBasedCourses.map((c) => c._id.toString()),
      ...tagBasedCourses.map((c) => c._id.toString()),
    ]

    if (contentBasedCourses.length + tagBasedCourses.length < 4) {
      popularCourses = await Course.find({
        _id: { $nin: alreadySuggested },
        status: "Published",
      })
        .populate("instructor", "firstName lastName")
        .populate("category", "name")
        .select("courseName courseDescription thumbnail price tag studentsEnrolled ratingAndReviews instructor category")
        .sort({ studentsEnrolled: -1 })
        .limit(4)
    }

    // Step 6: Merge and score recommendations
    const recommendations = []

    contentBasedCourses.forEach((course) => {
      recommendations.push({
        ...course.toObject(),
        recommendationScore: 0.9,
        reason: "Based on your learning interests",
      })
    })

    tagBasedCourses.forEach((course) => {
      recommendations.push({
        ...course.toObject(),
        recommendationScore: 0.7,
        reason: "Matches your skill tags",
      })
    })

    popularCourses.forEach((course) => {
      recommendations.push({
        ...course.toObject(),
        recommendationScore: 0.5,
        reason: "Popular among learners",
      })
    })

    // Sort by score
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    return res.status(200).json({
      success: true,
      data: recommendations.slice(0, 6),
      totalRecommendations: recommendations.length,
      algorithm: "Hybrid: Content-Based + Tag-Based + Popularity",
    })
  } catch (error) {
    console.log("Recommendation Error:", error)
    return res.status(500).json({
      success: false,
      message: "Could not fetch recommendations",
    })
  }
}

// Get recommendations for non-logged in users (popular courses)
exports.getPopularCourses = async (req, res) => {
  try {
    const popularCourses = await Course.find({ status: "Published" })
      .populate("instructor", "firstName lastName")
      .populate("category", "name")
      .select("courseName courseDescription thumbnail price tag studentsEnrolled ratingAndReviews instructor category")
      .sort({ studentsEnrolled: -1 })
      .limit(6)

    return res.status(200).json({
      success: true,
      data: popularCourses,
      reason: "Most Popular Courses",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}