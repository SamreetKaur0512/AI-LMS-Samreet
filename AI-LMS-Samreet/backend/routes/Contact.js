const express = require("express")
const router = express.Router()
const { contactUsController, getAllContacts, updateContactStatus } = require("../controllers/ContactUs")
const { auth, isAdmin } = require("../middlewares/auth")

router.post("/contact", contactUsController)
router.get("/getAllContacts", auth, isAdmin, getAllContacts)
router.put("/updateContactStatus/:id", auth, isAdmin, updateContactStatus)

module.exports = router