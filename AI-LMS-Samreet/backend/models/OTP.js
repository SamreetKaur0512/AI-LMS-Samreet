const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5,
	},
});

// Send OTP email - never crash even if email fails
async function sendVerificationEmail(email, otp) {
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email - EduAI LMS",
			emailTemplate(otp)
		);
		if (mailResponse) {
			console.log("OTP email sent successfully to:", email);
		} else {
			console.log("OTP email could not be sent (mail service issue) but OTP saved:", otp);
		}
	} catch (error) {
		// Log but never throw - OTP should still save even if email fails
		console.log("Error sending OTP email (non-fatal):", error.message);
	}
}

// Post-save hook - email failure will NOT block OTP creation
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");
	if (this.isNew) {
		// Don't await - fire and forget so it never blocks next()
		sendVerificationEmail(this.email, this.otp);
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;