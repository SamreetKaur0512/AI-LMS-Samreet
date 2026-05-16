const express = require("express")
const router = express.Router()
const { getRecommendations, getPopularCourses } = require("../controllers/Recommendation")
const { auth } = require("../middlewares/auth")

// Logged in user ke liye personalized recommendations
router.get("/personalized", auth, getRecommendations)

// Sab ke liye popular courses
router.get("/popular", getPopularCourses)

module.exports = router

