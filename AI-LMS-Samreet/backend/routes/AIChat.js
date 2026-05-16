const express = require("express")
const router = express.Router()
const { aiChat } = require("../controllers/AIChat")
const { auth } = require("../middlewares/auth")

router.post("/chat", auth, aiChat)

module.exports = router
