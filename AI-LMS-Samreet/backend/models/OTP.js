const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp:   { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

// Fire email AFTER save — does NOT block the save or the API response
OTPSchema.post("save", function (doc) {
  mailSender(
    doc.email,
    "Your OTP - EduAI LMS",
    emailTemplate(doc.otp)
  ).then((info) => {
    if (info) console.log("OTP email sent to:", doc.email, "| id:", info.messageId)
    else      console.error("OTP email FAILED for:", doc.email, "— check MAIL_USER/MAIL_PASS in .env")
  }).catch((err) => {
    console.error("OTP email error:", err.message)
  })
});

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;