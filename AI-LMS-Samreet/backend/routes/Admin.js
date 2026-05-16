const express = require("express")
const router = express.Router()
const { auth, isAdmin } = require("../middlewares/auth")
const {
  getOverview, getAllUsers, getUserById, updateUser,
  toggleSuspend, deleteUser, deleteUserPhoto, deleteUserBio,
  removeEnrolledCourse, getAIAnalytics, seedAdmin,
} = require("../controllers/Admin")

router.get("/seed", seedAdmin)   // one-time setup — visit in browser to create admin

router.use(auth, isAdmin)        // all routes below require admin auth

router.get("/overview",          getOverview)
router.get("/users",             getAllUsers)
router.get("/users/:id",         getUserById)
router.put("/users/:id",         updateUser)
router.put("/users/:id/suspend", toggleSuspend)
router.delete("/users/:id",      deleteUser)
router.delete("/users/:id/photo",deleteUserPhoto)
router.delete("/users/:id/bio",  deleteUserBio)
router.delete("/users/:id/courses/:courseId", removeEnrolledCourse)
router.get("/ai-analytics",      getAIAnalytics)

module.exports = router