const express = require("express")
const router = express.Router()
const { auth, isStudent } = require("../middlewares/auth")
const {
  getTimetableDashboard,
  saveStudyPlan,
  deleteStudyPlan,
} = require("../controllers/Timetable")

router.get("/dashboard", auth, isStudent, getTimetableDashboard)
router.post("/plan", auth, isStudent, saveStudyPlan)
router.delete("/plan/:courseId", auth, isStudent, deleteStudyPlan)

module.exports = router